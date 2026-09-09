from __future__ import annotations

import argparse
import json

from signallab import SOURCE_IDS
from signallab.pipeline import collect_all


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="SignalLab collector (metrics, no scores)")
    sub = parser.add_subparsers(dest="command", required=True)

    collect = sub.add_parser("collect", help="Run GitHub and/or arXiv collectors")
    collect.add_argument("--topic", action="append", dest="topics", help="Topic id (repeatable)")
    collect.add_argument(
        "--source",
        action="append",
        dest="sources",
        choices=list(SOURCE_IDS),
        help="Source id (repeatable). Default: all",
    )

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
        return 0

    if args.command == "serve":
        import uvicorn

        uvicorn.run("signallab.api:app", host="127.0.0.1", port=args.port, reload=False)
        return 0

    parser.error(f"unknown command {args.command}")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
