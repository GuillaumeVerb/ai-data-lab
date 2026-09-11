---
content_id: physical-ai-first-notes
locale: fr
type: lab
title: Premières notes Physical AI depuis la data
summary: "Lab d’entrée : carte VLM / VLA / ROS2 / simulation. Le premier run pixels est le lab digits 8×8."
format: lab
question: Qu’est-ce qu’un profil data doit apprendre en premier pour aborder Physical AI ?
hypothesis: Les questions data (provenance, eval, coût, dérive) se transposent. Le vocabulaire (VLM, VLA, world models) vient avant ROS2.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-11"
tags:
  - physical-ai
  - vlm
related_project_ids: []
scaffold: false
---

## Setup

Pas de robot, pas de simu publiée. Lecture et carte mentale. PhotoMind (photothèque, clustering, recherche) reste un projet perso **privé**.

## Résultat

Carte utile :

- **VLM** — voir et décrire.
- **VLA** — voir → langage → action.
- **ROS2 / simu / world models** — pas commencés en public.

Les mêmes questions que sur un CSV s’appliquent : d’où vient le signal, comment on mesure l’erreur, ce que ça coûte.

Premier run public sur des pixels : lab *Un baseline vision mesurable depuis la data* (UCI digits 8×8, majority vs centroïde).

## Échec / limite

Aucun run perception-action. ROS2, simulation et world models pas commencés ici. Le baseline digits n’est pas un VLM.

## Suite

Changer de dataset ou de tâche avant d’empiler du vocabulaire robotics. Relier à l’explainer *Physical AI vu depuis la data*.
