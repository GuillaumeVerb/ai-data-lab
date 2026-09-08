---
content_id: experiment-tracking
locale: fr
type: learning
title: Experiment tracking
summary: Versions, paramètres, artefacts. Sans ça, on ne peut pas comparer deux runs.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
last_reviewed_at: "2026-09-08"
stage: evidence
tags:
  - experiment-tracking
related_lab_ids: []
related_project_ids: []
scaffold: false
---

## Explication simple

Si tu ne sais pas quel modèle, quels hyperparamètres et quels données ont produit un résultat, tu ne peux pas le reproduire.

## Explication technique

Journaliser params, métriques, artefacts, versions de code. MLflow est un outil, pas une compétence magique. Le point : comparabilité.

## Preuves

Repo public [anomalie_eth](https://github.com/GuillaumeVerb/anomalie_eth) (détection d’anomalies on-chain + MLflow). Training / exploration, pas un produit Lab. Pas de dashboard MLflow hébergé ici.
