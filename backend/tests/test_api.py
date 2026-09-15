"""Integration tests for FastAPI endpoints."""

from fastapi.testclient import TestClient
from backend.main import app, SESSION_STORE

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["ok"] is True
    assert data["service"] == "MirrorMind API"


def test_metrics_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "total_requests" in data
    assert data["total_requests"] >= 0


def test_session_not_found():
    res = client.get("/api/session/non_existent_session_id")
    assert res.status_code == 404


def test_session_found():
    test_id = "test_sess_12345"
    SESSION_STORE[test_id] = {
        "session_id": test_id,
        "domain": "general",
        "trace": {"test": "data"},
    }
    res = client.get(f"/api/session/{test_id}")
    assert res.status_code == 200
    assert res.json()["session_id"] == test_id


def test_export_session_json():
    test_id = "export_sess_999"
    SESSION_STORE[test_id] = {
        "session_id": test_id,
        "domain": "career",
        "trace": {},
    }
    res = client.get(f"/api/export/{test_id}.json")
    assert res.status_code == 200
    assert res.headers["content-disposition"] == f'attachment; filename="{test_id}.json"'
    assert res.json()["session_id"] == test_id


def test_export_invalid_session_id():
    res = client.get("/api/export/../../etc/passwd.json")
    assert res.status_code in (400, 404)



def test_rerank_with_intent_payload():
    res = client.post(
        "/api/rerank/general",
        json={
            "intent": "Deciding whether to raise VC funding or stay bootstrapped for profitability.",
            "session_dna": {},
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert "trace" in data


def test_rerank_with_empty_payload():
    res = client.post(
        "/api/rerank/general",
        json={
            "intent": "",
            "message": "",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data



def test_analyze_request_whitespace_trimming():
    from backend.main import AnalyzeRequest
    req = AnalyzeRequest(message="   I am choosing between two offers   ")
    assert req.get_query() == "I am choosing between two offers"

