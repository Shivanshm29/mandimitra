# MANDIMITRA — System Architecture

## 1. High-Level Architecture

MANDIMITRA follows a clean decoupled client-server architecture:

```
+--------------------------------------------------------------+
|                   Farmer Client Interface                    |
|  - React 19 + TypeScript + Vite + Tailwind CSS              |
|  - Devanagari Typography (Noto Sans Devanagari)              |
|  - Responsive Mobile-First PWA-Ready UI                      |
|  - Languages: Marathi (mr-IN), Hindi (hi-IN), English (en-IN)|
+------------------------------+-------------------------------+
                               |
                        HTTPS / JSON REST
                               |
+------------------------------v-------------------------------+
|                    FastAPI Backend Gateway                   |
|  - Router Layer (/api/v1/auth, /api/v1/farmer, /health)      |
|  - Pydantic v2 Request/Response Validation                   |
|  - JWT Authentication & Bcrypt Password Security             |
|  - Structured Error Handlers & Request Tracing               |
+---------------+------------------------------+---------------+
                |                              |
        SQLAlchemy 2 ORM                       |
                |                              |
+---------------v---------------+   +----------v---------------+
|        Database Layer         |   |    Sarvam AI Gateway     |
| - PostgreSQL (Prod/Docker)    |   | - Official sarvamai SDK  |
| - SQLite (Fast Local Tests)   |   | - sarvam-105b Chat LLM   |
| - Alembic Schema Migrations   |   | - Indic Voice & Doc AI   |
+-------------------------------+   +--------------------------+
```

---

## 2. Directory Structure

```
mandimitra/
├── frontend/                     # React + Vite + TypeScript
│   ├── src/
│   │   ├── app/                  # Routing, Context Providers
│   │   ├── components/           # Accessible, Reusable UI Components
│   │   ├── pages/                # Route Page Views (Login, Register, Dashboard, Profile)
│   │   ├── layouts/              # AppShell, Navbar, Sidebar
│   │   ├── hooks/                # Custom React Hooks
│   │   ├── services/             # API Client & Axios/Fetch wrappers
│   │   ├── types/                # TypeScript Interfaces & Contracts
│   │   └── i18n/                 # Localization Strings (mr, hi, en)
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tests/
│
├── backend/                      # FastAPI Application
│   ├── app/
│   │   ├── main.py               # Application Entry Point & Middleware
│   │   ├── api/v1/               # Versioned REST Routes
│   │   ├── core/                 # Config, Security, JWT, Constants
│   │   ├── database/             # SQLAlchemy Engine, Session, Base
│   │   ├── models/               # SQLAlchemy ORM Entities
│   │   ├── schemas/              # Pydantic Input/Output Schemas
│   │   ├── services/             # Business Logic Layer
│   │   ├── repositories/         # Database Access Queries
│   │   └── integrations/         # Sarvam AI & Mandi Data Connectors
│   ├── alembic/                  # Database Migrations
│   ├── alembic.ini
│   ├── requirements.txt
│   └── tests/                    # Pytest Suite
│
├── docs/                         # Architecture, Audit & API Docs
├── .env.example                  # Safe configuration templates
├── .gitignore                    # Secrets & build artifacts exclusion
├── docker-compose.yml            # PostgreSQL & services containerization
└── README.md                     # Setup and operational instructions
```

---

## 3. Security Boundary
- The frontend **never** receives or handles third-party API keys (`SARVAM_API_KEY`, `DATA_GOV_IN_API_KEY`).
- Authentication uses signed JSON Web Tokens (HS256) with configurable expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- Passwords are salted and hashed using standard `bcrypt` routines.
- CORS policies restrict allowed browser origins.
- Sensitive environment variables are validated at backend startup; failure halts initialization with an informative message that omits secret values.

