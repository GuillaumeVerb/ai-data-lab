---
content_id: agents
locale: en
type: learning
title: Agents
summary: An evaluable action loop, not a chatbot with plugins.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
stage: evidence
tags:
  - agents
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Simple explanation

An agent observes, chooses a tool or action, observes the result, repeats. If failure is invisible, it is not a system.

## Technical explanation

state → policy → tool/environment → observation. Metrics: completion, tool-use correctness, cost, latency, hallucinations.

## Evidence

Decision Copilot (investigation loop) and Automation Agent (HITL, not multi-agent). No “Agents 80%” bar.
