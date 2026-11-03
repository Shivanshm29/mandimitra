from fastapi.testclient import TestClient

def test_farmer_profile_fetch_and_update(client: TestClient):
    # Register farmer
    register_payload = {
        "username": "ganesh_shinde",
        "password": "Password789!",
        "display_name": "Ganesh Shinde",
        "phone_number": "+919833445566",
        "district": "Solapur",
        "village": "Barshi",
        "preferred_language": "mr-IN"
    }
    reg_res = client.post("/api/v1/auth/register", json=register_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch profile
    prof_res = client.get("/api/v1/farmer/profile", headers=headers)
    assert prof_res.status_code == 200
    prof_data = prof_res.json()
    assert prof_data["display_name"] == "Ganesh Shinde"
    assert prof_data["district"] == "Solapur"
    assert prof_data["village"] == "Barshi"

    # Update profile
    update_payload = {
        "display_name": "Ganesh B. Shinde",
        "district": "Pune",
        "village": "Daund",
        "preferred_language": "hi-IN"
    }
    put_res = client.put("/api/v1/farmer/profile", json=update_payload, headers=headers)
    assert put_res.status_code == 200
    updated_data = put_res.json()
    assert updated_data["display_name"] == "Ganesh B. Shinde"
    assert updated_data["district"] == "Pune"
    assert updated_data["village"] == "Daund"
    assert updated_data["preferred_language"] == "hi-IN"

    # Fetch again to verify persistence
    get_res2 = client.get("/api/v1/farmer/profile", headers=headers)
    assert get_res2.status_code == 200
    assert get_res2.json()["district"] == "Pune"

def test_farmer_profile_unauthorized(client: TestClient):
    res = client.get("/api/v1/farmer/profile")
    assert res.status_code == 401

