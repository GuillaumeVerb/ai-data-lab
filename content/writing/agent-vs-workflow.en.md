---
content_id: agent-vs-workflow
locale: en
type: writing
title: Agent vs workflow
summary: Three public systems, three autonomy levels. Not everything needs to be an agent.
kind: explainer
translation_status: adapted
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - agents
  - evaluation
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
related_project_ids:
  - ai-data-investigator
  - ai-knowledge-copilot
scaffold: false
---

## The mix-up

“Agent” is too often a marketing label for a pipeline with an LLM in the middle. This Lab keeps **workflow**, **tool use** and **evaluable agent** apart on purpose.

## Three pieces of evidence, three shapes

1. **Knowledge Copilot** — retrieval then generation. A grounded workflow, not an action loop in the world.
2. **Automation Agent** — classification, extraction, score, human in the loop. Semi-deterministic. The README is explicit: not a multi-agent system.
3. **Decision Copilot** — profiling → investigation → scenarios. More agentic, still without a published eval suite.

## Rule

If failure is invisible (no tool, no metric, no review), it is copy, not a system. An honest workflow beats a cosmetic agent.

## What I am not concluding

No “best framework” ranking. No MCP claim. The next useful proof is an A/B protocol on tabular profiling, not another API wrapper.
