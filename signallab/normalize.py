from __future__ import annotations

from typing import Any

from signallab.schema import CollectedDocument


def document_id(full_name: str) -> str:
    return f"github:{full_name.strip().lower()}"


def normalize_repo(item: dict[str, Any], collected_at: str, topic_id: str, query: str) -> CollectedDocument:
    full_name = str(item.get("full_name") or "")
    owner = item.get("owner") if isinstance(item.get("owner"), dict) else {}
    license_info = item.get("license") if isinstance(item.get("license"), dict) else {}
    return CollectedDocument(
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
