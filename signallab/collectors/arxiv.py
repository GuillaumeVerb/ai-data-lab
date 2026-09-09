from __future__ import annotations

import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from typing import Any

from signallab import USER_AGENT

SEARCH_URL = "https://export.arxiv.org/api/query"
SAMPLE_SIZE = 30
TIMEOUT_S = 20
ATOM = "{http://www.w3.org/2005/Atom}"
OPENSEARCH = "{http://a9.com/-/spec/opensearch/1.1/}"
ARXIV_NS = "{http://arxiv.org/schemas/atom}"


class ArxivError(RuntimeError):
    pass


def search_papers(query: str) -> dict[str, Any]:
    params = urllib.parse.urlencode(
        {
            "search_query": query,
            "start": 0,
            "max_results": SAMPLE_SIZE,
            "sortBy": "submittedDate",
            "sortOrder": "descending",
        }
    )
    request = urllib.request.Request(
        f"{SEARCH_URL}?{params}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/atom+xml"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_S) as response:
            raw = response.read()
    except urllib.error.HTTPError as error:
        raise ArxivError(f"arXiv search failed ({error.code})") from error
    except urllib.error.URLError as error:
        raise ArxivError(f"arXiv search unreachable: {error.reason}") from error

    return parse_atom(raw)


def parse_atom(raw: bytes) -> dict[str, Any]:
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as error:
        raise ArxivError("arXiv returned invalid XML") from error

    total = root.findtext(f"{OPENSEARCH}totalResults") or "0"
    items: list[dict[str, Any]] = []
    for entry in root.findall(f"{ATOM}entry"):
        authors = [
            (author.findtext(f"{ATOM}name") or "").strip()
            for author in entry.findall(f"{ATOM}author")
        ]
        category = entry.find(f"{ARXIV_NS}primary_category")
        items.append(
            {
                "id": (entry.findtext(f"{ATOM}id") or "").strip(),
                "title": entry.findtext(f"{ATOM}title") or "",
                "summary": entry.findtext(f"{ATOM}summary") or "",
                "published": entry.findtext(f"{ATOM}published") or "",
                "updated": entry.findtext(f"{ATOM}updated") or "",
                "authors": [name for name in authors if name],
                "primary_category": category.get("term") if category is not None else None,
            }
        )
    return {"total_count": int(total), "items": items}
