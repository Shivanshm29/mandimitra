import os
import sys
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.database.base import Base
from app.database.session import get_db

# Use in-memory SQLite for test isolation
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    import uuid
    uid = uuid.uuid4().hex[:8]
    register_payload = {
        "username": f"farmer_{uid}",
        "password": "Password789!",
        "display_name": f"Farmer {uid}",
        "phone_number": f"+91983344{uid[:4]}",
        "district": "Nashik",
        "village": "Lasalgaon",
        "preferred_language": "mr-IN"
    }
    reg_res = client.post("/api/v1/auth/register", json=register_payload)
    token = reg_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


