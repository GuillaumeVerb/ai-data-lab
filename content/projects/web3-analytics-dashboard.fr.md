---
content_id: web3-analytics-dashboard
locale: fr
type: project
title: Web3 Analytics Dashboard
summary: Dashboard on-chain à partir d’exports CSV (Dune ou autre) — KPIs, séries, cohortes. La blockchain comme terrain de data, pas comme identité du Lab.
problem: Les exports on-chain sont lisibles en SQL, rarement en produit d’analyse. Il manquait une vue KPI + rétention sur un CSV standard.
why_it_matters: Applied AI / data. Ça démontre le fil Data sur un domaine adjacent, sans faire du site un portfolio crypto.
translation_status: original
published: true
published_at: "2025-12-04"
updated_at: "2026-09-08"
tags:
  - data
  - applied-ai
  - on-chain
stack:
  - Python
  - Streamlit
  - Plotly
  - pandas
github_url: https://github.com/GuillaumeVerb/web3-analytics-dashboard
related_lab_ids: []
related_writing_ids: []
flagship: false
domain: applied_ai
scaffold: false
---

## Architecture

Application Streamlit : upload CSV → détection des colonnes date / adresse / valeur → KPIs → charts Plotly (volume, tx, top addresses, heatmap de rétention).

Intégration Dune optionnelle (clé API). Déploiement visé Streamlit Cloud.

## Données

Exports CSV d’analytics on-chain. Pas un indexeur nœud. La qualité dépend de l’export, pas d’un pipeline de collecte maison documenté ici.

## Approche

1. Schéma souple : l’utilisateur mappe les colonnes.
2. KPI explicites (volume, tx, adresses uniques, jours actifs, moyennes).
3. Visualisations interactives plutôt qu’un modèle ML.

## Résultats

Repo public, UI Streamlit, ensemble de vues listées dans le README. Pas de benchmark de précision publié — ce n’est pas un détecteur, c’est un cockpit d’exploration.

## Limites

Pas de nœud Ethereum, pas de scoring on-chain original, pas de claim de « production trading ». Esthétique crypto volontaire : le Lab le range en Applied AI, pas en projet flagship.

## Learnings

Un domaine adjacent (blockchain) n’entre que s’il sert une méthode Core : ici, data wrangling, KPI et lecture de séries. Les travaux ML on-chain plus anciens (`anomalie_eth`, MLflow) restent des preuves d’apprentissage, pas des produits Lab.
