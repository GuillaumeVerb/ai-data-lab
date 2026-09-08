from __future__ import annotations

import time
from datetime import datetime, timezone

from signallab.collectors.github import search_repositories
from signallab.metrics import compute_repo_metrics
from signallab.normalize import normalize_repo
from signallab.schema import Observation
from signallab.store import append_observation, save_document
from signallab.topics import TOPICS, topic_ids


def collect_topic(topic_id: str, *, token: str | None = None, persist_raw: bool = True) -> Observation:
    meta = TOPICS[topic_id]
    payload = search_repositories(meta["query"], token=token)
    items = [item for item in payload.get("items", []) if isinstance(item, dict)]
    collected_at = datetime.now(timezone.utc).isoformat()
    seen: set[str] = set()

    if persist_raw:
        for item in items:
            doc = normalize_repo(item, collected_at, topic_id, meta["query"])
            if doc.external_id in seen:
                continue
            seen.add(doc.external_id)
            save_document(doc)

    observation = Observation(
        topic_id=topic_id,
        observed_at=collected_at,
        query=meta["query"],
        metrics=compute_repo_metrics(items, int(payload.get("total_count") or 0)),
        sample_urls=[str(item.get("html_url")) for item in items[:8] if item.get("html_url")],
    )
    return append_observation(observation).observations[-1]


def collect_all(topic_filter: list[str] | None = None, *, pause_s: float = 1.2) -> list[Observation]:
    selected = topic_filter or topic_ids()
    unknown = [topic for topic in selected if topic not in TOPICS]
    if unknown:
        raise ValueError(f"Unknown topic(s): {', '.join(unknown)}")

    observations: list[Observation] = []
    for index, topic_id in enumerate(selected):
        observations.append(collect_topic(topic_id))
        if index < len(selected) - 1:
            time.sleep(pause_s)
    return observations
