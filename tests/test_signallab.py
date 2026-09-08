from __future__ import annotations

from datetime import datetime, timezone

from signallab.metrics import compute_repo_metrics
from signallab.normalize import document_id, normalize_repo


def _repo(name: str, stars: int, created: str, pushed: str) -> dict:
    owner, repo = name.split("/")
    return {
        "full_name": name,
        "html_url": f"https://github.com/{name}",
        "description": "fixture",
        "stargazers_count": stars,
        "forks_count": 1,
        "open_issues_count": 0,
        "created_at": created,
        "pushed_at": pushed,
        "language": "Python",
        "owner": {"login": owner},
        "license": {"spdx_id": "MIT"},
    }


def test_document_id_is_stable() -> None:
    assert document_id("Owner/Repo") == document_id("owner/repo") == "github:owner/repo"


def test_normalize_repo_envelope() -> None:
    doc = normalize_repo(
        _repo("acme/agents", 10, "2026-01-01T00:00:00Z", "2026-01-02T00:00:00Z"),
        "2026-09-08T12:00:00+00:00",
        "ai-agents",
        "agentic",
    )
    assert doc.source_type == "repo"
    assert doc.external_id == "github:acme/agents"
    assert doc.engagement_metrics["stars"] == 10
    assert doc.source_specific_metadata["topic_id"] == "ai-agents"


def test_metrics_empty_sample() -> None:
    metrics = compute_repo_metrics([], 0)
    assert metrics["sample_size"] == 0
    assert metrics["stars_median"] == 0
    assert metrics["created_last_7d"] == 0


def test_metrics_viral_repo_does_not_hide_in_median() -> None:
    now = datetime(2026, 9, 8, tzinfo=timezone.utc)
    items = [
        _repo("old/famous", 80_000, "2018-01-01T00:00:00Z", "2026-09-08T00:00:00Z"),
        _repo("new/one", 4, "2026-09-07T00:00:00Z", "2026-09-07T00:00:00Z"),
        _repo("new/two", 6, "2026-09-06T00:00:00Z", "2026-09-06T00:00:00Z"),
    ]
    metrics = compute_repo_metrics(items, total_count=900, now=now)
    assert metrics["total_count"] == 900
    assert metrics["stars_max"] == 80_000
    assert metrics["stars_median"] == 6
    assert metrics["created_last_7d"] == 2
    assert metrics["created_last_30d"] == 2
    assert metrics["pushed_last_7d"] == 3
