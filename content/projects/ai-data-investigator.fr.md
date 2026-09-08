---
content_id: ai-data-investigator
locale: fr
type: project
title: AI Decision Copilot
summary: Un agent d’analyse tabulaire — profilage, investigation, prédiction explicable, scénarios — plutôt qu’un chat sur CSV.
problem: Un CSV arrive. Sans méthode, on obtient un résumé plausible. Il faut une boucle investigation → explication → simulation, avec des sorties d’outils avant le texte.
why_it_matters: C’est le pont Data → Agents du Lab. Le README du repo le positionne comme produit d’analyse, pas comme démo de chatbot.
translation_status: original
published: true
published_at: "2026-03-30"
updated_at: "2026-09-08"
tags:
  - agents
  - data
  - evaluation
stack:
  - Python
  - FastAPI
  - pandas
github_url: https://github.com/GuillaumeVerb/ai-data-investigator
related_lab_ids:
  - llm-dataset-exploration
related_writing_ids:
  - agent-vs-workflow
flagship: true
domain: core
scaffold: false
---

## Architecture

Flux documenté dans le dépôt : `upload → diagnose → investigate → explain → simulate → recommend → export`.

Le frontend est servi par FastAPI. Les étapes (ingestion, profiling, investigation, root-cause, moteur ML, scénarios, actions, copilote, export HTML) sont des modules séparés, pas un seul prompt.

## Données

CSV uploadé ou jeu d’exemple. Features dérivées côté profiling. Pas de claim sur des données clients.

## Approche

1. Profiler avant de raconter.
2. Proposer des pistes d’investigation classées.
3. Entraîner un modèle prédictif avec explicabilité quand une cible existe (ex. `revenue` dans la démo).
4. Comparer des scénarios avant une recommandation.
5. Exporter un rapport HTML de type note d’analyse.

## Résultats

Aucune métrique publique de qualité d’agent n’est publiée ici. Le livrable visible est le workflow et le code. Les scores d’agents seront versionnés dans le Lab, pas inventés après coup.

## Limites

Le README le dit : positionnement portfolio / démo courte / storytelling business. Ce n’est pas un déploiement client. Pas d’évaluation formelle (task completion, hallucinations, coût) dans cette page.

## Learnings

Un analyste agentique crédible impose des outils et des artefacts (profil, scénarios, rapport) avant la prose. La prochaine étape du Lab : un protocole d’eval sur un jeu de tâches tabulaires reproductibles.

## Suite

Relier ce projet au lab « un LLM peut-il profiler un dataset sans halluciner les stats ? ».
