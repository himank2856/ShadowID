"""
Unit Tests for ShadowID Deterministic Scoring Engine (Prompt 13 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import pytest
from packages.contracts.schemas.evidence import ComponentScoresSchema
from apps.api.modules.scoring.engine import calculate_shadow_score, WEIGHTS

def test_full_coverage_scoring():
    """Verify deterministic calculation when all 4 modules are active."""
    # Weights: Exposure 35%, Connectability 25%, Impersonation 25%, Document Anomaly 15%
    # Inputs: 78, 65, 60, 20
    # Expected: (0.35*78 + 0.25*65 + 0.25*60 + 0.15*20) / 1.0 = (27.3 + 16.25 + 15.0 + 3.0) = 61.55 -> 62
    components = ComponentScoresSchema(
        exposure=78,
        connectability=65,
        impersonation=60,
        document_anomaly=20
    )
    result = calculate_shadow_score(components)
    
    assert result.score == 62
    assert result.coverage == 100
    assert result.is_provisional is False
    assert result.provisional_reason is None
    assert result.severity_band == "elevated"
    assert result.input_snapshot_hash.startswith("sha256-")
    
    # Verify contributions sum matches score within rounding tolerance
    total_contrib = sum(result.contributions.values())
    assert abs(total_contrib - result.score) <= 2

def test_partial_coverage_provisional_scoring():
    """Verify formula reconciliation and provisional badge when document module is omitted."""
    # Active: Exposure (35%), Connectability (25%). Active sum = 0.60
    # Inputs: Exposure=60, Connectability=40.
    # Formula: (0.35*60 + 0.25*40) / 0.60 = (21 + 10) / 0.60 = 31 / 0.60 = 51.666 -> 52
    components = ComponentScoresSchema(
        exposure=60,
        connectability=40,
        impersonation=None,
        document_anomaly=None
    )
    result = calculate_shadow_score(components)
    
    assert result.score == 52
    assert result.coverage == 60
    assert result.is_provisional is True
    assert "Provisional assessment based on 60% module coverage" in result.provisional_reason
    assert "Impersonation" in result.provisional_reason
    assert "Document Anomaly" in result.provisional_reason
    assert result.severity_band == "elevated"

def test_empty_coverage_insufficient_evidence():
    """Verify null score when no modules are active."""
    components = ComponentScoresSchema(
        exposure=None,
        connectability=None,
        impersonation=None,
        document_anomaly=None
    )
    result = calculate_shadow_score(components)
    
    assert result.score is None
    assert result.coverage == 0
    assert result.is_provisional is True
    assert "Insufficient evidence" in result.provisional_reason

def test_deterministic_repeatability():
    """Verify identical inputs yield identical output and identical SHA-256 snapshot hash."""
    comps1 = ComponentScoresSchema(exposure=50, connectability=50, impersonation=50, document_anomaly=50)
    comps2 = ComponentScoresSchema(exposure=50, connectability=50, impersonation=50, document_anomaly=50)
    
    res1 = calculate_shadow_score(comps1)
    res2 = calculate_shadow_score(comps2)
    
    assert res1.score == res2.score == 50
    assert res1.input_snapshot_hash == res2.input_snapshot_hash
