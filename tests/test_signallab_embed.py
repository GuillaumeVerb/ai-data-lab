from __future__ import annotations

from signallab.embed import build_lexicon_day, tokenize
from signallab.schema import LexiconDay
from signallab.store import append_lexicon_day
from signallab.texts import document_text, texts_from_docs
from signallab.normalize import normalize_repo


def test_tokenize_drops_stopwords_and_keeps_bigrams() -> None:
    tokens = tokenize("The agent uses a tool-use loop with human review")
    assert "the" not in tokens
    assert "with" not in tokens
    assert "agent" in tokens
    assert "tool-use" in tokens
    assert "human review" in tokens


def test_tfidf_picks_distinctive_terms_not_query_echo() -> None:
    day = build_lexicon_day(
        {
            "ai-agents": [
                "A tool-use loop with human review for automation workflows.",
                "Crew of tool calling helpers for workflow orchestration.",
            ]
            * 4,
            "physical-ai": [
                "A robot policy in simulation with proprioception and actuators.",
                "World model for robot control and embodiment.",
            ]
            * 4,
            "vla": [
                "A robot policy that maps cameras to actuators in simulation.",
                "Embodied robot control with a world model.",
            ]
            * 4,
        },
        computed_at="2026-09-11T12:00:00+00:00",
    )
    assert day.day == "2026-09-11"
    agent_terms = {item.term for item in day.topics["ai-agents"].terms}
    physical_terms = {item.term for item in day.topics["physical-ai"].terms}
    assert any("tool" in term or "workflow" in term or "review" in term for term in agent_terms)
    assert any("robot" in term or "simulation" in term or "actuator" in term for term in physical_terms)
    assert "llm" not in agent_terms
    assert "llm agent" not in agent_terms
    nearest = {item.topic_id: item.cosine for item in day.topics["physical-ai"].nearest}
    assert "vla" in nearest
    assert nearest["vla"] > nearest.get("ai-agents", 0)


def test_identical_bags_have_cosine_one() -> None:
    texts = ["unique widget foobar for testers"] * 5
    day = build_lexicon_day(
        {"ai-agents": texts, "ai-coding": texts},
        computed_at="2026-09-11T12:00:00+00:00",
    )
    nearest = day.topics["ai-agents"].nearest[0]
    assert nearest.topic_id == "ai-coding"
    assert nearest.cosine == 1.0


def test_clusters_group_repeated_documents() -> None:
    day = build_lexicon_day(
        {
            "ai-coding": ["alpha beta gamma delta editor"] * 6
            + ["unrelated zebra yacht kayak"],
        },
        computed_at="2026-09-11T12:00:00+00:00",
    )
    sizes = [item.size for item in day.topics["ai-coding"].clusters]
    assert 6 in sizes


def test_tokenize_strips_html_entities() -> None:
    tokens = tokenize("A policy with foo&#x2f;bar and x2f leftovers")
    assert "x2f" not in tokens
    assert "foo" in tokens
    assert "bar" in tokens


def test_document_text_includes_hub_tags() -> None:
    from signallab.normalize import normalize_model

    item = {
        "id": "lab/demo",
        "author": "lab",
        "pipeline_tag": "robotics",
        "tags": ["vla", "license:mit", "region:us"],
        "downloads": 1,
        "likes": 0,
    }
    doc = normalize_model(item, "2026-09-11T12:00:00+00:00", "vla", "tag:vla")
    text = document_text(doc)
    assert "demo" in text
    assert "robotics" in text
    assert "vla" in text
    assert "license:mit" not in text
    assert "region:us" not in text
    assert "lab/" not in text


def test_texts_from_docs_dedupes() -> None:
    doc = normalize_repo(
        {
            "full_name": "acme/agents",
            "html_url": "https://github.com/acme/agents",
            "description": "fixture",
            "stargazers_count": 1,
            "forks_count": 0,
            "open_issues_count": 0,
            "owner": {"login": "acme"},
            "license": {"spdx_id": "MIT"},
        },
        "2026-09-11T12:00:00+00:00",
        "ai-agents",
        "topic:llm-agents",
    )
    texts = texts_from_docs([doc, doc])
    assert len(texts) == 1
    assert "acme/agents" in texts[0]


def test_append_lexicon_keeps_last_same_day(tmp_path, monkeypatch) -> None:
    from signallab import store as store_mod

    monkeypatch.setattr(store_mod, "LEXICON_PATH", tmp_path / "lexicon.json")
    monkeypatch.setattr(store_mod, "DATA", tmp_path)
    first = build_lexicon_day(
        {"vla": ["robot policy one"]},
        computed_at="2026-09-11T08:00:00+00:00",
    )
    second = build_lexicon_day(
        {"vla": ["robot policy two", "actuator stack"]},
        computed_at="2026-09-11T18:00:00+00:00",
    )
    later = build_lexicon_day(
        {"vla": ["robot policy three"]},
        computed_at="2026-09-12T09:00:00+00:00",
    )
    append_lexicon_day(first)
    append_lexicon_day(second)
    store = append_lexicon_day(later)
    assert [item.day for item in store.days] == ["2026-09-11", "2026-09-12"]
    assert store.days[0].computed_at.startswith("2026-09-11T18")
    assert isinstance(first, LexiconDay)
