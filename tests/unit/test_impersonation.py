"""
Unit Tests for Impersonation Intelligence Comparator (Prompt 11 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import pytest
from apps.api.modules.impersonation.comparator import (
    compute_token_overlap,
    compute_handle_similarity,
    compare_profiles
)

def test_unrelated_namesake_collision():
    """Verify unrelated namesake produces 'Limited overlap' and no wrongful takedown flag."""
    reference = {
        "name": "Kavya Mahajan",
        "handle": "@kavya_hp_m",
        "bio": "Environmental Educator & Heritage guide based in Shimla, Himachal Pradesh.",
        "city": "Shimla",
        "avatarHash": "hash-kavya-shimla-01"
    }
    candidate = {
        "name": "Kavya Mahajan",
        "handle": "@kavya_fintech_bom",
        "bio": "Risk Analyst at Global Equities Mumbai | Alum St. Xavier's College",
        "location": "Mumbai, Maharashtra",
        "avatarHash": "hash-kavya-mumbai-02"
    }
    
    result = compare_profiles(reference, candidate)
    
    assert result["verdict"] == "Limited overlap"
    assert len(result["contradictions"]) > 0
    assert any("Geographic context divergence" in c for c in result["contradictions"])
    assert result["metrics"]["avatarPerceptualMatch"] < 20

def test_malicious_recycled_avatar_and_bio():
    """Verify copied avatar and bio with financial diversion raises 'Needs review'."""
    reference = {
        "name": "Meera Ramanathan, Ph.D.",
        "handle": "@meera_biotech",
        "bio": "Research Scientist at Natura BioLabs | IISc Alum | Genomics & Drug Discovery.",
        "city": "Bengaluru",
        "avatarHash": "hash-meera-avatar-clone"
    }
    candidate = {
        "name": "Meera Ramanathan (Talent)",
        "handle": "@meera_biotech_career",
        "bio": "Research Scientist at Natura BioLabs | Hiring Freshers! Pay interview fees via UPI.",
        "location": "Bengaluru, Karnataka",
        "avatarHash": "hash-meera-avatar-clone"
    }
    
    result = compare_profiles(reference, candidate)
    
    assert result["verdict"] == "Needs review"
    assert result["metrics"]["avatarPerceptualMatch"] == 100
    assert any("financial solicitation" in c.lower() for c in result["contradictions"])
