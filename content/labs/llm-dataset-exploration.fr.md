---
content_id: llm-dataset-exploration
locale: fr
type: lab
title: Un LLM peut-il profiler un dataset sans halluciner les stats ?
summary: "Protocole d’évaluation : texte seul vs outil de descriptives. Relie Decision Copilot à une question mesurable."
format: lab
question: Un modèle peut-il décrire un CSV de façon fidèle s’il n’a accès qu’au texte, versus s’il a un outil de profilage ?
hypothesis: Sans outil, le modèle inventera des distributions plausibles. Avec outil, l’erreur devient mesurable.
translation_status: original
published: true
published_at: "2026-03-30"
updated_at: "2026-09-11"
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

Deux conditions sur le même fichier :

- **A** — contexte texte (échantillon ou schema verbalisé), pas d’outil.
- **B** — tool de descriptives (count, nulls, min/max, distributions) puis génération.

Score prévu : écart aux statistiques calculées hors LLM. Un résumé plausible ne compte pas.

Le projet [AI Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator) implémente déjà le profilage comme étape **avant** le récit. Ce lab isole la question d’évaluation.

## Résultat

Pas de tableau A/B versionné ici. Le livrable public est le protocole, et le fait que Copilot sépare profilage et narration.

## Échec / limite

Sans score d’écart, la lecture reste qualitative. Decision Copilot est un workflow de démo, pas une eval suite.

## Suite

Exécuter A/B sur un CSV d’exemple, stocker le snapshot (stats réelles, sortie A, sortie B), n’afficher un chiffre que s’il est reproductible.
