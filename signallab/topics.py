"""Observe topic ids → per-source queries.

GitHub uses topic labels. arXiv uses phrase search. Hacker News uses Algolia
story search. Hugging Face uses Hub model tags. Changing a query starts a new series.
"""

from __future__ import annotations

from signallab import ARXIV_SOURCE_ID, GITHUB_SOURCE_ID, HF_SOURCE_ID, HN_SOURCE_ID

TOPICS: dict[str, dict[str, str]] = {
    "ai-agents": {
        "label": "AI Agents",
        GITHUB_SOURCE_ID: "topic:llm-agents",
        ARXIV_SOURCE_ID: 'all:"llm agent" OR all:"language agent"',
        HN_SOURCE_ID: "LLM agents",
        HF_SOURCE_ID: "tag:agents",
    },
    "ai-evaluation": {
        "label": "AI Evaluation",
        GITHUB_SOURCE_ID: "topic:llm-evaluation",
        ARXIV_SOURCE_ID: 'all:"llm evaluation" OR all:"language model evaluation"',
        HN_SOURCE_ID: "LLM eval",
        HF_SOURCE_ID: "tag:reward-model",
    },
    "physical-ai": {
        "label": "Physical AI",
        GITHUB_SOURCE_ID: "topic:physical-ai",
        ARXIV_SOURCE_ID: 'all:"physical AI" OR all:"physical intelligence"',
        HN_SOURCE_ID: "physical intelligence",
        HF_SOURCE_ID: "tag:physical-ai",
    },
    "vla": {
        "label": "VLA",
        GITHUB_SOURCE_ID: "topic:vla",
        ARXIV_SOURCE_ID: 'all:"vision-language-action" OR all:"vision language action"',
        HN_SOURCE_ID: "vision-language-action",
        HF_SOURCE_ID: "tag:vla",
    },
    "ai-coding": {
        "label": "AI Coding",
        GITHUB_SOURCE_ID: "topic:coding-agent",
        ARXIV_SOURCE_ID: 'all:"coding agent" OR all:"code agent"',
        HN_SOURCE_ID: "coding assistants",
        HF_SOURCE_ID: "tag:code",
    },
}


def topic_ids() -> list[str]:
    return list(TOPICS.keys())
