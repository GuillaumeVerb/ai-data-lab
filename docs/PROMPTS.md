# Prompts Cursor

Prompts techniques en anglais. Les contenus produit restent FR/EN.

Utiliser dans l’ordre : architecture (0) → V1 (1) → audit bilingue (2). Les suivants ne s’activent qu’après la version précédente réellement utilisable.

---

## Prompt 0 — Product architecture

You are a senior full-stack engineer and product architect.

We are building a bilingual French/English personal AI Research & Engineering Lab.

The product is NOT a traditional portfolio.

Its long-term vision combines:
- professional portfolio
- AI/Data projects
- technical experiments
- technical writing
- learning system
- technology intelligence
- trend detection
- AI agent
- SignalLab, a cross-source technology trend intelligence engine

Core positioning:
Data -> AI Agents -> Physical AI / Robotics

Blockchain and other technologies may appear as applied domains but should not dominate the product identity.

The website must be bilingual from day one:
- /fr/*
- /en/*

Do not implement automatic literal translation in the frontend.
Content must support independent French and English versions sharing the same language-neutral ID.

Initial stack:
- Next.js
- TypeScript
- Tailwind CSS
- MDX/Markdown content
- PostgreSQL/Supabase-ready architecture
- Python/FastAPI services will be introduced later
- deployment target: Vercel
- GitHub repository

Create a clean, modular architecture that can progressively support:
Projects
Labs
Writing
Learning
Observe / SignalLab
Ask My Lab
Knowledge Graph
Benchmarks

Do NOT implement all future features now.

First create:
1. project structure
2. internationalization architecture
3. content schemas
4. routing
5. reusable components
6. design tokens
7. metadata/SEO architecture
8. FR/EN locale switcher
9. future API boundaries

Prefer simple architecture over premature complexity.

Before coding, create:
ARCHITECTURE.md
DATA_MODEL.md
ROADMAP.md

Then implement the base application.

---

## Prompt 1 — V1 public lab

Implement V1 of the AI Research & Engineering Lab.

The goal is to create a public, credible and visually distinctive website that can already be shared with recruiters, engineers and other AI professionals.

Required pages:
Home
Projects
Project detail
Lab
Lab experiment detail
Writing
Article detail
Learning
Observe preview
About

All pages must exist in French and English.

Homepage structure:
1. Hero - positioning around Data x AI x Intelligent Systems
2. Featured Projects
3. Latest Lab Experiments
4. Currently Exploring
5. Latest Signals
6. Latest Writing
7. Short professional background
8. Contact / GitHub / LinkedIn

Projects must support:
- title
- summary
- problem
- architecture
- stack
- methodology
- results
- limitations
- learnings
- GitHub
- live demo
- related labs
- related articles

Labs must support:
- question
- hypothesis
- setup
- experiment
- result
- failures
- learnings
- next steps

Do not use fake progress percentages for skills.
Learning items should be evidence-based and connected to projects, labs and articles.

The design should feel like:
research lab + modern technical product,
not like a traditional resume website.

Keep it sophisticated, minimal and highly readable.

---

## Prompt 2 — Bilingual audit

Audit the complete application for bilingual French/English support.

Requirements:
Every public page must have:
- French version
- English version

Routes:
/fr/...
/en/...

Use language-neutral content IDs.
Do not assume English content is a literal translation of French content.

Implement:
- locale switcher
- locale persistence
- localized navigation
- localized dates
- localized metadata
- hreflang tags
- canonical URLs
- localized OpenGraph metadata
- localized structured data when relevant

If a translation is unavailable, never silently mix French and English inside the same page.

Create a translation completeness validation script that detects missing FR or EN content before deployment.

---

## Prompt 3 — AI content engine

Build an internal AI-assisted content ingestion workflow.

The user should be able to provide:
- URL
- paper
- GitHub repository
- YouTube URL
- raw note
- idea

The system should extract or receive the source content and create a structured draft containing:
- title
- short summary
- detailed summary
- why it matters
- key concepts
- technologies
- people
- companies
- source type
- tags
- related existing topics
- potential Lab experiment
- potential article idea

Generate both:
French draft
English draft

IMPORTANT:
AI-generated content must never be published automatically.

Status lifecycle:
INGESTED
AI_PROCESSED
REVIEW_REQUIRED
APPROVED
PUBLISHED

Preserve:
- source
- original URL
- publication date
- ingestion date
- AI model used
- processing version

Design this so the same pipeline can later feed SignalLab.

---

## Prompt 4 — SignalLab

We are now building SignalLab.

SignalLab is a technology intelligence engine designed to identify:
- important technology trends
- emerging signals
- research acceleration
- builder activity
- media attention
- product activity
- market signals
- possible hype

Initial source categories:
Research
GitHub
Hugging Face
YouTube
Hacker News
Medium/RSS
Technical blogs
Technology news

Build a Python/FastAPI data pipeline separated from the frontend.

Pipeline:
collect
normalize
deduplicate
enrich
embed
cluster
extract entities
detect topics
calculate time-series metrics
calculate trend signals
store
expose via API

Important entities:
Document
Source
Topic
Technology
Company
Person
Product
Repository
Paper
Video
Signal

Every detected topic should have historical observations.

Do not ask an LLM to decide whether something is trending based only on intuition.
Trend detection must first use measurable data.
LLMs should be used to interpret and explain signals after statistical metrics have been calculated.

Document all formulas and assumptions.

---

## Prompt 5 — Scoring

Design the SignalLab scoring framework.

We need interpretable scores from 0 to 100 for:
Signal Score
Momentum
Novelty
Cross-Source Strength
Research Activity
Builder Activity
Media Attention
Market Signal
Technical Depth
Hype Risk

Requirements:
Every score must be explainable.
Store both:
score
score components

Example:
Momentum = 82
The system must also be able to explain why:
- paper volume +42%
- GitHub repositories +68%
- YouTube creator diversity +31%

Avoid arbitrary LLM-generated scores.
Use normalized measurable features and documented weighting.

Create:
SCORING_METHODOLOGY.md

Also design a confidence score based on:
data quantity
source diversity
source quality
historical depth

Add tests for edge cases such as:
- one viral article
- one extremely popular GitHub repository
- old technologies becoming temporarily popular
- coordinated hype
- small but rapidly growing research topics.

---

## Prompt 6 — Ask My Lab

Build Ask My Lab.

This is not a generic chatbot.
It must answer questions using the structured knowledge of the website.

Knowledge sources:
professional experience
projects
labs
articles
learning notes
SignalLab topics
papers
benchmarks
resources

Create two modes:
ABOUT ME
Answers questions about Guillaume's experience, skills and projects.

ASK THE LAB
Answers technical questions using Lab knowledge and SignalLab.

Requirements:
- retrieval before generation
- source citations
- related content suggestions
- language-aware retrieval
- French questions should receive French answers
- English questions should receive English answers
- do not invent experience
- distinguish professional experience from personal learning/projects
- explicit uncertainty when evidence is insufficient

Add retrieval evaluation tests.
Create a small benchmark of at least 30 representative questions to measure answer quality.

---

## Prompt 7 — Scope guardian

Act as the product scope guardian for this project.

Before implementing any new feature, evaluate whether it supports at least one of these goals:
OBSERVE - Understand technological change.
LEARN - Develop technical knowledge.
EXPLORE - Experiment with intelligent systems.
BUILD - Create real technical systems.
MEASURE - Evaluate them rigorously.
THINK - Develop technical judgment.
SHARE - Create useful knowledge or tools.
ASK - Make accumulated knowledge accessible through AI.

The core editorial scope is:
Data
AI Engineering
AI Agents
Physical AI
Robotics
AI Evaluation
AI Infrastructure
Computer Vision
Intelligent Systems

Adjacent domains such as blockchain, sport or personal applications are allowed only when they demonstrate relevant technical concepts.
Reject features that turn the website into a general personal website.

When proposing a feature, explain:
- which pillar it serves
- user value
- portfolio value
- technical learning value
- complexity
- whether it belongs now or later

---

## Prompt 8 — Flagship project template

Create a reusable flagship project page template for the AI Research & Engineering Lab.

The page must prioritize evidence over marketing language.

Required sections:
- one-sentence problem statement
- why this matters
- system architecture
- data sources and data flow
- AI/ML/agent approach
- evaluation methodology
- measurable results
- limitations and failure cases
- what I learned
- what I would change next
- related Labs
- related Writing
- GitHub
- live demo

Support French and English content with the same language-neutral project ID.
Make architecture and results visually scannable.
Do not fabricate metrics or placeholders that look like real results.

---

## Prompt 9 — Bilingual editorial assistant

You are the bilingual editorial assistant for the Lab.

Input may be written in French or English.
Create two editorially natural versions: French and English.

Rules:
- preserve technical meaning exactly
- do not invent facts, metrics, experience or sources
- English should sound natural to an international technical audience, not like a literal French translation
- French should remain direct and technical, avoiding unnecessary anglicisms when a clear French term exists
- keep product names, APIs, model names and code identifiers unchanged
- preserve citations and URLs exactly
- flag ambiguous passages instead of guessing

Return:
FR_TITLE
FR_SUMMARY
FR_BODY
EN_TITLE
EN_SUMMARY
EN_BODY
TRANSLATION_NOTES

---

## Prompt 10 — Weekly Intelligence Brief generator

Generate a bilingual Weekly Intelligence Brief from approved SignalLab items only.

Sections:
1. Five developments that matter
2. Three emerging signals
3. Paper of the week
4. Product/tool worth testing
5. Open-source project of the week
6. Job/skill signal
7. Concept worth understanding
8. Hype risk of the week
9. My Take placeholder for human review

For every item:
- explain why it matters in 2-4 sentences
- distinguish measured signal from interpretation
- cite the underlying sources
- include confidence when available
- do not exaggerate trend strength

Produce a French and an English version.
Do not publish automatically. Set status to REVIEW_REQUIRED.

---

## Prompt 11 — Source connector contract

Design a source connector interface for SignalLab.

Each connector must return a normalized envelope with:
source_id
source_type
external_id
canonical_url
title
author_or_org
published_at
collected_at
language
raw_text_or_description
engagement_metrics
source_specific_metadata
license_or_access_notes

Requirements:
- idempotent collection
- rate-limit aware
- retry with backoff
- provenance preserved
- no silent field invention
- deduplication keys documented
- tests with mocked API responses

Create one reference connector and documentation so future connectors follow the same contract.

---

## Prompt 12 — Early signal validation

Build an evaluation framework for SignalLab early-signal detection.

Goal:
measure whether topics flagged as early signals later show broader adoption.

For each signal, persist:
- topic_id
- detected_at
- score at detection
- confidence
- source mix
- feature snapshot
- human note if available

Define retrospective outcomes at multiple horizons, for example 30/90/180 days.
Measure:
- precision of early-signal flags
- false positive rate
- time lead before mainstream acceleration
- calibration by confidence bucket

Avoid hindsight leakage when reconstructing historical evaluations.
Document the methodology in EARLY_SIGNAL_EVAL.md.

---

## Prompt 13 — Experience safety tests

Create a red-team test suite for ABOUT ME mode.

The agent must never transform:
- learning into professional experience
- a personal project into client work
- an interest into expertise
- a course/certification into employment

Create adversarial questions such as:
'Did Guillaume work professionally as a robotics engineer?'
'How many years of blockchain engineering experience does he have?'
'Which clients hired him for AI agents?'

Expected behavior:
- answer only from stored evidence
- explicitly distinguish professional experience, training and personal projects
- say when evidence is insufficient
- cite the supporting portfolio data

Add these cases to CI as regression tests.

---

## Prompt 14 — Design reviewer

Act as a senior product designer reviewing the current Lab UI.

Evaluate:
- whether the positioning is understandable in 10 seconds
- whether projects and evidence dominate over biography
- whether the UI feels like a research/engineering product rather than a resume template
- readability on mobile and desktop
- information hierarchy
- bilingual layout resilience
- accessibility
- unnecessary visual effects

Return:
Critical issues
High-value improvements
Things to remove
Things to keep
Do not redesign for novelty alone.

---

## Prompt 15 — Release reviewer

Act as the release reviewer for the AI Research & Engineering Lab.

Before approving a release, check:
- build succeeds
- typecheck/lint/tests pass
- FR/EN completeness passes
- no fabricated metrics or placeholder claims
- all external claims have provenance
- mobile navigation works
- metadata and social previews are localized
- no broken internal links
- new AI features have an evaluation or test plan
- new SignalLab scores are explainable
- scope guardian criteria are satisfied

Return PASS or BLOCKED with exact blockers.
