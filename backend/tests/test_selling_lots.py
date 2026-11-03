import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

def test_selling_lots_and_inventory_deduction(client: TestClient, auth_headers: dict):
    # 1. Create a produce lot (LOT-001, Onion, 20 quintals)
    lot_payload = {
        "commodity": "Onion",
        "variety": "Red Garwa",
        "quality_grade": "Grade A",
        "total_quantity": "20.00",
        "unit": "QUINTAL",
        "storage_location": "Village Warehouse, Nashik"
    }
    create_res = client.post("/api/v1/lots", json=lot_payload, headers=auth_headers)
    assert create_res.status_code == 201
    lot = create_res.json()
    assert lot["lot_code"].startswith("LOT-")
    assert Decimal(lot["total_quantity"]) == Decimal("20.00")
    assert Decimal(lot["available_quantity"]) == Decimal("20.00")
    assert Decimal(lot["sold_quantity"]) == Decimal("0.00")
    assert lot["status"] == "AVAILABLE"
    lot_id = lot["id"]

    # 2. Sell 8 quintals linked to lot_id
    sale_payload = {
        "lot_id": lot_id,
        "commodity": "Onion",
        "variety": "Red Garwa",
        "trader_name": "Nashik Agro Traders",
        "market_name": "Lasalgaon APMC",
        "quantity": "8.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "2400.00",
        "sale_date": "2026-11-03",
        "deductions": [
            {"deduction_type": "HAMALI", "amount": "160.00", "description": "Loading/Unloading"}
        ]
    }
    sale_res = client.post("/api/v1/sales", json=sale_payload, headers=auth_headers)
    assert sale_res.status_code == 201
    sale = sale_res.json()
    assert sale["lot_id"] == lot_id
    # Gross = 8 * 2400 = 19200.00, net = 19200 - 160 = 19040.00
    assert Decimal(sale["gross_amount"]) == Decimal("19200.00")
    assert Decimal(sale["net_receivable"]) == Decimal("19040.00")
    assert Decimal(sale["outstanding_balance"]) == Decimal("19040.00")

    # 3. Check lot updated state
    lot_check = client.get(f"/api/v1/lots/{lot_id}", headers=auth_headers)
    assert lot_check.status_code == 200
    updated_lot = lot_check.json()
    assert Decimal(updated_lot["available_quantity"]) == Decimal("12.00")
    assert Decimal(updated_lot["sold_quantity"]) == Decimal("8.00")
    assert updated_lot["status"] == "PARTIALLY_SOLD"

    # 4. Attempt to oversell (request 15 quintals when only 12 are available)
    excess_sale_payload = {
        "lot_id": lot_id,
        "commodity": "Onion",
        "trader_name": "Greedy Buyer",
        "quantity": "15.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "2400.00",
        "sale_date": "2026-11-03"
    }
    excess_res = client.post("/api/v1/sales", json=excess_sale_payload, headers=auth_headers)
    assert excess_res.status_code == 400
    assert "insufficient available produce" in excess_res.json()["detail"].lower()

    # 5. Sell remaining 12 quintals
    final_sale_payload = {
        "lot_id": lot_id,
        "commodity": "Onion",
        "trader_name": "Nashik Agro Traders",
        "quantity": "12.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "2450.00",
        "sale_date": "2026-11-03"
    }
    final_sale_res = client.post("/api/v1/sales", json=final_sale_payload, headers=auth_headers)
    assert final_sale_res.status_code == 201

    # Check lot is now completely SOLD
    lot_sold_check = client.get(f"/api/v1/lots/{lot_id}", headers=auth_headers)
    assert lot_sold_check.status_code == 200
    fully_sold_lot = lot_sold_check.json()
    assert Decimal(fully_sold_lot["available_quantity"]) == Decimal("0.00")
    assert Decimal(fully_sold_lot["sold_quantity"]) == Decimal("20.00")
    assert fully_sold_lot["status"] == "SOLD"

    # 6. Cannot delete a lot with sales
    del_res = client.delete(f"/api/v1/lots/{lot_id}", headers=auth_headers)
    assert del_res.status_code == 400
    assert "cannot delete" in del_res.json()["detail"].lower()


def test_payment_allocations_and_duplicate_prevention(client: TestClient, auth_headers: dict):
    # Create a standalone sale
    sale_res = client.post("/api/v1/sales", json={
        "commodity": "Soybean",
        "trader_name": "Kisan Oil Mills",
        "quantity": "10.00",
        "quantity_unit": "Quintal",
        "rate_per_unit": "4500.00",
        "sale_date": "2026-11-01"
    }, headers=auth_headers)
    assert sale_res.status_code == 201
    sale_id = sale_res.json()["id"]
    net_amount = Decimal(sale_res.json()["net_receivable"])  # 45000.00

    # 1. Partial payment with multi-sale allocation format
    pay_res = client.post("/api/v1/payments", json={
        "amount": "20000.00",
        "payment_mode": "NEFT",
        "payment_date": "2026-11-02",
        "reference_note": "REF-PARTIAL-1",
        "allocations": [
            {"sale_id": sale_id, "amount": "20000.00"}
        ]
    }, headers=auth_headers)
    assert pay_res.status_code == 201

    # Verify sale outstanding balance is 25000.00 and status PARTIAL
    check_sale = client.get(f"/api/v1/sales/{sale_id}", headers=auth_headers)
    assert Decimal(check_sale.json()["outstanding_balance"]) == Decimal("25000.00")
    assert check_sale.json()["status"] == "PARTIAL"

    # 2. Over-allocation attempt: try to allocate 30000.00 when only 25000.00 is outstanding
    over_pay_res = client.post("/api/v1/payments", json={
        "amount": "30000.00",
        "payment_mode": "CASH",
        "payment_date": "2026-11-03",
        "reference_note": "REF-OVERALLOC",
        "allocations": [
            {"sale_id": sale_id, "amount": "30000.00"}
        ]
    }, headers=auth_headers)
    assert over_pay_res.status_code == 400
    assert "exceeds outstanding balance" in over_pay_res.json()["detail"].lower()

    # 3. Duplicate payment detection
    dup_res = client.post("/api/v1/payments", json={
        "amount": "20000.00",
        "payment_mode": "NEFT",
        "payment_date": "2026-11-02",
        "reference_note": "REF-PARTIAL-1"
    }, headers=auth_headers)
    assert dup_res.status_code == 400
    assert "duplicate payment" in dup_res.json()["detail"].lower()
