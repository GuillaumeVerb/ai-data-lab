---
content_id: human-in-the-loop-automation
locale: fr
type: lab
title: Un agent d’automatisation sans action irréversible
summary: "v2, mêmes 20 cas : classification 100 %, fausse autonomie 15 % (contre 60 % en v1)."
format: lab
question: Peut-on rendre un workflow IA utile sans lui laisser exécuter d’actions externes irréversibles ?
hypothesis: Un mode suggestion / assisted, avec timeline et feedback, suffit pour un MVP crédible. L’autonomie totale n’est pas le premier livrable.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-23"
run_id: hitl-agent.v2
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids:
  - ai-automation-agent
scaffold: false
---

## Setup

Repo public [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent), commit [`19343e5`](https://github.com/GuillaumeVerb/ai-automation-agent/commit/19343e51bdd9a2bdf37512cb79a7118ba4a32140). Même gold set que `hitl-agent.v1` : [`data/labeval/hitl-agent.v1.cases.json`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/hitl-agent.v1.cases.json).

Correctifs mesurés : frontières de mot (`merci` ≠ `commerciale`), priorité mixed-intent (support > admin > commercial > reporting), `low_risk_auto` réservé au reporting.

Reproduire : `python -m labeval --run hitl-agent`.

## Résultat

Run `hitl-agent.v2` ci-dessus, comparé à v1 sur les **mêmes 20 cas** :

| | v1 (`e920cf9`) | v2 (`19343e5`) |
| --- | --- | --- |
| Classification | 85 % | **100 %** |
| Extraction | 90 % | **96,25 %** |
| Choix d’outil | 95 % | **100 %** |
| Fausse autonomie | **60 %** | **15 %** |
| Revue humaine | 35 % | **80 %** |

Les 3 fausses autonomies restantes sont de l’administratif / incident encore en `assisted` alors que le gold demande `suggestion_only`.

## Échec / limite

Chemin heuristique, pas un LLM live, pas Gmail/Slack. Le snapshot v1 reste publié : c’est le avant. MCP hors de ce run.

## Suite

Le même gold avec `provider_live` quand une clé est disponible.
