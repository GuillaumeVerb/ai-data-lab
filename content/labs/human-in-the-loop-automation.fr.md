---
content_id: human-in-the-loop-automation
locale: fr
type: lab
title: Un agent d’automatisation sans action irréversible
summary: "MVP public : triage, extraction, score d’automation, validation humaine. Tool use, un seul agent."
format: lab
question: Peut-on rendre un workflow IA utile sans lui laisser exécuter d’actions externes irréversibles ?
hypothesis: Un mode suggestion / assisted, avec timeline et feedback, suffit pour un MVP crédible. L’autonomie totale n’est pas le premier livrable.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-11"
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Repo public [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent) : Python, FastAPI, SQLite, Streamlit, Pytest.

Flux : texte ou email → run progressif → classification (catégories fermées) → extraction → résumé → brouillon (email ou markdown) → automation score → timeline live → validation humaine.

Modes d’autonomie documentés : `suggestion_only`, `assisted`, `low_risk_auto`. Aucune action externe irréversible.

## Résultat

MVP local démontrable : UI cockpit (input, timeline, artefacts), persistance des runs et feedbacks, explainability panel. Architecture : un agent, tool use, pas un serveur MCP.

## Échec / limite

Pas de mesure publiée de tool-use correctness ni de taux de fausses autonomies. L’automation score est une heuristique interne. Pas d’intégration Gmail/Slack réelle dans le README.

## Suite

Mesurer tool-use correctness et le taux de fausses autonomies. MCP (connecteurs, serveurs) reste un nœud Learning « exploring ».
