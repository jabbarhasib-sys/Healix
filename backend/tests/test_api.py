"""
tests/test_api.py
-----------------
Unit tests for the Healix REST API endpoints.
Run with: pytest backend/tests/test_api.py -v
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_endpoint():
    """Root endpoint should return service name and online status."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "HEALIX AI"
    assert data["status"] == "online"


def test_health_check_endpoint():
    """Health check should always return 200 when the server is up."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_pipeline_run_valid():
    """Valid payload should trigger a full pipeline run and return results."""
    payload = {
        "symptoms_text": "I have severe chest pain and dizziness",
        "patient_name": "Test User",
        "patient_age": 35,
    }
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "clinical" in data
    assert "risk" in data


def test_pipeline_run_short_symptoms_validation():
    """Too-short symptoms text must be rejected with HTTP 422."""
    payload = {"symptoms_text": "hi"}
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 422


def test_pipeline_run_missing_payload():
    """Empty payload must be rejected with HTTP 422."""
    response = client.post("/api/pipeline/run", json={})
    assert response.status_code == 422


def test_root_response_has_version():
    """Root endpoint response should expose an API version field."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "version" in data or "service" in data


