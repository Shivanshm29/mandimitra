from fastapi.testclient import TestClient
from app.integrations.sarvam.client import SarvamIntegration

def test_sarvam_integration_smoke_test_structure():
    # Calling smoke_test should return a structured result with status, model, latency_ms
    res = SarvamIntegration.smoke_test()
    assert "status" in res
    assert "model" in res
    assert "latency_ms" in res
    assert res["model"] == "sarvam-105b-conversations"

def test_sarvam_api_endpoint(client: TestClient):
    # Register & login
    reg_payload = {
        "username": "sarvam_tester",
        "password": "Password123!",
        "display_name": "Sarvam Tester",
        "district": "Nagpur",
        "village": "Katol",
        "preferred_language": "mr-IN"
    }
    reg = client.post("/api/v1/auth/register", json=reg_payload)
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Call smoke-test endpoint
    res = client.post("/api/v1/integrations/sarvam/smoke-test", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "status" in data
    assert data["model"] == "sarvam-105b-conversations"

def test_sarvam_tts_and_doc_extract(client: TestClient, auth_headers: dict):
    # Test document extraction with raw text
    doc_payload = {
        "document_text": "लासलगाव बाजार समिती: शेतकरी गणेश शिंदे. कांदा आवक २० क्विंटल. दर ₹२,५०० प्रति क्विंटल. हमाली ₹२००. उपकर ₹१५०.",
        "language": "mr-IN"
    }
    doc_res = client.post("/api/v1/sarvam/document-extract", json=doc_payload, headers=auth_headers)
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert "commodity" in doc_data
    assert "deductions" in doc_data
    assert "confidence_score" in doc_data
    # Deterministic calculation check
    if doc_data["quantity"] and doc_data["rate_per_unit"]:
        expected_gross = float(doc_data["quantity"]) * float(doc_data["rate_per_unit"])
        assert abs(float(doc_data["gross_amount"]) - expected_gross) < 0.05


