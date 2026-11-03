import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Resolve SQLite path reliably regardless of process cwd
db_url = settings.DATABASE_URL
if db_url.startswith("sqlite:///."):
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    rel_path = db_url.replace("sqlite:///.", "").lstrip("/\\")
    abs_db_path = os.path.normpath(os.path.join(backend_dir, rel_path))
    db_url = f"sqlite:///{abs_db_path.replace(os.sep, '/')}"

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency for obtaining database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
