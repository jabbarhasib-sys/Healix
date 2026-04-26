"""schemas/response_models.py"""
from pydantic import BaseModel
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
    tier: str
    rating: float
    distance_km: Optional[float] = None
    er_capable: bool
    nabl_certified: bool
    jci_certified: bool
    specialties: list[str] = []
    score: float
    score_breakdown: dict[str, float]
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
