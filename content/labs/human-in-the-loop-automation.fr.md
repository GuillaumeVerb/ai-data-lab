---
content_id: human-in-the-loop-automation
locale: fr
type: lab
title: Un agent d’automatisation sans action irréversible
summary: "20 cas gold, commit e920cf9. Classification 85 %. Fausse autonomie 60 %. Tool use, un seul agent."
format: lab
question: Peut-on rendre un workflow IA utile sans lui laisser exécuter d’actions externes irréversibles ?
hypothesis: Un mode suggestion / assisted, avec timeline et feedback, suffit pour un MVP crédible. L’autonomie totale n’est pas le premier livrable.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-15"
run_id: hitl-agent.v1
tags:
  - agents
  - tool-use
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Repo public [AI Automation Agent](https://github.com/GuillaumeVerb/ai-automation-agent), commit [`e920cf9`](https://github.com/GuillaumeVerb/ai-automation-agent/commit/e920cf9ce15706cd6f9a59cddae53d962a190f9e). Chemin heuristique (`APP_LLM_ENABLED=false`) : preprocess → classify → extract → score → choix d’outil (email vs rapport) → gate `human_review`.

20 textes gold dans [`data/labeval/hitl-agent.v1.cases.json`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/hitl-agent.v1.cases.json). Les labels sont humains, pas copiés sur le classifieur. Fausse autonomie = le mode recommandé dépasse `max_autonomy`. Horloge des deadlines relatives figée au 2026-09-15.

Reproduire : `python -m labeval --run hitl-agent`.

## Résultat

Run `hitl-agent.v1` ci-dessus. Classification **85 %** (17/20). Extraction (priority / action / tone / channel) **90 %**. Choix d’outil **95 %**. Sorties dans le vocabulaire fermé **100 %**. Fausse autonomie **60 %** (12/20). Revue humaine déclenchée sur **35 %** des cas.

Les 3 erreurs de classe sont des pièges lexicaux : `KPI` + `plante` part en reporting, un dashboard inaccessible aussi, une facture déguisée en rapport KPI aussi. Le scorer pousse souvent `low_risk_auto` dès que le texte a l’air complet, y compris sur du commercial ou de l’administratif. L’extracteur marque `commerciale` comme ton poli : `merci` est une sous-chaîne.

## Échec / limite

Mesure du chemin heuristique public, pas d’un LLM live, pas de Gmail/Slack. L’automation score reste une formule interne ; ici on la confronte à un plafond d’autonomie humain. MCP n’est pas dans ce run.

## Suite

Relancer le même gold set avec `provider_live` quand une clé est disponible. Le nœud Learning MCP reste « exploring ».
