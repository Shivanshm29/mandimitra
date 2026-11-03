import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "MANDIMITRA"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str = "mandimitra_production_grade_secret_key_dev_2026_safe"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: defaults to SQLite for immediate local/test execution, supports PostgreSQL
    DATABASE_URL: str = "sqlite:////tmp/mandimitra.db" if os.environ.get("VERCEL") else "sqlite:///./mandimitra.db"
    
    # Third-Party Integrations
    SARVAM_API_KEY: Optional[str] = None
    DATA_GOV_IN_API_KEY: Optional[str] = None
    
    # Environment & CORS
    ENVIRONMENT: str = "development"
    ALLOWED_ORIGINS: str = "*"

    @property
    def cors_origins(self) -> List[str]:
        if self.ALLOWED_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

