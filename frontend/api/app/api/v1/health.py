from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.session import get_db
from app.core.config import settings
from app.schemas.common import HealthResponse, DetailedHealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health():
    """Basic health check endpoint."""
    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc)
    )

@router.get("/detailed-health", response_model=DetailedHealthResponse)
def get_detailed_health(db: Session = Depends(get_db)):
    """Detailed health check for database and external integrations."""
    # Check database
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "disconnected"

    # Check Sarvam AI configuration
    sarvam_status = "configured" if bool(settings.SARVAM_API_KEY) else "unconfigured"

    overall_status = "healthy" if db_status == "connected" else "degraded"

    return DetailedHealthResponse(
        status=overall_status,
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        database=db_status,
        sarvam_ai=sarvam_status,
        timestamp=datetime.now(timezone.utc),
        details={
            "environment": settings.ENVIRONMENT,
            "data_gov_configured": bool(settings.DATA_GOV_IN_API_KEY)
        }
    )

