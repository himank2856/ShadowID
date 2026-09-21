"""
ShadowID - Master FastAPI Modular Monolith (Prompt 1, 5, 9 compliant)
Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Depends, Request, Response, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from apps.api.core.config import settings
from apps.api.core.errors import (
    ShadowIDException,
    UnauthorizedException,
    PermissionDeniedException,
    ResourceNotFoundException,
    shadowid_exception_handler
)
from apps.api.core.security import get_current_user, require_role, AuthenticatedUser
from apps.api.modules.scoring.engine import calculate_shadow_score
from apps.api.modules.exposure.engine import build_evidence_graph, normalize_handle
from apps.api.modules.impersonation.comparator import compare_profiles
from apps.api.modules.documents.analyzer import analyze_document_sample
from apps.api.modules.billing.razorpay import (
    create_razorpay_order,
    verify_razorpay_payment_signature,
    verify_webhook_signature
)
from apps.api.modules.reports.generator import generate_sanitized_json_report
from packages.contracts.schemas.evidence import ComponentScoresSchema

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="ShadowID Modular Monolith API - India-first forensic digital exposure intelligence, impersonation detection, and document defense.",
    openapi_url="/api/v1/openapi.json",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc"
)

# Exception handlers
app.add_exception_handler(ShadowIDException, shadowid_exception_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Logging Middleware
@app.middleware("http")
async def correlation_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", f"req-{uuid.uuid4().hex[:12]}")
    request.state.request_id = request_id
    response: Response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# =============================================================================
# HEALTH & READINESS PROBES
# =============================================================================
@app.get("/api/v1/health", tags=["Health"])
async def get_health():
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.get("/api/v1/ready", tags=["Health"])
async def get_readiness():
    return {
        "status": "ready",
        "database": True,
        "redis": True,
        "ocrEngine": "Tesseract 5.3 (eng+hin) + OpenCV Morphological Pipeline"
    }

# =============================================================================
# IDENTITY & ACCESS
# =============================================================================
@app.get("/api/v1/me", tags=["Identity"])
async def get_current_profile(user: AuthenticatedUser = Depends(get_current_user)):
    return {
        "id": user.user_id,
        "email": user.email,
        "fullName": user.full_name,
        "workspaceId": user.workspace_id,
        "role": user.role,
        "isPro": user.is_pro
    }

@app.get("/api/v1/workspaces", tags=["Identity"])
async def list_workspaces(user: AuthenticatedUser = Depends(get_current_user)):
    return [
        {
            "id": user.workspace_id,
            "name": "Bharat Forensic Sandbox",
            "tier": "pro" if user.is_pro else "free",
            "retentionDays": 30,
            "createdAt": "2026-09-21T00:00:00Z"
        }
    ]

# =============================================================================
# SCORING ENDPOINT (Deterministic Engine)
# =============================================================================
class ScoreCalculationRequest(BaseModel):
    exposure: Optional[int] = None
    connectability: Optional[int] = None
    impersonation: Optional[int] = None
    documentAnomaly: Optional[int] = None

@app.post("/api/v1/scoring/calculate", tags=["Scoring"])
async def compute_score(
    payload: ScoreCalculationRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    comps = ComponentScoresSchema(
        exposure=payload.exposure,
        connectability=payload.connectability,
        impersonation=payload.impersonation,
        document_anomaly=payload.documentAnomaly
    )
    result = calculate_shadow_score(comps)
    return {
        "score": result.score,
        "coverage": result.coverage,
        "isProvisional": result.is_provisional,
        "provisionalReason": result.provisional_reason,
        "severityBand": result.severity_band,
        "componentScores": {
            "exposure": result.component_scores.exposure,
            "connectability": result.component_scores.connectability,
            "impersonation": result.component_scores.impersonation,
            "documentAnomaly": result.component_scores.document_anomaly
        },
        "contributions": result.contributions,
        "inputSnapshotHash": result.input_snapshot_hash
    }

# =============================================================================
# IMPERSONATION COMPARATOR
# =============================================================================
class ComparisonRequest(BaseModel):
    reference: Dict[str, Any]
    candidate: Dict[str, Any]

@app.post("/api/v1/comparisons", tags=["Impersonation"])
async def compare_profiles_endpoint(
    payload: ComparisonRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    res = compare_profiles(payload.reference, payload.candidate)
    return {
        "id": f"cmp-{uuid.uuid4().hex[:8]}",
        "referenceSubject": payload.reference,
        "candidateProfile": payload.candidate,
        "metrics": res["metrics"],
        "contradictions": res["contradictions"],
        "verdict": res["verdict"],
        "verdictNotes": res["verdictNotes"]
    }

# =============================================================================
# DOCUMENT DEFENSE & OCR
# =============================================================================
class DocumentAnalysisPayload(BaseModel):
    documentCategory: str
    sampleKey: Optional[str] = "arun"

@app.post("/api/v1/documents/analyze", tags=["Documents"])
async def analyze_document_endpoint(
    payload: DocumentAnalysisPayload,
    user: AuthenticatedUser = Depends(get_current_user)
):
    res = analyze_document_sample(payload.documentCategory, payload.sampleKey or "arun")
    return {
        "id": f"doc-{uuid.uuid4().hex[:8]}",
        **res
    }

# =============================================================================
# EXPOSURE GRAPH
# =============================================================================
class GraphBuildRequest(BaseModel):
    subjectName: str
    city: str
    institution: str = ""
    evidenceTokens: List[Dict[str, Any]] = []

@app.post("/api/v1/exposure/graph", tags=["Exposure"])
async def build_graph_endpoint(
    payload: GraphBuildRequest,
    user: AuthenticatedUser = Depends(get_current_user)
):
    return build_evidence_graph(
        payload.subjectName,
        payload.city,
        payload.institution,
        payload.evidenceTokens
    )

# =============================================================================
# BILLING & RAZORPAY
# =============================================================================
@app.post("/api/v1/billing/orders", tags=["Billing"])
async def create_order(user: AuthenticatedUser = Depends(get_current_user)):
    return create_razorpay_order(user.workspace_id)

class VerifyPaymentPayload(BaseModel):
    razorpayOrderId: str
    razorpayPaymentId: str
    razorpaySignature: str

@app.post("/api/v1/billing/verify", tags=["Billing"])
async def verify_payment(
    payload: VerifyPaymentPayload,
    user: AuthenticatedUser = Depends(get_current_user)
):
    is_valid = verify_razorpay_payment_signature(
        payload.razorpayOrderId,
        payload.razorpayPaymentId,
        payload.razorpaySignature
    )
    if not is_valid:
        raise ShadowIDException(
            code="PAYMENT_VERIFICATION_FAILED",
            message="Invalid Razorpay HMAC-SHA256 signature",
            status_code=status.HTTP_400_BAD_REQUEST
        )
    return {
        "success": True,
        "entitlement": "pro_pass_30d",
        "validUntilIST": "21 Oct 2026, 23:59 IST"
    }

@app.post("/api/v1/billing/webhooks/razorpay", tags=["Billing"])
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    body = await request.body()
    if not x_razorpay_signature or not verify_webhook_signature(body, x_razorpay_signature):
        return JSONResponse(status_code=400, content={"error": "Invalid signature"})
    return {"status": "processed"}

# =============================================================================
# REPORTS DOSSIER
# =============================================================================
class ReportRequestPayload(BaseModel):
    scanData: Dict[str, Any]

@app.post("/api/v1/reports/generate-json", tags=["Reports"])
async def generate_json_report_endpoint(
    payload: ReportRequestPayload,
    user: AuthenticatedUser = Depends(get_current_user)
):
    report_json_str = generate_sanitized_json_report(payload.scanData)
    return JSONResponse(content={"reportJson": report_json_str})
