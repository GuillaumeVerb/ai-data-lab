from __future__ import annotations

import re
from pathlib import Path

from signallab import EMBED_PIPELINE, GITHUB_SOURCE_ID, LEXICON_METHOD
from signallab.schema import CollectedDocument, LexiconDay, LexiconStore, Observation, TopicSnapshot

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "signallab"
RAW_DIR = DATA / "raw"
SNAPSHOT_DIR = DATA / "snapshots"
LEXICON_PATH = DATA / "lexicon.json"
MAX_OBSERVATIONS = 30
MAX_LEXICON_DAYS = 30


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


def utc_day(observed_at: str) -> str:
    return observed_at[:10] if len(observed_at) >= 10 else observed_at


def last_per_utc_day(observations: list[Observation]) -> list[Observation]:
    """Keep the last collect of each UTC day. Same-day reruns are not a series."""
    by_day: dict[str, Observation] = {}
    for item in observations:
        by_day[utc_day(item.observed_at)] = item
    return [by_day[day] for day in sorted(by_day)]


def append_observation(observation: Observation) -> TopicSnapshot:
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    snapshot = load_snapshot(observation.topic_id, observation.source_id)
    snapshot.observations = last_per_utc_day([*snapshot.observations, observation])[-MAX_OBSERVATIONS:]
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


def load_lexicon() -> LexiconStore:
    if not LEXICON_PATH.exists():
        return LexiconStore(pipeline_version=EMBED_PIPELINE, method=LEXICON_METHOD, days=[])
    return LexiconStore.model_validate_json(LEXICON_PATH.read_text(encoding="utf8"))


def append_lexicon_day(day: LexiconDay) -> LexiconStore:
    DATA.mkdir(parents=True, exist_ok=True)
    store = load_lexicon()
    by_day = {item.day: item for item in store.days}
    by_day[day.day] = day
    store.days = [by_day[key] for key in sorted(by_day)][-MAX_LEXICON_DAYS:]
    store.pipeline_version = day.pipeline_version
    store.method = day.method
    LEXICON_PATH.write_text(store.model_dump_json(indent=2) + "\n", encoding="utf8")
    return store


def latest_lexicon_day() -> LexiconDay | None:
    days = load_lexicon().days
    return days[-1] if days else None
