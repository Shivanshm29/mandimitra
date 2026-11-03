import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from datetime import date

def test_harvest_lifecycle_and_selling_lot_allocation(client: TestClient):
    # 1. Register farmer
    reg_payload = {
        "username": "harvest_farmer_test",
        "password": "Password123!",
        "display_name": "Suresh Harvest",
        "district": "Nashik",
        "village": "Niphad",
        "preferred_language": "mr-IN",
        "commonly_grown_crops": ["Onion", "Soybean"]
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add Harvest Record
    harvest_data = {
        "commodity": "Onion",
        "variety": "Garwa Red",
        "harvest_date": str(date.today()),
        "harvested_quantity": 50.00,
        "quantity_unit": "Quintal",
        "quality_grade": "Grade A",
        "storage_location": "Niphad Godown",
        "notes": "Post monsoon harvest"
    }
    res = client.post("/api/v1/harvests", json=harvest_data, headers=headers)
    assert res.status_code == 201
    harvest = res.json()
    harvest_id = harvest["id"]
    assert harvest["commodity"] == "Onion"
    assert Decimal(str(harvest["harvested_quantity"])) == Decimal("50.00")
    assert Decimal(str(harvest["remaining_quantity"])) == Decimal("50.00")

    # 3. Create Selling Lot directly from Harvest (Allocating 20 Quintals)
    lot_req = {
        "lot_quantity": 20.00,
        "expected_rate": 2400.00,
        "notes": "First market batch"
    }
    lot_res = client.post(f"/api/v1/harvests/{harvest_id}/create-lot", json=lot_req, headers=headers)
    assert lot_res.status_code == 201
    lot = lot_res.json()
    assert lot["lot_code"].startswith("LOT-")
    assert Decimal(str(lot["total_quantity"])) == Decimal("20.00")
    assert Decimal(str(lot["available_quantity"])) == Decimal("20.00")

    # 4. Verify harvest remaining quantity decreased to 30.00
    h_res = client.get(f"/api/v1/harvests/{harvest_id}", headers=headers)
    assert h_res.status_code == 200
    assert Decimal(str(h_res.json()["remaining_quantity"])) == Decimal("30.00")

    # 5. Attempt to create selling lot exceeding remaining quantity (e.g. 35 Qtl) -> must fail with 400
    oversell_req = {
        "lot_quantity": 35.00
    }
    bad_res = client.post(f"/api/v1/harvests/{harvest_id}/create-lot", json=oversell_req, headers=headers)
    assert bad_res.status_code == 400
    assert "exceeds remaining" in bad_res.json()["detail"].lower()

