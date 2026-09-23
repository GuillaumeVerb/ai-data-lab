---
content_id: human-in-the-loop-automation
locale: en
type: lab
title: An automation agent with no irreversible side effects
summary: "v2, same 20 cases: classification 100%, false autonomy 15% (down from 60% in v1)."
format: lab
question: Can an AI workflow stay useful without executing irreversible external actions?
hypothesis: Suggestion / assisted modes, with a timeline and feedback, are enough for a credible MVP. Full autonomy is not the first deliverable.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-23"
run_id: hitl-agent.v2
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids:
  - ai-automation-agent
scaffold: false
---

## Setup

Public repo [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent), commit [`19343e5`](https://github.com/GuillaumeVerb/ai-automation-agent/commit/19343e51bdd9a2bdf37512cb79a7118ba4a32140). Same gold set as `hitl-agent.v1`: [`data/labeval/hitl-agent.v1.cases.json`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/hitl-agent.v1.cases.json).

Measured fixes: word-boundary keywords (`merci` ≠ `commerciale`), mixed-intent priority (support > admin > commercial > reporting), `low_risk_auto` reserved for reporting.

Reproduce: `python -m labeval --run hitl-agent`.

## Result

Run `hitl-agent.v2` above, versus v1 on the **same 20 cases**:

| | v1 (`e920cf9`) | v2 (`19343e5`) |
| --- | --- | --- |
| Classification | 85% | **100%** |
| Extraction | 90% | **96.25%** |
| Tool choice | 95% | **100%** |
| False autonomy | **60%** | **15%** |
| Human review | 35% | **80%** |

The three remaining false-autonomy cases are admin / incident still on `assisted` while gold asks for `suggestion_only`.

## Failure / limit

Heuristic path, not a live LLM, not Gmail/Slack. The v1 snapshot stays published: that is the before. MCP is out of this run.

## Next

The same gold with `provider_live` when a key is available.
