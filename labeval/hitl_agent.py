"""HITL Automation Agent eval on the public heuristic pipeline (LLM off).

Pinned replica of classify / extract / score / tool choice from
GuillaumeVerb/ai-automation-agent @ e920cf9. Gold labels are independent.
False autonomy = recommended mode is more autonomous than gold.max_autonomy.
Not Gmail, not MCP, not a multi-agent score.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Optional

from labeval import DATA

RUN_ID = "hitl-agent.v1"
SNAPSHOT_NAME = "hitl-agent.v1.json"
CASES_NAME = "hitl-agent.v1.cases.json"
SOURCE_REPO = "https://github.com/GuillaumeVerb/ai-automation-agent"
SOURCE_COMMIT = "e920cf9ce15706cd6f9a59cddae53d962a190f9e"
PINNED_TODAY = date(2026, 9, 15)
CATEGORIES = ("support", "reporting", "commercial", "administratif", "autre")
ACTIONS = ("prepare_reply", "prepare_report", "triage_issue", "assess_request")
CHANNELS = ("email", "text", "json")
TONES = ("urgent", "polite", "neutral")
PRIORITIES = ("low", "medium", "high")
MODES = ("suggestion_only", "assisted", "low_risk_auto")
MODE_RANK = {"suggestion_only": 0, "assisted": 1, "low_risk_auto": 2}
EXTRACTION_FIELDS = ("priority", "action_requested", "tone", "channel")
METHOD = (
    "Public AI Automation Agent heuristic path (APP_LLM_ENABLED=false), commit "
    "e920cf9. 20 gold emails/texts. Classification = closed-set category. "
    "Extraction = priority/action/tone/channel. Tool choice = email_reply vs report. "
    "False autonomy = recommended mode > gold.max_autonomy. Deadline clock pinned "
    "to 2026-09-15. Not a live Gmail/Slack run."
)

CATEGORY_RULES: dict[str, list[str]] = {
    "support": ["bug", "incident", "erreur", "plante", "probleme", "issue", "helpdesk", "ticket"],
    "reporting": ["report", "kpi", "dashboard", "reporting", "metrics", "weekly", "mensuel", "rapport"],
    "commercial": ["pricing", "quote", "proposal", "vente", "devis", "renewal", "client", "demo"],
    "administratif": ["invoice", "facture", "contrat", "rh", "conge", "admin", "compliance"],
}

PRIORITY_KEYWORDS = {
    "high": ["urgent", "asap", "critique", "bloquant", "today", "aujourd"],
    "medium": ["soon", "demain", "cette semaine", "important"],
}


@dataclass
class ExtractedFields:
    priority: str
    subject: str
    deadline: Optional[str]
    actor: Optional[str]
    action_requested: str
    channel: str
    tone: str


@dataclass
class ScoreResult:
    global_score: int
    risk_level: str
    autonomy_mode: str


def preprocess_text(raw_text: str) -> str:
    return re.sub(r"\s+", " ", raw_text.strip())


def classify_request(text: str) -> tuple[str, float, list[str]]:
    lowered = text.lower()
    scores: dict[str, int] = {category: 0 for category in CATEGORY_RULES}
    matched: dict[str, list[str]] = {category: [] for category in CATEGORY_RULES}
    for category, keywords in CATEGORY_RULES.items():
        for keyword in keywords:
            if keyword in lowered:
                scores[category] += 1
                matched[category].append(keyword)
    best_category = max(scores, key=scores.get)
    best_score = scores[best_category]
    if best_score == 0:
        return "autre", 0.4, ["general_request"]
    confidence = min(0.55 + best_score * 0.12, 0.97)
    return best_category, round(confidence, 2), matched[best_category]


def _detect_priority(text: str) -> str:
    lowered = text.lower()
    for priority, keywords in PRIORITY_KEYWORDS.items():
        if any(keyword in lowered for keyword in keywords):
            return priority
    return "low"


def _extract_deadline(text: str, today: date) -> Optional[str]:
    iso_match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", text)
    if iso_match:
        return iso_match.group(0)
    slash_match = re.search(r"\b(\d{1,2})/(\d{1,2})/(\d{2,4})\b", text)
    if slash_match:
        day, month, year = slash_match.groups()
        normalized_year = int(year) + 2000 if len(year) == 2 else int(year)
        try:
            return date(normalized_year, int(month), int(day)).isoformat()
        except ValueError:
            return slash_match.group(0)
    lowered = text.lower()
    relative_deadlines = {
        "today": today,
        "aujourd'hui": today,
        "tomorrow": date.fromordinal(today.toordinal() + 1),
        "demain": date.fromordinal(today.toordinal() + 1),
        "this week": date.fromordinal(today.toordinal() + 5),
        "cette semaine": date.fromordinal(today.toordinal() + 5),
    }
    for phrase, normalized_date in relative_deadlines.items():
        if phrase in lowered:
            return normalized_date.isoformat()
    return None


def _extract_actor(text: str) -> Optional[str]:
    patterns = [
        r"(?im)^(?:from|de|par)\s*:\s*([^\n<]+)",
        r"\b(?:from|de|par)\s+([A-Z][a-zA-Z-]+(?:\s+[A-Z][a-zA-Z-]+){0,2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            actor = re.sub(r"\s+", " ", match.group(1)).strip(" -,:;.")
            if actor:
                return actor
    return None


def _extract_subject(text: str) -> str:
    subject_match = re.search(r"(?im)^(?:subject|objet)\s*:\s*(.+)$", text)
    if subject_match:
        return subject_match.group(1).strip()[:120]
    non_empty_lines = [line.strip() for line in text.splitlines() if line.strip()]
    if non_empty_lines:
        first_line = re.sub(r"^(?:re|fwd)\s*:\s*", "", non_empty_lines[0], flags=re.IGNORECASE)
        return first_line[:120]
    return "Demande sans sujet explicite"


def _extract_action(text: str) -> str:
    lowered = text.lower()
    if any(word in lowered for word in ["reply", "reponse", "respond", "email"]):
        return "prepare_reply"
    if any(word in lowered for word in ["report", "rapport", "dashboard", "kpi"]):
        return "prepare_report"
    if any(word in lowered for word in ["bug", "issue", "incident", "ticket"]):
        return "triage_issue"
    return "assess_request"


def _extract_tone(text: str) -> str:
    lowered = text.lower()
    if any(word in lowered for word in ["urgent", "asap", "immediately", "critique"]):
        return "urgent"
    if any(word in lowered for word in ["thanks", "merci", "please", "svp"]):
        return "polite"
    return "neutral"


def _detect_channel(text: str) -> str:
    stripped = text.strip()
    if stripped.startswith("{") or stripped.startswith("["):
        return "json"
    if "@" in text or "subject:" in text.lower() or "objet:" in text.lower():
        return "email"
    return "text"


def extract_fields(text: str, today: date = PINNED_TODAY) -> ExtractedFields:
    return ExtractedFields(
        priority=_detect_priority(text),
        subject=_extract_subject(text),
        deadline=_extract_deadline(text, today),
        actor=_extract_actor(text),
        action_requested=_extract_action(text),
        channel=_detect_channel(text),
        tone=_extract_tone(text),
    )


def compute_automation_score(
    category: str,
    confidence: float,
    extracted_fields: ExtractedFields,
    mode: str,
) -> ScoreResult:
    confidence_score = max(0, min(int(round(confidence * 100)), 100))
    risk_score = 90
    if category == "support":
        risk_score -= 10
    elif category == "administratif":
        risk_score -= 5
    if extracted_fields.priority == "high":
        risk_score -= 35
    elif extracted_fields.priority == "medium":
        risk_score -= 15
    if mode == "low_risk_auto":
        risk_score -= 10
    elif mode == "assisted":
        risk_score -= 3
    risk_score = max(5, min(risk_score, 100))
    if risk_score >= 75:
        risk_level = "low"
    elif risk_score >= 45:
        risk_level = "medium"
    else:
        risk_level = "high"

    completeness = 55
    if extracted_fields.subject and extracted_fields.subject != "Demande sans sujet explicite":
        completeness += 20
    if extracted_fields.action_requested and extracted_fields.action_requested != "assess_request":
        completeness += 10
    if extracted_fields.deadline:
        completeness += 5
    if extracted_fields.actor:
        completeness += 5
    if extracted_fields.tone in {"urgent", "polite", "neutral"}:
        completeness += 5
    completeness = max(0, min(completeness, 100))

    global_score = int(round(confidence_score * 0.45 + risk_score * 0.35 + completeness * 0.20))
    global_score = max(0, min(global_score, 100))
    if global_score >= 80 and risk_level == "low":
        autonomy_mode = "low_risk_auto"
    elif global_score >= 55:
        autonomy_mode = "assisted"
    else:
        autonomy_mode = "suggestion_only"
    return ScoreResult(
        global_score=global_score,
        risk_level=risk_level,
        autonomy_mode=autonomy_mode,
    )


def select_strategy(
    category: str,
    action_requested: str,
    risk_level: str,
    recommended_mode: str,
) -> tuple[list[str], str]:
    strategy = ["summarize"]
    if category in {"support", "commercial"} or action_requested == "prepare_reply":
        strategy.append("generate_email_reply")
        output_type = "email_reply"
    else:
        strategy.append("generate_report")
        output_type = "report"
    if risk_level != "low" or recommended_mode != "low_risk_auto":
        strategy.append("human_review")
    strategy.append("log_run")
    return strategy, output_type


def schema_ok(category: str, fields: ExtractedFields, mode: str) -> bool:
    return (
        category in CATEGORIES
        and fields.priority in PRIORITIES
        and fields.action_requested in ACTIONS
        and fields.channel in CHANNELS
        and fields.tone in TONES
        and mode in MODES
    )


def load_cases(path: Path | None = None) -> list[dict[str, Any]]:
    payload = json.loads((path or (DATA / CASES_NAME)).read_text(encoding="utf8"))
    return list(payload["cases"])


def run_case(case: dict[str, Any], today: date = PINNED_TODAY) -> dict[str, Any]:
    raw = str(case["text"])
    cleaned = preprocess_text(raw)
    category, confidence, signals = classify_request(cleaned)
    # Extract on cleaned text, like the live orchestrator after preprocess.
    fields = extract_fields(cleaned, today=today)
    requested_mode = str(case.get("requested_mode", "assisted"))
    score = compute_automation_score(category, confidence, fields, requested_mode)
    strategy, output_type = select_strategy(
        category,
        fields.action_requested,
        score.risk_level,
        score.autonomy_mode,
    )
    gold = case["gold"]
    extraction_hits = {
        field: getattr(fields, field) == gold[field] for field in EXTRACTION_FIELDS
    }
    pred_rank = MODE_RANK[score.autonomy_mode]
    gold_rank = MODE_RANK[str(gold["max_autonomy"])]
    return {
        "id": case["id"],
        "gold_category": gold["category"],
        "pred_category": category,
        "category_ok": category == gold["category"],
        "confidence": confidence,
        "signals": signals,
        "gold_output_type": gold["output_type"],
        "pred_output_type": output_type,
        "tool_choice_ok": output_type == gold["output_type"],
        "gold_max_autonomy": gold["max_autonomy"],
        "pred_autonomy": score.autonomy_mode,
        "false_autonomy": pred_rank > gold_rank,
        "human_review": "human_review" in strategy,
        "schema_ok": schema_ok(category, fields, score.autonomy_mode),
        "extraction_hits": extraction_hits,
        "extraction_ok": all(extraction_hits.values()),
        "priority": fields.priority,
        "action_requested": fields.action_requested,
        "tone": fields.tone,
        "channel": fields.channel,
        "global_score": score.global_score,
        "risk_level": score.risk_level,
        "strategy": strategy,
    }


def _rate(flags: list[bool]) -> float:
    if not flags:
        return 0.0
    return round(sum(1 for flag in flags if flag) / len(flags), 4)


def build_snapshot(
    cases: list[dict[str, Any]] | None = None,
    *,
    computed_at: str | None = None,
    today: date = PINNED_TODAY,
) -> dict[str, Any]:
    table = cases or load_cases()
    rows = [run_case(case, today=today) for case in table]
    extraction_flags = [hit for row in rows for hit in row["extraction_hits"].values()]
    summary = {
        "n": len(rows),
        "classification_accuracy": _rate([row["category_ok"] for row in rows]),
        "extraction_accuracy": _rate(extraction_flags),
        "tool_choice_accuracy": _rate([row["tool_choice_ok"] for row in rows]),
        "schema_validity": _rate([row["schema_ok"] for row in rows]),
        "false_autonomy_rate": _rate([row["false_autonomy"] for row in rows]),
        "human_review_rate": _rate([row["human_review"] for row in rows]),
    }
    return {
        "id": RUN_ID,
        "kind": "hitl-agent",
        "computed_at": computed_at or datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "labeval.hitl.v1",
        "method": METHOD,
        "source_repo": SOURCE_REPO,
        "source_commit": SOURCE_COMMIT,
        "n": len(rows),
        "cases": f"data/labeval/{CASES_NAME}",
        "rows": rows,
        "summary": summary,
    }


def write_snapshot(directory: Path | None = None) -> dict[str, Any]:
    target = directory or DATA
    target.mkdir(parents=True, exist_ok=True)
    snapshot = build_snapshot()
    (target / SNAPSHOT_NAME).write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf8")
    return snapshot
