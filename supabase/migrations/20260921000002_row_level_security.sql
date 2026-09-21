-- =============================================================================
-- Migration: 20260921000002_row_level_security.sql
-- ShadowID - Tenant Isolation & Row Level Security (RLS)
-- Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
-- =============================================================================

-- Enable Row Level Security on all tenant-owned tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Helper Function to resolve current user profile ID from Supabase auth.uid()
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Check workspace membership
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = ws_id 
        AND profile_id = current_profile_id()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper Function: Check workspace role (owner or analyst)
CREATE OR REPLACE FUNCTION has_workspace_role(ws_id UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_id = ws_id 
        AND profile_id = current_profile_id()
        AND role = ANY(required_roles)
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Workspaces
CREATE POLICY workspaces_member_read ON workspaces
    FOR SELECT USING (is_workspace_member(id));

CREATE POLICY workspaces_owner_update ON workspaces
    FOR UPDATE USING (has_workspace_role(id, ARRAY['owner']));

-- Workspace Members
CREATE POLICY members_read ON workspace_members
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY members_owner_manage ON workspace_members
    FOR ALL USING (has_workspace_role(workspace_id, ARRAY['owner']));

-- Subjects & Consents
CREATE POLICY subjects_member_select ON subjects
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY subjects_analyst_manage ON subjects
    FOR ALL USING (has_workspace_role(workspace_id, ARRAY['owner', 'analyst']));

CREATE POLICY consents_member_select ON consents
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY consents_analyst_manage ON consents
    FOR ALL USING (has_workspace_role(workspace_id, ARRAY['owner', 'analyst']));

-- Scans & Scan Jobs
CREATE POLICY scans_member_select ON scans
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY scans_analyst_insert ON scans
    FOR INSERT WITH CHECK (has_workspace_role(workspace_id, ARRAY['owner', 'analyst']));

CREATE POLICY scans_analyst_update ON scans
    FOR UPDATE USING (has_workspace_role(workspace_id, ARRAY['owner', 'analyst']));

-- Scores: Read-only to workspace members; MUTATION STRICTLY RESTRICTED TO SYSTEM WORKER
CREATE POLICY scores_member_select ON scores
    FOR SELECT USING (is_workspace_member(workspace_id));

-- Prevent end-users from updating calculated scores directly
CREATE OR REPLACE FUNCTION prevent_user_score_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Direct user mutation of calculated Shadow Scores is prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_score_update
BEFORE UPDATE OR DELETE ON scores
FOR EACH ROW EXECUTE FUNCTION prevent_user_score_mutation();

-- Audit Events: Append-only for all users
CREATE POLICY audit_events_member_select ON audit_events
    FOR SELECT USING (is_workspace_member(workspace_id));

CREATE POLICY audit_events_insert ON audit_events
    FOR INSERT WITH CHECK (is_workspace_member(workspace_id));

-- Prevent modification or deletion of audit logs
CREATE OR REPLACE FUNCTION prevent_audit_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are append-only and cannot be altered or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_tampering
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_tampering();
