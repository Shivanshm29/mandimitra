import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

def test_price_alerts_flow(client: TestClient, auth_headers: dict):
    # 1. Create alert
    alert_payload = {
        "commodity": "Onion",
        "target_modal_price": "2800.00",
        "condition": "ABOVE",
        "market_name": "Lasalgaon APMC"
    }
    create_res = client.post("/api/v1/mandi/alerts", json=alert_payload, headers=auth_headers)
    assert create_res.status_code == 201
    alert = create_res.json()
    assert alert["commodity"] == "Onion"
    assert Decimal(alert["target_modal_price"]) == Decimal("2800.00")
    alert_id = alert["id"]

    # 2. Get alerts
    list_res = client.get("/api/v1/mandi/alerts", headers=auth_headers)
    assert list_res.status_code == 200
    alerts = list_res.json()
    assert len(alerts) >= 1
    assert any(a["id"] == alert_id for a in alerts)

    # 3. Delete alert
    del_res = client.delete(f"/api/v1/mandi/alerts/{alert_id}", headers=auth_headers)
    assert del_res.status_code == 204

def test_sarvam_action_execution_lot_and_sale(client: TestClient, auth_headers: dict):
    # 1. Execute confirmed action: create_selling_lot
    lot_action_payload = {
        "action": "create_selling_lot",
        "parameters": {
            "commodity": "Onion",
            "variety": "Red Garwa",
            "total_quantity": 25.0,
            "quality_grade": "Grade A",
            "storage_location": "Lasalgaon Warehouse"
        }
    }
    exec_lot = client.post("/api/v1/sarvam/execute-action", json=lot_action_payload, headers=auth_headers)
    assert exec_lot.status_code == 200
    lot_data = exec_lot.json()
    assert lot_data["status"] == "SUCCESS"
    assert "lot_code" in lot_data["data"]

    # 2. Execute confirmed action: record_sale
    sale_action_payload = {
        "action": "record_sale",
        "parameters": {
            "trader_name": "Kisan Mandi Traders",
            "market_name": "Lasalgaon APMC",
            "commodity": "Onion",
            "variety": "Red Garwa",
            "quantity": 10.0,
            "rate_per_unit": 2500.0,
            "initial_payment_received": 10000.0,
            "deductions": [
                {"deduction_type": "HAMALI", "amount": 200.0, "description": "Unloading"}
            ]
        }
    }
    exec_sale = client.post("/api/v1/sarvam/execute-action", json=sale_action_payload, headers=auth_headers)
    assert exec_sale.status_code == 200
    sale_res = exec_sale.json()
    assert sale_res["status"] == "SUCCESS"
    # Gross: 10 * 2500 = 25000, Ded: 200 -> Net: 24800, Rec: 10000 -> Bal: 14800
    assert Decimal(sale_res["data"]["net_receivable"]) == Decimal("24800.00")
    assert Decimal(sale_res["data"]["outstanding_balance"]) == Decimal("14800.00")

def test_crop_extraction_from_voice_text(client: TestClient, auth_headers: dict):
    phrase_payload = {
        "text": "मी कांदा, सोयाबीन आणि गहू पिकवतो.",
        "language": "mr-IN"
    }
    crop_res = client.post("/api/v1/sarvam/extract-crops", json=phrase_payload, headers=auth_headers)
    assert crop_res.status_code == 200
    crops = crop_res.json()["crops"]
    commodities = [c["commodity"] for c in crops]
    assert "Onion" in commodities
    assert "Soybean" in commodities

