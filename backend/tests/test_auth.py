from fastapi.testclient import TestClient

def test_register_and_login_flow(client: TestClient):
    # 1. Register new farmer
    payload = {
        "username": "tukaram_p",
        "password": "Password123!",
        "display_name": "Tukaram Patil",
        "phone_number": "+919822123456",
        "district": "Nashik",
        "village": "Pimpalgaon",
        "locality": "Near APMC Mandi",
        "preferred_language": "mr-IN"
    }
    reg_res = client.post("/api/v1/auth/register", json=payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["username"] == "tukaram_p"
    assert reg_data["profile"]["district"] == "Nashik"
    assert reg_data["profile"]["preferred_language"] == "mr-IN"

    token = reg_data["access_token"]

    # 2. Reject duplicate username
    dup_res = client.post("/api/v1/auth/register", json=payload)
    assert dup_res.status_code == 400
    assert "already registered" in dup_res.json()["detail"].lower()

    # 3. Successful login
    login_res = client.post("/api/v1/auth/login", json={
        "username": "tukaram_p",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["username"] == "tukaram_p"

    # 4. Failed login with bad password
    bad_pass_res = client.post("/api/v1/auth/login", json={
        "username": "tukaram_p",
        "password": "WrongPassword!"
    })
    assert bad_pass_res.status_code == 401

    # 5. Failed login with non-existent username
    no_user_res = client.post("/api/v1/auth/login", json={
        "username": "non_existent_farmer",
        "password": "Password123!"
    })
    assert no_user_res.status_code == 401

    # 6. Authenticated /me endpoint
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["username"] == "tukaram_p"
    assert me_data["profile"]["display_name"] == "Tukaram Patil"

def test_unauthorized_access_rejected(client: TestClient):
    # Missing token
    res1 = client.get("/api/v1/auth/me")
    assert res1.status_code == 401

    # Malformed token
    res2 = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer badtoken"})
    assert res2.status_code == 401

