---
content_id: evaluation
locale: fr
type: learning
title: Evaluation
summary: Métriques d’abord, interprétation ensuite. Pas de score LLM arbitraire.
translation_status: original
published: true
published_at: "2026-09-08"
updated_at: "2026-09-23"
last_reviewed_at: "2026-09-23"
stage: evidence
tags:
  - evaluation
related_lab_ids:
  - llm-dataset-exploration
  - human-in-the-loop-automation
  - vision-digits-baseline
related_project_ids:
  - ai-data-investigator
  - ai-automation-agent
scaffold: false
---

## Explication simple

Si tu ne peux pas te tromper de façon visible, tu n’évalues pas, tu racontes.

## Explication technique

Task completion, exactitude, coût, latence, hallucinations, tool-use. Conserver les versions. SignalLab plus tard : early-signal precision, pas un vibe check.

## Preuves

Profilage A/B/C (`profile-llm.v1`) et HITL automation (`hitl-agent.v2` : classification 100 %, fausse autonomie 15 %, contre 60 % en v1). Gold versionné, pas un ranking de frameworks.
