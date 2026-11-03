import pytest
from decimal import Decimal
from datetime import date
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.models.farmer_profile import FarmerProfile
from app.models.harvest import HarvestRecord
from app.models.selling_lot import SellingLot
from app.models.mandi import MarketPrice
from app.schemas.mandi import RecommendationRequest
from app.services.mandi_service import MandiService

def test_harvest_lot_context_aware_recommendations(client: TestClient, db: Session):
    # 1. Register a test farmer in Nashik
    reg_payload = {
        "username": "nashik_lot_farmer",
        "password": "Password123!",
        "display_name": "Kailash Patil",
        "district": "Nashik",
        "village": "Niphad",
        "preferred_language": "mr-IN",
        "commonly_grown_crops": ["Onion"]
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    farmer_profile = db.query(FarmerProfile).filter(FarmerProfile.district == "Nashik").first()
    assert farmer_profile is not None

    # 2. Create a Harvest Record for Onion in Nashik
    harvest = HarvestRecord(
        farmer_id=farmer_profile.id,
        commodity="Onion",
        variety="Red Garwa",
        harvest_date=date(2026, 11, 1),
        harvested_quantity=Decimal("50.00"),
        remaining_quantity=Decimal("35.00"),
        quantity_unit="Quintal",
        quality_grade="Grade A",
        storage_location="Niphad Godown"
    )
    db.add(harvest)
    db.commit()
    db.refresh(harvest)

    # 3. Create a Selling Lot for 15 Quintals from this harvest
    lot = SellingLot(
        farmer_id=farmer_profile.id,
        harvest_id=harvest.id,
        lot_code="LOT-REC-01",
        commodity="Onion",
        variety="Red Garwa",
        quality_grade="Grade A",
        total_quantity=Decimal("15.00"),
        available_quantity=Decimal("15.00"),
        sold_quantity=Decimal("0.00"),
        quantity_unit="Quintal",
        status="AVAILABLE"
    )
    db.add(lot)

    # 4. Add test mandi prices
    p1 = MarketPrice(
        state="Maharashtra",
        district="Nashik",
        market_name="Pimpalgaon Baswant APMC",
        commodity="Onion",
        variety="Red/Gavran",
        arrival_date=date(2026, 11, 3),
        min_price=Decimal("1800.00"),
        max_price=Decimal("2600.00"),
        modal_price=Decimal("2450.00"),
        arrivals_volume=Decimal("1500.00"),
        data_source="AGMARKNET / MSAMB"
    )
    p2 = MarketPrice(
        state="Maharashtra",
        district="Pune",
        market_name="Pune Gultekdi APMC",
        commodity="Onion",
        variety="Local",
        arrival_date=date(2026, 11, 3),
        min_price=Decimal("1700.00"),
        max_price=Decimal("2300.00"),
        modal_price=Decimal("2200.00"),
        arrivals_volume=Decimal("800.00"),
        data_source="AGMARKNET / MSAMB"
    )
    p3 = MarketPrice(
        state="Maharashtra",
        district="Solapur",
        market_name="Solapur APMC",
        commodity="Onion",
        variety="Red",
        arrival_date=date(2026, 11, 2),
        min_price=Decimal("1600.00"),
        max_price=Decimal("2100.00"),
        modal_price=Decimal("2000.00"),
        arrivals_volume=Decimal("600.00"),
        data_source="AGMARKNET / MSAMB"
    )
    db.add_all([p1, p2, p3])
    db.commit()

    # 5. Request recommendation passing ONLY lot_id
    req_lot = RecommendationRequest(
        commodity="Onion",
        quantity=Decimal("1.00"), # Will be overridden by lot's available quantity
        lot_id=lot.id,
        farmer_district=farmer_profile.district
    )
    res_lot = MandiService.get_recommendations(db, req_lot, farmer_id=farmer_profile.id)

    # Verify lot details were retrieved automatically
    assert res_lot.commodity == "Onion"
    assert res_lot.quantity == Decimal("15.00") # from lot.available_quantity
    assert res_lot.lot_code == "LOT-REC-01"
    assert res_lot.lot_id == lot.id
    assert res_lot.best_market == "Pimpalgaon Baswant APMC"
    assert res_lot.best_modal_price == Decimal("2450.00")
    
    # Mathematical exactness of estimated gross: 15 * 2450 = 36750.00
    expected_gross = Decimal("15.00") * Decimal("2450.00")
    assert res_lot.highest_potential_gross == expected_gross

    # Verify ranking badges
    top_rec = res_lot.recommendations[0]
    assert top_rec.market_name == "Pimpalgaon Baswant APMC"
    assert top_rec.is_best_price is True
    assert top_rec.is_convenient_local is True
    assert top_rec.is_best_overall is True
    assert top_rec.estimated_gross == Decimal("36750.00")
    assert top_rec.min_estimated_gross == Decimal("15.00") * Decimal("1800.00")
    assert top_rec.max_estimated_gross == Decimal("15.00") * Decimal("2600.00")

    # 6. Request recommendation passing harvest_id
    req_harvest = RecommendationRequest(
        commodity="Onion",
        quantity=Decimal("1.00"), # Will be overridden by harvest remaining quantity (35.00)
        harvest_id=harvest.id,
        farmer_district=farmer_profile.district
    )
    res_harvest = MandiService.get_recommendations(db, req_harvest, farmer_id=farmer_profile.id)

    assert res_harvest.quantity == Decimal("35.00") # from harvest.remaining_quantity
    assert res_harvest.highest_potential_gross == Decimal("35.00") * Decimal("2450.00")

    # 7. Test sorting by location (home district first)
    req_loc = RecommendationRequest(
        commodity="Onion",
        quantity=Decimal("10.00"),
        farmer_district="Nashik",
        sort_by="location"
    )
    res_loc = MandiService.get_recommendations(db, req_loc)
    assert res_loc.recommendations[0].district == "Nashik"

    # 8. Test API endpoint POST /api/v1/mandi/recommendations directly
    token = reg_res.json()["access_token"]
    api_res = client.post(
        "/api/v1/mandi/recommendations",
        json={"commodity": "Onion", "quantity": 10.0, "lot_id": lot.id},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert api_res.status_code == 200
    api_data = api_res.json()
    assert api_data["lot_code"] == "LOT-REC-01"
    assert float(api_data["quantity"]) == 15.0
    assert api_data["best_overall_market"] == "Pimpalgaon Baswant APMC"
    assert len(api_data["recommendations"]) >= 1
