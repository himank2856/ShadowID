"""
ShadowID - Common Evidence and Ingestion Contracts (Prompt 8 & 9 compliant)
Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
"""

from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime

SourceType = Literal["telecom", "registry", "social", "document", "upi", "web"]
ExtractionMethod = Literal["manual_submission", "ocr_eng_hin", "insights_research", "verified_fixture"]
SeverityLevel = Literal["lower", "moderate", "elevated", "high"]
ScanStatusType = Literal["queued", "running", "succeeded", "partial", "failed", "cancelled"]

class EvidenceAttributeSchema(BaseModel):
    key: str
    label: str
    value: str
    source_type: SourceType
    source_name: str
    source_url: Optional[str] = None
    uploaded_file_id: Optional[str] = None
    observed_at: datetime
    extraction_method: ExtractionMethod
    certainty_reason: str
    is_confirmed_by_reviewer: bool = False
    is_synthetic: bool = False
    provenance: Optional[Dict[str, Any]] = None
    review_notes: Optional[str] = None

class CommonEvidenceBatch(BaseModel):
    schema_version: str = "1.4.0"
    subject_ref: str
    consent_ref: str
    imported_at: datetime = Field(default_factory=datetime.utcnow)
    is_synthetic: bool = False
    attributes: List[EvidenceAttributeSchema]
    provenance: Dict[str, Any] = Field(default_factory=dict)
    review_notes: Optional[str] = None

class ComponentScoresSchema(BaseModel):
    exposure: Optional[int] = None
    connectability: Optional[int] = None
    impersonation: Optional[int] = None
    document_anomaly: Optional[int] = None

class ShadowScoreOutputSchema(BaseModel):
    score: Optional[int]
    coverage: int
    is_provisional: bool
    provisional_reason: Optional[str] = None
    severity_band: SeverityLevel
    component_scores: ComponentScoresSchema
    weights: Dict[str, float]
    contributions: Dict[str, int]
    input_snapshot_hash: str
