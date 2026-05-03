"""db/models.py"""
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Float, Integer, Boolean, Text, DateTime,
    ForeignKey, JSON, Enum as SAEnum, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.database import Base
import enum


def _uuid() -> str:
    return str(uuid.uuid4())


class HospitalTier(str, enum.Enum):
    government = "government"
    mid = "mid"
    premium = "premium"
    super_specialty = "super_specialty"


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    area: Mapped[str] = mapped_column(String(200), nullable=True)
    tier: Mapped[HospitalTier] = mapped_column(SAEnum(HospitalTier), default=HospitalTier.mid)

    # Ratings & capacity
    rating: Mapped[float] = mapped_column(Float, default=4.0)
    total_beds: Mapped[int] = mapped_column(Integer, default=100)
    er_beds: Mapped[int] = mapped_column(Integer, default=0)
    er_capable: Mapped[bool] = mapped_column(Boolean, default=False)
    nabl_certified: Mapped[bool] = mapped_column(Boolean, default=False)
    jci_certified: Mapped[bool] = mapped_column(Boolean, default=False)

    # Location (mock coords)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Financials
    base_cost_per_day: Mapped[float] = mapped_column(Float, default=5000.0)
    tier_factor: Mapped[float] = mapped_column(Float, default=1.0)
    location_factor: Mapped[float] = mapped_column(Float, default=1.0)

    # Stored as JSON arrays
    specialties: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    insurance_accepted: Mapped[Optional[list]] = mapped_column(JSON, default=list)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "area": self.area,
            "tier": self.tier.value,
            "rating": self.rating,
            "total_beds": self.total_beds,
            "er_beds": self.er_beds,
            "er_capable": self.er_capable,
            "nabl_certified": self.nabl_certified,
            "jci_certified": self.jci_certified,
            "base_cost_per_day": self.base_cost_per_day,
            "tier_factor": self.tier_factor,
            "location_factor": self.location_factor,
            "specialties": self.specialties or [],
            "insurance_accepted": self.insurance_accepted or [],
        }


class PipelineRun(Base):
    """Audit log for every pipeline execution."""
    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    session_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)

    raw_input: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_input: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    conditions_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    hospitals_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    cost_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    confidence_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)

    patient_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    patient_age: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    patient_gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)

    llm_backend_used: Mapped[str] = mapped_column(String(50), default="ollama")
    duration_ms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    success: Mapped[bool] = mapped_column(Boolean, default=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_emergency: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
