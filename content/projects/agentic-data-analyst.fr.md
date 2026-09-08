---
content_id: agentic-data-analyst
locale: fr
type: project
title: Analyste de données agentique
summary: Un agent qui explore un jeu de données avec des outils, puis rend un diagnostic sourcé — à évaluer, pas à démontrer.
problem: Passer d’un notebook ad hoc à une boucle agent + outils + évaluation sur une tâche data réelle.
why_it_matters: C’est le pont Data → Agents. Sans protocole d’eval, ce n’est qu’une démo de chat.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - agents
  - data
  - evaluation
stack:
  - Python
  - SQL
  - LLM tools
related_lab_ids:
  - llm-dataset-exploration
related_writing_ids:
  - physical-ai-from-data
flagship: true
domain: core
---

## Architecture

Boucle prévue : question → plan → tool use (profilage, requêtes, graphiques) → synthèse → critique.

Le LLM n’invente pas les métriques. Il lit des sorties d’outils. Les scores d’agents seront versionnés.

## Approche

1. Définir une suite de tâches tabulaires reproductibles.
2. Imposer des outils avant toute génération longue.
3. Mesurer completion, exactitude, coût, latence, hallucinations.

## Résultats

Pas encore mesurés. Cette page est un scaffold V0. Aucun chiffre n’est inventé.

## Limites

Sans jeu d’évaluation, l’agent optimise l’impression, pas la vérité. V1 publiera des limites avant des claims.

## Learnings

Le projet flagship doit démontrer une méthode, pas une interface.
