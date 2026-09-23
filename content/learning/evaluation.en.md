---
content_id: evaluation
locale: en
type: learning
title: Evaluation
summary: Metrics first, interpretation second. No arbitrary LLM scores.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-23"
last_reviewed_at: "2026-09-23"
stage: evidence
tags:
  - evaluation
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
  - vision-digits-baseline
related_project_ids:
  - ai-data-investigator
  - ai-automation-agent
scaffold: false
---

## Simple explanation

If you cannot fail in a visible way, you are not evaluating — you are storytelling.

## Technical explanation

Task completion, accuracy, cost, latency, hallucinations, tool-use. Keep versions. Later SignalLab: early-signal precision, not a vibe check.

## Evidence

Profiling A/B/C (`profile-llm.v1`) and numbered HITL automation (`hitl-agent.v2`: classification 100%, false autonomy 15%, down from 60% in v1). Versioned gold, not a framework ranking.
