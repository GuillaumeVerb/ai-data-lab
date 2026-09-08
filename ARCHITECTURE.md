# Architecture — AI Research & Engineering Lab

Document de référence produit. Le code V0 doit rester simple : ces frontières existent pour ne pas tout construire maintenant.

## 1. Vision

Le site remplit trois fonctions en même temps :

1. Montrer une trajectoire professionnelle cohérente.
2. Accélérer l’apprentissage personnel.
3. Créer une valeur indépendante du CV (SignalLab, benchmarks, ressources, rapports vivants).

Le CV est un composant du système, pas son centre. La homepage montre d’abord ce qui est **construit, observé, appris et mesuré**.

## 2. Règle de focus

Fil conducteur : **DATA → AI AGENTS → PHYSICAL AI / ROBOTICS**

Question éditoriale : *Does this help understand, build, evaluate or apply intelligent systems?*

| Niveau | Ce qui y entre | Traitement |
| --- | --- | --- |
| **CORE** | Data, AI Engineering, Agents, Physical AI, Robotics, Evaluation, Infrastructure, Computer Vision | Navigation principale, projets flagship |
| **APPLIED AI** | Blockchain data, sport, photo intelligence, finance, industrie | Présentés comme applications de méthodes Core |
| **OTHER** | Sans lien démontrable avec les systèmes intelligents | Non mis en avant |

## 3. Architecture en trois couches

| Couche | Objectif | Valeur utilisateur | Valeur portfolio |
| --- | --- | --- | --- |
| 1. Personal Lab | Documenter progression et réalisations | Comprendre ce qui est construit | Preuves, profondeur, trajectoire |
| 2. Intelligence Engine | Transformer le bruit en signaux | Savoir ce qui monte et pourquoi | Data + NLP + analytics + AI |
| 3. Public Tools | Rendre le système utile aux autres | Radar, brief, benchmark, ressources | Adoption, crédibilité |

Ne pas implémenter les couches 2 et 3 avant qu’une V1 publique soit utilisable.

## 4. Huit piliers

| Pilier | Question | Sorties V1 (minimum) | Plus tard |
| --- | --- | --- | --- |
| **OBSERVE** | Qu’est-ce qui change ? | 5–10 signaux manuels | SignalLab |
| **LEARN** | Que retenir ? | Concept pages + preuves | Quiz, spaced review, skill graph |
| **EXPLORE** | Que se passe-t-il si je teste ? | Labs + failed experiments | Challenge Lab |
| **BUILD** | Qu’est-ce qui mérite un vrai projet ? | 3 projets, dont 1 flagship | Demos, open source |
| **MEASURE** | Est-ce que ça fonctionne ? | Résultats et limites dans les case studies | Benchmarks, evals |
| **THINK** | Pourquoi ce choix ? | Notes / My Take | Decision journal, predictions |
| **SHARE** | Que peuvent utiliser les autres ? | Writing | Living reports, datasets, templates |
| **ASK** | Comment interroger le corpus ? | — | Ask My Lab (ABOUT ME / ASK THE LAB) |

## 5. Audiences

| Audience | Cherche | Chemin |
| --- | --- | --- |
| Recruiter | Crédibilité, adéquation | About → Flagship Projects → Evidence → CV |
| Engineer / Researcher | Architecture, code, limites | Projects → Labs → Benchmarks → GitHub |
| Learner | Explications, progression | Learn → Explainers → Resources |
| AI/Tech enthusiast | Ce qui monte vs ce qui est surcoté | Observe → SignalLab → Weekly Brief |
| Robotics / Physical AI | Travaux spécifiques | Frontier Map → Labs → Projects |

Une navigation adaptative (« I’m a recruiter / engineer / learner ») n’est **pas** dans le MVP.

## 6. Architecture éditoriale bilingue

Routes :

```
/fr/projects/autonomous-data-analyst
/en/projects/autonomous-data-analyst
```

Règles :

- `content_id` neutre (ex. `autonomous-data-analyst`)
- `locale = fr | en`
- Corps et metadata **stockés séparément**
- Jamais de mélange silencieux FR/EN sur une même page
- Flagship : relecture manuelle dans les deux langues
- SignalLab rapide : traduction assistée possible, avec provenance et statut
- SEO : `hreflang`, canonical, OpenGraph localisés

FR = langue de rédaction naturelle. EN = adaptation éditoriale, pas un calque.

## 7. Pages V1

| Page | Minimum |
| --- | --- |
| Home | Hero, featured projects, latest labs, currently exploring, latest signals, writing, background |
| Projects | Liste filtrable + case study |
| Lab | Chronologie + détail d’expérience |
| Writing | Explainers, research notes, experiments, tool reviews |
| Learning | Concepts + preuves (pas de % artificiels) |
| Observe | 5–10 signaux manuels avant SignalLab |
| About | Trajectoire, expérience, credentials, liens, CV |

Case study projet : Problem → Why it matters → Architecture → Data → Approach → Results → Limitations → Learnings → Demo → GitHub.

Lab : Question → Hypothesis → Setup → Result → Failure → Learning → Next.

## 8. Frontières techniques (V0)

À créer maintenant :

1. Structure Next.js + TypeScript + Tailwind
2. i18n `/fr` `/en` + locale switcher
3. Content schemas MDX (IDs neutres)
4. Routing et metadata/SEO
5. Design tokens + composants réutilisables
6. Frontières API futures (pas d’implémentation)

À **ne pas** construire en V0/V1 :

- Collecteurs SignalLab et scoring
- RAG / Ask My Lab
- Auth, watchlists, billing
- Skill graph, Career Radar, Question Engine
- Traduction automatique côté frontend

Services Python/FastAPI : introduits à V2. PostgreSQL/Supabase : prêt architecturalement, pas obligatoire pour du MDX V1.

## 9. SignalLab (cible, pas V1)

Moteur de trend intelligence cross-source. Il cherche ce qui **émerge**, se **propage**, ou semble **surcoté** — pas seulement ce qui est populaire.

Sources cibles : arXiv / Semantic Scholar, GitHub, Hugging Face, HN, blogs/RSS, YouTube, jobs/produits, presse, LinkedIn si API compatible.

Fonctions publiques visées : Trending topics, Early Signals, Hype Detector, Research → Mainstream, Why is this trending?, Paper → Product, Weekly Brief, Daily Pulse.

Sous-radars : Products, Companies & People, Jobs, Compute & Economics, Governance & Safety, History & Mental Models.

## 10. Ask My Lab (cible, pas V1)

Deux modes strictement séparés :

| Mode | Rôle | Contrainte |
| --- | --- | --- |
| **ABOUT ME** | Expérience, projets, compétences | Ne jamais inventer d’expérience |
| **ASK THE LAB** | Corpus technique + SignalLab | Retrieval avant génération, citations, incertitude explicite |

Réponse dans la langue de la question.

## 11. Frontier Map (cible)

```
INTELLIGENT SYSTEMS
├── Data Intelligence
├── Agentic AI
├── Physical AI
│   ├── Computer Vision
│   ├── VLM / VLA
│   ├── ROS2
│   ├── Simulation
│   └── World Models
├── AI Infrastructure
├── Evaluation & Safety
└── Decentralized Systems
```

Le Skill Graph relie chaque compétence à des preuves. Pas de jauges « Python 90% ».

## 12. Confiance et qualité

- **Source Quality Score** : paper, doc officielle, média, opinion, sponsorisé, viral.
- **Provenance** : URL, auteur, date, source, ingestion, modèle IA, version pipeline.
- **Explainability** : tout score doit pouvoir répondre « why? ».
- **Human validation** : aucune publication éditoriale importante sans revue.
- **Legal/API** : pas de scraping non autorisé ; connecteurs source par source.

## 13. Mesure du succès

Portfolio (projets aboutis, contacts), Learning (preuves, labs), SignalLab (récurrence, précision des early signals), Content (lectures, organique), Career (entretiens, inbound), Product (retention avant monétisation).

Vision 12–18 mois : la valeur vient de l’accumulation (labs, projets profonds, benchmarks historiques, living reports, skill graph, signaux datés) — pas du design du site.
