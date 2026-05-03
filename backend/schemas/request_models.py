"""schemas/request_models.py"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
import uuid


class PipelineRequest(BaseModel):
    symptoms_text: str = Field(
        ...,
        min_length=10,
        max_length=2000,
        description="Natural language description of symptoms",
        examples=["I have severe chest pain radiating to my left arm for 2 hours with sweating. Budget ₹2 lakhs."],
    )
    session_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    city: Optional[str] = Field(None, description="City for hospital search")
    patient_name: Optional[str] = Field(None, description="Patient name")
    patient_age: Optional[int] = Field(None, description="Patient age")
    patient_gender: Optional[str] = Field(None, description="Patient gender")

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
