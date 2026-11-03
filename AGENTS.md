# MANDIMITRA — Engineering Discipline & Project Rules

This document outlines the architectural rules, security boundaries, and engineering practices governing the MANDIMITRA project.

---

## 1. Core Principles
1. **Never generate superficial prototypes**: No fake financial results, decorative non-functional buttons, or mocked AI responses pretending to be live.
2. **Never commit secrets**: `.env` is strictly ignored. `SARVAM_API_KEY` and other credentials must never be printed, logged, or exposed in frontend code.
3. **Never trust LLM output as financial ground truth**: Calculations, payment allocations, outstanding balances, and deductions must be computed deterministically in backend business logic using `Decimal`.
4. **Data integrity**: All currency values use Decimal types (e.g., `DECIMAL(12, 2)`), never floating point.
5. **Clear module states**: When an architectural pillar is in development or not yet connected, clearly present it as non-functional development state rather than fabricating live data.
6. **Strict Product Scope**: Only the 6 approved pillars (Farmer Management, Mandi Intelligence, Selling Recommendations, Transaction & Payment Intelligence, Sarvam AI, Financial Intelligence) are within scope. No cultivation/soil/fertilizer advice, vehicle logistics, direct bank integrations, or UPI execution.

---

## 2. Architecture & Tech Stack
- **Backend**: FastAPI, SQLAlchemy 2 (async/sync session support), Pydantic v2, Alembic migrations, PostgreSQL (with SQLite compatibility for lightweight local test suites).
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons, Devanagari Indic typography support (Marathi, Hindi, English).
- **AI Integrations**: Official `sarvamai` Python SDK. All external AI calls originate exclusively from the backend.
- **Testing**: Pytest for backend unit/integration tests; Vitest for frontend component and validation tests.

---

## 3. Continuous Testing Rule
- Every new business rule, model, or API endpoint must be accompanied by automated tests.
- Code changes must be followed by test execution. Never skip failing tests. Fix discovered defects and verify clean runs.
- Run both backend tests, frontend tests, and production build checks before completing phases.

