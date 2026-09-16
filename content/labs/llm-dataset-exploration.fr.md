---
content_id: llm-dataset-exploration
locale: fr
type: lab
title: Un LLM peut-il profiler un dataset sans halluciner les stats ?
summary: "Run A/B/C versionné : 8 lignes, outil, claims extraits. Erreur B = 0. C = A sur la trace figée."
format: lab
question: Un modèle peut-il décrire un CSV de façon fidèle s’il n’a accès qu’au texte, versus s’il a un outil de profilage ?
hypothesis: Sans outil, même des stats honnêtes sur un échantillon restent loin du fichier. Avec outil, l’erreur est nulle sur ces champs.
translation_status: original
published: true
published_at: "2026-03-30"
updated_at: "2026-09-15"
run_id: profile-llm.v1
tags:
  - evaluation
  - data
related_project_ids:
  - ai-data-investigator
scaffold: false
---

## Setup

CSV public versionné : [`data/labeval/transactions.v1.csv`](https://github.com/GuillaumeVerb/ai-data-lab/blob/main/data/labeval/transactions.v1.csv) — 240 commandes, seed `20260911`. Les 8 premières lignes sont volontairement biaisées (Paris, rating 5, montants hauts).

Trois conditions, mêmes champs :

- **A** — descriptives sur ces 8 lignes (le tableau qu’on collerait dans un prompt).
- **B** — le même calcul sur le fichier entier (l’étape profiling de [Decision Copilot](https://github.com/GuillaumeVerb/ai-data-investigator)).
- **C** — claims extraits d’une completion JSON figée, prompt = les 8 lignes. Parser dans `labeval/profile_llm.py`.

Score : erreur relative à la vérité (B). Un résumé plausible ne compte pas. A est le **meilleur cas** du texte-seul. CI rejoue la trace, sans appeler de provider.

Reproduire : `python -m labeval --run profile-llm`. Appel live (si `OPENAI_API_KEY`) : `python -m labeval --run profile-llm --live`.

## Résultat

Tableau ci-dessus (`profile-llm.v1`). A voit n = 8 au lieu de 240, aucun null, une seule ville, un amount moyen ~98 € contre ~22 €. B colle à la vérité. La trace commitée est `none` / `restated-sample` : C reprend le JSON honnête des 8 lignes, donc **C = A**. Erreur moyenne plafonnée à 1 : **A 0,659 · B 0 · C 0,659**. Pas un classement de modèles.

## Échec / limite

Pas de provider live dans ce dépôt (pas de clé `sk-` côté Lab). C prouve l’extracteur et le protocole, pas gpt-4o-mini. Decision Copilot reste un workflow de démo ; ce lab isole échantillon vs outil vs claims parsés.

## Suite

Écraser la trace avec `--live` dès qu’une clé est dans `.env.local`, puis republier C.
