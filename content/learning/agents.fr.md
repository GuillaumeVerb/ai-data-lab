---
content_id: agents
locale: fr
type: learning
title: Agents
summary: Une boucle d’action évaluable, pas un chatbot avec des plugins.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
stage: evidence
tags:
  - agents
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Explication simple

Un agent observe, choisit un outil ou une action, observe le résultat, recommence. Si l’échec n’est pas visible, ce n’est pas un système.

## Explication technique

state → policy → tool/environment → observation. Métriques : completion, tool-use correctness, coût, latence, hallucinations.

## Preuves

Decision Copilot (boucle d’investigation) et Automation Agent (HITL, pas multi-agent). Pas de jauge « Agents 80% ».
