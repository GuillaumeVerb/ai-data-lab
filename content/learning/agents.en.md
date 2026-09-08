---
content_id: agents
locale: en
type: learning
title: Agents
summary: An agent is not a chatbot with plugins. It is an evaluable action loop.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
tags:
  - agents
related_lab_ids:
  - llm-dataset-exploration
related_project_ids:
  - ai-data-investigator
scaffold: true
---

## Simple explanation

An agent observes, chooses a tool or action, observes the result, repeats. If failure is invisible, it is copy, not a system.

## Technical explanation

Loop: state → policy → tool/environment → observation → memory. Useful metrics: completion, tool-use correctness, cost, latency, hallucinations.

## Evidence

No “Agents 80%” bar. Evidence will be labs and projects, once they actually exist.
