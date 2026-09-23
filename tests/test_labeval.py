from __future__ import annotations

import json
from pathlib import Path

from labeval.hitl_agent import build_snapshot as build_hitl
from labeval.hitl_agent import extract_fields
from labeval.profile_ab import SAMPLE_SIZE, build_rows, build_snapshot, csv_text, relative_error
from labeval.profile_llm import build_snapshot as build_llm
from labeval.profile_llm import claim_error, parse_claims
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


def test_hitl_agent_v1_snapshot_stays_frozen() -> None:
    committed = json.loads((DATA / "hitl-agent.v1.json").read_text(encoding="utf8"))
    assert committed["id"] == "hitl-agent.v1"
    assert committed["summary"]["false_autonomy_rate"] == 0.6


def test_hitl_agent_matches_committed_snapshot() -> None:
    committed = json.loads((DATA / "hitl-agent.v2.json").read_text(encoding="utf8"))
    fresh = build_hitl(computed_at=committed["computed_at"])
    assert fresh == committed
    summary = fresh["summary"]
    assert summary["n"] == 20
    assert summary["schema_validity"] == 1.0
    assert summary["classification_accuracy"] == 1.0
    assert summary["extraction_accuracy"] == 0.9625
    assert summary["tool_choice_accuracy"] == 1.0
    assert summary["false_autonomy_rate"] == 0.15


def test_hitl_traps_and_merci_substring() -> None:
    assert extract_fields("proposition commerciale").tone == "neutral"
    assert extract_fields("Merci de preparer le reporting.").tone == "polite"
    rows = {row["id"]: row for row in build_hitl()["rows"]}
    assert rows["t01-kpi-plante"]["pred_category"] == "support"
    assert rows["t03-invoice-kpi-report"]["pred_category"] == "administratif"


def test_profile_llm_restated_sample_matches_a_and_snapshot() -> None:
    committed = json.loads((DATA / "profile-llm.v1.json").read_text(encoding="utf8"))
    fresh = build_llm(computed_at=committed["computed_at"])
    assert fresh == committed
    assert fresh["llm"]["model"] == "restated-sample"
    assert fresh["summary"]["c_mean_capped_error"] == fresh["summary"]["a_mean_capped_error"]
    assert fresh["summary"]["b_mean_capped_error"] == 0
    for row in fresh["rows"]:
        assert row["c"] == row["a"]
        assert row["c_error"] == row["a_error"]


def test_parse_claims_missing_and_fenced() -> None:
    assert parse_claims("not json")["n"] is None
    assert parse_claims('```json\n{"n": 8, "city_mode": "Paris"}\n```')["n"] == 8
    assert claim_error(None, 240) == 1.0
    assert claim_error("Lyon", "Paris") == 1.0
    assert claim_error("Paris", "Paris") == 0.0
