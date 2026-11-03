# MANDIMITRA (मंडीमित्र)
> **AI-Powered Multilingual Agricultural Market and Financial Intelligence Platform for Indian Farmers**  
> *Initial Deployment Focus: Maharashtra, India*

---

## 🌾 Overview
MANDIMITRA is a production-minded digital intelligence platform engineered to empower farmers with verified government-reported mandi prices, selling recommendations, transaction accounting, and AI-assisted financial explanations in **Marathi (mr-IN)**, **Hindi (hi-IN)**, and **English (en-IN)**.

To uphold financial truth and trust, MANDIMITRA **never** hallucinates fake market numbers, decorative buttons, or simulated financial balances.

---

## 🏛️ Approved Product Pillars
1. **Farmer Management**: Secure token authentication, demographic profile (State, District, Village, Locality), and language preferences.
2. **Mandi Intelligence**: Actual government-reported mandi prices (Min, Max, Modal rates per quintal) and arrivals. *(Phase 2)*
3. **Selling Recommendations**: Comparative mandi analysis based on real reported modal rates. *(Phase 2)*
4. **Transaction & Payment Intelligence**: Itemized weighing slips, deductions, and payment allocations. *(Phase 2)*
5. **Sarvam AI Gateway**: Indic speech-to-text (`Saaras`), conversational reasoning (`sarvam-105b`), text-to-speech (`Bulbul`), and document intelligence.
6. **Financial Intelligence / Profit Coach**: Explainable deduction auditing and profit tracking. *(Phase 3)*

---

## 💻 Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Devanagari typography (`Noto Sans Devanagari`).
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, Bcrypt, PyJWT.
- **Database**: PostgreSQL (Production/Docker) / SQLite (Immediate zero-config local development and testing).
- **AI Integration**: Official `sarvamai` Python SDK.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm
- (Optional) Docker for PostgreSQL

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains your credentials:
```ini
SARVAM_API_KEY=your_sarvam_api_key_here
SECRET_KEY=your_secure_secret_key_here
DATABASE_URL=sqlite:///./mandimitra.db
```
*(Note: `.env` is ignored by Git and must never be committed).*

---

### 3. Backend Setup & Run
In a terminal:
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run database migrations
python -m alembic upgrade head

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will be available at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`
- **Health Check:** `http://127.0.0.1:8000/health`

---

### 4. Frontend Setup & Run
In a second terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be live at:
- **Web App:** `http://localhost:5173`

---

## 🧪 Running Automated Tests

### Run Backend Test Suite (`pytest`):
```bash
cd backend
python -m pytest -v
```
*Executes health checks, registration, login, profile management, password hashing, and Sarvam connectivity tests.*

### Run Frontend Test Suite (`vitest`):
```bash
cd frontend
npm test
```
*Executes unit tests for components, translations dictionary, and page form validation.*

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```

### Run Full System Diagnostic Script:
```bash
python scripts/verify_setup.py
```

---

## 🔒 Security Principles
- All Sarvam AI calls originate exclusively from the backend; the API key is never exposed to the client.
- Passwords are salted and hashed with `bcrypt`.
- Authentication uses signed JSON Web Tokens (HS256) with configured expiration.
- Currency calculations strictly use Decimal numeric types.

