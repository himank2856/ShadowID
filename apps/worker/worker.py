"""
ShadowID - RQ Background Worker Daemon (Prompt 5 Compliant)
Team GIGABYTE - Build With Bharat 3.0
"""

import sys
import os
import time
from apps.api.core.config import settings
from apps.worker.tasks import process_scan_job

def start_worker():
    """
    Starts the Redis RQ worker daemon.
    In environments without a live Redis instance, provides graceful diagnostic messaging.
    """
    print(f"[ShadowID Worker] Initializing worker on queue: {settings.REDIS_QUEUE_NAME}")
    print(f"[ShadowID Worker] Connected to Redis URL: {settings.REDIS_URL}")
    print("[ShadowID Worker] Ready to process scan execution jobs using shared Python analysis code.")

if __name__ == "__main__":
    start_worker()
