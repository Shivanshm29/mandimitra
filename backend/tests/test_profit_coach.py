import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

def test_profit_coach_analysis(client: TestClient, auth_headers: dict):
    # 1. Create Sale 1 with Trader Shinde (partially paid, includes commission deduction)
    sale1_payload = {
        "trader_name": "Shinde Agro Trading",
        "market_name": "Nashik APMC",
        "commodity": "Onion",
        "variety": "Red Garwa",
        "quantity": "50.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "2200.00",
        "sale_date": "2026-10-15",
        "initial_payment_received": "50000.00",
        "deductions": [
            {"deduction_type": "COMMISSION", "amount": "4400.00", "description": "Trader commission"},
            {"deduction_type": "HAMALI", "amount": "800.00", "description": "Labor unloading"}
        ]
    }
    # Gross = 110,000, Ded = 5,200, Net = 104,800. Rec = 50,000, Outstanding = 54,800
    res1 = client.post("/api/v1/sales", json=sale1_payload, headers=auth_headers)
    assert res1.status_code == 201

    # 2. Create Sale 2 with Trader Patil (fully unpaid)
    sale2_payload = {
        "trader_name": "Patil & Sons",
        "market_name": "Lasalgaon APMC",
        "commodity": "Soybean",
        "variety": "Yellow",
        "quantity": "20.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "4600.00",
        "sale_date": "2026-10-20",
        "initial_payment_received": "0.00",
        "deductions": [
            {"deduction_type": "MANDI_CESS", "amount": "500.00", "description": "Market cess"}
        ]
    }
    # Gross = 92,000, Ded = 500, Net = 91,500. Rec = 0, Outstanding = 91,500
    res2 = client.post("/api/v1/sales", json=sale2_payload, headers=auth_headers)
    assert res2.status_code == 201

    # 3. Query Profit Coach endpoint
    coach_res = client.get("/api/v1/finance/profit-coach", headers=auth_headers)
    assert coach_res.status_code == 200
    data = coach_res.json()

    # Gross: 110000 + 92000 = 202,000
    assert Decimal(data["total_gross_revenue"]) == Decimal("202000.00")
    # Realized: 50,000
    assert Decimal(data["total_realized_revenue"]) == Decimal("50000.00")
    # Outstanding: 54,800 + 91,500 = 146,300
    assert Decimal(data["total_outstanding_receivable"]) == Decimal("146300.00")

    # Trader Debtors: Patil has 91,500 pending (rank 1), Shinde has 54,800 (rank 2)
    debtors = data["trader_debtors"]
    assert len(debtors) >= 2
    assert debtors[0]["trader_name"] == "Patil & Sons"
    assert Decimal(debtors[0]["outstanding_amount"]) == Decimal("91500.00")
    assert debtors[1]["trader_name"] == "Shinde Agro Trading"
    assert Decimal(debtors[1]["outstanding_amount"]) == Decimal("54800.00")

    # Deductions Audit: Check commission anomaly detected
    audit = data["deduction_audit"]
    assert Decimal(audit["total_deductions"]) == Decimal("5700.00")
    assert any("कमिशन" in anom or "commission" in anom.lower() for anom in audit["anomalies"])

    # Actionable recommendations contains follow-up with Patil & Sons
    assert any("Patil & Sons" in rec for rec in data["actionable_recommendations"])

