"""
ShadowID - DPDP Act Privacy Governance & Retention Controls (Prompt 7 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from apps.api.core.config import settings

def evaluate_retention_expiry(created_at: datetime, retention_days: int) -> bool:
    """Evaluates if an artifact or assessment has crossed its DPDP retention boundary."""
    expiry_time = created_at + timedelta(days=retention_days)
    return datetime.now(timezone.utc) > expiry_time

def sanitize_subject_export(subject_data: Dict[str, Any]) -> Dict[str, Any]:
    """Prepares DPDP Subject Access Request (SAR) export with unmasked verified personal data."""
    return {
        "exportFormat": "DPDP_PORTABILITY_V1",
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "subject": subject_data,
        "complianceNotice": "Export generated under Digital Personal Data Protection (DPDP) Act rules."
    }
