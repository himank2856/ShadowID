-- =============================================================================
-- Migration: 20260921000001_initial_schema.sql
-- ShadowID - Relational Schema, Foreign Keys & Multi-Tenant Indexes
-- Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles & Workspaces
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
    retention_days INT NOT NULL DEFAULT 30,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'analyst' CHECK (role IN ('owner', 'analyst', 'viewer')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(workspace_id, profile_id)
);

-- 2. Subjects & Consents
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    institution TEXT,
    employer TEXT,
    primary_handle TEXT,
    phone_masked TEXT,
    email_masked TEXT,
    is_synthetic BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(workspace_id, id)
);

CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    permitted_modules TEXT[] NOT NULL DEFAULT ARRAY['exposure', 'impersonation', 'documents', 'research'],
    authorization_basis TEXT NOT NULL CHECK (authorization_basis IN ('self', 'authorized_representative', 'synthetic_demo')),
    notice_version TEXT NOT NULL DEFAULT '1.4.0',
    retention_days INT NOT NULL DEFAULT 30,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, subject_id) REFERENCES subjects(workspace_id, id) ON DELETE CASCADE,
    UNIQUE(workspace_id, id)
);

-- 3. Sources & Evidence Tokens
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('telecom', 'registry', 'social', 'document', 'upi', 'web')),
    name TEXT NOT NULL,
    source_url TEXT,
    provenance_hash TEXT,
    review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(workspace_id, id)
);

CREATE TABLE IF NOT EXISTS evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL,
    consent_id UUID NOT NULL,
    source_id UUID NOT NULL,
    key TEXT NOT NULL,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    observed_at TIMESTAMPTZ NOT NULL,
    extraction_method TEXT NOT NULL,
    certainty_reason TEXT NOT NULL,
    is_confirmed_by_reviewer BOOLEAN NOT NULL DEFAULT FALSE,
    is_synthetic BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, subject_id) REFERENCES subjects(workspace_id, id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id, consent_id) REFERENCES consents(workspace_id, id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id, source_id) REFERENCES sources(workspace_id, id) ON DELETE CASCADE,
    UNIQUE(workspace_id, id)
);

CREATE TABLE IF NOT EXISTS evidence_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    source_evidence_id UUID NOT NULL,
    target_evidence_id UUID NOT NULL,
    relation_type TEXT NOT NULL,
    certainty INT NOT NULL CHECK (certainty BETWEEN 0 AND 100),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, source_evidence_id) REFERENCES evidence(workspace_id, id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id, target_evidence_id) REFERENCES evidence(workspace_id, id) ON DELETE CASCADE
);

-- 4. Scans, Scan Jobs & Durable Outbox
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL,
    consent_id UUID NOT NULL,
    selected_modules TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled')),
    progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    current_stage TEXT NOT NULL DEFAULT 'Job Queued',
    queued_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, subject_id) REFERENCES subjects(workspace_id, id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id, consent_id) REFERENCES consents(workspace_id, id) ON DELETE CASCADE,
    UNIQUE(workspace_id, id)
);

CREATE TABLE IF NOT EXISTS scan_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    queue_name TEXT NOT NULL DEFAULT 'default',
    attempts INT NOT NULL DEFAULT 0,
    max_retries INT NOT NULL DEFAULT 3,
    last_heartbeat TIMESTAMPTZ,
    locked_by TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'queued',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL,
    aggregate_id UUID NOT NULL,
    payload JSONB NOT NULL,
    dispatched_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Module Specific Entities: Impersonation & Documents
CREATE TABLE IF NOT EXISTS profile_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    candidate_platform TEXT NOT NULL,
    candidate_url TEXT,
    candidate_name TEXT NOT NULL,
    candidate_handle TEXT NOT NULL,
    candidate_bio TEXT,
    metrics JSONB NOT NULL,
    contradictions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    verdict TEXT NOT NULL CHECK (verdict IN ('Limited overlap', 'Similarities found', 'Needs review', 'Insufficient evidence')),
    verdict_notes TEXT NOT NULL,
    reviewer_decision TEXT CHECK (reviewer_decision IN ('dismiss', 'flag_for_takedown', 'monitor')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    document_category TEXT NOT NULL CHECK (document_category IN ('Aadhaar', 'PAN', 'Passport', 'Generic ID')),
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    ocr_engine TEXT NOT NULL DEFAULT 'Tesseract eng/hin v5.3 + OpenCV Preprocessing',
    quality_score INT NOT NULL,
    language_detected TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('Requires review', 'No configured inconsistencies found', 'Insufficient image quality')),
    summary TEXT NOT NULL,
    inconsistencies TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_human_verified BOOLEAN NOT NULL DEFAULT FALSE,
    human_review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    field_label TEXT NOT NULL,
    raw_extracted_value TEXT NOT NULL,
    masked_value TEXT NOT NULL,
    confidence INT NOT NULL,
    box_geometry JSONB NOT NULL,
    is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
    anomaly_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. Findings, Scores & Actions
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    rule_id TEXT NOT NULL,
    title TEXT NOT NULL,
    module TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('lower', 'moderate', 'elevated', 'high')),
    score_impact INT NOT NULL,
    description TEXT NOT NULL,
    supporting_evidence TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    confidence_reason TEXT NOT NULL,
    scope_limitation TEXT NOT NULL,
    remediation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'mitigated', 'false_positive_rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID UNIQUE NOT NULL,
    score INT CHECK (score BETWEEN 0 AND 100),
    coverage INT NOT NULL CHECK (coverage BETWEEN 0 AND 100),
    is_provisional BOOLEAN NOT NULL,
    provisional_reason TEXT,
    severity_band TEXT NOT NULL,
    component_exposure INT,
    component_connectability INT,
    component_impersonation INT,
    component_document_anomaly INT,
    weights JSONB NOT NULL,
    contributions JSONB NOT NULL,
    input_snapshot_hash TEXT NOT NULL,
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    finding_ref TEXT NOT NULL,
    title TEXT NOT NULL,
    module TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
    assignee TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    verification_method TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

-- 7. Reports, Billing, Integrations, Audit
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('json', 'pdf')),
    file_path TEXT NOT NULL,
    snapshot_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    FOREIGN KEY (workspace_id, scan_id) REFERENCES scans(workspace_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS billing_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    amount_paise INT NOT NULL CHECK (amount_paise > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    plan_tier TEXT NOT NULL DEFAULT 'pro_pass_30d',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'attempted', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    active_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL,
    provider_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    actor_profile_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE IF NOT EXISTS deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES profiles(id),
    scope TEXT NOT NULL CHECK (scope IN ('raw_documents', 'full_workspace')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- =============================================================================
-- INDEXES FOR TENANT PERFORMANCE & AUDIT QUERIES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_subjects_workspace_date ON subjects(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scans_workspace_date ON scans(workspace_id, queued_at DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_subject ON evidence(subject_id);
CREATE INDEX IF NOT EXISTS idx_findings_scan ON findings(scan_id);
CREATE INDEX IF NOT EXISTS idx_actions_scan_status ON actions(scan_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_events_workspace_time ON audit_events(workspace_id, created_at DESC);
