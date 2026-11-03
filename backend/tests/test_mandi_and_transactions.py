from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.database.seed_data import seed_mandi_prices_if_empty

def test_mandi_prices_and_recommendations(client: TestClient, db: Session):
    # Ensure seed data is in the current test database
    seed_mandi_prices_if_empty(db)

    # 1. Fetch mandi prices
    res = client.get("/api/v1/mandi/prices?commodity=Onion")
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    assert data[0]["commodity"] == "Onion"
    assert "modal_price" in data[0]
    assert "data_source" in data[0]

    # 2. Fetch commodities
    com_res = client.get("/api/v1/mandi/commodities")
    assert com_res.status_code == 200
    commodities = com_res.json()
    assert "Onion" in commodities
    assert "Soybean" in commodities

    # 3. Recommendations
    rec_res = client.post("/api/v1/mandi/recommendations", json={
        "commodity": "Onion",
        "quantity": "50.00"
    })
    assert rec_res.status_code == 200
    rec_data = rec_res.json()
    assert rec_data["commodity"] == "Onion"
    assert Decimal(str(rec_data["highest_potential_gross"])) > Decimal("0")
    assert len(rec_data["recommendations"]) > 0
    assert rec_data["recommendations"][0]["rank"] == 1

def test_sales_and_payments_lifecycle(client: TestClient):
    # Register farmer
    farmer_payload = {
        "username": "shrikant_patil",
        "password": "Password123!",
        "display_name": "Shrikant Patil",
        "district": "Nashik",
        "village": "Lasalgaon",
        "preferred_language": "mr-IN"
    }
    reg = client.post("/api/v1/auth/register", json=farmer_payload)
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create a sale: 100 Qtl Soybean at 4500/Qtl = 450,000 gross
    # Deductions: Hamali 2000, Cess 1500 -> total deductions = 3500
    # Net = 446,500. Initial payment = 100,000 -> Outstanding = 346,500
    sale_payload = {
        "trader_name": "Mahalaxmi Traders",
        "market_name": "Lasalgaon APMC",
        "commodity": "Soybean",
        "variety": "Yellow",
        "quantity": "100.00",
        "rate_per_unit": "4500.00",
        "sale_date": "2026-11-03",
        "initial_payment_received": "100000.00",
        "deductions": [
            {"deduction_type": "HAMALI", "amount": "2000.00", "description": "Labor/unloading charges"},
            {"deduction_type": "MANDI_CESS", "amount": "1500.00", "description": "Mandi market fee"}
        ],
        "notes": "Grade A harvest"
    }
    sale_res = client.post("/api/v1/sales", json=sale_payload, headers=headers)
    assert sale_res.status_code == 201
    sale_data = sale_res.json()

    assert Decimal(str(sale_data["gross_amount"])) == Decimal("450000.00")
    assert Decimal(str(sale_data["total_deductions"])) == Decimal("3500.00")
    assert Decimal(str(sale_data["net_receivable"])) == Decimal("446500.00")
    assert Decimal(str(sale_data["amount_received"])) == Decimal("100000.00")
    assert Decimal(str(sale_data["outstanding_balance"])) == Decimal("346500.00")
    assert sale_data["status"] == "PARTIAL"
    assert len(sale_data["deductions"]) == 2
    sale_id = sale_data["id"]

    # 2. Record a partial payment installment: 200,000 via UPI
    pay_payload = {
        "sale_id": sale_id,
        "amount": "200000.00",
        "payment_mode": "UPI",
        "reference_note": "UPI Ref 12345678"
    }
    pay_res = client.post("/api/v1/payments", json=pay_payload, headers=headers)
    assert pay_res.status_code == 201

    # Check updated sale details: remaining balance = 146,500
    sale_check = client.get(f"/api/v1/sales/{sale_id}", headers=headers)
    assert sale_check.status_code == 200
    updated_sale = sale_check.json()
    assert Decimal(str(updated_sale["amount_received"])) == Decimal("300000.00")
    assert Decimal(str(updated_sale["outstanding_balance"])) == Decimal("146500.00")

    # 3. Check finance summary
    summary_res = client.get("/api/v1/finance/summary", headers=headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_sales_count"] == 1
    assert Decimal(str(summary["total_gross_amount"])) == Decimal("450000.00")
    assert Decimal(str(summary["total_deductions"])) == Decimal("3500.00")
    assert Decimal(str(summary["total_outstanding"])) == Decimal("146500.00")
    assert Decimal(str(summary["total_received"])) == Decimal("300000.00")
