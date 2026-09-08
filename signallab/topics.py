"""Observe topic ids → GitHub search queries.

Queries are GitHub topic labels, not a semantic census. Changing a query
starts a new series; do not compare totals across query versions.
"""

from __future__ import annotations

TOPICS: dict[str, dict[str, str]] = {
    "ai-agents": {
        "query": "topic:llm-agents",
        "label": "AI Agents",
    },
    "ai-evaluation": {
        "query": "topic:llm-evaluation",
        "label": "AI Evaluation",
    },
    "physical-ai": {
        "query": "topic:physical-ai",
        "label": "Physical AI",
    },
    "vla": {
        "query": "topic:vla",
        "label": "VLA",
    },
    "ai-coding": {
        "query": "topic:coding-agent",
        "label": "AI Coding",
    },
}


def topic_ids() -> list[str]:
    return list(TOPICS.keys())
