"""
ShadowID - iNSIGHTS Manual Deep Search Research Bridge (Prompt 14 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

from typing import List, Dict, Any

VENDOR_RESEARCH_PROMPT_TEMPLATE: str = (
    "Using only the supplied fictional evidence, summarize potential identity-exposure patterns "
    "and prevention steps. Distinguish supplied facts, inferences and unknowns. Cite any external "
    "general guidance. Do not search for or enrich real people's identities. Return claims with "
    "their supporting evidence references and uncertainty."
)

def filter_active_claims_for_scoring(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Ensures ONLY reviewer-accepted research claims are eligible for analytical correlation.
    Unreviewed or rejected claims are strictly excluded from the deterministic score.
    """
    return [c for c in claims if c.get("reviewerStatus") == "accepted"]
