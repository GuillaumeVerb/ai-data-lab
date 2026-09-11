from __future__ import annotations

import os
import sys
import time
from datetime import datetime, timezone

from signallab import (
    ARXIV_PIPELINE,
    ARXIV_SOURCE_ID,
    GITHUB_PIPELINE,
    GITHUB_SOURCE_ID,
    HF_PIPELINE,
    HF_SOURCE_ID,
    HN_PIPELINE,
    HN_SOURCE_ID,
    SOURCE_IDS,
)
from signallab.collectors.arxiv import search_papers
from signallab.collectors.github import search_repositories
from signallab.collectors.hn import search_stories
from signallab.collectors.huggingface import search_models
from signallab.metrics import (
    compute_model_metrics,
    compute_paper_metrics,
    compute_repo_metrics,
    compute_story_metrics,
)
from signallab.embed import build_lexicon_day
from signallab.normalize import normalize_model, normalize_paper, normalize_repo, normalize_story
from signallab.schema import CollectedDocument, Observation
from signallab.store import append_lexicon_day, append_observation, save_document
from signallab.texts import texts_from_docs
from signallab.topics import TOPICS, topic_ids

GITHUB_ASSUMPTIONS = (
    "Sample = up to 30 GitHub repos with this topic, sorted by stars. "
    "total_count is GitHub's estimate for that topic label, not a census. "
    "Not a trend score."
)
ARXIV_ASSUMPTIONS = (
    "Sample = up to 30 most recently submitted arXiv hits for the query. "
    "published_last_7d saturates at 30. total_count is arXiv's match estimate. "
    "Not a trend score."
)
HN_ASSUMPTIONS = (
    "Sample = up to 30 Hacker News stories from Algolia (single phrase; "
    "quoted OR is not supported). points_max vs points_median shows a viral thread. "
    "Not a trend score."
)
HF_ASSUMPTIONS = (
    "Sample = up to 30 Hugging Face models with this Hub tag, sorted by downloads. "
    "total_count is Hub's full-text estimate for the same string, not a tag census. "
    "downloads_max vs downloads_median shows a popular (often GGUF) re-upload. "
    "Not a trend score."
)


def collect_github_topic(
    topic_id: str,
    *,
    token: str | None = None,
    persist_raw: bool = True,
    bag: dict[str, list[str]] | None = None,
) -> Observation:
    query = TOPICS[topic_id][GITHUB_SOURCE_ID]
    payload = search_repositories(query, token=token)
    items = [item for item in payload.get("items", []) if isinstance(item, dict)]
    collected_at = datetime.now(timezone.utc).isoformat()
    docs = [normalize_repo(item, collected_at, topic_id, query) for item in items]
    _persist_docs(docs, persist_raw)
    _extend_bag(bag, topic_id, docs)

    observation = Observation(
        topic_id=topic_id,
        observed_at=collected_at,
        source_id=GITHUB_SOURCE_ID,
        pipeline_version=GITHUB_PIPELINE,
        query=query,
        metrics=compute_repo_metrics(items, int(payload.get("total_count") or 0)),
        sample_urls=[str(item.get("html_url")) for item in items[:8] if item.get("html_url")],
        assumptions=GITHUB_ASSUMPTIONS,
    )
    return append_observation(observation).observations[-1]


def collect_arxiv_topic(
    topic_id: str,
    *,
    persist_raw: bool = True,
    bag: dict[str, list[str]] | None = None,
) -> Observation:
    query = TOPICS[topic_id][ARXIV_SOURCE_ID]
    payload = search_papers(query)
    items = [item for item in payload.get("items", []) if isinstance(item, dict)]
    collected_at = datetime.now(timezone.utc).isoformat()
    docs = [normalize_paper(item, collected_at, topic_id, query) for item in items]
    _persist_docs(docs, persist_raw)
    _extend_bag(bag, topic_id, docs)

    observation = Observation(
        topic_id=topic_id,
        observed_at=collected_at,
        source_id=ARXIV_SOURCE_ID,
        pipeline_version=ARXIV_PIPELINE,
        query=query,
        metrics=compute_paper_metrics(items, int(payload.get("total_count") or 0)),
        sample_urls=[str(item.get("id")).replace("http://", "https://") for item in items[:8] if item.get("id")],
        assumptions=ARXIV_ASSUMPTIONS,
    )
    return append_observation(observation).observations[-1]


def collect_hn_topic(
    topic_id: str,
    *,
    persist_raw: bool = True,
    bag: dict[str, list[str]] | None = None,
) -> Observation:
    query = TOPICS[topic_id][HN_SOURCE_ID]
    payload = search_stories(query)
    items = [item for item in payload.get("items", []) if isinstance(item, dict)]
    collected_at = datetime.now(timezone.utc).isoformat()
    docs = [normalize_story(item, collected_at, topic_id, query) for item in items]
    _persist_docs(docs, persist_raw)
    _extend_bag(bag, topic_id, docs)

    observation = Observation(
        topic_id=topic_id,
        observed_at=collected_at,
        source_id=HN_SOURCE_ID,
        pipeline_version=HN_PIPELINE,
        query=query,
        metrics=compute_story_metrics(items, int(payload.get("total_count") or len(items))),
        sample_urls=[
            str(item.get("url") or f"https://news.ycombinator.com/item?id={item.get('objectID')}")
            for item in items[:8]
            if item.get("url") or item.get("objectID")
        ],
        assumptions=HN_ASSUMPTIONS,
    )
    return append_observation(observation).observations[-1]


def collect_hf_topic(
    topic_id: str,
    *,
    persist_raw: bool = True,
    bag: dict[str, list[str]] | None = None,
) -> Observation:
    query = TOPICS[topic_id][HF_SOURCE_ID]
    payload = search_models(query)
    items = [item for item in payload.get("items", []) if isinstance(item, dict)]
    collected_at = datetime.now(timezone.utc).isoformat()
    docs = [normalize_model(item, collected_at, topic_id, query) for item in items]
    _persist_docs(docs, persist_raw)
    _extend_bag(bag, topic_id, docs)

    observation = Observation(
        topic_id=topic_id,
        observed_at=collected_at,
        source_id=HF_SOURCE_ID,
        pipeline_version=HF_PIPELINE,
        query=query,
        metrics=compute_model_metrics(items, int(payload.get("total_count") or len(items))),
        sample_urls=[
            f"https://huggingface.co/{item.get('id')}"
            for item in items[:8]
            if item.get("id")
        ],
        assumptions=HF_ASSUMPTIONS,
    )
    return append_observation(observation).observations[-1]


def persist_raw_enabled() -> bool:
    flag = os.environ.get("SIGNALLAB_PERSIST_RAW", "1").strip().lower()
    return flag not in {"0", "false", "no"}


def collect_all(
    topic_filter: list[str] | None = None,
    *,
    sources: list[str] | None = None,
) -> list[Observation]:
    selected = topic_filter or topic_ids()
    unknown = [topic for topic in selected if topic not in TOPICS]
    if unknown:
        raise ValueError(f"Unknown topic(s): {', '.join(unknown)}")

    chosen = sources or list(SOURCE_IDS)
    bad_sources = [source for source in chosen if source not in SOURCE_IDS]
    if bad_sources:
        raise ValueError(f"Unknown source(s): {', '.join(bad_sources)}")

    raw = persist_raw_enabled()
    bag: dict[str, list[str]] = {}
    observations: list[Observation] = []
    if GITHUB_SOURCE_ID in chosen:
        observations.extend(
            _collect_each(
                selected,
                lambda topic_id: collect_github_topic(topic_id, persist_raw=raw, bag=bag),
                pause_s=1.2,
            )
        )
    if ARXIV_SOURCE_ID in chosen:
        observations.extend(
            _collect_each(
                selected,
                lambda topic_id: collect_arxiv_topic(topic_id, persist_raw=raw, bag=bag),
                pause_s=3.2,
            )
        )
    if HN_SOURCE_ID in chosen:
        observations.extend(
            _collect_each(
                selected,
                lambda topic_id: collect_hn_topic(topic_id, persist_raw=raw, bag=bag),
                pause_s=0.8,
            )
        )
    if HF_SOURCE_ID in chosen:
        observations.extend(
            _collect_each(
                selected,
                lambda topic_id: collect_hf_topic(topic_id, persist_raw=raw, bag=bag),
                pause_s=0.8,
            )
        )
    if any(bag.values()):
        append_lexicon_day(build_lexicon_day(bag))
    return observations


def _persist_docs(docs: list[CollectedDocument], persist_raw: bool) -> None:
    if not persist_raw:
        return
    seen: set[str] = set()
    for doc in docs:
        if doc.external_id in seen:
            continue
        seen.add(doc.external_id)
        save_document(doc)


def _extend_bag(bag: dict[str, list[str]] | None, topic_id: str, docs: list[CollectedDocument]) -> None:
    if bag is None:
        return
    bag.setdefault(topic_id, []).extend(texts_from_docs(docs))


def _collect_each(selected: list[str], fn, *, pause_s: float) -> list[Observation]:
    """Collect each topic. One failure does not abort the rest of the day."""
    observations: list[Observation] = []
    for index, topic_id in enumerate(selected):
        try:
            observations.append(fn(topic_id))
        except Exception as error:
            print(f"collect skipped {topic_id}: {error}", file=sys.stderr)
        if index < len(selected) - 1:
            time.sleep(pause_s)
    return observations
