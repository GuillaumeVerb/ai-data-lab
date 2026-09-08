from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

USER_AGENT = "AI-Data-Lab-SignalLab/0.1 (https://github.com/GuillaumeVerb/ai-data-lab)"
SEARCH_URL = "https://api.github.com/search/repositories"
SAMPLE_SIZE = 30
TIMEOUT_S = 12


class GitHubError(RuntimeError):
    pass


def search_repositories(query: str, token: str | None = None) -> dict[str, Any]:
    params = urllib.parse.urlencode(
        {"q": query, "sort": "stars", "order": "desc", "per_page": SAMPLE_SIZE}
    )
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    secret = token if token is not None else os.environ.get("GITHUB_TOKEN", "").strip()
    if secret:
        headers["Authorization"] = f"Bearer {secret}"

    request = urllib.request.Request(f"{SEARCH_URL}?{params}", headers=headers)
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
            payload = json.loads(response.read().decode("utf8"))
    except urllib.error.HTTPError as error:
        raise GitHubError(f"GitHub search failed ({error.code})") from error
    except urllib.error.URLError as error:
        raise GitHubError(f"GitHub search unreachable: {error.reason}") from error

    if not isinstance(payload, dict):
        raise GitHubError("GitHub search returned a non-object payload")
    items = payload.get("items")
    if not isinstance(items, list):
        raise GitHubError("GitHub search missing items")
    return payload
