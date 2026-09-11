from __future__ import annotations

import argparse
import json
import sys

from labeval.profile_ab import write_artifacts
from labeval.vision_digits import write_snapshot


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Rebuild versioned Lab eval snapshots")
    parser.add_argument(
        "--run",
        choices=("profile-ab", "vision-digits", "all"),
        default="all",
    )
    args = parser.parse_args(argv)
    if args.run in {"profile-ab", "all"}:
        snapshot = write_artifacts()
        print(json.dumps({"id": snapshot["id"], "summary": snapshot["summary"]}, indent=2))
    if args.run in {"vision-digits", "all"}:
        try:
            snapshot = write_snapshot()
        except FileNotFoundError:
            print("Missing data/labeval/uci-digits-8x8.json", file=sys.stderr)
            return 1
        print(json.dumps({"id": snapshot["id"], "metrics": snapshot["metrics"]}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
