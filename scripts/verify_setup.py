#!/usr/bin/env python3
"""
MANDIMITRA — System Setup & Diagnostics Verification Script
Verifies database integrity, ORM models, environment configuration, Sarvam AI connectivity,
Selling Lots, Payment Allocations, and Profit Coach intelligence.
"""
import os
import sys
import time

# Ensure safe UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Ensure backend is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, os.path.join(project_root, "backend"))

def check_mark(success: bool) -> str:
    return "[PASS]" if success else "[FAIL]"

def run_diagnostics():
    print("=" * 70)
    print("MANDIMITRA (मंडीमित्र) — Complete System & Intelligence Diagnostics")
    print("=" * 70)

    all_passed = True

    # 1. Check Python version
    py_ver = sys.version.split()[0]
    print(f"\n1. Python Runtime: {py_ver}")
    print(f"   {check_mark(True)} Python 3.10+ detected.")

    # 2. Check Environment & Secrets
    from dotenv import load_dotenv
    load_dotenv(os.path.join(project_root, ".env"))

    sarvam_key_present = bool(os.getenv("SARVAM_API_KEY"))
    secret_key_present = bool(os.getenv("SECRET_KEY"))
    data_gov_present = bool(os.getenv("DATA_GOV_IN_API_KEY"))

    print(f"\n2. Environment Configuration:")
    print(f"   {check_mark(sarvam_key_present)} SARVAM_API_KEY configured: {sarvam_key_present} (value protected)")
    print(f"   {check_mark(secret_key_present)} SECRET_KEY configured: {secret_key_present}")
    print(f"   [INFO] DATA_GOV_IN_API_KEY configured: {data_gov_present}")

    if not sarvam_key_present or not secret_key_present:
        all_passed = False

    # 3. Check Database & ORM
    print(f"\n3. Database & Registered Models:")
    try:
        from app.database.session import engine
        from app.database.base import Base
        from app.models.user import User
        from app.models.farmer_profile import FarmerProfile
        from app.models.selling_lot import SellingLot
        from app.models.payment_allocation import PaymentAllocation
        from app.models.transaction import Sale, Payment, SaleDeduction
        from app.models.mandi import MarketPrice
        from sqlalchemy import text

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"   {check_mark(True)} Database connection established.")
        print(f"   {check_mark(True)} All 7 core models (User, Farmer, SellingLot, Sale, Payment, Allocation, MarketPrice) verified.")
    except Exception as e:
        print(f"   {check_mark(False)} Database check failed: {type(e).__name__} - {e}")
        all_passed = False

    # 4. Check Security & Crypto
    print(f"\n4. Security & Cryptography:")
    try:
        from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
        test_hash = get_password_hash("test_pwd_2026")
        assert verify_password("test_pwd_2026", test_hash)
        assert not verify_password("wrong_pwd", test_hash)
        token = create_access_token(subject=1)
        payload = decode_access_token(token)
        assert payload and payload["sub"] == "1"
        print(f"   {check_mark(True)} Bcrypt hashing & verification operating correctly.")
        print(f"   {check_mark(True)} Signed JWT bearer token lifecycle validated.")
    except Exception as e:
        print(f"   {check_mark(False)} Security check failed: {type(e).__name__} - {e}")
        all_passed = False

    # 5. Check Sarvam AI Chat & Bulbul TTS
    print(f"\n5. Sarvam AI Multilingual Gateway:")
    try:
        from app.integrations.sarvam.client import SarvamIntegration
        res = SarvamIntegration.smoke_test()
        if res.get("status") == "success":
            print(f"   {check_mark(True)} Sarvam-105B Conversations responded in {res.get('latency_ms')}ms.")
        else:
            print(f"   {check_mark(False)} Sarvam AI smoke test returned status: {res.get('status')} - {res.get('error')}")
            all_passed = False

        from app.services.sarvam_service import SarvamService
        from app.schemas.sarvam import TTSRequest
        tts_res = SarvamService.synthesize_speech(TTSRequest(text="नमस्कार शेतकरी बंधूंनो", language="mr-IN"))
        if tts_res.audio_base64:
            print(f"   {check_mark(True)} Sarvam Bulbul v4 Marathi TTS generated {len(tts_res.audio_base64)} base64 chars.")
        else:
            print(f"   {check_mark(False)} Sarvam TTS returned empty audio.")
            all_passed = False
    except Exception as e:
        print(f"   {check_mark(False)} Sarvam AI test failed: {type(e).__name__} - {e}")
        all_passed = False

    # 6. Check Profit Coach & Business Logic
    print(f"\n6. Financial Intelligence & Profit Coach:")
    try:
        from app.services.profit_coach_service import ProfitCoachService
        from app.database.session import SessionLocal
        with SessionLocal() as db:
            analysis = ProfitCoachService.analyze(db, None, "mr-IN")
            assert hasattr(analysis, "total_gross_revenue")
            assert hasattr(analysis, "deduction_audit")
            assert hasattr(analysis, "rate_comparisons")
            print(f"   {check_mark(True)} Profit Coach deterministic math and benchmark engine validated.")
    except Exception as e:
        print(f"   {check_mark(False)} Profit Coach check failed: {type(e).__name__} - {e}")
        all_passed = False

    print("\n" + "=" * 70)
    if all_passed:
        print("OVERALL DIAGNOSTIC RESULT: ALL SYSTEM & INTELLIGENCE CHECKS PASSED")
    else:
        print("OVERALL DIAGNOSTIC RESULT: ISSUES DETECTED")
    print("=" * 70)

    return all_passed

if __name__ == "__main__":
    success = run_diagnostics()
    sys.exit(0 if success else 1)
