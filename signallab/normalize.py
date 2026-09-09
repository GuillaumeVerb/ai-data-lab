from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

from signallab import ARXIV_SOURCE_ID, GITHUB_SOURCE_ID, HF_SOURCE_ID, HN_SOURCE_ID
from signallab.schema import CollectedDocument


def document_id(full_name: str) -> str:
    return f"github:{full_name.strip().lower()}"


def paper_id(arxiv_abs: str) -> str:
    slug = arxiv_abs.rstrip("/").rsplit("/", 1)[-1]
    slug = re.sub(r"v\d+$", "", slug, flags=re.IGNORECASE)
    return f"arxiv:{slug.lower()}"


def story_id(object_id: object) -> str:
    return f"hn:{object_id}"


def model_id(model_ref: str) -> str:
    return f"hf:{model_ref.strip().lower()}"


def datetime_from_unix(value: object) -> str | None:
    try:
        return datetime.fromtimestamp(int(value), tz=timezone.utc).isoformat()
    except (TypeError, ValueError, OSError):
        return None


def normalize_repo(item: dict[str, Any], collected_at: str, topic_id: str, query: str) -> CollectedDocument:
    full_name = str(item.get("full_name") or "")
    owner = item.get("owner") if isinstance(item.get("owner"), dict) else {}
    license_info = item.get("license") if isinstance(item.get("license"), dict) else {}
    return CollectedDocument(
        source_id=GITHUB_SOURCE_ID,
        source_type="repo",
        external_id=document_id(full_name),
        canonical_url=str(item.get("html_url") or f"https://github.com/{full_name}"),
        title=full_name,
        author_or_org=owner.get("login"),
        published_at=item.get("created_at"),
        collected_at=collected_at,
        language=item.get("language"),
        raw_text_or_description=str(item.get("description") or ""),
        engagement_metrics={
            "stars": int(item.get("stargazers_count") or 0),
            "forks": int(item.get("forks_count") or 0),
            "open_issues": int(item.get("open_issues_count") or 0),
        },
        source_specific_metadata={
            "topic_id": topic_id,
            "query": query,
            "pushed_at": item.get("pushed_at"),
            "updated_at": item.get("updated_at"),
            "default_branch": item.get("default_branch"),
        },
        license_or_access_notes=license_info.get("spdx_id"),
    )


def normalize_paper(item: dict[str, Any], collected_at: str, topic_id: str, query: str) -> CollectedDocument:
    abs_url = str(item.get("id") or "")
    authors = item.get("authors") if isinstance(item.get("authors"), list) else []
    return CollectedDocument(
        source_id=ARXIV_SOURCE_ID,
        source_type="paper",
        external_id=paper_id(abs_url),
        canonical_url=abs_url.replace("http://", "https://"),
        title=" ".join(str(item.get("title") or "").split()),
        author_or_org=", ".join(str(name) for name in authors[:8]) or None,
        published_at=item.get("published"),
        collected_at=collected_at,
        language="en",
        raw_text_or_description=" ".join(str(item.get("summary") or "").split())[:4_000],
        source_specific_metadata={
            "topic_id": topic_id,
            "query": query,
            "authors": authors,
            "primary_category": item.get("primary_category"),
            "updated": item.get("updated"),
        },
        license_or_access_notes="arXiv",
    )


def normalize_story(item: dict[str, Any], collected_at: str, topic_id: str, query: str) -> CollectedDocument:
    object_id = item.get("objectID") or item.get("story_id") or ""
    hn_url = f"https://news.ycombinator.com/item?id={object_id}"
    created = item.get("created_at")
    if not isinstance(created, str) or not created:
        created = datetime_from_unix(item.get("created_at_i"))
    return CollectedDocument(
        source_id=HN_SOURCE_ID,
        source_type="opinion",
        external_id=story_id(object_id),
        canonical_url=str(item.get("url") or hn_url),
        title=" ".join(str(item.get("title") or "").split()),
        author_or_org=item.get("author"),
        published_at=created if isinstance(created, str) else None,
        collected_at=collected_at,
        language="en",
        raw_text_or_description=" ".join(
            str(item.get("story_text") or item.get("title") or "").split()
        )[:4_000],
        engagement_metrics={
            "points": int(item.get("points") or 0),
            "comments": int(item.get("num_comments") or 0),
        },
        source_specific_metadata={
            "topic_id": topic_id,
            "query": query,
            "hn_url": hn_url,
            "created_at_i": item.get("created_at_i"),
        },
        license_or_access_notes="Hacker News",
    )


def _license_from_tags(tags: object) -> str | None:
    if not isinstance(tags, list):
        return None
    for tag in tags:
        if isinstance(tag, str) and tag.startswith("license:"):
            return tag.split(":", 1)[-1] or None
    return None


def normalize_model(item: dict[str, Any], collected_at: str, topic_id: str, query: str) -> CollectedDocument:
    model_ref = str(item.get("id") or item.get("modelId") or "")
    author = item.get("author")
    if not isinstance(author, str) or not author.strip():
        author = model_ref.split("/", 1)[0] if "/" in model_ref else None
    tags = item.get("tags") if isinstance(item.get("tags"), list) else []
    return CollectedDocument(
        source_id=HF_SOURCE_ID,
        source_type="model",
        external_id=model_id(model_ref),
        canonical_url=f"https://huggingface.co/{model_ref}",
        title=model_ref,
        author_or_org=author,
        published_at=item.get("createdAt") if isinstance(item.get("createdAt"), str) else None,
        collected_at=collected_at,
        language=None,
        raw_text_or_description="",
        engagement_metrics={
            "downloads": int(item.get("downloads") or 0),
            "likes": int(item.get("likes") or 0),
        },
        source_specific_metadata={
            "topic_id": topic_id,
            "query": query,
            "last_modified": item.get("lastModified"),
            "pipeline_tag": item.get("pipeline_tag"),
            "library_name": item.get("library_name"),
            "gated": item.get("gated"),
            "tags": tags[:24],
        },
        license_or_access_notes=_license_from_tags(tags),
    )
