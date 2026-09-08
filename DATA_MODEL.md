# Data model — AI Research & Engineering Lab

Modèle cible. V1 peut vivre presque entièrement en MDX. Les tables ci-dessous décrivent les contrats pour ne pas casser V1.5+ / SignalLab.

## 1. Contenu bilingue

Toute entité publique partage un identifiant neutre et deux corps localisés.

```text
ContentItem
  content_id          string   # language-neutral, slug-stable
  type                enum     # project | lab | writing | learning | observe | about | resource | report
  locale              enum     # fr | en
  title               string
  summary             string
  body                markdown
  metadata            json     # dates, tags, seo, og
  translation_status  enum     # original | adapted | ai_draft | human_reviewed | missing
  published           boolean
  published_at        datetime?
  updated_at          datetime
```

Règles :

- Un `content_id` n’est jamais traduit.
- FR et EN sont des enregistrements distincts, pas un champ `translations[]` implicite.
- Si une locale manque : page 404 localisée ou état « translation unavailable » — **jamais** de mélange de langues.
- Validation CI : tout item `published` doit exister dans les deux locales, ou être explicitement marqué `translation_status = missing` et retiré du sitemap.

## 2. Project

```text
Project extends ContentItem
  problem             string
  why_it_matters      string
  architecture        markdown
  data_sources        markdown
  approach            markdown
  stack               string[]
  methodology         markdown
  results             markdown      # no fabricated metrics
  limitations         markdown
  learnings           markdown
  next_changes        markdown
  github_url          url?
  demo_url            url?
  related_lab_ids     content_id[]
  related_writing_ids content_id[]
  flagship            boolean
  domain              enum         # core | applied_ai
```

## 3. Lab (expérience)

```text
Lab extends ContentItem
  format              enum     # lab | build_log | challenge | failed_experiment
  question            string
  hypothesis          string
  setup               markdown
  experiment          markdown
  result              markdown
  failures            markdown
  learnings           markdown
  next_steps          markdown
  related_project_ids content_id[]
```

## 4. Writing

```text
Writing extends ContentItem
  kind                enum     # explainer | research_note | experiment | tool_review | brief | living_report
  sources             SourceRef[]
  related_topic_ids   content_id[]
```

## 5. Learning (concept)

```text
LearningNode extends ContentItem
  simple_explanation  markdown
  technical_explanation markdown
  architecture        markdown
  important_papers    SourceRef[]
  tools_products      string[]
  related_signal_ids  id[]
  notes               markdown
  quiz                markdown?
  related_lab_ids     content_id[]
  related_project_ids content_id[]
  last_reviewed_at    datetime?
```

Compétence ≠ pourcentage. Une compétence pointe vers des **preuves** :

```text
SkillEvidence
  skill_id            string
  evidence_type       enum     # project | lab | writing | note | quiz | benchmark | resource
  content_id          string
  notes               string?
```

## 6. Observe (V1 manuel → V2 SignalLab)

```text
ObserveItem extends ContentItem
  topic               string
  why_it_matters      markdown
  source_mix          SourceRef[]
  status              enum     # watching | rising | cooling | hype_risk | adopted
  manual              boolean  # true until SignalLab
```

## 7. Content Engine (V1.5)

Lifecycle obligatoire :

```text
INGESTED → AI_PROCESSED → REVIEW_REQUIRED → APPROVED → PUBLISHED
```

```text
IngestJob
  id                  uuid
  input_type          enum     # url | paper | github | youtube | note | idea
  input_ref           string
  status              enum     # ingested | ai_processed | review_required | approved | published | rejected
  source              SourceRef
  model_used          string?
  pipeline_version    string
  draft_fr            markdown?
  draft_en            markdown?
  extracted           json     # title, summaries, concepts, people, companies, tags, lab/article ideas
  created_at          datetime
  reviewed_at         datetime?
  published_content_id content_id?
```

L’IA ne publie jamais toute seule.

## 8. Provenance

Chaque document, score ou génération conserve :

```text
SourceRef
  url                 url
  source_id           string
  source_type         enum     # paper | official_docs | serious_media | opinion | sponsored | viral | repo | video | job
  author_or_org       string?
  published_at        datetime?
  collected_at        datetime
  language            string?
  license_or_access   string?
  quality_score       number?  # source quality, not importance
```

Pour le contenu généré : `model_used`, `pipeline_version`, `prompt_version`.

## 9. SignalLab (V2+)

Entités :

```text
Source
Document
Topic
Technology
Company
Person
Product
Repository
Paper
Video
Signal
```

Enveloppe connecteur (normalisée, idempotente) :

```text
CollectedDocument
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
```

Un topic a un **historique d’observations** (time series), pas un snapshot unique.

Pipeline : collect → normalize → deduplicate → enrich → embed → cluster → extract entities → detect topics → time-series metrics → trend signals → store → API.

Les LLM interprètent **après** les métriques. Ils ne décident pas seuls si quelque chose « trende ».

## 10. Scoring (V2.5)

Scores 0–100, tous explicables, composants stockés à part du score.

| Score | Interprétation |
| --- | --- |
| Signal Score | Importance agrégée |
| Momentum | Accélération |
| Novelty | Nouveauté relative |
| Cross-Source Strength | Diversité de communautés |
| Research Activity | Activité scientifique |
| Builder Activity | Construction / open source |
| Media Attention | Éditorial + vidéo |
| Market Signal | Jobs, produits, entreprises |
| Technical Depth | Substance technique |
| Hype Risk | Bruit social vs preuves |
| Confidence | Quantité, diversité, qualité, profondeur historique |
| Personal Relevance | Score séparé, jamais mélangé au score global |

```text
ScoreSnapshot
  topic_id
  score_name
  value               0..100
  components          json     # feature → contribution
  confidence          0..100
  computed_at
  methodology_version
```

Exemple : Momentum = 82 parce que paper volume +42%, GitHub repos +68%, YouTube creator diversity +31%.

## 11. Ask My Lab (V3)

```text
AgentMode            enum     # about_me | ask_the_lab
RetrievalChunk
  content_id
  locale
  source_type
  text
  citation
```

Contraintes ABOUT ME : ne jamais transformer apprentissage → expérience pro, projet perso → client, intérêt → expertise.

## 12. Stockage par version

| Version | Stockage réel |
| --- | --- |
| V0–V1 | MDX/Markdown versionné dans le repo |
| V1.5 | Postgres (jobs d’ingestion + drafts) + MDX publié |
| V2+ | Postgres + object/raw store + pgvector plus tard |
| V3 | Index de retrieval sur le corpus déjà structuré |
