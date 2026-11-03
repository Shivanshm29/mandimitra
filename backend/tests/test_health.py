from fastapi.testclient import TestClient

def test_root_health(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MANDIMITRA"
    assert "version" in data
    assert "timestamp" in data

def test_api_v1_health(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "MANDIMITRA"

def test_api_v1_detailed_health(client: TestClient):
    response = client.get("/api/v1/detailed-health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "sarvam_ai" in data

