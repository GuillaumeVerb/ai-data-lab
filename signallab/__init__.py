"""SignalLab V2.0 foundations: collect → normalize → store.

No LLM scores. Metrics first. Interpretation comes later (V2.5).
"""

USER_AGENT = "AI-Data-Lab-SignalLab/0.1 (https://github.com/GuillaumeVerb/ai-data-lab)"
GITHUB_SOURCE_ID = "github-search"
ARXIV_SOURCE_ID = "arxiv"
HN_SOURCE_ID = "hacker-news"
HF_SOURCE_ID = "huggingface"
GITHUB_PIPELINE = "signallab.github.v1"
ARXIV_PIPELINE = "signallab.arxiv.v1"
HN_PIPELINE = "signallab.hn.v1"
HF_PIPELINE = "signallab.huggingface.v1"
PIPELINE_VERSION = "signallab.v2.0"
EMBED_PIPELINE = "signallab.embed.v1"
LEXICON_METHOD = (
    "TF-IDF on titles and descriptions from the latest in-memory collect samples "
    "(up to 30 documents per source). Cosine is lexical overlap between topic bags. "
    "Clusters group sample documents that share terms. Not a neural embedding. "
    "Not a trend score."
)
SOURCE_IDS = (GITHUB_SOURCE_ID, ARXIV_SOURCE_ID, HN_SOURCE_ID, HF_SOURCE_ID)

# Back-compat aliases used by the first GitHub-only collector.
SOURCE_ID = GITHUB_SOURCE_ID
