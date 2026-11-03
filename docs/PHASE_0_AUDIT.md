# MANDIMITRA — Phase 0 Environment Audit Report

**Date & Time:** 2026-11-03 19:27 IST  
**Auditor:** Senior Full-Stack & System Architect Agent  
**Status:** Audit Complete — Repository Clean / Baseline Initialized  

---

## 1. Repository & Directory Structure
- **Root Path:** `c:\Users\shiva\projects\hackthon`
- **Existing Files:**
  - `.env` (Present, contains API key configuration)
  - `.gitignore` (Present, ignores `.env`)
  - `main.py` (Present from initial connectivity test script)
- **Existing Frontend Directory:** None (Repository was freshly initiated)
- **Existing Backend Directory:** None (Repository was freshly initiated)
- **Git Repository Status:**
  - Parent directory `c:\Users\shiva\projects` is an active Git repository.
  - Directory `hackthon` contains untracked prototype files from initial verification.
  - No existing production application architecture is being overwritten. Target architecture from specification will be established cleanly.

---

## 2. Environment & Runtime Findings

| Component | Detected Version / Status | Notes |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 AMD64 | PowerShell shell environment |
| **Python** | 3.14.5 | Global python runtime in `C:\Python314` |
| **Node.js** | v24.16.0 | Modern LTS/Current runtime |
| **npm** | 11.13.0 | Node package manager available |
| **Docker Engine** | Docker CLI 29.7.2 | Docker daemon not running currently (`docker-compose.yml` provided for Postgres) |
| **PostgreSQL Service** | `postgresql-x64-18` (Running) | Windows service active on port 5432. Local authentication requires configured credentials. SQLite fallback supported for automated tests and standalone development. |

---

## 3. Dependency Inventory

### Python Installed Packages (Verified):
- `fastapi` (Installed)
- `uvicorn` (Installed)
- `pydantic` (Installed)
- `sqlalchemy` (v2.0.50 installed)
- `alembic` (Installed)
- `pytest` (Installed)
- `bcrypt` (Installed, verified hashing and salt checks)
- `pyjwt` (v2.15.1 installed)
- `psycopg2-binary` (v2.9.13 installed)
- `httpx` (v0.28.1 installed)
- `sarvamai` (v0.1.42 installed)
- `python-dotenv` (v1.2.3 installed)

### Node.js Packages:
- No existing `node_modules` or `package.json` in root. Vite + React + TypeScript + Tailwind will be scaffolded in `frontend/`.

---

## 4. Credentials & Configuration Verification
- **SARVAM_API_KEY:** Configured in `.env` (Presence verified: **YES**; Value: preserved securely, never logged or exposed).
- **DATA_GOV_IN_API_KEY:** Configured in `.env`: **NO** (Optional external data-provider credential, marked as missing/optional as expected).
- **SECRET_KEY:** Needs to be defined in `.env` for signing JWT auth tokens.
- **DATABASE_URL:** Will default to SQLite (`sqlite:///./mandimitra.db`) for lightweight local execution, with seamless PostgreSQL connection string support (`postgresql://user:password@localhost:5432/mandimitra`).

---

## 5. Sarvam AI Smoke Test Result
- **Client:** Official `sarvamai` Python SDK (v0.1.42)
- **Tested Model:** `sarvam-105b-conversations`
- **Action:** Harmless test message submitted via backend Python runtime.
- **Result:** **SUCCESS** (API responded with HTTP 200, valid choices array).
- **Security Check:** API key loaded strictly from environment variable, never logged or displayed.

---

## 6. Architecture Selection
Since no legacy application existed in the repository, the canonical architecture requested in Section 5 is selected:
- **Backend:** FastAPI + SQLAlchemy 2 + Alembic + Pydantic v2 + PyJWT + Bcrypt.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + React Router + Lucide Icons + Devanagari font support.
- **Documentation & Tests:** Full test suite with `pytest` (backend) and `vitest` (frontend).

