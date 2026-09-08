---
content_id: web3-analytics-dashboard
locale: en
type: project
title: Web3 Analytics Dashboard
summary: An on-chain dashboard from CSV exports (Dune or otherwise) — KPIs, series, cohorts. Blockchain as a data terrain, not the Lab’s identity.
problem: "On-chain exports are readable in SQL, rarely as an analysis product. Missing piece: KPI + retention views on a standard CSV."
why_it_matters: Applied AI / data. It shows the Data thread on an adjacent domain without turning the site into a crypto portfolio.
translation_status: adapted
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

Streamlit app: CSV upload → detect date / address / value columns → KPIs → Plotly charts (volume, tx count, top addresses, retention heatmap).

Optional Dune API. Target deploy: Streamlit Cloud.

## Data

On-chain analytics CSV exports. Not a node indexer. Quality follows the export, not a documented custom collector.

## Approach

1. Flexible schema: the user maps columns.
2. Explicit KPIs (volume, tx, unique addresses, active days, averages).
3. Interactive charts rather than an ML model.

## Results

Public repo, Streamlit UI, views listed in the README. No accuracy benchmark — this is an exploration cockpit, not a detector.

## Limitations

No Ethereum node, no original on-chain score, no “production trading” claim. Crypto aesthetic is intentional: the Lab files it as Applied AI, not a flagship.

## Learnings

An adjacent domain (blockchain) only enters when it serves a Core method: here, wrangling, KPIs and time series. Older on-chain ML (`anomalie_eth`, MLflow) stays learning evidence, not a Lab product.
