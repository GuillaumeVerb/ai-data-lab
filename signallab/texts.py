"""Plain text from collected documents — used by V2.1 TF-IDF, not persisted."""

from __future__ import annotations

import html
import re

from signallab import HF_SOURCE_ID
from signallab.schema import CollectedDocument

SKIP_TAG_PREFIXES = (
    "license:",
    "region:",
    "arxiv:",
    "doi:",
    "base_model:",
    "dataset:",
    "adapter:",
    "diffusers:",
)
ENTITY = re.compile(r"&#x[0-9a-f]+;", re.IGNORECASE)


def clean_text(value: str) -> str:
    text = html.unescape(value)
    text = ENTITY.sub(" ", text)
    return " ".join(text.split())


def document_text(doc: CollectedDocument) -> str:
    extra: list[str] = []
    meta = doc.source_specific_metadata
    tags = meta.get("tags")
    if isinstance(tags, list):
        extra.extend(
            str(tag)
            for tag in tags
            if isinstance(tag, str)
            and not tag.lower().startswith(SKIP_TAG_PREFIXES)
        )
    pipeline = meta.get("pipeline_tag")
    if isinstance(pipeline, str) and pipeline.strip():
        extra.append(pipeline)
    title = doc.title
    if doc.source_id == HF_SOURCE_ID and "/" in title:
        title = title.split("/", 1)[-1]
    parts = [title, doc.raw_text_or_description, *extra]
    return clean_text(
        " ".join(part.strip() for part in parts if isinstance(part, str) and part.strip())
    )


def texts_from_docs(docs: list[CollectedDocument]) -> list[str]:
    seen: set[str] = set()
    texts: list[str] = []
    for doc in docs:
        if doc.external_id in seen:
            continue
        seen.add(doc.external_id)
        text = document_text(doc)
        if text:
            texts.append(text)
    return texts
