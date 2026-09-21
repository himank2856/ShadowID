# ShadowID — Operational Runbook & Deployment Guide

> **Platform:** ShadowID (“What You Share Is More Than What You See.”)  
> **Team GIGABYTE:** Anshul, Tanishq, and Himank  
> **Build With Bharat 3.0, Chitkara University, Himachal Pradesh**

---

## 1. Local Development Prerequisites

- **Node.js:** v20+ or v24+
- **Python:** 3.11+ or 3.12+ (verified with Python 3.12.10 on Windows x64)
- **Database:** Supabase Local CLI or PostgreSQL 15+
- **Queue Broker:** Redis 7.0+
- **OCR Engine (Optional in local mock mode):** Tesseract OCR (`tesseract-ocr`, `tesseract-ocr-hin`)

---

## 2. Quickstart Execution (Step-by-Step)

### Step 1: Install Python Core & Test Dependencies
```bash
python -m pip install -r apps/api/requirements.txt
```

### Step 2: Install Frontend Dependencies
```bash
npm install
```

### Step 3: Run Full Automated Verification Suite
```bash
python -m pytest tests -v
```
*Expected result: 15/15 tests passing covering scoring, impersonation, document defense, and API contracts.*

### Step 4: Run Frontend Typecheck & Build
```bash
npm run lint
npm run build
```

### Step 5: Launch Local Services
1. **Start FastAPI Backend:**
   ```bash
   uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Start Asynchronous Worker:**
   ```bash
   python -m apps.worker.worker
   ```
3. **Start React Frontend:**
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000` (or `http://localhost:5173`).

---

## 3. Containerized Orchestration (`docker-compose.yml`)

To run the complete production-grade stack including Redis, Worker, API, and Web in isolated containers:

```bash
docker compose up --build -d
```

### Health & Diagnostic Check
```bash
curl -f http://localhost:8000/api/v1/health
curl -f http://localhost:8000/api/v1/ready
```

---

## 4. Database Migrations & Seeding

Migrations are located in `supabase/migrations/`:
1. `20260921000001_initial_schema.sql` (Tables, Foreign Keys, Indexes)
2. `20260921000002_row_level_security.sql` (RLS Tenant Policies)
3. `20260921000003_seed_synthetic_data.sql` (6 Canonical Indian Test Cases)

### Applying Migrations via Supabase CLI
```bash
supabase db reset
```

---

## 5. Environment Variables Reference (`.env.example`)

```ini
# Application
ENVIRONMENT=development
PROJECT_NAME="ShadowID Forensic Core"
SECRET_KEY="shadowid-bharat-forensic-secret-key-development-mode-2026"

# Database & Supabase
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
STORAGE_BUCKET_PRIVATE="shadowid-private-evidence"

# Redis & RQ Worker
REDIS_URL="redis://localhost:6379/0"
REDIS_QUEUE_NAME="shadowid_scans"

# Razorpay Test Mode (Paise persistence)
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
RAZORPAY_WEBHOOK_SECRET="rzp_test_webhook_secret_2026"

# Tesseract
TESSERACT_CMD="tesseract"
TESSERACT_LANGS="eng+hin"
```

---

## 6. Data Sovereign Infrastructure & Processing Locations

In compliance with DPDP recommendations:
- **Primary API & Worker Region:** Mumbai (`ap-south-1`)
- **Database & Storage Region:** Mumbai (`ap-south-1`)
- **Retention Standards:**
  - Raw document byte streams: Hard deleted after 24 hours.
  - Completed forensic assessments: Retained for 30 days unless subject requests immediate revocation/deletion.
