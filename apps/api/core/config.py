"""
ShadowID - Global Configuration & Environment Settings
Team GIGABYTE - Build With Bharat 3.0
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "ShadowID Forensic Core"
    VERSION: str = "1.4.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security & CORS
    SECRET_KEY: str = "shadowid-bharat-forensic-secret-key-development-mode-2026"
    JWT_ALGORITHM: str = "HS256"
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://shadowid.in"
    ]
    
    # Database (Supabase PostgreSQL / Local Postgres)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:54322/postgres"
    
    # Supabase Auth & Storage
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_ANON_KEY: str = "eyJh...anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "eyJh...service-role-key"
    STORAGE_BUCKET_PRIVATE: str = "shadowid-private-evidence"
    
    # Redis & RQ Worker
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_QUEUE_NAME: str = "shadowid_scans"
    
    # Razorpay Test Mode
    RAZORPAY_KEY_ID: str = "rzp_test_placeholder_key"
    RAZORPAY_KEY_SECRET: str = "rzp_test_placeholder_secret"
    RAZORPAY_WEBHOOK_SECRET: str = "rzp_test_webhook_secret_2026"
    
    # Tesseract & Document Analysis
    TESSERACT_CMD: str = "tesseract"
    TESSERACT_LANGS: str = "eng+hin"
    MAX_DOCUMENT_SIZE_BYTES: int = 10 * 1024 * 1024 # 10 MB
    MAX_DOCUMENT_PAGES: int = 5
    
    # DPDP Defaults
    DEFAULT_DOCUMENT_RETENTION_HOURS: int = 24
    DEFAULT_ASSESSMENT_RETENTION_DAYS: int = 30

settings = Settings()
