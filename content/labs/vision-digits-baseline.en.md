---
content_id: vision-digits-baseline
locale: en
type: lab
title: A measurable vision baseline from a data seat
summary: "UCI digits 8×8, frozen split, test accuracy: majority 10.03% vs centroid 92.48%. Not a VLM."
format: lab
question: Do data questions (provenance, split, baseline, metric) hold on pixels, before any VLM / VLA story?
hypothesis: A public dataset, a reproducible split and two baselines are enough to make error visible. ROS2 is not the first deliverable.
translation_status: adapted
published: true
published_at: "2026-09-11"
updated_at: "2026-09-11"
run_id: vision-digits.v1
tags:
  - physical-ai
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Dataset: [UCI Optical Recognition of Handwritten Digits](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits), 1,797 8×8 images, 10 classes, values 0–16. Versioned fixture: `data/labeval/uci-digits-8x8.json`.

Stratified 80/20 split, seed `20260911` — 1,438 train, 359 test. Classes roughly balanced (139–146 in train).

Two baselines, no neural net:

- **Majority** — most frequent train class (digit 1).
- **Centroid** — per-class mean pixel vector, nearest Euclidean neighbour.

Metric: test accuracy. Reproduce: `python -m labeval --run vision-digits`.

## Result

Run `vision-digits.v1` above. Majority: **10.03%** (36/359). Centroid: **92.48%** (332/359).

Pixels read as a wide CSV. Provenance, split and baseline come before VLM or ROS2.

## Failure / limit

8×8 digits is an easy problem. This is not a VLM, not a VLA, not a robot policy, not PhotoMind. No perception-action loop.

## Next

Keep this run as a floor. A later vision lab should change dataset or task, not replay 92% on UCI digits.
