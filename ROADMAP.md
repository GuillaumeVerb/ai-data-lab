# Roadmap — AI Research & Engineering Lab

Principe : publier tôt, enrichir ensuite. Ne commencer la couche suivante que si la précédente est **réellement utilisable**.

## Versioning global

| Version | Nom | Capacité | Statut |
| --- | --- | --- | --- |
| V0.x | Foundation | Architecture, i18n, schemas, design system | Interne |
| V1.x | AI/Data Lab | Portfolio + Labs + Writing + Learning | Public |
| V1.5.x | Content Engine | Ingestion et brouillons IA FR/EN | Public + admin |
| V2.x | SignalLab | Collecte multi-source + topics + trends | Produit public |
| V2.5.x | Intelligence | Scores, early signals, hype detector | Produit différenciant |
| V3.x | Ask My Lab | RAG + agent sur le corpus | Agent public |
| V3.5.x | Learning Engine | Quiz, review, skill graph | Usage perso / public partiel |
| V4.x | Frontier Intelligence | Benchmarks, predictions, career radar | Plateforme mature |
| V5.x | Product/SaaS | Accounts, watchlists, alerts, API | Seulement si traction |

Anti-dispersion : pas de V2 tant que V1 n’est pas en ligne ; pas de personnalisation SaaS tant que SignalLab n’a pas d’usage réel.

## V0 — Foundation

### V0.1 Architecture

**Objectif :** une base que V1–V3 peuvent réutiliser sans sur-ingénierie.

Livrables : `ARCHITECTURE.md`, `DATA_MODEL.md`, `ROADMAP.md`, routes FR/EN, content schemas, design tokens.

**Sortie :** le projet compile, routes localisées fonctionnelles, conventions documentées.

### V0.2 Content foundation

**Objectif :** ajouter simplement projets, labs et articles.

Livrables : collections MDX, IDs neutres, validations, metadata localisée.

**Sortie :** un contenu exemple existe dans les deux langues et passe la validation.

### V0.3 Quality gate

Livrables : lint, typecheck, build, translation completeness, accessibilité de base.

**Sortie :** CI verte et preview Vercel stable.

## V1 — Public AI/Data Lab

Pages : Home, Projects, Lab, Writing, Learning, Observe preview, About — toutes FR/EN.

Critères de sortie :

- Lien public montrable à un recruteur
- 3 projets visibles (1 flagship suffit)
- 3 Labs réels
- 3 contenus Writing
- 5–10 signaux Observe manuels
- 8–12 learning nodes
- Aucun score de compétence arbitraire
- Aucun contenu factice essentiel
- Mobile + desktop, SEO minimal

## V1.5 — Content Engine

Input : URL, paper, GitHub, YouTube, note, idée → brouillon FR/EN structuré, **non publié**.

Lifecycle : `INGESTED → AI_PROCESSED → REVIEW_REQUIRED → APPROVED → PUBLISHED`

## V2 — SignalLab

- **V2.0** Collect & normalize : connecteurs, raw store, dedupe, provenance quotidienne
- **V2.1** Topics & entities : embeddings, clustering, historique
- **V2.2** Trend dashboard : time-series, topic pages, source breakdown — lisible **sans** LLM magique

## V2.5 — Scoring

Signal / Momentum / Novelty / Cross-source / Research / Builder / Media / Market / Depth / Hype / Confidence.

Chaque score expose ses composants et passe des tests d’edge cases.

Débloque : Early Signals, Hype Detector, Why is this trending?, Research → Mainstream.

## V3 — Ask My Lab

- **V3.0** Retrieval évalué sur un jeu de questions défini
- **V3.1** UI à deux modes ; 30+ questions de benchmark ; zéro hallucination d’expérience

## V3.5 / V4 / V5

Learning engine, benchmarks & predictions, Career Radar / Frontier Map, puis comptes utilisateurs **uniquement** si des gens reviennent déjà pour SignalLab.

Ne pas définir de pricing avant un usage récurrent. Le portfolio doit fonctionner même si SignalLab ne devient jamais un SaaS.

## Contenu minimum de lancement

| Type | Quantité | Exemples |
| --- | --- | --- |
| Projects | 3 | Projet Data sérieux ; Agentic Data Analyst ; Applied AI (data/blockchain ou vision) |
| Labs | 3 | LLM explore dataset ; MCP/tool use ; première expérience Physical AI/vision |
| Writing | 3 | Physical AI from a Data perspective ; Agent vs workflow ; What I’m learning in Intelligent Systems |
| Observe | 5 | AI Agents ; Physical AI ; VLA ; AI Evaluation ; AI Coding |
| Learning | 8–12 | RAG, Agents, MCP, evals, VLM, VLA, ROS2, simulation, observability |

## Plan des 6 premières semaines

| Semaine | Focus | Sortie |
| --- | --- | --- |
| 1 | V0 architecture + design + i18n | Skeleton, routes, schemas, repo propre |
| 2 | Home + Projects + About | Preview cohérente FR/EN |
| 3 | Lab + Writing + Learning | V1 quasi complète, contenus réels |
| 4 | Observe manuel + polish + deploy | **V1 publique** |
| 5 | Content Engine | Ingestion → draft → review |
| 6 | Premier collecteur SignalLab | Fondations V2 |

L’ordre compte plus que le rythme : **public d’abord, automatisation ensuite**.

## Backlog

| | Must | Should | Later |
| --- | --- | --- | --- |
| UX | Home claire, nav, mobile, FR/EN | Filtres, entry points adaptatifs | Animations complexes |
| Content | Projects / Labs / Writing réels | Living reports | Community features |
| AI | Content Engine | Ask My Lab | Personal mentor |
| Data | Collecteurs SignalLab | Scoring | Prediction engine |
| Measurement | Evals de base | Benchmarks | Recherche longitudinale auto |
| Product | Usage public | Watchlists | Billing / API |

## Definition of Done

| Type | DoD |
| --- | --- |
| Page publique | FR/EN, mobile, metadata, pas de claims placeholder, liens internes, a11y de base |
| Project | Problem, architecture, evidence/results, limits, learnings, GitHub/demo si dispo |
| Lab | Question, setup, result, failure/learning, next step |
| Signal source | Provenance, idempotence, rate limit, schema normalisé, tests |
| Score | Formule documentée, composants stockés, confidence, edge-case tests |
| AI generation | Grounding, incertitude, sources, eval, revue humaine à la publication |
| Release | CI verte, complétude bilingue, changelog, preview revue |

**Premier jalon : terminer V0 + V1 et publier. Tout le reste reste en backlog tant que ce jalon n’est pas atteint.**
