"""
ShadowID - Razorpay Indian Payment Rail & Entitlements (Prompt 15 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import hmac
import hashlib
import time
from typing import Dict, Any, Optional
from apps.api.core.config import settings
from apps.api.core.errors import ShadowIDException

PRO_PASS_PRICE_PAISE: int = 49900 # ₹499.00
PRO_PASS_DURATION_DAYS: int = 30

def create_razorpay_order(workspace_id: str) -> Dict[str, Any]:
    """
    Creates a server-authorized order for the 30-Day Pro Pass in paise.
    Ensures amount and currency are determined solely by server rules.
    """
    order_id = f"order_rzp_mock_{int(time.time())}"
    
    return {
        "orderId": order_id,
        "amountPaise": PRO_PASS_PRICE_PAISE,
        "currency": "INR",
        "keyId": settings.RAZORPAY_KEY_ID,
        "productName": "ShadowID 30-Day Pro Pass (₹499)"
    }

def verify_razorpay_payment_signature(
    razorpay_order_id: str,
    razorpay_payment_id: str,
    razorpay_signature: str
) -> bool:
    """
    Verifies HMAC-SHA256 signature according to official Razorpay specifications.
    signature = hmac_sha256(order_id + "|" + payment_id, secret)
    """
    if not razorpay_order_id or not razorpay_payment_id:
        return False
        
    # In test sandbox without live credentials, accept test signatures or verify
    if settings.ENVIRONMENT == "development" and razorpay_signature.startswith("test_sig_"):
        return True
        
    message = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
    generated_signature = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(generated_signature, razorpay_signature)

def verify_webhook_signature(payload_body: bytes, signature_header: str) -> bool:
    """Verifies Razorpay raw body webhook signature."""
    if not signature_header:
        return False
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        payload_body,
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature_header)
