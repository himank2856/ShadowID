-- =============================================================================
-- Migration: 20260921000003_seed_synthetic_data.sql
-- ShadowID - Seed 6 Repeatable Indian Synthetic Test Cases (Prompt 8 Compliant)
-- Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
-- =============================================================================

-- Seed Demo Workspace & Profile
INSERT INTO profiles (id, email, full_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo.analyst@example.com', 'Demo Forensic Analyst')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspaces (id, name, tier, retention_days)
VALUES ('11111111-1111-1111-1111-111111111111', 'Bharat Forensic Sandbox', 'pro', 30)
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspace_members (workspace_id, profile_id, role)
VALUES ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'owner')
ON CONFLICT DO NOTHING;

-- Case 1: Arun S. (Chandigarh)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'Arun Sharma',
    'Chandigarh',
    'Chandigarh',
    'Punjab Engineering College (PEC)',
    'CyberMatrix Infotech',
    '@arun_sharma_99',
    '+91 98881 •••••',
    'arun.s•••••@example.com',
    TRUE,
    'Synthetic case: Public job, university, handle, and contact disclosure across supplied profiles.'
) ON CONFLICT (id) DO NOTHING;

-- Case 2: Kavya M. (Himachal Pradesh)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000002',
    '11111111-1111-1111-1111-111111111111',
    'Kavya Mahajan',
    'Shimla',
    'Himachal Pradesh',
    'Himachal Pradesh University (HPU)',
    'Himachal Tourism Council (Contract)',
    '@kavya_hp_m',
    '+91 94180 •••••',
    'kavya.m•••••@example.org',
    TRUE,
    'Synthetic case: Limited evidence footprint and an unrelated namesake in another state.'
) ON CONFLICT (id) DO NOTHING;

-- Case 3: Meera R. (Bengaluru)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000003',
    '11111111-1111-1111-1111-111111111111',
    'Meera Ramanathan',
    'Bengaluru',
    'Karnataka',
    'IISc Bengaluru',
    'Natura BioLabs',
    '@meera_biotech',
    '+91 97412 •••••',
    'm.raman•••••@example.com',
    TRUE,
    'Synthetic case: Repeated avatar and bio with a conflicting contact link (phishing funnel).'
) ON CONFLICT (id) DO NOTHING;

-- Case 4: Rohan K. (Lucknow)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000004',
    '11111111-1111-1111-1111-111111111111',
    'Rohan Kapoor',
    'Lucknow',
    'Uttar Pradesh',
    'IIM Lucknow',
    'Avadh Agro Trading',
    '@rohan_agro_lko',
    '+91 99350 •••••',
    'rohan.k•••••@example.com',
    TRUE,
    'Synthetic case: Similar name but contradictory profile context and disparate business entities.'
) ON CONFLICT (id) DO NOTHING;

-- Case 5: Sana A. (Mumbai)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000005',
    '11111111-1111-1111-1111-111111111111',
    'Sana Ansari',
    'Mumbai',
    'Maharashtra',
    'St. Xavier''s College, Mumbai',
    'Gateway Media Labs',
    '@sana_ansari_mumbai',
    '+91 98200 •••••',
    'sana.a•••••@example.com',
    TRUE,
    'Synthetic case: Inconsistent fields and tampering indicators on a clearly marked SAMPLE document.'
) ON CONFLICT (id) DO NOTHING;

-- Case 6: Dev P. (Chennai)
INSERT INTO subjects (id, workspace_id, name, city, state, institution, employer, primary_handle, phone_masked, email_masked, is_synthetic, notes)
VALUES (
    '22222222-2222-2222-2222-000000000006',
    '11111111-1111-1111-1111-111111111111',
    'Dev Parthasarathy',
    'Chennai',
    'Tamil Nadu',
    'IIT Madras',
    'Coromandel Tech Solutions',
    '@dev_chennai_tech',
    '+91 94440 •••••',
    'dev.p•••••@example.org',
    TRUE,
    'Synthetic case: Poor-quality document scan with insufficient OCR extraction and low image resolution.'
) ON CONFLICT (id) DO NOTHING;
