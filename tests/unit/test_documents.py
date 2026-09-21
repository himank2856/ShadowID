"""
Unit Tests for Document Defense & Masking Engine (Prompt 12 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import pytest
from apps.api.modules.documents.analyzer import mask_pii_field, analyze_document_sample

def test_pii_masking_rules():
    """Verify Aadhaar and PAN masking according to UIDAI/IT guidelines."""
    masked_aadhaar = mask_pii_field("Aadhaar", "1234 5678 9021")
    assert masked_aadhaar == "•••• •••• 9021"
    
    masked_pan = mask_pii_field("PAN", "ABCPS1234D")
    assert masked_pan == "ABCPS••••D"
    
    masked_passport = mask_pii_field("Passport", "Z1234567")
    assert masked_passport.startswith("Z1••••••")

def test_clean_pan_sample():
    """Verify clean PAN fixture produces 'No configured inconsistencies found'."""
    result = analyze_document_sample("PAN", "arun")
    assert result["verdict"] == "No configured inconsistencies found"
    assert len(result["inconsistencies"]) == 0
    assert result["qualityScore"] >= 90
    assert result["isHumanVerified"] is True

def test_altered_aadhaar_sample():
    """Verify font alteration on sample Aadhaar flags 'Requires review'."""
    result = analyze_document_sample("Aadhaar", "sana")
    assert result["verdict"] == "Requires review"
    assert len(result["inconsistencies"]) > 0
    assert any("Typeface mismatch" in inc for inc in result["inconsistencies"])
    # Check that anomaly box is flagged
    anomaly_boxes = [b for b in result["boxes"] if b["isAnomaly"]]
    assert len(anomaly_boxes) >= 1
    assert "Arial" in anomaly_boxes[0]["anomalyReason"]

def test_blurry_passport_quality():
    """Verify blurry glare sample returns 'Insufficient image quality'."""
    result = analyze_document_sample("Passport", "dev")
    assert result["verdict"] == "Insufficient image quality"
    assert result["qualityScore"] < 50
