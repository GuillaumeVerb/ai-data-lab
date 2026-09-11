"""A/B: text-context sample vs full-file profiling tool.

Condition A uses the first SAMPLE_SIZE rows — the table you would paste into a
prompt. Condition B uses the whole CSV. Ground truth is B. This is the best
case for text-only (honest stats on the sample). An LLM that invents extra
numbers can only do worse. Not a model leaderboard.
"""

from __future__ import annotations

import csv
import json
import random
from collections import Counter
from datetime import datetime, timezone
from io import StringIO
from pathlib import Path
from statistics import mean
from typing import Any

from labeval import DATA

RUN_ID = "profile-ab.v1"
SAMPLE_SIZE = 8
N_ROWS = 240
SEED = 20260911
CSV_NAME = "transactions.v1.csv"
SNAPSHOT_NAME = "profile-ab.v1.json"
CITIES_POP = (("Paris", 0.55), ("Lyon", 0.20), ("Lille", 0.15), ("Nantes", 0.10))
NULL_RATE = 0.12
METHOD = (
    "A = descriptives on the first 8 rows (text-context sample). "
    "B = descriptives on the full file (profiling tool). "
    "Error = |pred − truth| / |truth| for numeric fields; 0/1 for city_mode. "
    "Best case for text-only, not an LLM run. Not a trend score."
)


def _pick_city(rng: random.Random) -> str:
    draw = rng.random()
    cumulative = 0.0
    for name, weight in CITIES_POP:
        cumulative += weight
        if draw <= cumulative:
            return name
    return CITIES_POP[-1][0]


def build_rows(n: int = N_ROWS, seed: int = SEED) -> list[dict[str, str]]:
    rng = random.Random(seed)
    rows: list[dict[str, str]] = []
    for index in range(n):
        if index < SAMPLE_SIZE:
            amount = round(80 + rng.random() * 40, 2)
            age = str(rng.randint(28, 36))
            rating = "5"
            city = "Paris"
        else:
            amount = round(min(400.0, max(3.0, rng.lognormvariate(2.8, 0.7))), 2)
            age = str(rng.randint(22, 67))
            rating = "" if rng.random() < NULL_RATE else str(rng.randint(1, 5))
            city = _pick_city(rng)
        rows.append(
            {
                "order_id": str(index + 1),
                "amount": f"{amount:.2f}",
                "age": age,
                "rating": rating,
                "city": city,
            }
        )
    return rows


def csv_text(rows: list[dict[str, str]]) -> str:
    buffer = StringIO()
    writer = csv.DictWriter(
        buffer,
        fieldnames=["order_id", "amount", "age", "rating", "city"],
        lineterminator="\n",
    )
    writer.writeheader()
    writer.writerows(rows)
    return buffer.getvalue()


def _floats(values: list[str]) -> list[float]:
    out: list[float] = []
    for value in values:
        if value == "":
            continue
        out.append(float(value))
    return out


def profile(rows: list[dict[str, str]]) -> dict[str, float | int | str]:
    amounts = _floats([row["amount"] for row in rows])
    ages = _floats([row["age"] for row in rows])
    ratings_raw = [row["rating"] for row in rows]
    ratings = _floats(ratings_raw)
    cities = [row["city"] for row in rows]
    city_counts = Counter(cities)
    return {
        "n": len(rows),
        "amount_mean": round(mean(amounts), 4) if amounts else 0.0,
        "amount_min": round(min(amounts), 4) if amounts else 0.0,
        "amount_max": round(max(amounts), 4) if amounts else 0.0,
        "age_mean": round(mean(ages), 4) if ages else 0.0,
        "rating_null_rate": round(ratings_raw.count("") / max(len(ratings_raw), 1), 4),
        "rating_mean": round(mean(ratings), 4) if ratings else 0.0,
        "city_nunique": len(city_counts),
        "city_mode": city_counts.most_common(1)[0][0] if city_counts else "",
    }


def relative_error(pred: float | int | str, truth: float | int | str) -> float:
    if isinstance(truth, str) or isinstance(pred, str):
        return 0.0 if pred == truth else 1.0
    truth_n = float(truth)
    pred_n = float(pred)
    if truth_n == 0:
        return 0.0 if pred_n == 0 else 1.0
    return round(abs(pred_n - truth_n) / abs(truth_n), 4)


NUMERIC_STATS = (
    "n",
    "amount_mean",
    "amount_min",
    "amount_max",
    "age_mean",
    "rating_null_rate",
    "rating_mean",
    "city_nunique",
)


def build_snapshot(
    rows: list[dict[str, str]] | None = None,
    *,
    computed_at: str | None = None,
) -> dict[str, Any]:
    table = rows or build_rows()
    truth = profile(table)
    sample = profile(table[:SAMPLE_SIZE])
    records = []
    for stat in (*NUMERIC_STATS, "city_mode"):
        truth_value = truth[stat]
        a_value = sample[stat]
        b_value = truth_value
        records.append(
            {
                "stat": stat,
                "truth": truth_value,
                "a": a_value,
                "a_error": relative_error(a_value, truth_value),
                "b": b_value,
                "b_error": relative_error(b_value, truth_value),
            }
        )
    errors_a = [item["a_error"] for item in records]
    errors_b = [item["b_error"] for item in records]
    return {
        "id": RUN_ID,
        "kind": "profile-ab",
        "computed_at": computed_at or datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "labeval.profile.v1",
        "method": METHOD,
        "n": len(table),
        "sample_size": SAMPLE_SIZE,
        "seed": SEED,
        "csv": f"data/labeval/{CSV_NAME}",
        "rows": records,
        "summary": {
            "a_mean_error": round(sum(errors_a) / len(errors_a), 4),
            "b_mean_error": round(sum(errors_b) / len(errors_b), 4),
            "a_mean_capped_error": round(sum(min(err, 1.0) for err in errors_a) / len(errors_a), 4),
            "b_mean_capped_error": round(sum(min(err, 1.0) for err in errors_b) / len(errors_b), 4),
        },
    }


def write_artifacts(directory: Path | None = None) -> dict[str, Any]:
    target = directory or DATA
    target.mkdir(parents=True, exist_ok=True)
    rows = build_rows()
    (target / CSV_NAME).write_text(csv_text(rows), encoding="utf8")
    snapshot = build_snapshot(rows)
    (target / SNAPSHOT_NAME).write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf8")
    return snapshot
