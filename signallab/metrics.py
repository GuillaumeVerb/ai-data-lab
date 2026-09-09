"""Raw GitHub-search metrics. These are measurements, not scores.

Formulas (sample = up to 30 GitHub repos matching the topic label, sorted by stars):

- sample_size          = len(sample)
- total_count          = GitHub search.total_count (estimate, not a census)
- stars_sum            = sum(stargazers_count)
- stars_max            = max(stargazers_count)   # skew / single-viral-repo check
- stars_median         = median(stargazers_count)
- forks_sum            = sum(forks_count)
- created_last_7d      = count(created_at >= now-7d)
- created_last_30d     = count(created_at >= now-30d)
- pushed_last_7d       = count(pushed_at >= now-7d)

A single popular repository inflates stars_sum and stars_max, not stars_median.
That skew is left visible on purpose. V2.5 scoring must not hide it.

We sort by stars, not updated, so pushed_last_7d is not tautological.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def _parse_dt(value: object) -> datetime | None:
    if not isinstance(value, str) or not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None


def _median(values: list[int]) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    mid = len(ordered) // 2
    if len(ordered) % 2:
        return float(ordered[mid])
    return (ordered[mid - 1] + ordered[mid]) / 2


def compute_repo_metrics(items: list[dict[str, Any]], total_count: int, now: datetime | None = None) -> dict[str, float | int]:
    moment = now or datetime.now(timezone.utc)
    week = moment - timedelta(days=7)
    month = moment - timedelta(days=30)
    stars = [int(item.get("stargazers_count") or 0) for item in items]
    forks = [int(item.get("forks_count") or 0) for item in items]

    created_7 = 0
    created_30 = 0
    pushed_7 = 0
    for item in items:
        created = _parse_dt(item.get("created_at"))
        pushed = _parse_dt(item.get("pushed_at"))
        if created and created >= month:
            created_30 += 1
            if created >= week:
                created_7 += 1
        if pushed and pushed >= week:
            pushed_7 += 1

    return {
        "sample_size": len(items),
        "total_count": int(total_count),
        "stars_sum": sum(stars),
        "stars_max": max(stars) if stars else 0,
        "stars_median": _median(stars),
        "forks_sum": sum(forks),
        "created_last_7d": created_7,
        "created_last_30d": created_30,
        "pushed_last_7d": pushed_7,
    }


def compute_paper_metrics(items: list[dict[str, Any]], total_count: int, now: datetime | None = None) -> dict[str, float | int]:
    """arXiv metrics. Sample = up to 30 most recently submitted hits.

    published_last_7d saturates at 30: if the field is hotter than that,
    the count is capped. total_count is the API's matching-paper estimate.
    """
    moment = now or datetime.now(timezone.utc)
    week = moment - timedelta(days=7)
    month = moment - timedelta(days=30)
    published_7 = 0
    published_30 = 0
    authors: set[str] = set()
    for item in items:
        published = _parse_dt(item.get("published"))
        if published and published >= month:
            published_30 += 1
            if published >= week:
                published_7 += 1
        for name in item.get("authors") or []:
            if isinstance(name, str) and name.strip():
                authors.add(name.strip().lower())
    return {
        "sample_size": len(items),
        "total_count": int(total_count),
        "published_last_7d": published_7,
        "published_last_30d": published_30,
        "unique_authors": len(authors),
    }


def compute_story_metrics(items: list[dict[str, Any]], total_count: int, now: datetime | None = None) -> dict[str, float | int]:
    """HN metrics. Sample = up to 30 Algolia story hits (relevance ranking).

    points_max vs points_median shows a single viral thread. created_last_7d
    is counted on that sample, not on every matching story ever posted.
    """
    moment = now or datetime.now(timezone.utc)
    week = moment - timedelta(days=7)
    month = moment - timedelta(days=30)
    points = [int(item.get("points") or 0) for item in items]
    comments = [int(item.get("num_comments") or 0) for item in items]
    created_7 = 0
    created_30 = 0
    authors: set[str] = set()
    for item in items:
        created = _parse_dt(item.get("created_at"))
        if created is None and item.get("created_at_i") is not None:
            try:
                created = datetime.fromtimestamp(int(item["created_at_i"]), tz=timezone.utc)
            except (TypeError, ValueError, OSError):
                created = None
        if created and created >= month:
            created_30 += 1
            if created >= week:
                created_7 += 1
        author = item.get("author")
        if isinstance(author, str) and author.strip():
            authors.add(author.strip().lower())
    return {
        "sample_size": len(items),
        "total_count": int(total_count),
        "points_sum": sum(points),
        "points_max": max(points) if points else 0,
        "points_median": _median(points),
        "comments_sum": sum(comments),
        "created_last_7d": created_7,
        "created_last_30d": created_30,
        "unique_authors": len(authors),
    }
