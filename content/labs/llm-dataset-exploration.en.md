---
content_id: llm-dataset-exploration
locale: en
type: lab
title: Can an LLM profile a dataset without inventing stats?
summary: "Versioned A/B/C run: 8 rows, tool, extracted claims. B error = 0. Frozen trace: C = A."
format: lab
question: Can a model describe a CSV faithfully from text alone, versus with a profiling tool?
hypothesis: Without a tool, even honest stats on a sample stay far from the file. With a tool, error on these fields is zero.
translation_status: adapted
published: true
published_at: "2026-03-30"
updated_at: "2026-09-15"
run_id: profile-llm.v1
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

Versioned public CSV: [`data/labeval/transactions.v1.csv`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/transactions.v1.csv) — 240 orders, seed `20260911`. The first 8 rows are biased on purpose (Paris, rating 5, high amounts).

Three conditions, same fields:

- **A** — descriptives on those 8 rows (the table you would paste into a prompt).
- **B** — the same computation on the full file (the profiling step in [Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator)).
- **C** — claims parsed from a frozen JSON completion, prompt = the 8 rows. Parser in `labeval/profile_llm.py`.

Score: relative error to truth (B). A summary that merely sounds right does not count. A is the **best case** for text-only. CI replays the trace and does not call a provider.

Reproduce: `python -m labeval --run profile-llm`. Live call (if `OPENAI_API_KEY`): `python -m labeval --run profile-llm --live`.

## Result

Table above (`profile-llm.v1`). A sees n = 8 instead of 240, no nulls, one city, mean amount ~€98 vs ~€22. B matches truth. The committed trace is `none` / `restated-sample`: C is the honest JSON of the 8 rows, so **C = A**. Mean error capped at 1: **A 0.659 · B 0 · C 0.659**. Not a model leaderboard.

## Failure / limit

No live provider in this repo (no Lab-side `sk-` key). C proves the extractor and the protocol, not gpt-4o-mini. Decision Copilot remains a demo workflow; this lab isolates sample vs tool vs parsed claims.

## Next

Overwrite the trace with `--live` once a key is in `.env.local`, then republish C.
