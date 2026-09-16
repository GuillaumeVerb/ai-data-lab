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
updated_at: "2026-09-15"
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

Le lab de profilage publie un run A/B/C (`profile-llm.v1`) : échantillon vs outil vs claims extraits. Les scores d’agents hors ce protocole restent absents de cette page.

## Limites

Le README le dit : positionnement portfolio / démo courte / storytelling business. Pas un déploiement client. Pas de task-completion globale sur le workflow entier.

## Learnings

Un analyste agentique crédible impose des outils et des artefacts (profil, scénarios, rapport) avant la prose. Le gap échantillon vs outil est maintenant chiffré dans le Lab.

## Suite

Écraser la trace C avec un appel live (`python -m labeval --run profile-llm --live`) dès qu’une clé est disponible.
