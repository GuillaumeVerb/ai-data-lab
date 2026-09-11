---
content_id: vision-digits-baseline
locale: fr
type: lab
title: Un baseline vision mesurable depuis la data
summary: "UCI digits 8×8, split gelé, accuracy test : majority 10,03 % vs centroïde 92,48 %. Pas un VLM."
format: lab
question: Les questions data (provenance, split, baseline, métrique) tiennent-elles sur des pixels, avant tout discours VLM / VLA ?
hypothesis: Un dataset public, un split reproductible et deux baselines suffisent à rendre l’erreur visible. ROS2 n’est pas le premier livrable.
translation_status: original
published: true
published_at: "2026-09-11"
updated_at: "2026-09-11"
run_id: vision-digits.v1
tags:
  - physical-ai
  - evaluation
related_project_ids: []
scaffold: false
---

## Setup

Dataset : [UCI Optical Recognition of Handwritten Digits](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits), 1797 images 8×8, 10 classes, valeurs 0–16. Fixture versionnée : `data/labeval/uci-digits-8x8.json`.

Split stratifié 80/20, seed `20260911` — 1438 train, 359 test. Classes à peu près équilibrées (139–146 au train).

Deux baselines, aucun réseau :

- **Majority** — classe la plus fréquente du train (chiffre 1).
- **Centroïde** — moyenne des pixels par classe, plus proche voisin euclidien.

Métrique : accuracy test. Reproduire : `python -m labeval --run vision-digits`.

## Résultat

Run `vision-digits.v1` ci-dessus. Majority : **10,03 %** (36/359). Centroïde : **92,48 %** (332/359).

Les pixels se lisent comme un CSV large. La provenance, le split et le baseline se discutent avant VLM ou ROS2.

## Échec / limite

Digits 8×8 est un problème facile. Ce n’est pas un VLM, pas un VLA, pas une politique robot, pas PhotoMind. Pas de perception-action.

## Suite

Garder ce run comme plancher. Un lab vision suivant devra changer de dataset ou de tâche, pas rejouer 92 % sur UCI digits.
