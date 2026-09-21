"""
Integration Tests for FastAPI Endpoints (Prompt 9 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.main import app

client = TestClient(app)

def test_health_probe():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data

def test_readiness_probe():
    response = client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"] is True
    assert data["redis"] is True

def test_scoring_api_endpoint():
    response = client.post(
        "/api/v1/scoring/calculate",
        json={
            "exposure": 78,
            "connectability": 65,
            "impersonation": 60,
            "documentAnomaly": 20
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 62
    assert data["coverage"] == 100
    assert data["isProvisional"] is False
    assert data["severityBand"] == "elevated"

def test_impersonation_comparison_api():
    response = client.post(
        "/api/v1/comparisons",
        json={
            "reference": {
                "name": "Arun Sharma",
                "handle": "@arun_sharma_99",
                "bio": "Security Researcher building IndusScan",
                "city": "Chandigarh"
            },
            "candidate": {
                "name": "Arun Sharma (Official)",
                "handle": "@arun_sharma_99_official",
                "bio": "Security Researcher building IndusScan | UPI: arun@okaxis",
                "location": "Chandigarh"
            }
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["verdict"] in ["Needs review", "Similarities found"]
    assert "metrics" in data

def test_razorpay_order_api():
    response = client.post("/api/v1/billing/orders")
    assert response.status_code == 200
    data = response.json()
    assert data["amountPaise"] == 49900
    assert data["currency"] == "INR"
    assert "orderId" in data
