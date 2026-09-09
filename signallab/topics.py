"""Observe topic ids → per-source queries.

GitHub uses topic labels. arXiv uses phrase search. Neither is a census.
Changing a query starts a new series; do not compare totals across versions.
"""

from __future__ import annotations

from signallab import ARXIV_SOURCE_ID, GITHUB_SOURCE_ID

TOPICS: dict[str, dict[str, str]] = {
    "ai-agents": {
        "label": "AI Agents",
        GITHUB_SOURCE_ID: "topic:llm-agents",
        ARXIV_SOURCE_ID: 'all:"llm agent" OR all:"language agent"',
    },
    "ai-evaluation": {
        "label": "AI Evaluation",
        GITHUB_SOURCE_ID: "topic:llm-evaluation",
        ARXIV_SOURCE_ID: 'all:"llm evaluation" OR all:"language model evaluation"',
    },
    "physical-ai": {
        "label": "Physical AI",
        GITHUB_SOURCE_ID: "topic:physical-ai",
        ARXIV_SOURCE_ID: 'all:"physical AI" OR all:"physical intelligence"',
    },
    "vla": {
        "label": "VLA",
        GITHUB_SOURCE_ID: "topic:vla",
        ARXIV_SOURCE_ID: 'all:"vision-language-action" OR all:"vision language action"',
    },
    "ai-coding": {
        "label": "AI Coding",
        GITHUB_SOURCE_ID: "topic:coding-agent",
        ARXIV_SOURCE_ID: 'all:"coding agent" OR all:"code agent"',
    },
}


def topic_ids() -> list[str]:
    return list(TOPICS.keys())
