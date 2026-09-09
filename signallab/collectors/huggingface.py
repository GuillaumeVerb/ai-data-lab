from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

from signallab import USER_AGENT

MODELS_URL = "https://huggingface.co/api/models"
QUICKSEARCH_URL = "https://huggingface.co/api/quicksearch"
SAMPLE_SIZE = 30
TIMEOUT_S = 12


class HuggingFaceError(RuntimeError):
    pass


def tag_from_query(query: str) -> str:
    return query.removeprefix("tag:").strip()


def _get_json(url: str) -> tuple[dict[str, str], Any]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
            headers = {key.lower(): value for key, value in response.headers.items()}
            payload = json.loads(response.read().decode("utf8"))
    except urllib.error.HTTPError as error:
        raise HuggingFaceError(f"Hugging Face request failed ({error.code})") from error
    except urllib.error.URLError as error:
        raise HuggingFaceError(f"Hugging Face unreachable: {error.reason}") from error
    return headers, payload


def estimate_model_count(tag: str) -> int:
    """Hub full-text estimate for the tag string. Not a tag census."""
    params = urllib.parse.urlencode({"q": tag, "type": "model"})
    _, payload = _get_json(f"{QUICKSEARCH_URL}?{params}")
    if not isinstance(payload, dict):
        return 0
    try:
        return int(payload.get("modelsCount") or 0)
    except (TypeError, ValueError):
        return 0


def search_models(query: str) -> dict[str, Any]:
    tag = tag_from_query(query)
    params = urllib.parse.urlencode(
        {
            "filter": tag,
            "sort": "downloads",
            "direction": -1,
            "limit": SAMPLE_SIZE,
            "full": "true",
        }
    )
    _, payload = _get_json(f"{MODELS_URL}?{params}")
    if not isinstance(payload, list):
        raise HuggingFaceError("Hugging Face returned a non-list payload")
    items = [item for item in payload if isinstance(item, dict)]
    return {"total_count": estimate_model_count(tag), "items": items}
