from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.repositories.farmer_repo import FarmerRepository
from app.schemas.sarvam import (
    FarmerChatRequest,
    FarmerChatResponse,
    ExecuteActionRequest,
    ExecuteActionResponse,
    TTSRequest,
    TTSResponse,
    STTResponse,
    DocumentExtractRequest,
    DocumentExtractResponse,
)
from app.services.sarvam_service import SarvamService

router = APIRouter(prefix="/sarvam", tags=["Sarvam AI Assistant"])

@router.post("/chat", response_model=FarmerChatResponse)
def chat_with_assistant(
    data: FarmerChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Conversational assistant for agricultural market and financial intelligence."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    return SarvamService.answer_farmer_query(db, profile, data)

@router.post("/tts", response_model=TTSResponse)
def text_to_speech(
    data: TTSRequest,
    current_user: User = Depends(get_current_user)
):
    """Synthesize Indic speech (Marathi, Hindi, English) via Sarvam Bulbul v4."""
    return SarvamService.synthesize_speech(data)

@router.post("/transcribe", response_model=STTResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form("mr-IN"),
    current_user: User = Depends(get_current_user)
):
    """Transcribe farmer audio via Sarvam Saaras v4."""
    audio_bytes = await file.read()
    return SarvamService.transcribe_audio(
        audio_bytes=audio_bytes,
        filename=file.filename or "recording.wav",
        language_code=language_code or "mr-IN"
    )

@router.post("/document-extract", response_model=DocumentExtractResponse)
def extract_document_info(
    data: DocumentExtractRequest,
    current_user: User = Depends(get_current_user)
):
    """Extract agricultural weighing slip or trade invoice fields with preview state."""
    return SarvamService.extract_document_data(data)

@router.post("/execute-action", response_model=ExecuteActionResponse)
def execute_confirmed_action(
    data: ExecuteActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Execute confirmed financial or operational action through validated backend registry."""
    profile = FarmerRepository.get_by_user_id(db, current_user.id)
    return SarvamService.execute_confirmed_action(db, profile, data)

@router.post("/extract-crops")
def extract_crops_from_phrase(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """Extract recognized crop and commodity names from spoken phrase or typed text."""
    phrase = data.get("text", "")
    lang = data.get("language", "mr-IN")
    crops = SarvamService.extract_crops_from_text(phrase, lang)
    return {"crops": crops}

