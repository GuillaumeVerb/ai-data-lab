"""SignalLab V2.0 foundations: collect → normalize → store.

No LLM scores. Metrics first. Interpretation comes later (V2.5).
"""

USER_AGENT = "AI-Data-Lab-SignalLab/0.1 (https://github.com/GuillaumeVerb/ai-data-lab)"
GITHUB_SOURCE_ID = "github-search"
ARXIV_SOURCE_ID = "arxiv"
GITHUB_PIPELINE = "signallab.github.v1"
ARXIV_PIPELINE = "signallab.arxiv.v1"
PIPELINE_VERSION = "signallab.v2.0"
SOURCE_IDS = (GITHUB_SOURCE_ID, ARXIV_SOURCE_ID)

# Back-compat aliases used by the first GitHub-only collector.
SOURCE_ID = GITHUB_SOURCE_ID
