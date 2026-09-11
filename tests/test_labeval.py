from __future__ import annotations

import json
from pathlib import Path

from labeval.profile_ab import SAMPLE_SIZE, build_rows, build_snapshot, csv_text, relative_error
from labeval.vision_digits import build_snapshot as build_vision


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "labeval"


def test_relative_error_zero_truth() -> None:
    assert relative_error(0, 0) == 0
    assert relative_error(1, 0) == 1
    assert relative_error("Paris", "Paris") == 0
    assert relative_error("Lyon", "Paris") == 1


def test_sample_is_biased_on_purpose() -> None:
    rows = build_rows()
    assert len(rows) == 240
    sample = rows[:SAMPLE_SIZE]
    assert all(row["city"] == "Paris" for row in sample)
    assert all(row["rating"] == "5" for row in sample)
    assert any(row["rating"] == "" for row in rows)
    assert {row["city"] for row in rows} == {"Paris", "Lyon", "Lille", "Nantes"}


def test_profile_ab_matches_committed_snapshot() -> None:
    committed = json.loads((DATA / "profile-ab.v1.json").read_text(encoding="utf8"))
    fresh = build_snapshot(computed_at=committed["computed_at"])
    assert fresh == committed
    assert fresh["summary"]["b_mean_error"] == 0
    assert fresh["summary"]["b_mean_capped_error"] == 0
    assert fresh["summary"]["a_mean_capped_error"] > 0.5
    csv_committed = (DATA / "transactions.v1.csv").read_text(encoding="utf8")
    assert csv_committed == csv_text(build_rows())


def test_vision_centroid_beats_majority_and_matches_snapshot() -> None:
    committed = json.loads((DATA / "vision-digits.v1.json").read_text(encoding="utf8"))
    fresh = build_vision(computed_at=committed["computed_at"])
    assert fresh == committed
    metrics = fresh["metrics"]
    assert metrics["n_test"] == 359
    assert metrics["majority_accuracy"] == 0.1003
    assert metrics["centroid_accuracy"] == 0.9248
    assert metrics["centroid_accuracy"] > metrics["majority_accuracy"]
