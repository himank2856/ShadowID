"""
ShadowID - Forensic Dossier & Report Export Generator (Prompt 16 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import json
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

# IST Timezone Offset: UTC+5:30
IST = timezone(timedelta(hours=5, minutes=30))

def format_ist(dt: datetime) -> str:
    """Formats UTC timestamp into standard Asia/Kolkata date-time (e.g. 21 Sep 2026, 14:45 IST)."""
    local_dt = dt.astimezone(IST)
    return local_dt.strftime("%d %b %Y, %H:%M IST")

def generate_sanitized_json_report(scan_data: Dict[str, Any]) -> str:
    """
    Generates sanitized JSON dossier with masked PII, cryptographic input snapshot hashes,
    and structured actions ready for download or compliance archiving.
    """
    now = datetime.now(timezone.utc)
    subject = scan_data.get("subject", {})
    score_data = scan_data.get("scoreData", {})
    
    report_dict = {
        "exportSchemaVersion": "1.4.0",
        "exportedAtIST": format_ist(now),
        "reportTitle": f"ShadowID Forensic Audit Dossier — {subject.get('name', 'Subject')}",
        "governance": {
            "platform": "ShadowID — What You Share Is More Than What You See",
            "team": "Team GIGABYTE (Anshul, Tanishq, Himank)",
            "initiative": "Build With Bharat 3.0, Chitkara University, HP",
            "disclaimer": "Evaluated strictly against user-consented, supplied evidence. Direct government database connectivity is legally restricted and strictly avoided."
        },
        "subject": {
            "name": subject.get("name"),
            "territory": f"{subject.get('city', '')}, {subject.get('state', '')}",
            "institution": subject.get("institution"),
            "employer": subject.get("employer"),
            "primaryHandle": subject.get("primaryHandle"),
            "phoneMasked": subject.get("phoneMasked"),
            "emailMasked": subject.get("emailMasked"),
            "isSynthetic": subject.get("isSynthetic", False)
        },
        "assessment": {
            "scanId": scan_data.get("id"),
            "status": scan_data.get("status"),
            "shadowScore": score_data.get("score"),
            "coveragePercent": score_data.get("coverage"),
            "isProvisional": score_data.get("isProvisional", False),
            "provisionalReason": score_data.get("provisionalReason"),
            "severityBand": score_data.get("severityBand"),
            "inputSnapshotHash": score_data.get("inputSnapshotHash"),
            "componentScores": score_data.get("componentScores", {}),
            "contributions": score_data.get("contributions", {})
        },
        "findings": [
            {
                "ruleId": f.get("ruleId"),
                "title": f.get("title"),
                "module": f.get("module"),
                "severity": f.get("severity"),
                "scoreImpact": f.get("scoreImpact"),
                "description": f.get("description"),
                "supportingEvidence": f.get("supportingEvidence", []),
                "remediation": f.get("remediation")
            }
            for f in scan_data.get("findings", [])
        ],
        "remediationActions": [
            {
                "id": a.get("id"),
                "title": a.get("title"),
                "priority": a.get("priority"),
                "status": a.get("status"),
                "assignee": a.get("assignee"),
                "verificationMethod": a.get("verificationMethod")
            }
            for a in scan_data.get("actions", [])
        ]
    }
    
    return json.dumps(report_dict, indent=2)
