---
content_id: ai-knowledge-copilot
locale: en
type: project
title: AI Knowledge Copilot
summary: A grounded document assistant — retrieval before generation, visible excerpts, confidence signals. Not a generic chatbot.
problem: Internal knowledge is fragmented. Search returns noise; an LLM without retrieval answers fluently and wrong.
why_it_matters: This is the pattern Ask My Lab must follow. Retrieval, citations and explicit uncertainty before any answer.
translation_status: adapted
published: true
published_at: "2026-04-03"
updated_at: "2026-09-08"
tags:
  - rag
  - retrieval
  - evaluation
stack:
  - Python
  - React
  - RAG
github_url: https://github.com/GuillaumeVerb/ai-knowledge-copilot
related_lab_ids: []
related_writing_ids: []
flagship: false
domain: core
scaffold: false
---

## Architecture

File ingest → chunks → retrieval → context narrowing → generation → excerpts, confidence and a “why this answer” panel.

Product modes: Ask, single-document summary, compare, cross-document synthesis, metadata filters, session history.

French-first UI, FR/EN switch.

## Data

PDF, DOCX, TXT, MD, CSV. No OCR on scanned PDFs. No XLSX, PPTX, email or connectors yet.

## Approach

- Retrieval before generation.
- Source narrowing before the final answer.
- Confidence signals instead of false certainty.
- Workflows (summary, compare, synthesis) rather than one chat box.

## Results

Evidence: architecture, workflows and the trust layer in the public repo. No published retrieval benchmark numbers here.

## Limitations

No auth, no workspace boundaries, no permissions. No OCR. An internal demonstration product, not a client SaaS.

## Learnings

“Grounded” has to show up in the UI: excerpts, confidence, document compare. Ask My Lab will reuse that discipline, with a 30+ question set from V3.
