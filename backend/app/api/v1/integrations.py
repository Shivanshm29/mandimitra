from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.api.deps import get_current_user
from app.models.user import User
from app.integrations.sarvam.client import SarvamIntegration

router = APIRouter(prefix="/integrations", tags=["Integrations"])

@router.post("/sarvam/smoke-test")
def test_sarvam_connectivity(
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Protected smoke test for Sarvam AI backend integration."""
    return SarvamIntegration.smoke_test()

