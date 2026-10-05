"""schemas/request_models.py — Pydantic input validation models for the Healix API."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import uuid


class PipelineRequest(BaseModel):
    symptoms_text: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Natural language description of symptoms",
        examples=["I have a headache", "chest pain and shortness of breath"],
    )
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    city: Optional[str] = Field(None, description="City for hospital search")
    lat: Optional[float] = Field(None, description="User latitude for distance and local clinic ranking")
    lng: Optional[float] = Field(None, description="User longitude for distance and local clinic ranking")
    patient_name: Optional[str] = Field(None, description="Patient name")
    patient_age: Optional[int] = Field(None, ge=0, le=130, description="Patient age in years")
    patient_gender: Optional[str] = Field(None, description="Patient gender")
    patient_blood_type: Optional[str] = Field(None, description="Patient blood type (e.g. A+, O-)")

    @field_validator("symptoms_text")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("symptoms_text cannot be blank")
        return v.strip()


class HospitalFilterRequest(BaseModel):
    city: Optional[str] = None
    specialties: Optional[list[str]] = None
    er_only: bool = False
    limit: int = Field(20, ge=1, le=100)
