---
content_id: human-in-the-loop-automation
locale: en
type: lab
title: An automation agent with no irreversible side effects
summary: "Public MVP: triage, extraction, automation score, human review. Tool use, not a multi-agent system."
format: lab
question: Can an AI workflow stay useful without executing irreversible external actions?
hypothesis: Suggestion / assisted modes, with a timeline and feedback, are enough for a credible MVP. Full autonomy is not the first deliverable.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-08"
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Public repo [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent): Python, FastAPI, SQLite, Streamlit, Pytest.

Flow: text or email → progressive run → closed-set classification → extraction → summary → draft (email or markdown) → automation score → live timeline → human review.

Documented autonomy modes: `suggestion_only`, `assisted`, `low_risk_auto`. No irreversible external actions.

## Result

A demonstrable local MVP exists: cockpit UI (input, timeline, artifacts), persisted runs and feedback, explainability panel. It is **not** an MCP server, and not a multi-agent system.

## Failure / limit

No published tool-use correctness or false-autonomy rate. The automation score is an internal heuristic, not a Lab benchmark. No live Gmail/Slack integration in the README.

## Next

Treat this repo as evidence of **tool use + human-in-the-loop**. MCP (connectors, servers) stays a Learning node on “exploring”, not a claimed skill.
