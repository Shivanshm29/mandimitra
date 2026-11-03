from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    timestamp: datetime

class DetailedHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    database: str
    sarvam_ai: str
    timestamp: datetime
    details: Optional[Dict[str, Any]] = None

class ErrorDetail(BaseModel):
    detail: str

