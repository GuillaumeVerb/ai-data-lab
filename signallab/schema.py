from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field

from signallab import PIPELINE_VERSION


class CollectedDocument(BaseModel):
    source_id: str
    source_type: str
    external_id: str
    canonical_url: str
    title: str
    author_or_org: str | None = None
    published_at: str | None = None
    collected_at: str
    language: str | None = None
    raw_text_or_description: str = ""
    engagement_metrics: dict[str, int] = Field(default_factory=dict)
    source_specific_metadata: dict[str, Any] = Field(default_factory=dict)
    license_or_access_notes: str | None = None


class Observation(BaseModel):
    topic_id: str
    observed_at: str
    source_id: str
    pipeline_version: str
    query: str
    metrics: dict[str, float | int]
    sample_urls: list[str] = Field(default_factory=list)
    assumptions: str


class TopicSnapshot(BaseModel):
    topic_id: str
    source_id: str
    pipeline_version: str = PIPELINE_VERSION
    observations: list[Observation] = Field(default_factory=list)
