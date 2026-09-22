/**
 * ShadowID - Supabase Cloud Database Client & Synchronization Engine
 * Configured for Account: himank2856
 * Team GIGABYTE - Build With Bharat 3.0
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { UserAccount, ScanJob, DocumentAnalysisData } from '../types.ts';
import type { AuditLogEntry } from './accountDatabase.ts';

const SUPABASE_STORAGE_KEY = 'shadowid_supabase_config';
export const DEFAULT_SUPABASE_ACCOUNT = 'himank2856';

export interface SupabaseConfig {
  accountName: string;
  projectUrl: string;
  anonKey: string;
  isConnected: boolean;
  lastConnectedAt?: string;
  lastError?: string;
}

function loadStoredConfig(): SupabaseConfig {
  const env = (import.meta as any).env || {};
  const envAccount = env.VITE_SUPABASE_ACCOUNT || DEFAULT_SUPABASE_ACCOUNT;
  const envUrl = env.VITE_SUPABASE_URL || `https://${envAccount}.supabase.co`;
  const envKey = env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(SUPABASE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        accountName: parsed.accountName || envAccount,
        projectUrl: parsed.projectUrl || envUrl,
        anonKey: parsed.anonKey || envKey,
        isConnected: !!(parsed.projectUrl && parsed.anonKey && parsed.isConnected),
        lastConnectedAt: parsed.lastConnectedAt,
        lastError: parsed.lastError,
      };
    }
  } catch (err) {
    console.warn('Failed to read Supabase configuration from storage:', err);
  }

  return {
    accountName: envAccount,
    projectUrl: envUrl,
    anonKey: envKey,
    isConnected: !!(envUrl && envKey),
  };
}

let activeConfig: SupabaseConfig = loadStoredConfig();
let clientInstance: SupabaseClient | null = null;

function initializeClient(): SupabaseClient | null {
  if (activeConfig.projectUrl && activeConfig.anonKey && activeConfig.anonKey.trim().length > 10) {
    try {
      clientInstance = createClient(activeConfig.projectUrl.trim(), activeConfig.anonKey.trim(), {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      clientInstance = null;
      return null;
    }
  }
  clientInstance = null;
  return null;
}

// Initial client creation
initializeClient();

export const supabaseService = {
  /**
   * Get current Supabase credentials and status
   */
  getConfig: (): SupabaseConfig => {
    return { ...activeConfig };
  },

  /**
   * Check if Supabase client is initialized with valid credentials
   */
  isConfigured: (): boolean => {
    return !!(clientInstance && activeConfig.anonKey && activeConfig.anonKey.trim().length > 10);
  },

  /**
   * Get raw client instance
   */
  getClient: (): SupabaseClient | null => {
    return clientInstance;
  },

  /**
   * Test the live connection to user's Supabase project
   */
  testConnection: async (urlOverride?: string, keyOverride?: string): Promise<{
    success: boolean;
    latencyMs?: number;
    error?: string;
  }> => {
    const targetUrl = (urlOverride || activeConfig.projectUrl || '').trim();
    const targetKey = (keyOverride || activeConfig.anonKey || '').trim();

    if (!targetUrl || !targetKey) {
      return {
        success: false,
        error: 'Missing Project URL or Anon Public Key. Please provide your Supabase credentials.',
      };
    }

    const startTime = performance.now();
    try {
      const testClient = createClient(targetUrl, targetKey);
      // Attempt a lightweight ping to Supabase auth or rest service
      const { data, error } = await testClient.from('profiles').select('id').limit(1);
      const latencyMs = Math.round(performance.now() - startTime);

      if (error && error.code !== 'PGRST116' && !error.message.includes('relation "profiles" does not exist')) {
        // A table missing error still proves the REST API & Auth credentials are valid!
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          return {
            success: true,
            latencyMs,
          };
        }
        return {
          success: false,
          latencyMs,
          error: `${error.message} (Code: ${error.code || 'UNKNOWN'})`,
        };
      }

      return {
        success: true,
        latencyMs,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error attempting to reach Supabase project host.',
      };
    }
  },

  /**
   * Save and activate Supabase credentials for himank2856
   */
  saveCredentials: async (
    projectUrl: string,
    anonKey: string,
    accountName: string = DEFAULT_SUPABASE_ACCOUNT
  ): Promise<{ success: boolean; message: string }> => {
    const cleanUrl = projectUrl.trim();
    const cleanKey = anonKey.trim();

    const testRes = await supabaseService.testConnection(cleanUrl, cleanKey);
    const now = new Date().toISOString();

    activeConfig = {
      accountName: accountName.trim() || DEFAULT_SUPABASE_ACCOUNT,
      projectUrl: cleanUrl,
      anonKey: cleanKey,
      isConnected: testRes.success,
      lastConnectedAt: testRes.success ? now : undefined,
      lastError: testRes.success ? undefined : testRes.error,
    };

    localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(activeConfig));
    initializeClient();

    if (!testRes.success) {
      return {
        success: false,
        message: `Credentials saved, but connection ping returned: ${testRes.error}. Verify your Supabase URL & Anon Key.`,
      };
    }

    return {
      success: true,
      message: `Connected successfully to Supabase for account "${activeConfig.accountName}" (${testRes.latencyMs}ms latency).`,
    };
  },

  /**
   * Reset credentials to local fallback
   */
  resetCredentials: () => {
    localStorage.removeItem(SUPABASE_STORAGE_KEY);
    activeConfig = {
      accountName: DEFAULT_SUPABASE_ACCOUNT,
      projectUrl: `https://${DEFAULT_SUPABASE_ACCOUNT}.supabase.co`,
      anonKey: '',
      isConnected: false,
    };
    clientInstance = null;
  },

  /**
   * Synchronize a user account to Supabase `profiles` table
   */
  syncUser: async (user: UserAccount): Promise<boolean> => {
    if (!clientInstance) return false;
    try {
      const { error } = await clientInstance.from('profiles').upsert(
        {
          id: user.id,
          email: user.email,
          full_name: user.fullName,
          phone_number: user.phone,
          organization: user.organization || null,
          role: user.role,
          is_verified: user.isVerified,
          is_pro: user.isPro,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );
      if (error) {
        console.warn('[Supabase Sync] User profile upsert returned:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Sync] User sync error:', err);
      return false;
    }
  },

  /**
   * Synchronize an investigation scan to Supabase `scans` table
   */
  syncScan: async (scan: ScanJob, userId?: string): Promise<boolean> => {
    if (!clientInstance) return false;
    try {
      const { error } = await clientInstance.from('scans').upsert(
        {
          id: scan.id,
          user_id: userId || null,
          subject_name: scan.subject.name,
          subject_city: scan.subject.city,
          subject_state: scan.subject.state,
          score: scan.scoreData.score,
          coverage: scan.scoreData.coverage,
          severity_band: scan.scoreData.severityBand,
          snapshot_hash: scan.scoreData.inputSnapshotHash,
          score_data: scan.scoreData,
          evidence_graph: scan.evidenceGraph,
          findings: scan.findings,
          actions: scan.actions,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('[Supabase Sync] Scan upsert returned:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Sync] Scan sync error:', err);
      return false;
    }
  },

  /**
   * Synchronize a document analysis record to Supabase `documents` table
   */
  syncDocument: async (doc: DocumentAnalysisData, scanId?: string): Promise<boolean> => {
    if (!clientInstance) return false;
    try {
      const { error } = await clientInstance.from('documents').upsert(
        {
          id: doc.id,
          scan_id: scanId || null,
          document_category: doc.documentCategory,
          sample_label: doc.sampleLabel,
          filename: doc.filename,
          ocr_engine: doc.ocrEngine,
          quality_score: doc.qualityScore,
          language_detected: doc.languageDetected,
          verdict: doc.verdict,
          summary: doc.summary,
          boxes: doc.boxes,
          inconsistencies: doc.inconsistencies,
          is_human_verified: doc.isHumanVerified,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn('[Supabase Sync] Document upsert returned:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Sync] Document sync error:', err);
      return false;
    }
  },

  /**
   * Synchronize a DPDP Audit Log to Supabase `audit_logs` table
   */
  syncAuditLog: async (log: AuditLogEntry): Promise<boolean> => {
    if (!clientInstance) return false;
    try {
      const { error } = await clientInstance.from('audit_logs').insert({
        id: log.id,
        user_id: log.userId,
        action: log.action,
        details: log.details,
        ip_masked: log.ipMasked,
        timestamp: log.timestamp,
      });
      if (error) {
        console.warn('[Supabase Sync] Audit log insert returned:', error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('[Supabase Sync] Audit log error:', err);
      return false;
    }
  },

  /**
   * Returns copyable PostgreSQL migration DDL for user to run in their Supabase SQL editor
   */
  getSqlMigrationSchema: (): string => {
    return `-- =============================================================================
-- ShadowID Database Schema for Supabase Account: himank2856
-- Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
-- Run this in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    organization TEXT,
    role TEXT NOT NULL DEFAULT 'analyst',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_pro BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. Forensic Scans & Investigations Table
CREATE TABLE IF NOT EXISTS public.scans (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    subject_city TEXT NOT NULL,
    subject_state TEXT NOT NULL,
    score INT,
    coverage INT NOT NULL DEFAULT 0,
    severity_band TEXT NOT NULL DEFAULT 'lower',
    snapshot_hash TEXT,
    score_data JSONB,
    evidence_graph JSONB,
    findings JSONB,
    actions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Document Defense & OCR Extractions Table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    scan_id TEXT REFERENCES public.scans(id) ON DELETE CASCADE,
    document_category TEXT NOT NULL,
    sample_label TEXT NOT NULL,
    filename TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    quality_score INT NOT NULL DEFAULT 95,
    language_detected TEXT NOT NULL DEFAULT 'English',
    verdict TEXT NOT NULL,
    summary TEXT,
    boxes JSONB,
    inconsistencies TEXT[],
    is_human_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. DPDP Act Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_masked TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for ShadowID Client
CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Write Profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public Read Scans" ON public.scans FOR SELECT USING (true);
CREATE POLICY "Public Write Scans" ON public.scans FOR ALL USING (true);
CREATE POLICY "Public Read Documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public Write Documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Public Read Audit Logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Public Write Audit Logs" ON public.audit_logs FOR ALL USING (true);
`;
  },
};
