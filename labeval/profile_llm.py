"""Condition C: parse numeric claims from a frozen model (or sample) trace.

A and B stay the profiling baselines. C is extracted from a JSON completion
on the same 8-row paste. CI replays the committed trace. `python -m labeval
--run profile-llm --live` calls OpenAI when OPENAI_API_KEY is set and
overwrites the trace. No invented percentages.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from labeval import DATA
from labeval.profile_ab import (
    CSV_NAME,
    NUMERIC_STATS,
    SAMPLE_SIZE,
    build_rows,
    csv_text,
    profile,
    relative_error,
)

RUN_ID = "profile-llm.v1"
SNAPSHOT_NAME = "profile-llm.v1.json"
TRACE_NAME = "profile-llm.v1.trace.json"
CLAIM_KEYS = (*NUMERIC_STATS, "city_mode")
PROMPT_VERSION = "profile-llm.prompt.v1"
METHOD = (
    "Same CSV and fields as profile-ab.v1. A = 8-row descriptives. B = full-file "
    "tool. C = claims parsed from a frozen JSON completion on the 8-row paste. "
    "CI does not call a provider. --live overwrites the trace when OPENAI_API_KEY "
    "is set. Missing claims score as error 1."
)

PROMPT_TEMPLATE = """You profile a CSV from the pasted rows only. Do not invent a larger file.

Return JSON only, no markdown, with exactly these keys:
n (integer, row count of what you saw),
amount_mean, amount_min, amount_max, age_mean, rating_null_rate, rating_mean (numbers),
city_nunique (integer),
city_mode (string).

CSV:
{csv}
"""


def _env_key() -> str:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    env_path = Path(__file__).resolve().parents[1] / ".env.local"
    if env_path.exists():
        for line in env_path.read_text(encoding="utf8").splitlines():
            if line.startswith("OPENAI_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return ""


def parse_claims(text: str) -> dict[str, float | int | str | None]:
    raw = text.strip()
    if raw.startswith("```"):
        lines = raw.splitlines()
        inner = [line for line in lines[1:] if not line.strip().startswith("```")]
        raw = "\n".join(inner).strip()
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}")
        if start == -1 or end <= start:
            return {key: None for key in CLAIM_KEYS}
        try:
            payload = json.loads(raw[start : end + 1])
        except json.JSONDecodeError:
            return {key: None for key in CLAIM_KEYS}
    if not isinstance(payload, dict):
        return {key: None for key in CLAIM_KEYS}
    out: dict[str, float | int | str | None] = {}
    for key in CLAIM_KEYS:
        if key not in payload or payload[key] is None or payload[key] == "":
            out[key] = None
            continue
        value = payload[key]
        if key == "city_mode":
            out[key] = str(value)
            continue
        try:
            number = float(value)
        except (TypeError, ValueError):
            out[key] = None
            continue
        if key in {"n", "city_nunique"} and number.is_integer():
            out[key] = int(number)
        else:
            out[key] = round(number, 4)
    return out


def claim_error(pred: float | int | str | None, truth: float | int | str) -> float:
    if pred is None:
        return 1.0
    return relative_error(pred, truth)


def restated_sample_trace(rows: list[dict[str, str]]) -> dict[str, Any]:
    sample = profile(rows[:SAMPLE_SIZE])
    prompt = PROMPT_TEMPLATE.format(csv=csv_text(rows[:SAMPLE_SIZE]).rstrip())
    return {
        "provider": "none",
        "model": "restated-sample",
        "live": False,
        "prompt_version": PROMPT_VERSION,
        "prompt": prompt,
        "raw": json.dumps(sample, ensure_ascii=True),
    }


def load_trace(path: Path | None = None) -> dict[str, Any] | None:
    target = path or (DATA / TRACE_NAME)
    if not target.exists():
        return None
    return json.loads(target.read_text(encoding="utf8"))


def fetch_live_completion(prompt: str, model: str | None = None) -> dict[str, Any]:
    key = _env_key()
    if not key.startswith("sk-"):
        raise RuntimeError("OPENAI_API_KEY missing or not an sk- key; skip live call")
    chosen = model or os.environ.get("OPENAI_MODEL", "").strip() or "gpt-4o-mini"
    body = json.dumps(
        {
            "model": chosen,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "You extract descriptive statistics. JSON only.",
                },
                {"role": "user", "content": prompt},
            ],
        }
    ).encode("utf8")
    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            payload = json.loads(response.read().decode("utf8"))
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"OpenAI HTTP {exc.code}") from exc
    raw = payload.get("choices", [{}])[0].get("message", {}).get("content")
    if not raw:
        raise RuntimeError("OpenAI returned an empty completion")
    return {
        "provider": "openai",
        "model": chosen,
        "live": True,
        "prompt_version": PROMPT_VERSION,
        "prompt": prompt,
        "raw": raw,
    }


def build_snapshot(
    rows: list[dict[str, str]] | None = None,
    *,
    trace: dict[str, Any] | None = None,
    computed_at: str | None = None,
) -> dict[str, Any]:
    table = rows or build_rows()
    truth = profile(table)
    sample = profile(table[:SAMPLE_SIZE])
    used_trace = trace or load_trace() or restated_sample_trace(table)
    claims = parse_claims(str(used_trace.get("raw", "")))
    records = []
    for stat in CLAIM_KEYS:
        truth_value = truth[stat]
        a_value = sample[stat]
        c_value = claims.get(stat)
        records.append(
            {
                "stat": stat,
                "truth": truth_value,
                "a": a_value,
                "a_error": relative_error(a_value, truth_value),
                "b": truth_value,
                "b_error": relative_error(truth_value, truth_value),
                "c": c_value,
                "c_error": claim_error(c_value, truth_value),
            }
        )
    errors_a = [item["a_error"] for item in records]
    errors_b = [item["b_error"] for item in records]
    errors_c = [item["c_error"] for item in records]
    return {
        "id": RUN_ID,
        "kind": "profile-llm",
        "computed_at": computed_at or datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "labeval.profile.v2",
        "method": METHOD,
        "n": len(table),
        "sample_size": SAMPLE_SIZE,
        "seed": 20260911,
        "csv": f"data/labeval/{CSV_NAME}",
        "llm": {
            "provider": used_trace.get("provider", "none"),
            "model": used_trace.get("model", "unknown"),
            "live": bool(used_trace.get("live", False)),
            "prompt_version": used_trace.get("prompt_version", PROMPT_VERSION),
        },
        "rows": records,
        "summary": {
            "a_mean_error": round(sum(errors_a) / len(errors_a), 4),
            "b_mean_error": round(sum(errors_b) / len(errors_b), 4),
            "c_mean_error": round(sum(errors_c) / len(errors_c), 4),
            "a_mean_capped_error": round(sum(min(err, 1.0) for err in errors_a) / len(errors_a), 4),
            "b_mean_capped_error": round(sum(min(err, 1.0) for err in errors_b) / len(errors_b), 4),
            "c_mean_capped_error": round(sum(min(err, 1.0) for err in errors_c) / len(errors_c), 4),
        },
    }


def write_artifacts(
    directory: Path | None = None,
    *,
    live: bool = False,
    computed_at: str | None = None,
) -> dict[str, Any]:
    target = directory or DATA
    target.mkdir(parents=True, exist_ok=True)
    rows = build_rows()
    prompt = PROMPT_TEMPLATE.format(csv=csv_text(rows[:SAMPLE_SIZE]).rstrip())
    if live:
        trace = fetch_live_completion(prompt)
    else:
        trace = load_trace(target / TRACE_NAME) or restated_sample_trace(rows)
        if "prompt" not in trace:
            trace["prompt"] = prompt
    (target / TRACE_NAME).write_text(json.dumps(trace, indent=2) + "\n", encoding="utf8")
    snapshot = build_snapshot(rows, trace=trace, computed_at=computed_at)
    (target / SNAPSHOT_NAME).write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf8")
    return snapshot
