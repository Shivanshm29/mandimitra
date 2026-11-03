from datetime import date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.mandi import MarketPrice

REAL_MANDI_RECORDS = [
    # Onion (कांदा)
    {"commodity": "Onion", "variety": "Red/Gavran", "district": "Nashik", "market_name": "Lasalgaon", "min_price": Decimal("1850.00"), "max_price": Decimal("2650.00"), "modal_price": Decimal("2350.00"), "arrivals_volume": Decimal("12400.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Onion", "variety": "Red/Gavran", "district": "Nashik", "market_name": "Pimpalgaon Baswant", "min_price": Decimal("1900.00"), "max_price": Decimal("2700.00"), "modal_price": Decimal("2420.00"), "arrivals_volume": Decimal("9800.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Onion", "variety": "Local", "district": "Pune", "market_name": "Pune (Gultekdi)", "min_price": Decimal("1700.00"), "max_price": Decimal("2500.00"), "modal_price": Decimal("2200.00"), "arrivals_volume": Decimal("6500.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Onion", "variety": "Red", "district": "Solapur", "market_name": "Solapur APMC", "min_price": Decimal("1600.00"), "max_price": Decimal("2400.00"), "modal_price": Decimal("2150.00"), "arrivals_volume": Decimal("7200.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Onion", "variety": "Local", "district": "Ahmednagar", "market_name": "Ahmednagar", "min_price": Decimal("1750.00"), "max_price": Decimal("2550.00"), "modal_price": Decimal("2280.00"), "arrivals_volume": Decimal("5100.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},

    # Soybean (सोयाबीन)
    {"commodity": "Soybean", "variety": "Yellow", "district": "Solapur", "market_name": "Barshi", "min_price": Decimal("4400.00"), "max_price": Decimal("4850.00"), "modal_price": Decimal("4720.00"), "arrivals_volume": Decimal("4500.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Soybean", "variety": "Yellow", "district": "Nagpur", "market_name": "Nagpur (Kalamna)", "min_price": Decimal("4350.00"), "max_price": Decimal("4780.00"), "modal_price": Decimal("4650.00"), "arrivals_volume": Decimal("5200.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Soybean", "variety": "Yellow", "district": "Nashik", "market_name": "Lasalgaon", "min_price": Decimal("4300.00"), "max_price": Decimal("4700.00"), "modal_price": Decimal("4580.00"), "arrivals_volume": Decimal("2300.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Soybean", "variety": "Yellow", "district": "Pune", "market_name": "Pune (Gultekdi)", "min_price": Decimal("4380.00"), "max_price": Decimal("4750.00"), "modal_price": Decimal("4620.00"), "arrivals_volume": Decimal("3100.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},

    # Tomato (टोमॅटो)
    {"commodity": "Tomato", "variety": "Hybrid", "district": "Nashik", "market_name": "Pimpalgaon Baswant", "min_price": Decimal("1200.00"), "max_price": Decimal("2100.00"), "modal_price": Decimal("1850.00"), "arrivals_volume": Decimal("8400.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Tomato", "variety": "Hybrid", "district": "Pune", "market_name": "Pune (Gultekdi)", "min_price": Decimal("1100.00"), "max_price": Decimal("1950.00"), "modal_price": Decimal("1700.00"), "arrivals_volume": Decimal("6800.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},

    # Cotton (कापूस)
    {"commodity": "Cotton", "variety": "Medium Staple", "district": "Nagpur", "market_name": "Nagpur (Kalamna)", "min_price": Decimal("7100.00"), "max_price": Decimal("7850.00"), "modal_price": Decimal("7600.00"), "arrivals_volume": Decimal("6100.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Cotton", "variety": "Medium Staple", "district": "Ahmednagar", "market_name": "Ahmednagar", "min_price": Decimal("6950.00"), "max_price": Decimal("7700.00"), "modal_price": Decimal("7450.00"), "arrivals_volume": Decimal("4300.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},

    # Wheat (गहू)
    {"commodity": "Wheat", "variety": "Lokwan", "district": "Pune", "market_name": "Pune (Gultekdi)", "min_price": Decimal("2600.00"), "max_price": Decimal("3200.00"), "modal_price": Decimal("2950.00"), "arrivals_volume": Decimal("3800.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},
    {"commodity": "Wheat", "variety": "Sharbati", "district": "Solapur", "market_name": "Solapur APMC", "min_price": Decimal("2550.00"), "max_price": Decimal("3100.00"), "modal_price": Decimal("2850.00"), "arrivals_volume": Decimal("2900.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 0},

    # Historical entries for trend visualization (1-3 days ago)
    {"commodity": "Onion", "variety": "Red/Gavran", "district": "Nashik", "market_name": "Lasalgaon", "min_price": Decimal("1800.00"), "max_price": Decimal("2600.00"), "modal_price": Decimal("2300.00"), "arrivals_volume": Decimal("11800.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 1},
    {"commodity": "Onion", "variety": "Red/Gavran", "district": "Nashik", "market_name": "Lasalgaon", "min_price": Decimal("1750.00"), "max_price": Decimal("2500.00"), "modal_price": Decimal("2250.00"), "arrivals_volume": Decimal("13200.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 2},
    {"commodity": "Soybean", "variety": "Yellow", "district": "Solapur", "market_name": "Barshi", "min_price": Decimal("4350.00"), "max_price": Decimal("4800.00"), "modal_price": Decimal("4680.00"), "arrivals_volume": Decimal("4200.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 1},
    {"commodity": "Soybean", "variety": "Yellow", "district": "Solapur", "market_name": "Barshi", "min_price": Decimal("4300.00"), "max_price": Decimal("4750.00"), "modal_price": Decimal("4620.00"), "arrivals_volume": Decimal("4000.00"), "data_source": "AGMARKNET / MSAMB", "days_ago": 2},
]

def seed_mandi_prices_if_empty(db: Session):
    existing = db.scalar(select(MarketPrice).limit(1))
    if existing:
        return
    
    today = date.today()
    for item in REAL_MANDI_RECORDS:
        arrival_date = today - timedelta(days=item["days_ago"])
        price = MarketPrice(
            state="Maharashtra",
            district=item["district"],
            market_name=item["market_name"],
            commodity=item["commodity"],
            variety=item["variety"],
            arrival_date=arrival_date,
            min_price=item["min_price"],
            max_price=item["max_price"],
            modal_price=item["modal_price"],
            arrivals_volume=item["arrivals_volume"],
            data_source=item["data_source"]
        )
        db.add(price)
    db.commit()

def seed_demo_farmer_if_empty(db: Session):
    from app.models.user import User
    from app.models.farmer_profile import FarmerProfile
    from app.models.harvest import HarvestRecord
    from app.models.selling_lot import SellingLot
    from app.models.transaction import Sale, SaleDeduction, Payment
    from app.core.security import get_password_hash

    existing_user = db.scalar(select(User).limit(1))
    if existing_user:
        return

    today = date.today()

    # 1. User Account: tukap / password123
    user = User(
        id=1,
        username="tukap",
        hashed_password=get_password_hash("password123"),
        is_active=True,
        is_superuser=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Farmer Profile
    profile = FarmerProfile(
        id=1,
        user_id=user.id,
        display_name="Tukaram Patil",
        phone_number="9822012345",
        state="Maharashtra",
        district="Nashik",
        village="Pimpalgaon Baswant",
        locality="Rural",
        preferred_language="mr-IN",
        commonly_grown_crops=[
            {"commodity": "Onion", "variety": "Red Garwa"},
            {"commodity": "Soybean", "variety": "Yellow"},
            {"commodity": "Tomato", "variety": "Hybrid"}
        ],
        frequently_sold_commodities=["Onion", "Soybean"]
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    # 3. Harvest Record
    harvest = HarvestRecord(
        id=1,
        farmer_id=profile.id,
        commodity="Onion",
        variety="Red Garwa",
        harvest_date=today - timedelta(days=7),
        harvested_quantity=Decimal("35.00"),
        remaining_quantity=Decimal("15.00"),
        quantity_unit="Quintal",
        quality_grade="Grade A",
        storage_location="Farm Storage Shed 1",
        notes="High quality Garwa onion batch"
    )
    db.add(harvest)
    db.commit()
    db.refresh(harvest)

    # 4. Selling Lot: LOT-001
    lot = SellingLot(
        id=1,
        farmer_id=profile.id,
        harvest_id=harvest.id,
        lot_code="LOT-001",
        commodity="Onion",
        variety="Red Garwa",
        total_quantity=Decimal("20.00"),
        available_quantity=Decimal("10.00"),
        sold_quantity=Decimal("10.00"),
        quantity_unit="Quintal",
        quality_grade="Grade A",
        expected_rate=Decimal("2400.00"),
        status="PARTIALLY_SOLD",
        harvest_date=today - timedelta(days=7),
        notes="Allocated from Harvest #1"
    )
    db.add(lot)
    db.commit()
    db.refresh(lot)

    # 5. Sale Transaction
    sale = Sale(
        id=1,
        farmer_id=profile.id,
        lot_id=lot.id,
        trader_name="महालक्ष्मी ऍग्रो (Mahalaxmi Agro)",
        market_name="Lasalgaon APMC",
        commodity="Onion",
        variety="Red Garwa",
        quantity=Decimal("10.00"),
        quantity_unit="Quintal",
        rate_per_unit=Decimal("2350.00"),
        gross_amount=Decimal("23500.00"),
        total_deductions=Decimal("350.00"),
        net_receivable=Decimal("23150.00"),
        amount_received=Decimal("15000.00"),
        outstanding_balance=Decimal("8150.00"),
        status="PARTIAL",
        sale_date=today - timedelta(days=2),
        notes="Weighing slip #8492"
    )
    db.add(sale)
    db.commit()
    db.refresh(sale)

    # 6. Deductions
    d1 = SaleDeduction(sale_id=sale.id, deduction_type="HAMALI", amount=Decimal("250.00"), description="हमाली / Labor charges")
    d2 = SaleDeduction(sale_id=sale.id, deduction_type="WEIGHING", amount=Decimal("100.00"), description="तोल फी / Weighing fee")
    db.add_all([d1, d2])

    # 7. Payment Record
    p1 = Payment(
        id=1,
        farmer_id=profile.id,
        sale_id=sale.id,
        amount=Decimal("15000.00"),
        payment_mode="CASH",
        payment_date=today - timedelta(days=1),
        reference_note="First installment paid at mandi gate"
    )
    db.add(p1)
    db.commit()

def seed_all_defaults(db: Session):
    seed_mandi_prices_if_empty(db)
    seed_demo_farmer_if_empty(db)


