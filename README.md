# AI Research & Engineering Lab

Portfolio vivant, laboratoire technique et moteur d’intelligence technologique — **FR / EN**.

Le produit n’est pas un CV en ligne. C’est un système public qui transforme veille, apprentissage, expérimentation et construction en preuves de compétence et en ressources utiles.

**Positionnement :** Data → AI Agents → Physical AI / Robotics

Les domaines adjacents (blockchain, sport, photo, finance) n’entrent que comme **Applied AI**, lorsqu’ils servent à démontrer une méthode Core.

## Trois couches

| Couche | Rôle | Exemples |
| --- | --- | --- |
| **Your Lab** | Prouver ce qui est construit et comment ça progresse | Projects, Labs, Writing, Learning, Decision Journal |
| **Intelligence Engine** | Distinguer signal et bruit | SignalLab, Early Signals, Hype Detector |
| **Public Tools** | Donner une raison de venir sans te connaître | Radar, briefs, benchmarks, Ask My Lab |

Boucle : **OBSERVE → QUESTION → LEARN → EXPLORE → BUILD → MEASURE → UNDERSTAND → SHARE → OBSERVE AGAIN**

## Stack cible

| Couche | Choix |
| --- | --- |
| Frontend | Next.js + TypeScript + Tailwind |
| Contenu | MDX/Markdown, IDs neutres, locales séparées `/fr` et `/en` |
| Data / AI | Python + FastAPI (à partir de SignalLab) |
| Base | PostgreSQL / Supabase |
| Deploy | Vercel |

Le bilingue est une contrainte d’architecture dès V0 : pas de traduction mécanique silencieuse, pas de mélange FR/EN dans une même page.

## Versioning

| Version | Capacité | Statut |
| --- | --- | --- |
| **V0** | Foundation : i18n, schemas, design system | Interne |
| **V1** | Lab public : Home, Projects, Lab, Writing, Learning, About | Public |
| **V1.5** | Content Engine (brouillons IA, revue humaine) | Public + admin |
| **V2** | SignalLab (collecte multi-source) | Produit public |
| **V2.5** | Scoring interprétable | Produit différenciant |
| **V3** | Ask My Lab (RAG, 2 modes) | Agent public |
| **V3.5+** | Learning, Frontier, SaaS | Seulement après usage réel |

Règle : **publier V1 avant d’automatiser**. Ne pas commencer V2 tant que V1 n’est pas en ligne.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — vision, piliers, parcours, frontières du produit
- [DATA_MODEL.md](./DATA_MODEL.md) — contenus bilingues, provenance, SignalLab, scoring
- [ROADMAP.md](./ROADMAP.md) — V0 → V5, critères de sortie, plan 6 semaines
- [docs/PROMPTS.md](./docs/PROMPTS.md) — prompts Cursor de construction
- Sources Word : [`docs/source/`](./docs/source/)

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000) — redirection vers `/fr` ou `/en`. Routes publiques : `/fr/*` et `/en/*`.

```bash
npm run check:i18n   # paires FR/EN + clés de dictionnaire
npm run ci           # lint, types, i18n, build
```

Contenu versionné dans `content/` : un fichier par locale, même `content_id`.

## Principes

- Métriques d’abord, interprétation LLM ensuite — pas de scores inventés.
- Tout contenu IA passe par `REVIEW_REQUIRED` avant publication.
- Pas de pourcentages de compétence artificiels : uniquement des preuves (projet, lab, note, eval).
- Provenance obligatoire : source, URL, dates, modèle, version de pipeline.
- Premier jalon : **terminer V0 + V1 et publier**.
