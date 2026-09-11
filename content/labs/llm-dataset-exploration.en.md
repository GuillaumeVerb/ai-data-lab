---
content_id: llm-dataset-exploration
locale: en
type: lab
title: Can an LLM profile a dataset without inventing stats?
summary: "Versioned A/B run: 8 pasted rows vs a descriptive-stats tool. B error = 0. Ties Decision Copilot."
format: lab
question: Can a model describe a CSV faithfully from text alone, versus with a profiling tool?
hypothesis: Without a tool, even honest stats on a sample stay far from the file. With a tool, error on these fields is zero.
translation_status: adapted
published: true
published_at: "2026-03-30"
updated_at: "2026-09-11"
run_id: profile-ab.v1
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

Versioned public CSV: [`data/labeval/transactions.v1.csv`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/transactions.v1.csv) — 240 orders, seed `20260911`. The first 8 rows are biased on purpose (Paris, rating 5, high amounts).

Two conditions, same fields:

- **A** — descriptives on those 8 rows (the table you would paste into a prompt).
- **B** — the same computation on the full file (the profiling step in [Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator)).

Score: relative error to truth (B). A summary that merely sounds right does not count. This run does not call an LLM: it is the **best case** for text-only. A model that invents numbers can only do worse.

Reproduce: `python -m labeval --run profile-ab`.

## Result

Table above (`profile-ab.v1`). A sees n = 8 instead of 240, no nulls, one city, mean amount ~€98 vs ~€22. B matches truth. Mean error capped at 1: **A 0.659 · B 0**.

## Failure / limit

Not a model leaderboard. Not an agent eval suite. Decision Copilot remains a demo workflow; this lab isolates sample vs tool.

## Next

Wire a real LLM output on the same CSV, extract numeric claims, and compare them to these A/B rows.
