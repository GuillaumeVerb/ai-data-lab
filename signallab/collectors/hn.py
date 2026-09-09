from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from signallab import USER_AGENT

SEARCH_URL = "https://hn.algolia.com/api/v1/search"
SAMPLE_SIZE = 30
TIMEOUT_S = 12


class HackerNewsError(RuntimeError):
    pass


def search_stories(query: str) -> dict[str, Any]:
    params = urllib.parse.urlencode(
        {
            "query": query,
            "tags": "story",
            "hitsPerPage": SAMPLE_SIZE,
        }
    )
    request = urllib.request.Request(
        f"{SEARCH_URL}?{params}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
            payload = json.loads(response.read().decode("utf8"))
    except urllib.error.HTTPError as error:
        raise HackerNewsError(f"Hacker News search failed ({error.code})") from error
    except urllib.error.URLError as error:
        raise HackerNewsError(f"Hacker News unreachable: {error.reason}") from error

    if not isinstance(payload, dict):
        raise HackerNewsError("Hacker News returned a non-object payload")
    hits = payload.get("hits")
    if not isinstance(hits, list):
        raise HackerNewsError("Hacker News missing hits")
    return {"total_count": int(payload.get("nbHits") or 0), "items": hits}
