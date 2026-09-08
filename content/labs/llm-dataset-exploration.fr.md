---
content_id: llm-dataset-exploration
locale: fr
type: lab
title: Un LLM peut-il profiler un dataset sans halluciner les stats ?
summary: "Expérience courte sur le profilage tabulaire. Hypothèse : sans outils, les statistiques inventées passent inaperçues."
format: lab
question: Un modèle peut-il décrire un CSV de façon fidèle s’il n’a accès qu’au texte, versus s’il a un outil de profilage ?
hypothesis: Sans outil, le modèle inventera des distributions plausibles. Avec outil, l’erreur devient mesurable.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: true
---

## Setup

Comparer deux conditions sur le même fichier : (A) contexte texte seul, (B) tool de descriptives. Score = écart aux stats réelles.

## Résultat

Pas encore exécuté. Le protocole est le livrable V0.

## Échec attendu

Les résumés « qui sonnent justes » sont le mode d’échec par défaut.

## Suite

Relier cette expérience à l’analyste agentique dès qu’un premier run existe.
