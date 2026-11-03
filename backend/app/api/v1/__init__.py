from fastapi import APIRouter
from app.api.v1.health import router as health_router
from app.api.v1.auth import router as auth_router
from app.api.v1.farmer import router as farmer_router
from app.api.v1.integrations import router as integrations_router
from app.api.v1.mandi import router as mandi_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.lots import router as lots_router
from app.api.v1.harvests import router as harvests_router
from app.api.v1.sarvam import router as sarvam_router

api_v1_router = APIRouter()
api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(farmer_router)
api_v1_router.include_router(integrations_router)
api_v1_router.include_router(mandi_router)
api_v1_router.include_router(transactions_router)
api_v1_router.include_router(lots_router)
api_v1_router.include_router(harvests_router)
api_v1_router.include_router(sarvam_router)

__all__ = ["api_v1_router"]
