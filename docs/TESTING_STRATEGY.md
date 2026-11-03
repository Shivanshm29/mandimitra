# MANDIMITRA — Testing Strategy & Quality Assurance Plan

## 1. Quality Objectives
- **Zero Hallucinated Metrics**: Every financial figure and calculation is validated by deterministic code and test suites.
- **Fail-Fast Security**: Tokens, authorization checks, and sensitive data protection are tested at every boundary.
- **Continuous Verification**: Tests are run automatically during development, after bug fixes, and prior to phase gate reviews.

---

## 2. Backend Testing Strategy (`pytest`)

### Scope of Tests
1. **Environment Configuration**: Validate that missing critical settings fail gracefully while valid ones instantiate clients.
2. **Health Endpoints**: Test `/health` and `/api/v1/health`.
3. **Authentication Flows**:
   - Successful farmer registration.
   - Duplicate username or email rejection.
   - Successful login with token generation.
   - Rejection of invalid passwords.
   - Bcrypt hashing verification (entropy and salt uniqueness).
4. **Farmer Profile Management**:
   - Auto-creation of profile on registration.
   - Fetching authenticated farmer profile.
   - Profile updating (district, village, language).
5. **Authorization Security**:
   - Accessing protected endpoints without bearer token (HTTP 401).
   - Accessing with expired or malformed token (HTTP 401).
6. **Database Persistence**:
   - SQLAlchemy session management, rollback on transaction failure, and constraint verification.
7. **Sarvam AI Integration**:
   - Smoke test against `sarvam-105b-conversations` endpoint using valid backend credentials.
   - Graceful error categorization if credentials are absent or network is unreachable.

---

## 3. Frontend Testing Strategy (`vitest` + `testing-library`)

### Scope of Tests
1. **Form Validation**:
   - Registration inputs (username length, password confirmation, required location fields).
   - Login inputs (required fields, error display on bad credentials).
2. **Navigation & Routes**:
   - Protected routes redirecting unauthenticated users to `/login`.
   - Accessing Dashboard, Profile, and Mandi modules once authenticated.
3. **Profile Editing**:
   - Loading initial profile data into form inputs.
   - Submitting updates and refreshing local state.
4. **Module Status Transparency**:
   - Verifying that non-functional development modules display clear "In Development / Phase 2" indicators rather than simulated data.
5. **Type Safety & Build Integrity**:
   - `tsc --noEmit` validation for zero TypeScript warnings or errors.
   - Vite production build verification.

