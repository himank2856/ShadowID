"""
ShadowID - Worker Task Orchestration (Prompt 5 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import time
from typing import Dict, Any
from apps.api.modules.scoring.engine import calculate_shadow_score
from apps.api.modules.exposure.engine import build_evidence_graph
from apps.api.modules.impersonation.comparator import compare_profiles
from apps.api.modules.documents.analyzer import analyze_document_sample
from packages.contracts.schemas.evidence import ComponentScoresSchema

def process_scan_job(job_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes multi-vector analysis strictly using shared Python domain code,
    without making circular HTTP calls back to the API.
    Validates consent before running and checks cancellation flags.
    """
    subject = job_payload.get("subject", {})
    consent = job_payload.get("consent", {})
    selected_modules = job_payload.get("selectedModules", [])
    
    # Pre-execution check: Recheck consent status
    if consent.get("isRevoked", False):
        return {
            "status": "cancelled",
            "reason": "Consent revoked prior to worker execution."
        }

    # Step 1: Ingestion and Exposure Intelligence
    evidence_tokens = job_payload.get("evidenceList", [])
    graph = build_evidence_graph(
        subject_name=subject.get("name", ""),
        city=subject.get("city", ""),
        institution=subject.get("institution", ""),
        evidence_tokens=evidence_tokens
    )

    # Step 2: Impersonation Intelligence (if selected)
    profile_comparison = None
    if "impersonation" in selected_modules and "profileComparison" in job_payload:
        cmp_req = job_payload["profileComparison"]
        profile_comparison = compare_profiles(
            cmp_req.get("referenceSubject", {}),
            cmp_req.get("candidateProfile", {})
        )

    # Step 3: Document Defense & OCR (if selected)
    doc_analysis = None
    if "documents" in selected_modules and "documentAnalysis" in job_payload:
        doc_req = job_payload["documentAnalysis"]
        doc_analysis = analyze_document_sample(
            doc_req.get("documentCategory", "PAN"),
            sample_key=job_payload.get("sampleKey", "arun")
        )

    # Step 4: Synthesize deterministic Shadow Score
    # Extract component scores based on module selection
    comp_scores = ComponentScoresSchema(
        exposure=job_payload.get("componentExposure", 65),
        connectability=job_payload.get("componentConnectability", 50),
        impersonation=profile_comparison["metrics"]["handleSimilarity"] if profile_comparison else None,
        document_anomaly=doc_analysis["qualityScore"] if doc_analysis and doc_analysis["verdict"] == "Requires review" else None
    )
    
    score_result = calculate_shadow_score(comp_scores)

    return {
        "status": "succeeded" if score_result.coverage == 100 else "partial",
        "scoreData": score_result.dict(),
        "evidenceGraph": graph,
        "profileComparison": profile_comparison,
        "documentAnalysis": doc_analysis,
        "completedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }
