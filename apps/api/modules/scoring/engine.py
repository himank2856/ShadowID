"""
ShadowID - Deterministic Shadow Score Engine (Prompt 13 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import hashlib
import json
from typing import Optional, Dict, Any, List
from packages.contracts.schemas.evidence import (
    ComponentScoresSchema,
    ShadowScoreOutputSchema,
    SeverityLevel
)

# Prototype Model Weights (Total = 1.00)
WEIGHTS: Dict[str, float] = {
    "exposure": 0.35,
    "connectability": 0.25,
    "impersonation": 0.25,
    "document_anomaly": 0.15,
}

# Rule Registry definition for deterministic evaluation
RULE_REGISTRY: List[Dict[str, Any]] = [
    {
        "rule_id": "EXP-CORR-004",
        "component": "exposure",
        "title": "Cross-Platform Handle Linkage",
        "points": 26,
        "explanation": "Identical developer handle combined with educational tenure allows cross-network identity correlation.",
        "recommendation": "Decouple developer identities from career and social directories."
    },
    {
        "rule_id": "EXP-TEL-002",
        "component": "exposure",
        "title": "Unmasked Telecom Identifier",
        "points": 18,
        "explanation": "Indian mobile telecom contact found in public repository commit logs.",
        "recommendation": "Scrub git history and enable commit signature verification."
    },
    {
        "rule_id": "IMP-AVT-003",
        "component": "impersonation",
        "title": "Recycled Avatar Asset",
        "points": 30,
        "explanation": "Candidate profile reuses reference avatar with conflicting payment or contact rail.",
        "recommendation": "File formal platform impersonation takedown notice."
    },
    {
        "rule_id": "DOC-ANOM-001",
        "component": "document_anomaly",
        "title": "Typography and Date Discrepancy",
        "points": 32,
        "explanation": "Detected altered font typeface in identification token or impossible chronological relationship.",
        "recommendation": "Request offline e-Aadhaar XML or QR verification."
    }
]

def calculate_shadow_score(components: ComponentScoresSchema) -> ShadowScoreOutputSchema:
    """
    Computes deterministic Shadow Score strictly adhering to Section 13 contract:
    - Normalizes across available components A.
    - score = round(sum(w_i * c_i) / sum(w_i)) for i in A.
    - coverage = round(100 * sum(w_i)).
    - If A is empty, score is None ("Insufficient evidence").
    - If coverage < 100%, flagged as is_provisional = True with detailed reason.
    - Contributions use same active denominator to reconcile with display score.
    """
    comp_dict = {
        "exposure": components.exposure,
        "connectability": components.connectability,
        "impersonation": components.impersonation,
        "document_anomaly": components.document_anomaly,
    }

    active_weight_sum = 0.0
    weighted_value_sum = 0.0
    active_components = []
    missing_components = []

    for name, weight in WEIGHTS.items():
        val = comp_dict.get(name)
        if val is not None:
            # Clamp component score to [0, 100]
            bounded_val = max(0, min(100, val))
            weighted_value_sum += weight * bounded_val
            active_weight_sum += weight
            active_components.append(name)
        else:
            missing_components.append(name.replace("_", " ").title())

    coverage = round(active_weight_sum * 100)

    # Empty coverage edge case
    if active_weight_sum == 0 or not active_components:
        return ShadowScoreOutputSchema(
            score=None,
            coverage=0,
            is_provisional=True,
            provisional_reason="Insufficient evidence across all forensic modules.",
            severity_band="lower",
            component_scores=components,
            weights=WEIGHTS,
            contributions={"exposure": 0, "connectability": 0, "impersonation": 0, "document_anomaly": 0},
            input_snapshot_hash="sha256-00000000000000000000000000000000"
        )

    # Normalization formula
    calculated_score = round(weighted_value_sum / active_weight_sum)
    is_provisional = coverage < 100

    provisional_reason = None
    if is_provisional:
        provisional_reason = (
            f"Provisional assessment based on {coverage}% module coverage. "
            f"Omitted/unassessed: {', '.join(missing_components)}."
        )

    # Reconciled contributions: contribution_i = round((w_i * c_i) / active_weight_sum)
    contributions = {}
    for name in WEIGHTS:
        val = comp_dict.get(name)
        if val is not None:
            contributions[name] = round((WEIGHTS[name] * max(0, min(100, val))) / active_weight_sum)
        else:
            contributions[name] = 0

    # Severity bands: 0-24 lower, 25-49 moderate, 50-74 elevated, 75-100 high
    if calculated_score >= 75:
        severity_band: SeverityLevel = "high"
    elif calculated_score >= 50:
        severity_band = "elevated"
    elif calculated_score >= 25:
        severity_band = "moderate"
    else:
        severity_band = "lower"

    # Compute deterministic immutable snapshot hash
    snapshot_raw = json.dumps({
        "components": comp_dict,
        "score": calculated_score,
        "coverage": coverage,
        "weights": WEIGHTS,
        "version": "1.4.0"
    }, sort_keys=True)
    snapshot_hash = f"sha256-{hashlib.sha256(snapshot_raw.encode()).hexdigest()[:32]}"

    return ShadowScoreOutputSchema(
        score=calculated_score,
        coverage=coverage,
        is_provisional=is_provisional,
        provisional_reason=provisional_reason,
        severity_band=severity_band,
        component_scores=components,
        weights=WEIGHTS,
        contributions=contributions,
        input_snapshot_hash=snapshot_hash
    )
