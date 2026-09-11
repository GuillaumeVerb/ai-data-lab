"""Vision baseline: UCI 8×8 digits, majority vs nearest class centroid.

Pixels treated as a table. Not a VLM, not a VLA, not ROS2. Public dataset,
frozen split, two baselines, accuracy on the test fold.
"""

from __future__ import annotations

import base64
import json
import random
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from labeval import DATA

RUN_ID = "vision-digits.v1"
FIXTURE_NAME = "uci-digits-8x8.json"
SNAPSHOT_NAME = "vision-digits.v1.json"
SEED = 20260911
TEST_RATIO = 0.2
N_CLASSES = 10
METHOD = (
    "UCI Optical Recognition of Handwritten Digits, 8×8 pixels, values 0–16. "
    "Stratified 80/20 split, seed 20260911. Majority class vs nearest class "
    "centroid (Euclidean). Metric = test accuracy. Not a VLM. Not a robot run."
)


def load_fixture(path: Path | None = None) -> tuple[list[list[int]], list[int], dict[str, Any]]:
    fixture_path = path or (DATA / FIXTURE_NAME)
    payload = json.loads(fixture_path.read_text(encoding="utf8"))
    raw = base64.b64decode(payload["x_b64"])
    width = int(payload["width"]) * int(payload["height"])
    n = int(payload["n"])
    x = [list(raw[index * width : (index + 1) * width]) for index in range(n)]
    y = [int(label) for label in payload["y"]]
    if len(x) != n or len(y) != n:
        raise ValueError("digits fixture length mismatch")
    return x, y, payload


def stratified_split(y: list[int], *, seed: int = SEED, test_ratio: float = TEST_RATIO) -> tuple[list[int], list[int]]:
    rng = random.Random(seed)
    by_class: dict[int, list[int]] = defaultdict(list)
    for index, label in enumerate(y):
        by_class[label].append(index)
    train: list[int] = []
    test: list[int] = []
    for label in range(N_CLASSES):
        idxs = list(by_class[label])
        rng.shuffle(idxs)
        n_test = max(1, round(len(idxs) * test_ratio))
        test.extend(idxs[:n_test])
        train.extend(idxs[n_test:])
    return train, test


def class_counts(labels: list[int]) -> dict[str, int]:
    tallies = Counter(labels)
    return {str(k): int(tallies.get(k, 0)) for k in range(N_CLASSES)}


def majority_label(labels: list[int]) -> int:
    tallies = Counter(labels)
    return max(range(N_CLASSES), key=lambda k: (tallies.get(k, 0), -k))


def centroids(x: list[list[int]], y: list[int], indices: list[int]) -> list[list[float]]:
    sums = [[0.0] * len(x[0]) for _ in range(N_CLASSES)]
    counts = [0] * N_CLASSES
    for index in indices:
        label = y[index]
        counts[label] += 1
        for dim, value in enumerate(x[index]):
            sums[label][dim] += value
    out: list[list[float]] = []
    width = len(x[0])
    for label in range(N_CLASSES):
        if counts[label] == 0:
            out.append([0.0] * width)
            continue
        out.append([value / counts[label] for value in sums[label]])
    return out


def predict_centroid(row: list[int], centers: list[list[float]]) -> int:
    best = 0
    best_d = float("inf")
    for label, center in enumerate(centers):
        dist = 0.0
        for left, right in zip(row, center):
            delta = left - right
            dist += delta * delta
        if dist < best_d:
            best_d = dist
            best = label
    return best


def accuracy(y_true: list[int], y_pred: list[int]) -> float:
    if not y_true:
        return 0.0
    hits = sum(int(left == right) for left, right in zip(y_true, y_pred))
    return round(hits / len(y_true), 4)


def build_snapshot(
    *,
    fixture_path: Path | None = None,
    computed_at: str | None = None,
) -> dict[str, Any]:
    x, y, meta = load_fixture(fixture_path)
    train_idx, test_idx = stratified_split(y)
    y_train = [y[i] for i in train_idx]
    y_test = [y[i] for i in test_idx]
    majority = majority_label(y_train)
    majority_pred = [majority] * len(y_test)
    centers = centroids(x, y, train_idx)
    centroid_pred = [predict_centroid(x[i], centers) for i in test_idx]
    return {
        "id": RUN_ID,
        "kind": "vision-digits",
        "computed_at": computed_at or datetime.now(timezone.utc).isoformat(),
        "pipeline_version": "labeval.vision.v1",
        "method": METHOD,
        "dataset": {
            "name": meta.get("name", "UCI digits 8×8"),
            "url": meta.get("url"),
            "n": meta["n"],
            "shape": [meta["width"], meta["height"]],
            "classes": N_CLASSES,
        },
        "split": {
            "seed": SEED,
            "test_ratio": TEST_RATIO,
            "n_train": len(train_idx),
            "n_test": len(test_idx),
            "majority_class": majority,
        },
        "class_balance_train": class_counts(y_train),
        "metrics": {
            "majority_accuracy": accuracy(y_test, majority_pred),
            "centroid_accuracy": accuracy(y_test, centroid_pred),
            "majority_correct": sum(int(left == right) for left, right in zip(y_test, majority_pred)),
            "centroid_correct": sum(int(left == right) for left, right in zip(y_test, centroid_pred)),
            "n_test": len(y_test),
        },
    }


def write_snapshot(directory: Path | None = None) -> dict[str, Any]:
    target = directory or DATA
    target.mkdir(parents=True, exist_ok=True)
    snapshot = build_snapshot()
    (target / SNAPSHOT_NAME).write_text(json.dumps(snapshot, indent=2) + "\n", encoding="utf8")
    return snapshot
