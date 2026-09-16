---
content_id: evaluation
locale: en
type: learning
title: Evaluation
summary: Metrics first, interpretation second. No arbitrary LLM scores.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-15"
last_reviewed_at: "2026-09-15"
stage: evidence
tags:
  - evaluation
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
  - vision-digits-baseline
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Simple explanation

If you cannot fail in a visible way, you are not evaluating — you are storytelling.

## Technical explanation

Task completion, accuracy, cost, latency, hallucinations, tool-use. Keep versions. Later SignalLab: early-signal precision, not a vibe check.

## Evidence

Profiling A/B/C (`profile-llm.v1`) and numbered HITL automation (`hitl-agent.v1`: classification 85%, false autonomy 60%). Versioned gold, not a framework ranking.
