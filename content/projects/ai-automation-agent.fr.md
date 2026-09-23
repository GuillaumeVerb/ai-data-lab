---
content_id: ai-automation-agent
locale: fr
type: project
title: AI Automation Agent
summary: Un agent unique de triage — classification fermée, extraction, score, revue humaine. Aucune action externe irréversible.
problem: Un texte ou un email arrive. Sans garde-fous, un agent envoie trop tôt. Il faut un cockpit utile avec un plafond d’autonomie.
why_it_matters: C’est la preuve Agents du Lab côté HITL, mesurée sur un gold set public. Un seul agent, tool use, pas un serveur MCP.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-23"
tags:
  - agents
  - tool-use
  - evaluation
stack:
  - Python
  - FastAPI
  - Streamlit
github_url: https://github.com/GuillaumeVerb/ai-automation-agent
related_lab_ids:
  - human-in-the-loop-automation
related_writing_ids:
  - agent-vs-workflow
flagship: false
domain: core
scaffold: false
---

## Architecture

Flux documenté : texte ou email → preprocess → classify → extract → summarize → score → brouillon (email ou markdown) → gate `human_review`. Modes : `suggestion_only`, `assisted`, `low_risk_auto`.

Service layer modulaire (FastAPI + SQLite + Streamlit). Heuristiques par défaut ; un provider LLM est optionnel.

## Données

Presets de démo dans le repo. Pas d’intégration Gmail/Slack réelle. Pas de données clients.

## Approche

1. Vocabulaire fermé pour la classe et les champs extraits.
2. Score d’automation explicable, pas un envoi.
3. `low_risk_auto` réservé au reporting, après le lab `hitl-agent.v1` (60 % de fausses autonomies).
4. Mots-clés en frontières de mot : `merci` ne match plus `commerciale`.

## Résultats

Run Lab `hitl-agent.v2` (commit `19343e5`, mêmes 20 cas gold). Classification **100 %**. Extraction **96,25 %**. Choix d’outil **100 %**. Fausse autonomie **15 %** (contre 60 % en v1). Revue humaine sur **80 %** des cas.

## Limites

MVP local, pas un déploiement. L’automation score reste une formule. Pas de MCP. Pas de mesure `provider_live`.

## Learnings

Compter les mots ne suffit pas : un KPI dans un incident, ou une facture dans un rapport, doit perdre contre l’intention opérationnelle ou l’argent. L’autonomie se plafonne, elle ne se déduit pas du seul score.

## Suite

Le même gold set avec un LLM allumé, dès qu’une clé est disponible.
