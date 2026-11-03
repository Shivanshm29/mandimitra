from datetime import datetime, timezone
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.api.v1 import api_v1_router
from app.schemas.common import HealthResponse
from app.database.base import Base
from app.database.session import engine

# Ensure models are imported for metadata registration
import app.models  # noqa: F401

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Seed baseline mandi market rates if empty
    from app.database.session import SessionLocal
    from app.database.seed_data import seed_mandi_prices_if_empty
    db = SessionLocal()
    try:
        seed_mandi_prices_if_empty(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multilingual Agricultural Market & Financial Intelligence Platform for Indian Farmers",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_msg = errors[0].get("msg") if errors else "Invalid request data"
    first_field = " -> ".join(str(loc) for loc in errors[0].get("loc", [])) if errors else "body"
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"{first_field}: {first_msg}"}
    )

# Root health endpoint required by specification Section 11: GET /health
@app.get("/health", response_model=HealthResponse, tags=["Health"])
def root_health():
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc)
    )

# Include API v1 router: provides /api/v1/health, /api/v1/auth/*, /api/v1/farmer/*, etc.
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root_info():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

