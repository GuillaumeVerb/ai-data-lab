---
content_id: physical-ai-first-notes
locale: en
type: lab
title: First Physical AI notes from a data seat
summary: "Entry lab: map VLM / VLA / ROS2 / simulation. The first pixel run is the 8×8 digits lab."
format: lab
question: What should a data profile learn first to approach Physical AI?
hypothesis: Data questions (provenance, eval, cost, drift) transfer. Vocabulary (VLM, VLA, world models) comes before ROS2.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-11"
tags:
  - physical-ai
  - vlm
related_project_ids: []
scaffold: false
---

## Setup

No robot, no published sim. Reading plus a mental map. PhotoMind (library, clustering, search) stays a **private** personal project.

## Result

A useful map:

- **VLM** — see and describe.
- **VLA** — see → language → action.
- **ROS2 / sim / world models** — not started in public.

The same questions as on a CSV apply: where the signal comes from, how error is measured, what it costs.

First public pixel run: lab *A measurable vision baseline from a data seat* (UCI digits 8×8, majority vs centroid).

## Failure / limit

No perception-action run. ROS2, simulation and world models are not started here. The digits baseline is not a VLM.

## Next

Change dataset or task before stacking robotics vocabulary. Tie to the explainer *Physical AI from a data perspective*.
