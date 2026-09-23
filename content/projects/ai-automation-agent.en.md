---
content_id: ai-automation-agent
locale: en
type: project
title: AI Automation Agent
summary: A single triage agent — closed-set classification, extraction, score, human review. No irreversible external actions.
problem: A text or email arrives. Without a ceiling, an agent sends too soon. The need is a useful cockpit with an autonomy cap.
why_it_matters: This is the Lab’s HITL agent evidence, scored on a public gold set. One agent, tool use, not an MCP server.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-23"
tags:
  - agents
  - tool-use
  - evaluation
stack:
  - Python
  - FastAPI
  - Streamlit
github_url: https://github.com/GuillaumeVerb/ai-automation-agent
related_lab_ids:
  - human-in-the-loop-automation
related_writing_ids:
  - agent-vs-workflow
flagship: false
domain: core
scaffold: false
---

## Architecture

Documented flow: text or email → preprocess → classify → extract → summarize → score → draft (email or markdown) → `human_review` gate. Modes: `suggestion_only`, `assisted`, `low_risk_auto`.

Modular service layer (FastAPI + SQLite + Streamlit). Heuristics by default; an LLM provider is optional.

## Data

Demo presets in the repo. No live Gmail/Slack. No client data.

## Approach

1. Closed vocabularies for class and extracted fields.
2. An explainable automation score, not a send.
3. `low_risk_auto` reserved for reporting, after lab `hitl-agent.v1` (60% false autonomy).
4. Word-boundary keywords: `merci` no longer matches `commerciale`.

## Results

Lab run `hitl-agent.v2` (commit `19343e5`, same 20 gold cases). Classification **100%**. Extraction **96.25%**. Tool choice **100%**. False autonomy **15%** (down from 60% in v1). Human review on **80%** of cases.

## Limitations

Local MVP, not a deployment. The automation score is still a formula. No MCP. No `provider_live` measurement.

## Learnings

Counting tokens is not enough: a KPI inside an incident, or an invoice inside a report, should lose to operational intent or money. Autonomy is capped; it is not inferred from the score alone.

## Next

The same gold set with an LLM on, once a key is available.
