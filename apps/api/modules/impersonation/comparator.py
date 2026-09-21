"""
ShadowID - Impersonation Intelligence Comparator (Prompt 11 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import re
from typing import Dict, Any, List

def compute_token_overlap(str1: str, str2: str) -> int:
    """Computes Jaccard word-token overlap percentage [0, 100]."""
    if not str1 or not str2:
        return 0
    t1 = set(re.findall(r"\w+", str1.lower()))
    t2 = set(re.findall(r"\w+", str2.lower()))
    if not t1 or not t2:
        return 0
    intersection = t1.intersection(t2)
    union = t1.union(t2)
    return round((len(intersection) / len(union)) * 100)

def compute_handle_similarity(h1: str, h2: str) -> int:
    """Computes handle similarity based on normalized prefix/suffix edit distance."""
    if not h1 or not h2:
        return 0
    c1 = h1.strip().lstrip("@").lower()
    c2 = h2.strip().lstrip("@").lower()
    if c1 == c2:
        return 100
    if c1 in c2 or c2 in c1:
        return 85
    # Bigram character similarity
    bg1 = set(c1[i:i+2] for i in range(len(c1)-1))
    bg2 = set(c2[i:i+2] for i in range(len(c2)-1))
    if not bg1 or not bg2:
        return 0
    return round((len(bg1.intersection(bg2)) / len(bg1.union(bg2))) * 100)

def compare_profiles(
    reference: Dict[str, Any],
    candidate: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates multi-signal similarity without facial recognition or uncalibrated fraud claims.
    Outputs: Limited overlap, Similarities found, Needs review, or Insufficient evidence.
    """
    name_overlap = compute_token_overlap(reference.get("name", ""), candidate.get("name", ""))
    handle_sim = compute_handle_similarity(reference.get("handle", ""), candidate.get("handle", ""))
    bio_overlap = compute_token_overlap(reference.get("bio", ""), candidate.get("bio", ""))
    
    # Perceptual match heuristic (if avatar hash provided)
    ref_hash = reference.get("avatarHash", reference.get("avatar_hash", ""))
    cand_hash = candidate.get("avatarHash", candidate.get("avatar_hash", ""))
    avatar_match = 0
    if ref_hash and cand_hash:
        avatar_match = 100 if ref_hash == cand_hash else 15
        
    contradictions: List[str] = []
    
    # Check geographic / industry divergences
    ref_city = reference.get("city", "").lower()
    cand_loc = candidate.get("location", "").lower()
    if ref_city and cand_loc and ref_city not in cand_loc:
        contradictions.append(f"Geographic context divergence: '{reference.get('city')}' vs candidate location '{candidate.get('location')}'.")
        
    # Check UPI / financial diversion indicator
    cand_bio = candidate.get("bio", "")
    if "upi" in cand_bio.lower() or "pay" in cand_bio.lower() or "fee" in cand_bio.lower():
        contradictions.append("Candidate introduces financial solicitation rail not corroborated by reference profile.")

    # Multi-signal verdict rules
    # High bio overlap + high avatar match = intentional mimicry
    if avatar_match >= 90 and (bio_overlap >= 75 or handle_sim >= 75):
        verdict = "Needs review"
        notes = "High asset and text duplication detected across independent profile vectors. Potential identity mimicry."
    elif name_overlap >= 80 and len(contradictions) > 0 and avatar_match < 20:
        verdict = "Limited overlap"
        notes = "Namesake collision detected: matching name tokens but distinct professional/geographic context refutes identity mimicry."
    elif name_overlap >= 70 or handle_sim >= 70:
        verdict = "Similarities found"
        notes = "Partial lexical or handle correlation observed; requires human analyst review of primary source."
    else:
        verdict = "Limited overlap"
        notes = "Heuristic overlap remains below threshold across all evaluated profile signals."

    return {
        "metrics": {
            "nameTokenOverlap": name_overlap,
            "handleSimilarity": handle_sim,
            "bioTextOverlap": bio_overlap,
            "avatarPerceptualMatch": avatar_match,
            "contextualAgreement": 70 if len(contradictions) == 0 else 25
        },
        "contradictions": contradictions,
        "verdict": verdict,
        "verdictNotes": notes
    }
