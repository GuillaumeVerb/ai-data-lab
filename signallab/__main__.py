from __future__ import annotations

import argparse
import json
import sys

from signallab import SOURCE_IDS
from signallab.embed import rebuild_lexicon_from_raw
from signallab.pipeline import collect_all


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SignalLab collector (metrics, no scores)")
    sub = parser.add_subparsers(dest="command", required=True)

    collect = sub.add_parser("collect", help="Run GitHub, arXiv, Hacker News and/or Hugging Face collectors")
    collect.add_argument("--topic", action="append", dest="topics", help="Topic id (repeatable)")
    collect.add_argument(
        "--source",
        action="append",
        dest="sources",
        choices=list(SOURCE_IDS),
        help="Source id (repeatable). Default: all",
    )

    sub.add_parser("embed", help="Rebuild TF-IDF lexicon from persisted raw documents")

    serve = sub.add_parser("serve", help="Expose stored snapshots on :8000")
    serve.add_argument("--port", type=int, default=8000)

    args = parser.parse_args(argv)

    if args.command == "collect":
        observations = collect_all(args.topics, sources=args.sources)
        print(
            json.dumps(
                [
                    {
                        "topic_id": item.topic_id,
                        "source_id": item.source_id,
                        "observed_at": item.observed_at,
                        "metrics": item.metrics,
                    }
                    for item in observations
                ],
                indent=2,
            )
        )
        if not observations:
            print("No observations collected", file=sys.stderr)
            return 1
        return 0

    if args.command == "embed":
        day = rebuild_lexicon_from_raw()
        if day is None:
            print("No raw documents to embed", file=sys.stderr)
            return 1
        print(
            json.dumps(
                {
                    "day": day.day,
                    "pipeline_version": day.pipeline_version,
                    "topics": {
                        topic_id: {
                            "document_count": item.document_count,
                            "terms": [term.term for term in item.terms[:8]],
                            "nearest": [n.topic_id for n in item.nearest],
                        }
                        for topic_id, item in day.topics.items()
                    },
                },
                indent=2,
            )
        )
        return 0

    if args.command == "serve":
        import uvicorn

        uvicorn.run("signallab.api:app", host="127.0.0.1", port=args.port, reload=False)
        return 0

    parser.error(f"unknown command {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
