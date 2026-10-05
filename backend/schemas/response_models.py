"""schemas/response_models.py — Pydantic response schemas for all API endpoints."""
from pydantic import BaseModel, Field
from typing import Optional, Any


class ConditionResult(BaseModel):
    name: str
    icd10_code: Optional[str] = None
    probability: float
    category: str
    urgency: str
    recommended_specialty: Optional[str] = None
    supporting_symptoms: list[str] = []
    reasoning: Optional[str] = None


class CostEstimate(BaseModel):
    min: int
    estimate: int
    max: int
    currency: str = "INR"
    estimated_days: int
    breakdown: dict[str, int]
    model_confidence: float


class HospitalResult(BaseModel):
    id: str
    name: str
    city: str
    area: Optional[str] = None
    facility_type: Optional[str] = "hospital"
    tier: str = "mid"
    rating: float = 4.0
    wait_time_mins: Optional[int] = None
    distance_km: Optional[float] = None
    er_capable: bool = False
    nabl_certified: bool = False
    jci_certified: bool = False
    specialties: list[str] = []
    score: float = 0.8
    score_breakdown: dict[str, float] = {}
    cost_estimate: Optional[CostEstimate] = None


class RiskResult(BaseModel):
    is_emergency: bool
    urgency_level: str
    emergency_reasons: list[str]
    recommended_action: str


class ConfidenceResult(BaseModel):
    score: float
    percentage: float
    tier: str
    components: dict[str, float]
    warnings: list[str]
    interpretation: str


class PipelineResponse(BaseModel):
    success: bool
    run_id: str
    session_id: str
    parsed_input: dict[str, Any]
    clinical: dict[str, Any]
    risk: RiskResult
    hospitals: list[HospitalResult]
    active_weights: dict[str, float]
    confidence: ConfidenceResult
    explanation: dict[str, Any]
    meta: dict[str, Any]
    processing_time_ms: Optional[float] = Field(None, description="Total pipeline duration in milliseconds")
