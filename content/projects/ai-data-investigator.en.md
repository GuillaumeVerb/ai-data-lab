---
content_id: ai-data-investigator
locale: en
type: project
title: AI Decision Copilot
summary: A tabular analytics agent — profiling, investigation, explainable prediction, scenarios — not a chat-over-CSV demo.
problem: A CSV lands. Without a method you get a plausible summary. The need is a loop of investigation → explanation → simulation, with tool outputs before prose.
why_it_matters: This is the Lab’s Data → Agents bridge. The repo README positions it as an analytics product, not a chatbot demo.
translation_status: adapted
published: true
published_at: "2026-03-30"
updated_at: "2026-09-08"
tags:
  - agents
  - data
  - evaluation
stack:
  - Python
  - FastAPI
  - pandas
github_url: https://github.com/GuillaumeVerb/ai-data-investigator
related_lab_ids:
  - llm-dataset-exploration
related_writing_ids:
  - agent-vs-workflow
flagship: true
domain: core
scaffold: false
---

## Architecture

Documented flow: `upload → diagnose → investigate → explain → simulate → recommend → export`.

FastAPI serves the UI. Ingestion, profiling, investigation, root-cause, ML engine, scenarios, actions, copilot and HTML export are separate modules, not one prompt.

## Data

Uploaded CSV or the sample set. Derived features in the profiler. No client-data claims.

## Approach

1. Profile before narrating.
2. Rank investigation paths.
3. Train an explainable model when a target exists (the demo uses `revenue`).
4. Compare scenarios before recommending.
5. Export an HTML analysis note.

## Results

No public agent-quality metrics are published here. The evidence is the workflow and the code. Agent scores will be versioned in the Lab, not invented after the fact.

## Limitations

The README is explicit: portfolio / short demo / business storytelling. Not a client deployment. No formal eval (task completion, hallucinations, cost) on this page.

## Learnings

A credible analyst agent needs tools and artifacts (profile, scenarios, report) before prose. Next Lab step: an eval protocol on a reproducible tabular task suite.

## Next

Connect this project to the lab “can an LLM profile a dataset without inventing stats?”.
