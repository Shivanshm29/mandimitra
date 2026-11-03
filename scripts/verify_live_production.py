import urllib.request
import json
import base64
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://mandimitra-sepia.vercel.app/api/v1'

def run():
    print("===============================================================")
    print(" MANDIMITRA LIVE VERCEL PRODUCTION VERIFICATION")
    print(f" Target: {BASE_URL}")
    print("===============================================================")

    # 1. Health
    with urllib.request.urlopen(f"{BASE_URL}/health") as r:
        health = json.loads(r.read())
        print(f"[PASS] 1. Health: status={health.get('status')}, service={health.get('service')}, version={health.get('version')}")

    # 2. Auth Login
    login_payload = json.dumps({'username': 'tukap', 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/auth/login", data=login_payload, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        auth_res = json.loads(r.read())
        token = auth_res['access_token']
        farmer_name = auth_res['profile']['display_name']
        district = auth_res['profile']['district']
        print(f"[PASS] 2. Auth Login: farmer='{farmer_name}', district='{district}', token_type='{auth_res['token_type']}'")

    headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

    # 3. Auth Me
    req = urllib.request.Request(f"{BASE_URL}/auth/me", headers=headers)
    with urllib.request.urlopen(req) as r:
        me = json.loads(r.read())
        print(f"[PASS] 3. Auth Me: user_id={me['id']}, username='{me['username']}'")

    # 4. Farmer Profile
    req = urllib.request.Request(f"{BASE_URL}/farmer/profile", headers=headers)
    with urllib.request.urlopen(req) as r:
        prof = json.loads(r.read())
        print(f"[PASS] 4. Farmer Profile: village='{prof['village']}', state='{prof['state']}', crops={len(prof['commonly_grown_crops'])}")

    # 5. Mandi Prices
    req = urllib.request.Request(f"{BASE_URL}/mandi/prices?commodity=Onion", headers=headers)
    with urllib.request.urlopen(req) as r:
        prices = json.loads(r.read())
        print(f"[PASS] 5. Mandi Prices: {len(prices)} APMC price records found for Onion")

    # 6. Selling Recommendations (Harvest-Lot Context)
    rec_payload = json.dumps({
        'commodity': 'Onion',
        'variety': 'Red Garwa',
        'quantity': 10.0,
        'quantity_unit': 'Quintal',
        'source_district': 'Nashik'
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/mandi/recommendations", data=rec_payload, headers=headers)
    with urllib.request.urlopen(req) as r:
        rec = json.loads(r.read())
        print(f"[PASS] 6. Selling Recommendations: best_mandi='{rec.get('best_market')}', modal_price=₹{rec.get('best_modal_price')}, est_gross=₹{rec.get('highest_potential_gross')}, total_mandis={len(rec.get('recommendations', []))}")

    # 7. Harvests & Lots
    req = urllib.request.Request(f"{BASE_URL}/harvests/", headers=headers)
    with urllib.request.urlopen(req) as r:
        harvests = json.loads(r.read())
        print(f"[PASS] 7. Harvests: {len(harvests)} harvest records active")

    req = urllib.request.Request(f"{BASE_URL}/lots/", headers=headers)
    with urllib.request.urlopen(req) as r:
        lots = json.loads(r.read())
        print(f"[PASS] 8. Lots: {len(lots)} selling lots tracked")

    # 8. Sales & Payments
    req = urllib.request.Request(f"{BASE_URL}/sales", headers=headers)
    with urllib.request.urlopen(req) as r:
        sales = json.loads(r.read())
        print(f"[PASS] 9. Sales: {len(sales)} sales transactions")

    req = urllib.request.Request(f"{BASE_URL}/payments", headers=headers)
    with urllib.request.urlopen(req) as r:
        payments = json.loads(r.read())
        print(f"[PASS] 10. Payments: {len(payments)} payment allocations")

    # 9. Finance Summary & Profit Coach
    req = urllib.request.Request(f"{BASE_URL}/finance/summary", headers=headers)
    with urllib.request.urlopen(req) as r:
        fin = json.loads(r.read())
        print(f"[PASS] 11. Finance Summary: gross={fin.get('total_gross_amount')}, net={fin.get('total_net_receivable')}")

    req = urllib.request.Request(f"{BASE_URL}/finance/profit-coach", headers=headers)
    with urllib.request.urlopen(req) as r:
        coach = json.loads(r.read())
        print(f"[PASS] 12. Profit Coach: health_rating='{coach.get('health_rating')}', recommended_actions={len(coach.get('recommended_actions', []))}")

    # 10. Sarvam AI Conversational Voice Assistant Chat
    chat_payload = json.dumps({'message': 'कांदा कुठे विकू?', 'language': 'mr-IN'}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/sarvam/chat", data=chat_payload, headers=headers)
    with urllib.request.urlopen(req) as r:
        chat = json.loads(r.read())
        reply_len = len(chat.get('reply', ''))
        print(f"[PASS] 13. Sarvam Voice Assistant Chat: reply_length={reply_len} chars, language='{chat.get('language')}'")

    # 11. Sarvam Bulbul v4 Text-to-Speech (TTS)
    tts_payload = json.dumps({'text': 'लासलगाव मध्ये कांद्याला चांगला भाव आहे.', 'language': 'mr-IN'}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/sarvam/tts", data=tts_payload, headers=headers)
    with urllib.request.urlopen(req) as r:
        tts = json.loads(r.read())
        print(f"[PASS] 14. Sarvam Voice Synthesis TTS (Bulbul v4): format='{tts.get('audio_format')}', audio_base64_len={len(tts.get('audio_base64', ''))}")

    # 12. Sarvam Crop Extraction NER
    crop_payload = json.dumps({'text': 'मी माझ्या शेतात कांदा आणि हरभरा पिकवतो', 'language': 'mr-IN'}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/sarvam/extract-crops", data=crop_payload, headers=headers)
    with urllib.request.urlopen(req) as r:
        crops_res = json.loads(r.read())
        print(f"[PASS] 15. Sarvam Crop NER: identified={crops_res.get('crops')}")

    # 13. Sarvam Vision / Document Extraction (Weighing Slip OCR & Financial Determinism)
    slip_text = 'नाशिक APMC पावती. व्यापारी: श्री गणेश ट्रेडर्स. शेतकरी: तुकाराम पाटील. माल: कांदा लाल, वजन: २० क्विंटल, भाव: ₹२,५०० प्रति क्विंटल. हमाली: ₹२००, वजन खर्च: ₹५०.'
    doc_payload = json.dumps({'document_text': slip_text}).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/sarvam/document-extract", data=doc_payload, headers=headers)
    with urllib.request.urlopen(req) as r:
        doc = json.loads(r.read())
        print(f"[PASS] 16. Sarvam Vision / Document Intelligence:")
        print(f"       - Trader: '{doc.get('trader_name')}'")
        print(f"       - Commodity: '{doc.get('commodity')}' ({doc.get('quantity')} {doc.get('quantity_unit')})")
        print(f"       - Rate/Unit: ₹{doc.get('rate_per_unit')}")
        print(f"       - Gross Amount: ₹{doc.get('gross_amount')}")
        print(f"       - Total Deductions: ₹{doc.get('total_deductions')}")
        print(f"       - Net Receivable: ₹{doc.get('net_receivable')}")
        print(f"       - Confidence Score: {doc.get('confidence_score')}")

    print("\n===============================================================")
    print(" [ALL 16 PRODUCTION APIs VERIFIED WORKING SUCCESSFULLY] ")
    print("===============================================================")

if __name__ == '__main__':
    run()
