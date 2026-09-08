from __future__ import annotations

from fastapi import FastAPI, HTTPException

from signallab import PIPELINE_VERSION
from signallab.store import list_snapshots, load_snapshot
from signallab.topics import TOPICS

app = FastAPI(title="SignalLab", version=PIPELINE_VERSION)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "pipeline_version": PIPELINE_VERSION}


@app.get("/v1/topics/{topic_id}")
def get_topic(topic_id: str) -> dict:
    if topic_id not in TOPICS:
        raise HTTPException(status_code=404, detail="Unknown topic")
    snapshot = load_snapshot(topic_id)
    return {
        "topic": {
            "id": topic_id,
            "label": TOPICS[topic_id]["label"],
            "history_start": snapshot.observations[0].observed_at if snapshot.observations else None,
        },
        "observations": [item.model_dump() for item in snapshot.observations],
    }


@app.get("/v1/signals")
def get_signals(topic: str | None = None) -> dict:
    snapshots = list_snapshots()
    if topic:
        snapshots = [item for item in snapshots if item.topic_id == topic]
    signals = []
    for snapshot in snapshots:
        latest = snapshot.observations[-1] if snapshot.observations else None
        if not latest:
            continue
        signals.append(
            {
                "topic_id": snapshot.topic_id,
                "metrics": latest.metrics,
                "computed_at": latest.observed_at,
                "pipeline_version": latest.pipeline_version,
                "scores": None,
                "note": "Metrics only. Interpretable scores are V2.5.",
            }
        )
    return {"signals": signals}
