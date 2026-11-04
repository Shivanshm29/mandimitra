from typing import List, Optional, Dict, Any
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict

class FarmerChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    language: Optional[str] = Field("mr-IN", description="Preferred Indic language (mr-IN, hi-IN, en-IN)")

class ActionProposal(BaseModel):
    action: str = Field(..., description="Action name e.g. record_sale, create_selling_lot, record_payment")
    summary: str = Field(..., description="Readable summary of the proposed action")
    requires_confirmation: bool = True
    parameters: Dict[str, Any] = Field(default_factory=dict)

class FarmerChatResponse(BaseModel):
    reply: str
    speech_text: Optional[str] = None
    language: str
    suggested_actions: List[str] = []
    action_proposal: Optional[ActionProposal] = None
    ui_action: Optional[Dict[str, Any]] = None  # e.g. {"type": "navigate", "route": "/mandi-intelligence"}

class ExecuteActionRequest(BaseModel):
    action: str
    parameters: Dict[str, Any]

class ExecuteActionResponse(BaseModel):
    status: str
    message: str
    data: Optional[Dict[str, Any]] = None

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2500)
    language: Optional[str] = Field("mr-IN", description="mr-IN, hi-IN, or en-IN")
    speed: Optional[float] = Field(1.0, ge=0.5, le=2.0, description="Speech playback speed")

class TTSResponse(BaseModel):
    audio_base64: str
    language: str
    audio_format: str = "wav"

class STTResponse(BaseModel):
    transcript: str
    language_code: Optional[str] = None

class ExtractedDeduction(BaseModel):
    deduction_type: str
    amount: Decimal
    description: Optional[str] = None

class DocumentExtractRequest(BaseModel):
    document_text: Optional[str] = None
    image_base64: Optional[str] = None
    language: Optional[str] = "mr-IN"

class DocumentExtractResponse(BaseModel):
    trader_name: Optional[str] = None
    market_name: Optional[str] = None
    commodity: Optional[str] = None
    variety: Optional[str] = "Standard"
    quantity: Optional[Decimal] = None
    quantity_unit: str = "Quintal"
    rate_per_unit: Optional[Decimal] = None
    gross_amount: Optional[Decimal] = None
    deductions: List[ExtractedDeduction] = []
    total_deductions: Optional[Decimal] = None
    net_receivable: Optional[Decimal] = None
    sale_date: Optional[str] = None
    confidence_score: float = 0.90
    extracted_summary: str = ""
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
