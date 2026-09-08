---
content_id: human-in-the-loop-automation
locale: fr
type: lab
title: Un agent d’automatisation sans action irréversible
summary: "MVP public : triage, extraction, score d’automation, validation humaine. Tool use, pas un multi-agent."
format: lab
question: Peut-on rendre un workflow IA utile sans lui laisser exécuter d’actions externes irréversibles ?
hypothesis: Un mode suggestion / assisted, avec timeline et feedback, suffit pour un MVP crédible. L’autonomie totale n’est pas le premier livrable.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-08"
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

Le système existe comme MVP local démontrable : UI cockpit (input, timeline, artefacts), persistance des runs et feedbacks, explainability panel. Ce n’est **pas** un serveur MCP, ni un multi-agent.

## Échec / limite

Pas de mesure publiée de tool-use correctness ni de taux de fausses autonomies. Le « automation score » est une heuristique interne, pas un benchmark Lab. Pas d’intégration Gmail/Slack réelle dans le README.

## Suite

Traiter ce repo comme preuve de **tool use + human-in-the-loop**. MCP (connecteurs, serveurs) reste un nœud Learning « exploring », pas une compétence revendiquée.
