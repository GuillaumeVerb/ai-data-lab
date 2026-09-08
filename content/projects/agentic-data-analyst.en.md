---
content_id: agentic-data-analyst
locale: en
type: project
title: Agentic data analyst
summary: An agent that explores a dataset with tools, then returns a sourced diagnosis — to be evaluated, not demoed.
problem: Move from an ad-hoc notebook to an agent + tools + evaluation loop on a real data task.
why_it_matters: This is the Data → Agents bridge. Without an eval protocol it is just a chat demo.
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - agents
  - data
  - evaluation
stack:
  - Python
  - SQL
  - LLM tools
related_lab_ids:
  - llm-dataset-exploration
related_writing_ids:
  - physical-ai-from-data
flagship: true
domain: core
---

## Architecture

Intended loop: question → plan → tool use (profiling, queries, charts) → synthesis → critique.

The model does not invent metrics. It reads tool outputs. Agent scores will be versioned.

## Approach

1. Define a reproducible suite of tabular tasks.
2. Require tools before long-form generation.
3. Measure completion, accuracy, cost, latency, hallucinations.

## Results

Not measured yet. This page is a V0 scaffold. No numbers are fabricated.

## Limitations

Without an evaluation set the agent optimises for impression, not truth. V1 will publish limits before claims.

## Learnings

A flagship project should prove a method, not an interface.
