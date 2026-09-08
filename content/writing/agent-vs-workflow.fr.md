---
content_id: agent-vs-workflow
locale: fr
type: writing
title: Agent vs workflow
summary: Trois systèmes publics, trois niveaux d’autonomie. Tout n’a pas besoin d’être un agent.
kind: explainer
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-08"
tags:
  - agents
  - evaluation
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
related_project_ids:
  - ai-data-investigator
  - ai-knowledge-copilot
scaffold: false
---

## La confusion

« Agent » sert trop souvent d’étiquette marketing pour un pipeline avec un LLM au milieu. Le Lab distingue volontairement **workflow**, **tool use** et **agent évaluable**.

## Trois preuves, trois formes

1. **Knowledge Copilot** — retrieval puis génération. C’est un workflow grounded, pas une boucle d’actions dans le monde.
2. **Automation Agent** — classification, extraction, score, humain dans la boucle. Semi-déterministe. Le README le dit : ce n’est pas un multi-agent.
3. **Decision Copilot** — profilage → investigation → scénarios. Plus « agentique », encore sans eval suite publiée.

## Règle

Si l’échec n’est pas observable (pas d’outil, pas de métrique, pas de revue), ce n’est pas un système, c’est de la copie. Un workflow honnête vaut mieux qu’un agent cosmétique.

## Ce que je n’en conclus pas

Pas de ranking « le meilleur framework ». Pas de claim MCP. La prochaine preuve utile est un protocole A/B sur le profilage tabulaire, pas un nouveau wrapper d’API.
