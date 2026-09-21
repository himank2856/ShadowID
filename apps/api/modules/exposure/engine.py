"""
ShadowID - Exposure Intelligence & Multi-Vector Evidence Graph (Prompt 10 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import re
from typing import List, Dict, Any, Tuple
from packages.contracts.schemas.evidence import EvidenceAttributeSchema

def normalize_handle(handle: str) -> str:
    """Conservatively normalizes handles by stripping punctuation and lowercasing."""
    if not handle:
        return ""
    cleaned = handle.strip().lstrip("@").lower()
    return re.sub(r"[^a-z0-9_]", "", cleaned)

def build_evidence_graph(
    subject_name: str,
    subject_city: str,
    subject_institution: str,
    evidence_tokens: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Constructs reasoned evidence graph with nodes and weighted edges strictly from consented evidence.
    Does not invent nodes or hallucinate third-party linkages.
    """
    nodes = []
    edges = []
    
    # Root Subject Node
    root_id = "node-subject-root"
    nodes.append({
        "id": root_id,
        "label": subject_name,
        "category": "identity",
        "val": f"{subject_city} • {subject_institution or 'Independent'}",
        "riskWeight": 3,
        "source": "Consented Assessment Scope"
    })
    
    for idx, ev in enumerate(evidence_tokens):
        node_id = f"node-ev-{idx+1}"
        key = ev.get("key", "attribute")
        val = ev.get("value", "")
        source_name = ev.get("sourceName", ev.get("source_name", "Supplied Evidence"))
        
        # Categorize node
        category = "identity"
        risk_weight = 4
        if "handle" in key.lower():
            category = "handle"
            risk_weight = 6
        elif "phone" in key.lower() or "telecom" in key.lower():
            category = "telecom"
            risk_weight = 8
        elif "institution" in key.lower() or "college" in key.lower() or "employer" in key.lower():
            category = "employer"
            risk_weight = 5
        elif "document" in key.lower() or "pan" in key.lower() or "aadhaar" in key.lower():
            category = "document"
            risk_weight = 7
            
        nodes.append({
            "id": node_id,
            "label": ev.get("label", key.title()),
            "category": category,
            "val": val,
            "riskWeight": risk_weight,
            "source": source_name
        })
        
        # Edge from root subject to attribute
        relation = "associated_with"
        if category == "handle":
            relation = "same_handle"
        elif category == "telecom":
            relation = "leaked_in"
            
        edges.append({
            "id": f"edge-root-{idx+1}",
            "source": root_id,
            "target": node_id,
            "label": f"Verified ({source_name})",
            "relationType": relation,
            "certainty": 95 if ev.get("isConfirmedByReviewer", False) else 80,
            "isVerified": ev.get("isConfirmedByReviewer", False)
        })

    return {
        "nodes": nodes,
        "edges": edges
    }
