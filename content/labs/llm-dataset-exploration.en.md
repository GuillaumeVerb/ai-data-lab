---
content_id: llm-dataset-exploration
locale: en
type: lab
title: Can an LLM profile a dataset without inventing stats?
summary: "A short tabular-profiling experiment. Hypothesis: without tools, invented statistics slip through."
format: lab
question: Can a model describe a CSV faithfully from text alone, versus with a profiling tool?
hypothesis: Without a tool the model will invent plausible distributions. With a tool, error becomes measurable.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - evaluation
  - data
related_project_ids:
  - agentic-data-analyst
---

## Setup

Compare two conditions on the same file: (A) text context only, (B) descriptive-stats tool. Score = distance to real stats.

## Result

Not run yet. The protocol is the V0 deliverable.

## Expected failure

Summaries that sound right are the default failure mode.

## Next

Connect this experiment to the agentic analyst as soon as a first run exists.
