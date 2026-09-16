from __future__ import annotations

import argparse
import json
import sys

from labeval.hitl_agent import write_snapshot as write_hitl
from labeval.profile_ab import write_artifacts as write_profile_ab
from labeval.profile_llm import write_artifacts as write_profile_llm
from labeval.vision_digits import write_snapshot as write_vision


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Rebuild versioned Lab eval snapshots")
    parser.add_argument(
        "--run",
        choices=("profile-ab", "profile-llm", "vision-digits", "hitl-agent", "all"),
        default="all",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Call OpenAI for profile-llm when OPENAI_API_KEY is set",
    )
    args = parser.parse_args(argv)
    if args.run in {"profile-ab", "all"}:
        snapshot = write_profile_ab()
        print(json.dumps({"id": snapshot["id"], "summary": snapshot["summary"]}, indent=2))
    if args.run in {"profile-llm", "all"}:
        try:
            snapshot = write_profile_llm(live=args.live)
        except RuntimeError as exc:
            print(str(exc), file=sys.stderr)
            return 1
        print(json.dumps({"id": snapshot["id"], "summary": snapshot["summary"], "llm": snapshot["llm"]}, indent=2))
    if args.run in {"vision-digits", "all"}:
        try:
            snapshot = write_vision()
        except FileNotFoundError:
            print("Missing data/labeval/uci-digits-8x8.json", file=sys.stderr)
            return 1
        print(json.dumps({"id": snapshot["id"], "metrics": snapshot["metrics"]}, indent=2))
    if args.run in {"hitl-agent", "all"}:
        snapshot = write_hitl()
        print(json.dumps({"id": snapshot["id"], "summary": snapshot["summary"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
