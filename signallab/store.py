from __future__ import annotations

from pathlib import Path

from signallab.schema import CollectedDocument, Observation, TopicSnapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "signallab"
RAW_DIR = DATA / "raw"
SNAPSHOT_DIR = DATA / "snapshots"
MAX_OBSERVATIONS = 30


def _safe_name(external_id: str) -> str:
    return external_id.replace("github:", "").replace("/", "__")


def save_document(doc: CollectedDocument) -> Path:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    path = RAW_DIR / f"{_safe_name(doc.external_id)}.json"
    path.write_text(doc.model_dump_json(indent=2) + "\n", encoding="utf8")
    return path


def snapshot_path(topic_id: str) -> Path:
    return SNAPSHOT_DIR / f"{topic_id}.json"


def load_snapshot(topic_id: str) -> TopicSnapshot:
    path = snapshot_path(topic_id)
    if not path.exists():
        return TopicSnapshot(topic_id=topic_id)
    return TopicSnapshot.model_validate_json(path.read_text(encoding="utf8"))


def append_observation(observation: Observation) -> TopicSnapshot:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = load_snapshot(observation.topic_id)
    existing = [item for item in snapshot.observations if item.observed_at != observation.observed_at]
    snapshot.observations = [*existing, observation][-MAX_OBSERVATIONS:]
    snapshot.pipeline_version = observation.pipeline_version
    path = snapshot_path(observation.topic_id)
    path.write_text(snapshot.model_dump_json(indent=2) + "\n", encoding="utf8")
    return snapshot


def list_snapshots() -> list[TopicSnapshot]:
    if not SNAPSHOT_DIR.exists():
        return []
    return [
        TopicSnapshot.model_validate_json(path.read_text(encoding="utf8"))
        for path in sorted(SNAPSHOT_DIR.glob("*.json"))
    ]
