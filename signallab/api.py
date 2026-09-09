from __future__ import annotations

from fastapi import FastAPI, HTTPException

from signallab import PIPELINE_VERSION
from signallab.store import latest_observations, load_topic_snapshots
from signallab.topics import TOPICS

app = FastAPI(title="SignalLab", version=PIPELINE_VERSION)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "pipeline_version": PIPELINE_VERSION}


@app.get("/v1/topics/{topic_id}")
def get_topic(topic_id: str) -> dict:
    if topic_id not in TOPICS:
        raise HTTPException(status_code=404, detail="Unknown topic")
    snapshots = load_topic_snapshots(topic_id)
    observations = [item for snapshot in snapshots for item in snapshot.observations]
    history_start = observations[0].observed_at if observations else None
    return {
        "topic": {
            "id": topic_id,
            "label": TOPICS[topic_id]["label"],
            "history_start": history_start,
        },
        "observations": [item.model_dump() for item in observations],
    }


@app.get("/v1/signals")
def get_signals(topic: str | None = None) -> dict:
    signals = []
    topic_ids = [topic] if topic else sorted(TOPICS)
    if topic and topic not in TOPICS:
        raise HTTPException(status_code=404, detail="Unknown topic")
    for topic_id in topic_ids:
        for observation in latest_observations(topic_id):
            signals.append(
                {
                    "topic_id": observation.topic_id,
                    "source_id": observation.source_id,
                    "metrics": observation.metrics,
                    "computed_at": observation.observed_at,
                    "pipeline_version": observation.pipeline_version,
                    "scores": None,
                    "note": "Metrics only. Interpretable scores are V2.5.",
                }
            )
    return {"signals": signals}
