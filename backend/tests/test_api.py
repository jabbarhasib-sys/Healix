import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "HEALIX AI"
    assert data["status"] == "online"

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200

def test_pipeline_run_valid():
    payload = {
        "symptoms_text": "I have severe chest pain and dizziness",
        "patient_name": "Test User",
        "patient_age": 35
    }
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "clinical" in data
    assert "risk" in data

def test_pipeline_run_short_symptoms_validation():
    payload = {"symptoms_text": "hi"}
    response = client.post("/api/pipeline/run", json=payload)
    assert response.status_code == 422

