from __future__ import annotations

from datetime import datetime, timezone

from signallab.metrics import compute_model_metrics, compute_paper_metrics, compute_repo_metrics, compute_story_metrics
from signallab.normalize import (
    document_id,
    model_id,
    normalize_model,
    normalize_paper,
    normalize_repo,
    normalize_story,
    paper_id,
    story_id,
)
from signallab.collectors.arxiv import parse_atom
from signallab.collectors.huggingface import tag_from_query


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


ATOM_FIXTURE = b"""<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom"
      xmlns:opensearch="http://a9.com/-/spec/opensearch/1.1/"
      xmlns:arxiv="http://arxiv.org/schemas/atom">
  <opensearch:totalResults>12</opensearch:totalResults>
  <entry>
    <id>http://arxiv.org/abs/2609.00001v1</id>
    <title>Fresh VLA paper</title>
    <published>2026-09-07T00:00:00Z</published>
    <summary>A new policy.</summary>
    <author><name>Ada Lovelace</name></author>
    <arxiv:primary_category term="cs.RO"/>
  </entry>
  <entry>
    <id>http://arxiv.org/abs/2401.00002v2</id>
    <title>Old VLA paper</title>
    <published>2024-01-01T00:00:00Z</published>
    <summary>Baseline.</summary>
    <author><name>Ada Lovelace</name></author>
    <author><name>Alan Turing</name></author>
  </entry>
</feed>
"""


def test_paper_id_strips_version() -> None:
    assert paper_id("http://arxiv.org/abs/2609.00001v1") == "arxiv:2609.00001"


def test_parse_atom_and_normalize_paper() -> None:
    payload = parse_atom(ATOM_FIXTURE)
    assert payload["total_count"] == 12
    doc = normalize_paper(payload["items"][0], "2026-09-08T12:00:00+00:00", "vla", "all:VLA")
    assert doc.source_type == "paper"
    assert doc.external_id == "arxiv:2609.00001"
    assert doc.source_id == "arxiv"


def test_paper_metrics_recency_and_author_dedupe() -> None:
    payload = parse_atom(ATOM_FIXTURE)
    now = datetime(2026, 9, 8, tzinfo=timezone.utc)
    metrics = compute_paper_metrics(payload["items"], payload["total_count"], now=now)
    assert metrics["total_count"] == 12
    assert metrics["published_last_7d"] == 1
    assert metrics["published_last_30d"] == 1
    assert metrics["unique_authors"] == 2


def test_story_id_and_normalize() -> None:
    hit = {
        "objectID": "123",
        "title": "OpenVLA drop",
        "url": "https://example.com/openvla",
        "author": "pg",
        "created_at": "2026-09-07T00:00:00.000Z",
        "points": 400,
        "num_comments": 80,
    }
    assert story_id("123") == "hn:123"
    doc = normalize_story(hit, "2026-09-09T12:00:00+00:00", "vla", "OpenVLA")
    assert doc.source_id == "hacker-news"
    assert doc.source_type == "opinion"
    assert doc.engagement_metrics["points"] == 400


def test_story_metrics_viral_thread_visible_in_max() -> None:
    now = datetime(2026, 9, 9, tzinfo=timezone.utc)
    items = [
        {
            "author": "a",
            "points": 900,
            "num_comments": 200,
            "created_at": "2024-01-01T00:00:00.000Z",
        },
        {
            "author": "b",
            "points": 12,
            "num_comments": 3,
            "created_at": "2026-09-08T00:00:00.000Z",
        },
        {
            "author": "a",
            "points": 8,
            "num_comments": 1,
            "created_at": "2026-09-07T00:00:00.000Z",
        },
    ]
    metrics = compute_story_metrics(items, total_count=40, now=now)
    assert metrics["total_count"] == 40
    assert metrics["points_max"] == 900
    assert metrics["points_median"] == 12
    assert metrics["created_last_7d"] == 2
    assert metrics["unique_authors"] == 2


def test_model_id_and_tag_query() -> None:
    assert model_id("OpenVLA/OpenVLA-7B") == "hf:openvla/openvla-7b"
    assert tag_from_query("tag:vla") == "vla"


def test_normalize_model_envelope() -> None:
    item = {
        "id": "openvla/openvla-7b",
        "author": "openvla",
        "downloads": 441_512,
        "likes": 254,
        "createdAt": "2024-06-10T16:35:59.000Z",
        "lastModified": "2026-02-17T03:43:23.000Z",
        "pipeline_tag": "robotics",
        "tags": ["vla", "license:mit"],
    }
    doc = normalize_model(item, "2026-09-09T12:00:00+00:00", "vla", "tag:vla")
    assert doc.source_id == "huggingface"
    assert doc.source_type == "model"
    assert doc.external_id == "hf:openvla/openvla-7b"
    assert doc.engagement_metrics["downloads"] == 441_512
    assert doc.license_or_access_notes == "mit"


def test_model_metrics_viral_download_visible_in_max() -> None:
    now = datetime(2026, 9, 9, tzinfo=timezone.utc)
    items = [
        {
            "id": "org/famous",
            "author": "org",
            "downloads": 400_000,
            "likes": 200,
            "createdAt": "2024-01-01T00:00:00.000Z",
            "lastModified": "2026-09-08T00:00:00.000Z",
        },
        {
            "id": "lab/one",
            "author": "lab",
            "downloads": 12,
            "likes": 3,
            "createdAt": "2026-09-08T00:00:00.000Z",
            "lastModified": "2026-09-08T00:00:00.000Z",
        },
        {
            "id": "lab/two",
            "downloads": 8,
            "likes": 1,
            "createdAt": "2026-09-07T00:00:00.000Z",
            "lastModified": "2024-01-01T00:00:00.000Z",
        },
    ]
    metrics = compute_model_metrics(items, total_count=90, now=now)
    assert metrics["total_count"] == 90
    assert metrics["downloads_max"] == 400_000
    assert metrics["downloads_median"] == 12
    assert metrics["created_last_7d"] == 2
    assert metrics["updated_last_7d"] == 2
    assert metrics["unique_authors"] == 2
