"""SignalLab V2.1: TF-IDF embeddings, topic proximity, term entities.

No neural model, no LLM, no trend score. Vectors are bags of terms over the
latest collect sample (titles + descriptions + Hub tags).
"""

from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Iterable

from signallab import EMBED_PIPELINE, LEXICON_METHOD
from signallab.schema import LexiconCluster, LexiconDay, TermWeight, TopicLexicon, TopicNeighbor
from signallab.texts import clean_text
from signallab.topics import TOPICS

TOKEN = re.compile(r"[a-z][a-z0-9+\-]{2,}")
HEX_ENTITY = re.compile(r"^x[0-9a-f]{2,}$")
STOPWORDS = frozenset(
    {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "are",
        "was",
        "were",
        "have",
        "has",
        "had",
        "not",
        "but",
        "you",
        "your",
        "our",
        "their",
        "its",
        "into",
        "onto",
        "over",
        "under",
        "than",
        "then",
        "also",
        "can",
        "via",
        "using",
        "used",
        "use",
        "based",
        "new",
        "open",
        "source",
        "http",
        "https",
        "www",
        "html",
        "com",
        "org",
        "github",
        "arxiv",
        "hugging",
        "face",
        "model",
        "models",
        "paper",
        "papers",
        "repo",
        "repos",
        "code",
        "data",
        "dataset",
        "license",
        "tag",
        "tags",
        "all",
        "how",
        "what",
        "why",
        "when",
        "who",
        "which",
        "about",
        "into",
        "such",
        "more",
        "most",
        "other",
        "some",
        "any",
        "each",
        "per",
        "between",
        "without",
        "within",
        "across",
        "after",
        "before",
        "through",
        "towards",
        "toward",
        "large",
        "language",
        "learning",
        "machine",
        "deep",
        "neural",
        "framework",
        "library",
        "python",
        "implementation",
        "official",
        "state",
        "art",
        "sota",
        "pre",
        "trained",
        "pretrained",
        "fine",
        "tuned",
        "finetuned",
        "checkpoint",
        "weights",
        "gguf",
        "quantized",
        "readme",
        "introducing",
        "introduction",
        "towards",
        "transformers",
        "text-generation",
        "region",
        "base",
        "system",
        "while",
        "these",
        "those",
        "they",
        "them",
        "show",
        "shown",
        "compatible",
        "endpoints",
    }
)
MAX_TERMS = 12
MAX_SHARED = 8
MAX_NEAREST = 4
MAX_CLUSTERS = 5
MIN_CLUSTER_SIZE = 2
MIN_NEIGHBOR = 0.08
MIN_CLUSTER_COSINE = 0.28


def tokenize(text: str) -> list[str]:
    words = [
        token
        for token in TOKEN.findall(clean_text(text).lower())
        if token not in STOPWORDS and not HEX_ENTITY.match(token)
    ]
    grams = list(words)
    grams.extend(f"{left} {right}" for left, right in zip(words, words[1:]))
    return grams


def query_tokens(topic_id: str) -> set[str]:
    spec = TOPICS.get(topic_id) or {}
    blob = " ".join(value for key, value in spec.items() if key != "label")
    return set(tokenize(blob))


def _tf(tokens: Iterable[str]) -> Counter[str]:
    return Counter(tokens)


def _idf(doc_freq: dict[str, int], n_docs: int) -> dict[str, float]:
    n = max(n_docs, 1)
    return {term: math.log((1 + n) / (1 + df)) + 1.0 for term, df in doc_freq.items()}


def _tfidf(tf: Counter[str], idf: dict[str, float]) -> dict[str, float]:
    total = sum(tf.values()) or 1
    return {term: (count / total) * idf.get(term, 0.0) for term, count in tf.items()}


def _cosine(left: dict[str, float], right: dict[str, float]) -> float:
    if not left or not right:
        return 0.0
    keys = set(left) & set(right)
    dot = sum(left[key] * right[key] for key in keys)
    n_left = math.sqrt(sum(value * value for value in left.values()))
    n_right = math.sqrt(sum(value * value for value in right.values()))
    if n_left == 0 or n_right == 0:
        return 0.0
    return dot / (n_left * n_right)


def _mean(vectors: list[dict[str, float]]) -> dict[str, float]:
    acc: dict[str, float] = defaultdict(float)
    for vector in vectors:
        for key, value in vector.items():
            acc[key] += value
    n = max(len(vectors), 1)
    return {key: value / n for key, value in acc.items()}


def _is_query_term(term: str, queries: set[str]) -> bool:
    if term in queries:
        return True
    parts = term.split()
    return bool(parts) and all(part in queries for part in parts)


def _cluster_docs(doc_vectors: list[dict[str, float]], doc_tf: list[Counter[str]]) -> list[LexiconCluster]:
    if len(doc_vectors) < MIN_CLUSTER_SIZE:
        return []
    members: list[list[int]] = []
    centroids: list[dict[str, float]] = []
    for index, vector in enumerate(doc_vectors):
        best_j = -1
        best = MIN_CLUSTER_COSINE
        for cluster_index, centroid in enumerate(centroids):
            sim = _cosine(vector, centroid)
            if sim > best:
                best = sim
                best_j = cluster_index
        if best_j >= 0:
            members[best_j].append(index)
            centroids[best_j] = _mean([doc_vectors[i] for i in members[best_j]])
        else:
            members.append([index])
            centroids.append(vector)

    clusters: list[LexiconCluster] = []
    for group in members:
        if len(group) < MIN_CLUSTER_SIZE:
            continue
        bag: Counter[str] = Counter()
        for index in group:
            bag.update(doc_tf[index])
        label_terms = [
            term
            for term, _ in bag.most_common(12)
            if " " not in term and not HEX_ENTITY.match(term)
        ][:2]
        if not label_terms:
            continue
        clusters.append(LexiconCluster(label=" ".join(label_terms), size=len(group)))
        if len(clusters) >= MAX_CLUSTERS:
            break
    return clusters


def build_lexicon_day(
    topic_texts: dict[str, list[str]],
    *,
    computed_at: str | None = None,
) -> LexiconDay:
    computed = computed_at or datetime.now(timezone.utc).isoformat()
    day = computed[:10]
    topic_ids = [topic_id for topic_id, texts in topic_texts.items() if texts]
    tokenized: dict[str, list[list[str]]] = {
        topic_id: [tokenize(text) for text in texts if text.strip()]
        for topic_id, texts in topic_texts.items()
        if texts
    }
    topic_tf: dict[str, Counter[str]] = {
        topic_id: _tf(token for doc in docs for token in doc) for topic_id, docs in tokenized.items()
    }
    doc_freq: dict[str, int] = defaultdict(int)
    for tf in topic_tf.values():
        for term in tf:
            doc_freq[term] += 1
    idf = _idf(doc_freq, len(topic_tf))
    topic_vectors = {topic_id: _tfidf(tf, idf) for topic_id, tf in topic_tf.items()}

    topics: dict[str, TopicLexicon] = {}
    for topic_id in topic_ids:
        queries = query_tokens(topic_id)
        vector = topic_vectors[topic_id]
        ranked = sorted(vector.items(), key=lambda item: item[1], reverse=True)
        docs = tokenized[topic_id]
        local_df: dict[str, int] = defaultdict(int)
        for tokens in docs:
            for term in set(tokens):
                local_df[term] += 1
        min_df = 3 if len(docs) >= 40 else 2
        terms = [
            TermWeight(term=term, weight=round(weight, 4))
            for term, weight in ranked
            if not _is_query_term(term, queries) and local_df.get(term, 0) >= min_df
        ][:MAX_TERMS]
        shared = [
            term
            for term, _ in ranked
            if doc_freq.get(term, 0) >= 2
            and not _is_query_term(term, queries)
            and local_df.get(term, 0) >= min_df
        ][:MAX_SHARED]
        nearest = sorted(
            (
                TopicNeighbor(topic_id=other, cosine=round(_cosine(vector, other_vec), 4))
                for other, other_vec in topic_vectors.items()
                if other != topic_id
            ),
            key=lambda item: item.cosine,
            reverse=True,
        )
        nearest = [item for item in nearest if item.cosine >= MIN_NEIGHBOR][:MAX_NEAREST]

        local_idf = _idf(local_df, len(docs))
        doc_counters = [_tf(tokens) for tokens in docs]
        doc_vectors = [_tfidf(counter, local_idf) for counter in doc_counters]
        clusters = _cluster_docs(doc_vectors, doc_counters)

        topics[topic_id] = TopicLexicon(
            topic_id=topic_id,
            document_count=len(docs),
            terms=terms,
            shared=shared,
            nearest=nearest,
            clusters=clusters,
        )

    return LexiconDay(
        computed_at=computed,
        day=day,
        pipeline_version=EMBED_PIPELINE,
        method=LEXICON_METHOD,
        topics=topics,
    )


def bag_from_raw() -> dict[str, list[str]]:
    from signallab.schema import CollectedDocument
    from signallab.store import RAW_DIR
    from signallab.texts import document_text

    bag: dict[str, list[str]] = {}
    if not RAW_DIR.exists():
        return bag
    for path in sorted(RAW_DIR.glob("*.json")):
        try:
            doc = CollectedDocument.model_validate_json(path.read_text(encoding="utf8"))
        except Exception:
            continue
        topic_id = doc.source_specific_metadata.get("topic_id")
        if not isinstance(topic_id, str) or not topic_id:
            continue
        text = document_text(doc)
        if text:
            bag.setdefault(topic_id, []).append(text)
    return bag


def rebuild_lexicon_from_raw(*, computed_at: str | None = None) -> LexiconDay | None:
    from signallab.store import append_lexicon_day

    bag = bag_from_raw()
    if not any(bag.values()):
        return None
    day = build_lexicon_day(bag, computed_at=computed_at)
    append_lexicon_day(day)
    return day
