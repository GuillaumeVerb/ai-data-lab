---
content_id: agents
locale: fr
type: learning
title: Agents
summary: Un agent n’est pas un chatbot avec des plugins. C’est une boucle d’action évaluable.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
tags:
  - agents
related_lab_ids:
  - llm-dataset-exploration
related_project_ids:
  - agentic-data-analyst
---

## Explication simple

Un agent observe, choisit un outil ou une action, observe le résultat, recommence. S’il ne peut pas se tromper de façon visible, ce n’est pas un système, c’est une copie.

## Explication technique

Boucle : state → policy → tool/environment → observation → memory. Les métriques utiles sont completion, tool-use correctness, coût, latence, hallucinations.

## Preuves liées

Pas de jauge « Agents 80% ». Les preuves seront des labs et des projets, dès qu’ils existent pour de vrai.
