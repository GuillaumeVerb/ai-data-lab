---
content_id: llm-dataset-exploration
locale: fr
type: lab
title: Un LLM peut-il profiler un dataset sans halluciner les stats ?
summary: "Run A/B versionné : 8 lignes collées vs outil de descriptives. Erreur B = 0. Relie Decision Copilot."
format: lab
question: Un modèle peut-il décrire un CSV de façon fidèle s’il n’a accès qu’au texte, versus s’il a un outil de profilage ?
hypothesis: Sans outil, même des stats honnêtes sur un échantillon restent loin du fichier. Avec outil, l’erreur est nulle sur ces champs.
translation_status: original
published: true
published_at: "2026-03-30"
updated_at: "2026-09-11"
run_id: profile-ab.v1
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

CSV public versionné : [`data/labeval/transactions.v1.csv`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/transactions.v1.csv) — 240 commandes, seed `20260911`. Les 8 premières lignes sont volontairement biaisées (Paris, rating 5, montants hauts).

Deux conditions, mêmes champs :

- **A** — descriptives sur ces 8 lignes (le tableau qu’on collerait dans un prompt).
- **B** — le même calcul sur le fichier entier (l’étape profiling de [Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator)).

Score : erreur relative à la vérité (B). Un résumé plausible ne compte pas. Ce run n’appelle pas de LLM : c’est le **meilleur cas** du texte-seul. Un modèle qui invente des chiffres ne peut que faire moins bien.

Reproduire : `python -m labeval --run profile-ab`.

## Résultat

Tableau ci-dessus (`profile-ab.v1`). A voit n = 8 au lieu de 240, aucun null, une seule ville, un amount moyen ~98 € contre ~22 €. B colle à la vérité. Erreur moyenne plafonnée à 1 : **A 0,659 · B 0**.

## Échec / limite

Pas un leaderboard de modèles. Pas une eval suite agents. Decision Copilot reste un workflow de démo ; ce lab isole le gap échantillon vs outil.

## Suite

Brancher une sortie LLM réelle (même CSV, extraire les claims chiffrés) et comparer à ces lignes A/B.
