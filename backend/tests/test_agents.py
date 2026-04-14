"""Unit tests for agent fallback behaviors."""

from backend.agents.mapper import MapperAgent
from backend.agents.investigator import InvestigatorAgent
from backend.agents.advocate import AdvocateAgent
from backend.agents.synthesizer import SynthesizerAgent


def test_mapper_fallback():
    agent = MapperAgent()
    res = agent.fallback("I want to quit my job and start a startup.")
    assert "claims" in res
    assert "values" in res
    assert "assumptions" in res
    assert isinstance(res["claims"], list)
    assert res.get("_fallback") is True


def test_investigator_fallback():
    agent = InvestigatorAgent()
    res = agent.fallback("I am confident this stock will go up 10x.")
    assert "biases" in res
    assert isinstance(res["biases"], list)
    assert res.get("_fallback") is True


def test_advocate_fallback():
    agent = AdvocateAgent()
    res = agent.fallback("Buying this car might be risky.")
    assert "defense" in res
    assert isinstance(res["defense"], list)
    assert res.get("_fallback") is True


def test_synthesizer_fallback():
    agent = SynthesizerAgent()
    res = agent.fallback("Should I relocate to Seattle?")
    assert "pattern_name" in res
    assert "explanation" in res
    assert "confidence" in res
    assert res.get("_fallback") is True

def test_agent_temperature_defaults():
    from backend.config import AGENT_TEMPERATURES
    assert "mapper" in AGENT_TEMPERATURES
    assert "investigator" in AGENT_TEMPERATURES


def test_mapper_decision_type_key():
    from backend.agents.mapper import MapperAgent
    agent = MapperAgent()
    res = agent.fallback("test query")
    assert "claims" in res


def test_advocate_defense_list():
    from backend.agents.advocate import AdvocateAgent
    agent = AdvocateAgent()
    res = agent.fallback("test query")
    assert isinstance(res["defense"], list)


def test_synthesizer_confidence_bounds():
    from backend.agents.synthesizer import SynthesizerAgent
    agent = SynthesizerAgent()
    res = agent.fallback("test query")
    assert 0 <= res.get("confidence", 0) <= 100

