---
content_id: llm-dataset-exploration
locale: en
type: lab
title: Can an LLM profile a dataset without inventing stats?
summary: "Eval protocol: text-only vs a descriptive-stats tool. Ties Decision Copilot to a measurable question."
format: lab
question: Can a model describe a CSV faithfully from text alone, versus with a profiling tool?
hypothesis: Without a tool the model will invent plausible distributions. With a tool, error becomes measurable.
translation_status: adapted
published: true
published_at: "2026-03-30"
updated_at: "2026-09-11"
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

Two conditions on the same file:

- **A** — text context (sample or verbalised schema), no tool.
- **B** — descriptive-stats tool (counts, nulls, min/max, distributions) then generation.

Intended score: distance to stats computed outside the LLM. A summary that merely sounds right does not count.

[AI Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator) already runs profiling **before** narrative. This lab isolates the evaluation question.

## Result

No versioned A/B table is published here. The public deliverable is the protocol, plus Copilot’s split between profiling and storytelling.

## Failure / limit

Without an error score the reading stays qualitative. Decision Copilot is a demo workflow, not an eval suite.

## Next

Run A/B on a sample CSV, persist the snapshot (true stats, output A, output B), and only show a number if it is reproducible.
