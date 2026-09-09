from __future__ import annotations

import re
from pathlib import Path

from signallab import GITHUB_SOURCE_ID
from signallab.schema import CollectedDocument, Observation, TopicSnapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "signallab"
RAW_DIR = DATA / "raw"
SNAPSHOT_DIR = DATA / "snapshots"
MAX_OBSERVATIONS = 30


def _safe_name(external_id: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "_", external_id)


def save_document(doc: CollectedDocument) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"{_safe_name(doc.external_id)}.json"
    path.write_text(doc.model_dump_json(indent=2) + "\n", encoding="utf8")
    return path


def snapshot_path(topic_id: str, source_id: str) -> Path:
    return SNAPSHOT_DIR / f"{topic_id}.{source_id}.json"


def load_snapshot(topic_id: str, source_id: str) -> TopicSnapshot:
    path = snapshot_path(topic_id, source_id)
    if not path.exists() and source_id == GITHUB_SOURCE_ID:
        legacy = SNAPSHOT_DIR / f"{topic_id}.json"
        if legacy.exists():
            path = legacy
    if not path.exists():
        return TopicSnapshot(topic_id=topic_id, source_id=source_id)
    snapshot = TopicSnapshot.model_validate_json(path.read_text(encoding="utf8"))
    return snapshot.model_copy(update={"source_id": source_id, "topic_id": topic_id})


def append_observation(observation: Observation) -> TopicSnapshot:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = load_snapshot(observation.topic_id, observation.source_id)
    existing = [
        item
        for item in snapshot.observations
        if not (
            item.observed_at == observation.observed_at and item.source_id == observation.source_id
        )
    ]
    snapshot.observations = [*existing, observation][-MAX_OBSERVATIONS:]
    snapshot.pipeline_version = observation.pipeline_version
    snapshot.source_id = observation.source_id
    path = snapshot_path(observation.topic_id, observation.source_id)
    path.write_text(snapshot.model_dump_json(indent=2) + "\n", encoding="utf8")
    return snapshot


def load_topic_snapshots(topic_id: str) -> list[TopicSnapshot]:
    snapshots = []
    for path in _topic_files(topic_id):
        snapshot = TopicSnapshot.model_validate_json(path.read_text(encoding="utf8"))
        snapshots.append(snapshot)
    return snapshots


def list_snapshots() -> list[TopicSnapshot]:
    if not SNAPSHOT_DIR.exists():
        return []
    snapshots = []
    for path in sorted(SNAPSHOT_DIR.glob("*.json")):
        snapshots.append(TopicSnapshot.model_validate_json(path.read_text(encoding="utf8")))
    return snapshots


def latest_observations(topic_id: str) -> list[Observation]:
    latest: list[Observation] = []
    for snapshot in load_topic_snapshots(topic_id):
        if snapshot.observations:
            latest.append(snapshot.observations[-1])
    return latest


def _topic_files(topic_id: str) -> list[Path]:
    if not SNAPSHOT_DIR.exists():
        return []
    files = sorted(SNAPSHOT_DIR.glob(f"{topic_id}.*.json"))
    legacy = SNAPSHOT_DIR / f"{topic_id}.json"
    if legacy.exists():
        files = [legacy, *files]
    return files
