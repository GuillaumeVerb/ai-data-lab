---
content_id: tool-use
locale: en
type: learning
title: Tool use
summary: The tool runs, the model reads the result. No silent field invention.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
stage: evidence
tags:
  - tool-use
related_lab_ids:
  - human-in-the-loop-automation
  - llm-dataset-exploration
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Simple explanation

A tool computes or acts. The model must not fabricate the tool’s output.

## Technical explanation

Deterministic calls (profiling, closed-set classification, schema extraction). Retry, idempotence, human review before side effects.

## Evidence

Automation Agent plus profiling in Decision Copilot. **Not** a public MCP server.
