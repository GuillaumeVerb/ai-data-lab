---
content_id: ai-knowledge-copilot
locale: fr
type: project
title: AI Knowledge Copilot
summary: Assistant documentaire grounded — retrieval avant génération, extraits visibles, signaux de confiance. Pas un chatbot générique.
problem: La connaissance interne est fragmentée. La recherche renvoie du bruit ; un LLM sans retrieval invente avec assurance.
why_it_matters: C’est le pattern que Ask My Lab devra suivre. Retrieval, citations et incertitude explicite avant toute réponse.
translation_status: original
published: true
published_at: "2026-04-03"
updated_at: "2026-09-08"
tags:
  - rag
  - retrieval
  - evaluation
stack:
  - Python
  - React
  - RAG
github_url: https://github.com/GuillaumeVerb/ai-knowledge-copilot
related_lab_ids: []
related_writing_ids:
  - agent-vs-workflow
flagship: false
domain: core
scaffold: false
---

## Architecture

Ingestion de fichiers → chunks → retrieval → narrowing du contexte → génération → affichage des extraits, de la confiance et d’un « pourquoi cette réponse ».

Modes produit : Ask, résumé d’un document, comparaison, synthèse transversale, filtres de metadata, historique de session.

UX FR d’abord, bascule FR/EN.

## Données

PDF, DOCX, TXT, MD, CSV. Pas d’OCR sur PDF scannés. Pas encore de XLSX, PPTX, email ni connecteurs.

## Approche

- Retrieval avant génération.
- Narrowing des sources avant la réponse finale.
- Signaux de confiance plutôt que fausse certitude.
- Workflows (summary, compare, synthesis) plutôt qu’un chat unique.

## Résultats

Preuve : architecture, workflows et couche de confiance dans le repo public. Pas de benchmark retrieval chiffré publié ici.

## Limites

Pas d’auth, pas de frontières d’espace de travail, pas de permissions. Pas d’OCR. C’est un produit interne de démonstration, pas un SaaS déployé chez un client.

## Learnings

« Grounded » n’est pas un slogan : extraits, confiance et comparaison de documents doivent être dans l’UI. Ask My Lab réutilisera cette discipline, avec un jeu de 30+ questions dès V3.
