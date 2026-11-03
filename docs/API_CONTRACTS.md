# MANDIMITRA — API Contracts & Specifications

All API responses follow consistent JSON formats and HTTP status codes.

---

## 1. System Health & Diagnostics

### `GET /health`
Global health check for load balancers.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "mandimitra-backend",
  "version": "1.0.0"
}
```

### `GET /api/v1/health`
Detailed subsystem status.
- **Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "sarvam_ai": "configured",
  "timestamp": "2026-11-03T14:00:00Z"
}
```

---

## 2. Authentication Endpoints

### `POST /api/v1/auth/register`
Register a new farmer account and initial profile.
- **Request Body:**
```json
{
  "username": "tukaram_patil",
  "password": "SecurePassword123!",
  "display_name": "Tukaram Patil",
  "phone_number": "+919822012345",
  "district": "Nashik",
  "village": "Pimpalgaon Baswant",
  "locality": "Near Gram Panchayat",
  "preferred_language": "mr-IN"
}
```
- **Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "username": "tukaram_patil",
    "phone_number": "+919822012345",
    "created_at": "2026-11-03T14:00:00Z"
  },
  "profile": {
    "id": 1,
    "display_name": "Tukaram Patil",
    "phone_number": "+919822012345",
    "state": "Maharashtra",
    "district": "Nashik",
    "village": "Pimpalgaon Baswant",
    "locality": "Near Gram Panchayat",
    "preferred_language": "mr-IN"
  },
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer"
}
```

### `POST /api/v1/auth/login`
Authenticate farmer using username and password.
- **Request Body:**
```json
{
  "username": "tukaram_patil",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "tukaram_patil"
  }
}
```

### `GET /api/v1/auth/me`
Retrieve the authenticated farmer user info.
- **Header:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "id": 1,
  "username": "tukaram_patil",
  "phone_number": "+919822012345",
  "is_active": true,
  "created_at": "2026-11-03T14:00:00Z"
}
```

---

## 3. Farmer Profile Endpoints

### `GET /api/v1/farmer/profile`
Retrieve farmer's localized profile.
- **Header:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "display_name": "Tukaram Patil",
  "phone_number": "+919822012345",
  "state": "Maharashtra",
  "district": "Nashik",
  "village": "Pimpalgaon Baswant",
  "locality": "Near Gram Panchayat",
  "preferred_language": "mr-IN",
  "created_at": "2026-11-03T14:00:00Z",
  "updated_at": "2026-11-03T14:00:00Z"
}
```

### `PUT /api/v1/farmer/profile`
Update farmer's geographic or language preferences.
- **Header:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "display_name": "Tukaram Patil (Farmer)",
  "phone_number": "+919822012345",
  "district": "Nashik",
  "village": "Lasalgaon",
  "locality": "Station Road",
  "preferred_language": "mr-IN"
}
```
- **Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "display_name": "Tukaram Patil (Farmer)",
  "phone_number": "+919822012345",
  "state": "Maharashtra",
  "district": "Nashik",
  "village": "Lasalgaon",
  "locality": "Station Road",
  "preferred_language": "mr-IN",
  "created_at": "2026-11-03T14:00:00Z",
  "updated_at": "2026-11-03T14:05:00Z"
}
```

---

## 4. Diagnostics & AI Test Endpoint

### `POST /api/v1/integrations/sarvam/smoke-test`
Performs a backend-mediated health connectivity test with Sarvam AI `sarvam-105b-conversations`.
- **Header:** `Authorization: Bearer <token>`
- **Response (200 OK):**
```json
{
  "status": "success",
  "model": "sarvam-105b-conversations",
  "latency_ms": 320,
  "response_snippet": "..."
}
```

