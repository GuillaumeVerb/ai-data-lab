---
content_id: human-in-the-loop-automation
locale: en
type: lab
title: An automation agent with no irreversible side effects
summary: "20 gold cases, commit e920cf9. Classification 85%. False autonomy 60%. Tool use, a single agent."
format: lab
question: Can an AI workflow stay useful without executing irreversible external actions?
hypothesis: Suggestion / assisted modes, with a timeline and feedback, are enough for a credible MVP. Full autonomy is not the first deliverable.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-15"
run_id: hitl-agent.v1
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Public repo [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent), commit [`e920cf9`](https://github.com/GuillaumeVerb/ai-automation-agent/commit/e920cf9ce15706cd6f9a59cddae53d962a190f9e). Heuristic path (`APP_LLM_ENABLED=false`): preprocess → classify → extract → score → tool choice (email vs report) → `human_review` gate.

20 gold texts in [`data/labeval/hitl-agent.v1.cases.json`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/hitl-agent.v1.cases.json). Labels are human, not copied from the classifier. False autonomy = recommended mode exceeds `max_autonomy`. Relative-deadline clock pinned to 2026-09-15.

Reproduce: `python -m labeval --run hitl-agent`.

## Result

Run `hitl-agent.v1` above. Classification **85%** (17/20). Extraction (priority / action / tone / channel) **90%**. Tool choice **95%**. Closed-vocab outputs **100%**. False autonomy **60%** (12/20). Human review fired on **35%** of cases.

The three class misses are lexical traps: `KPI` + `plante` goes to reporting, so does an inaccessible dashboard, so does an invoice dressed as a KPI report. The scorer often recommends `low_risk_auto` as soon as the text looks complete, including commercial and admin cases. The extractor marks `commerciale` as a polite tone: `merci` is a substring.

## Failure / limit

This measures the public heuristic path, not a live LLM, not Gmail/Slack. The automation score is still an internal formula; here it is checked against a human autonomy ceiling. MCP is not in this run.

## Next

Rerun the same gold set with `provider_live` when a key is available. The MCP Learning node stays “exploring”.
