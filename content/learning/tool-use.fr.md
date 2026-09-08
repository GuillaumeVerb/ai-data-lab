---
content_id: tool-use
locale: fr
type: learning
title: Tool use
summary: L’outil s’exécute, le modèle lit le résultat. Pas d’invention silencieuse de champs.
translation_status: original
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

## Explication simple

Un outil calcule ou agit. Le modèle ne doit pas fabriquer la sortie de l’outil.

## Explication technique

Appels déterministes (profilage, classification fermée, extraction schéma). Retry, idempotence, validation humaine avant effet de bord.

## Preuves

Automation Agent + profiling dans Decision Copilot. **Pas** un serveur MCP public.
