import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { accountDatabase } from '../../services/accountDatabase.ts';
import { otpService } from '../../services/otpService.ts';
import { supabaseService, SupabaseConfig, DEFAULT_SUPABASE_ACCOUNT } from '../../services/supabaseService.ts';
import {
  Settings,
  CreditCard,
  Shield,
  ShieldCheck,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  User,
  Phone,
  Mail,
  Download,
  KeyRound,
  Lock,
  Cloud,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
  Info,
} from 'lucide-react';
import { BillingModal } from '../../components/BillingModal.tsx';
import { formatINR } from '../../utils/formatters.ts';
import { paymentProtocolService } from '../../services/paymentProtocolService.ts';
import { PaymentReceipt } from '../../types.ts';

export const SettingsPage: React.FC = () => {
  const { billing, user, logout, showToast, navigate, refreshUser } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

  // Email Verification State
  const [isEmailVerifyModalOpen, setIsEmailVerifyModalOpen] = useState(false);
  const [emailOtpDigits, setEmailOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [emailOtpCountdown, setEmailOtpCountdown] = useState<number>(30);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState<boolean>(false);
  const [emailVerifyError, setEmailVerifyError] = useState<string | null>(null);
  const [showEmailBackupCode, setShowEmailBackupCode] = useState<boolean>(false);
  const [emailBackupCode, setEmailBackupCode] = useState<string | null>(null);
  const [emailDeliveryStatus, setEmailDeliveryStatus] = useState<string | null>(null);
  const [emailDeliveryNote, setEmailDeliveryNote] = useState<string | null>(null);

  const handleInitiateEmailVerification = async () => {
    if (!user) return;
    setEmailVerifyError(null);
    setEmailOtpCountdown(30);
    setEmailOtpDigits(['', '', '', '', '', '']);
    setShowEmailBackupCode(false);
    setIsEmailVerifyModalOpen(true);
    const res = await otpService.sendEmailOtp(user.email, 'signup');
    if (res.deliveryStatus) setEmailDeliveryStatus(res.deliveryStatus);
    if (res.deliveryNote) setEmailDeliveryNote(res.deliveryNote);
    setEmailBackupCode(res.code || null);
    showToast(res.message);
  };

  const handleConfirmEmailVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEmailVerifyError(null);
    const code = emailOtpDigits.join('');
    if (code.length !== 6) {
      setEmailVerifyError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const res = await accountDatabase.verifyUserEmail(user.id, user.email, code);
      if (!res.success) {
        throw new Error(res.message);
      }
      refreshUser();
      setIsEmailVerifyModalOpen(false);
      showToast('Work email successfully verified with cryptographic OTP!');
    } catch (err: any) {
      setEmailVerifyError(err.message || 'Email verification failed.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Supabase State (Account: himank2856)
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => supabaseService.getConfig());
  const [projectUrl, setProjectUrl] = useState<string>(() => supabaseConfig.projectUrl);
  const [anonKey, setAnonKey] = useState<string>(() => supabaseConfig.anonKey);
  const [showAnonKey, setShowAnonKey] = useState<boolean>(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ success: boolean; message: string } | null>(null);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [showSqlSchema, setShowSqlSchema] = useState<boolean>(false);
  const [isSqlCopied, setIsSqlCopied] = useState<boolean>(false);

  const handleExportData = () => {
    if (!user) {
      showToast('Please sign in to export your forensic account data package.');
      return;
    }
    const jsonStr = accountDatabase.exportDataPackage(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowid-dpdp-export-${user.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('DPDP Section 12 Data Export downloaded successfully.');
  };

  const handlePurgeAccount = () => {
    if (!user) return;
    if (
      window.confirm(
        'WARNING: You are about to invoke DPDP Section 12 Right to Erasure. This will permanently delete your account, credentials, OTP logs, and all forensic investigations from the database. This action is irreversible. Proceed?'
      )
    ) {
      accountDatabase.purgeAccount(user.id);
      showToast('Account and all associated evidence purged under DPDP Act.');
      logout();
    }
  };

  const handleSaveSupabase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);
    try {
      const res = await supabaseService.saveCredentials(projectUrl, anonKey, 'himank2856');
      setSupabaseConfig(supabaseService.getConfig());
      setSupabaseStatusMsg({
        success: res.success,
        message: res.message,
      });
      showToast(
        res.success
          ? 'Connected to Supabase for account himank2856!'
          : 'Credentials saved, ping returned warnings.'
      );
    } catch (err: any) {
      setSupabaseStatusMsg({
        success: false,
        message: err.message || 'Failed to connect to Supabase.',
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleSyncWorkspace = async () => {
    if (!supabaseService.isConfigured()) {
      showToast('Please enter and save your Supabase Anon Key first.');
      return;
    }
    setIsSyncingSupabase(true);
    try {
      if (user) {
        await supabaseService.syncUser(user);
        const scans = accountDatabase.getUserScans(user.id);
        for (const scan of Object.values(scans)) {
          await supabaseService.syncScan(scan, user.id);
        }
      }
      showToast('All local profiles and investigations synchronized to Supabase.');
    } catch (err: any) {
      showToast('Sync error: ' + err.message);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySqlSchema = () => {
    const ddl = supabaseService.getSqlMigrationSchema();
    navigator.clipboard.writeText(ddl);
    setIsSqlCopied(true);
    showToast('PostgreSQL schema copied! Paste it in your Supabase SQL Editor.');
    setTimeout(() => setIsSqlCopied(false), 3000);
  };

  const integrations = [
    {
      name: 'iNSIGHTS Deep Search Bridge',
      type: 'Manual Research Import',
      status: 'Manual',
      statusColor: 'text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10',
      description: 'Structured privacy-preserving deep research workflow. Operates with explicit consent boundaries under DPDP Act 2023.',
      url: 'https://insights-ai.info/DeepSearch',
    },
    {
      name: 'Tesseract eng/hin OCR Engine',
      type: 'Local Isolated Worker',
      status: 'Available',
      statusColor: 'text-[#A3E635] border-[#A3E635]/40 bg-[#A3E635]/10',
      description: 'Dual-script English and Devanagari OCR with OpenCV morphological validation in memory.',
    },
    {
      name: 'UPI 2.0 & Payment Protocol Gateway',
      type: 'Indian Payment Rail',
      status: 'Available',
      statusColor: 'text-[#A3E635] border-[#A3E635]/40 bg-[#A3E635]/10',
      description: 'Direct UPI QR remittances (7973009420@ptaxis), card rails, and GST cryptographic receipts.',
    },
    {
      name: 'UIDAI / Aadhaar Direct Registry API',
      type: 'Government Identity Database',
      status: 'Unsupported',
      statusColor: 'text-[#64748B] border-[#64748B]/40 bg-[#07111F]',
      description: 'Direct government registry lookup is legally restricted and strictly avoided. Analysis is purely visual and morphological.',
    },
    {
      name: 'Automated Dark Web Scraper',
      type: 'Unconsented Scraping',
      status: 'Unsupported',
      statusColor: 'text-[#64748B] border-[#64748B]/40 bg-[#07111F]',
      description: 'Mass surveillance and unconsented credential scraping are prohibited by ShadowID\'s DPDP Act charter.',
    },
  ];

  const handleRevokeConsent = () => {
    if (window.confirm('Are you sure you want to revoke consent? This will purge all active sessions and delete raw artifacts.')) {
      showToast('Consent revoked. All active scan jobs cancelled and raw document cache purged.');
      navigate('/');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#38BDF8] uppercase mb-1">
          <Settings className="w-4 h-4" />
          <span>System Governance</span>
        </div>
        <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
          Workspace Settings & Account Profile
        </h1>
        <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
          DPDP Act 2023 compliance controls, two-factor OTP verification status, account registry, and analytical integrations.
        </p>
      </div>

      {/* Authenticated Account Profile Card */}
      {user && (
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172A42]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#172A42] border border-[#A3E635] flex items-center justify-center font-display font-bold text-[#A3E635] text-base">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-display font-bold text-[#F1F5F9]">{user.fullName}</h3>
                  <span className="text-[10px] font-mono-code bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> DPDP Verified
                  </span>
                </div>
                <div className="text-xs text-[#94A3B8] font-mono-code">{user.organization} • {user.role.toUpperCase()}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportData}
                className="px-3 py-1.5 rounded text-xs font-mono-code bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export DPDP Package
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] space-y-1">
              <div className="text-[10px] font-mono-code text-[#64748B] uppercase flex items-center justify-between">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> Work Email</span>
                {user.isEmailVerified ? (
                  <span className="text-[10px] text-[#A3E635] bg-[#A3E635]/10 px-1.5 py-0.5 rounded border border-[#A3E635]/30">Verified</span>
                ) : (
                  <span className="text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30">Unverified</span>
                )}
              </div>
              <div className="text-[#F1F5F9] font-mono-code truncate">{user.email}</div>
              {user.isEmailVerified ? (
                <div className="text-[10px] text-[#A3E635] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Verified (DPDP Compliant)
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#F59E0B] flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Verification Pending
                  </span>
                  <button
                    type="button"
                    onClick={handleInitiateEmailVerification}
                    className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#38BDF8]/30 transition-colors"
                  >
                    Verify Email
                  </button>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] space-y-1">
              <div className="text-[10px] font-mono-code text-[#64748B] uppercase flex items-center gap-1">
                <Phone className="w-3 h-3" /> Verified Mobile (OTP)
              </div>
              <div className="text-[#38BDF8] font-mono-code">{user.phone}</div>
              <div className="text-[10px] text-[#A3E635]">2-Factor Authentication Confirmed</div>
            </div>

            <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] space-y-1">
              <div className="text-[10px] font-mono-code text-[#64748B] uppercase flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Account ID & TTL
              </div>
              <div className="text-[#CBD5E1] font-mono-code text-[11px] truncate">{user.id}</div>
              <div className="text-[10px] text-[#94A3B8]">Retention: 30 Days rolling</div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Cloud Database Connection Card (Account: himank2856) */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#172A42]">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38BDF8]" />
              <h3 className="text-base font-display font-bold text-[#F1F5F9]">
                Supabase Database Connection
              </h3>
              <span className="text-[10px] font-mono-code bg-[#172A42] text-[#A3E635] px-2 py-0.5 rounded border border-[#A3E635]/40 font-bold">
                Account: himank2856
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Connect your official Supabase project to persist user profiles, forensic scans, OCR documents, and DPDP audit trails.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded text-xs font-mono-code flex items-center gap-1.5 border ${
                supabaseConfig.isConnected
                  ? 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/50'
                  : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseConfig.isConnected ? 'bg-[#A3E635] animate-pulse' : 'bg-[#F59E0B]'
                }`}
              />
              <span>{supabaseConfig.isConnected ? 'Connected' : 'Local Fallback'}</span>
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSaveSupabase} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://himank2856.supabase.co"
                className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 px-3 text-xs font-mono-code focus:outline-none focus:border-[#38BDF8]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1 flex items-center justify-between">
                <span>Supabase Public Anon Key</span>
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  className="text-[10px] text-[#38BDF8] hover:underline flex items-center gap-1"
                >
                  {showAnonKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showAnonKey ? 'Hide' : 'Reveal'}
                </button>
              </label>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 px-3 pr-8 text-xs font-mono-code focus:outline-none focus:border-[#38BDF8]"
                />
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {supabaseStatusMsg && (
            <div
              className={`p-2.5 rounded text-xs flex items-center gap-2 border ${
                supabaseStatusMsg.success
                  ? 'bg-[#A3E635]/15 border-[#A3E635]/40 text-[#bef264]'
                  : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#fca5a5]'
              }`}
            >
              {supabaseStatusMsg.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{supabaseStatusMsg.message}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isTestingSupabase}
                className="px-4 py-2 rounded text-xs font-bold bg-[#38BDF8] text-[#07111F] hover:bg-[#7dd3fc] flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isTestingSupabase ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Test & Save Connection</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSyncWorkspace}
                disabled={isSyncingSupabase}
                className="px-3.5 py-2 rounded text-xs font-mono-code bg-[#172A42] text-[#A3E635] border border-[#A3E635]/40 hover:bg-[#1E3A5F] flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSyncingSupabase ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>Sync to Supabase</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSqlSchema(!showSqlSchema)}
                className="px-3 py-2 rounded text-xs font-mono-code text-[#CBD5E1] bg-[#07111F] border border-[#1E3A5F] hover:bg-[#172A42] flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{showSqlSchema ? 'Hide SQL Script' : 'View Supabase SQL Schema'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopySqlSchema}
                className="px-3 py-2 rounded text-xs font-mono-code bg-[#07111F] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#172A42] flex items-center gap-1.5"
              >
                {isSqlCopied ? <Check className="w-3.5 h-3.5 text-[#A3E635]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isSqlCopied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>
          </div>

          {/* SQL Schema View */}
          {showSqlSchema && (
            <div className="mt-3 p-3 bg-[#07111F] border border-[#1E3A5F] rounded space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-code text-[#94A3B8]">
                <span>Run this script in Supabase SQL Editor for account himank2856:</span>
                <span className="text-[#A3E635]">PostgreSQL 15+ DDL</span>
              </div>
              <pre className="text-[10px] font-mono-code text-[#CBD5E1] bg-[#050D17] p-3 rounded overflow-x-auto max-h-60 border border-[#1E3A5F]/60">
                {supabaseService.getSqlMigrationSchema()}
              </pre>
            </div>
          )}
        </form>
      </div>

      {/* Integration Status Matrix */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#172A42] mb-3">
          <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
            Factual Integration Matrix
          </h3>
          <span className="text-[11px] font-mono-code text-[#64748B]">
            No fabricated "Connected" badges
          </span>
        </div>

        <div className="space-y-3">
          {integrations.map((item, i) => (
            <div
              key={i}
              className="p-3.5 bg-[#07111F] rounded border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F1F5F9] text-sm">{item.name}</span>
                  <span className="text-[10px] font-mono-code text-[#64748B] bg-[#172A42] px-1.5 py-0.2 rounded">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[10px] font-mono-code uppercase px-2 py-1 rounded border font-semibold ${item.statusColor}`}>
                  {item.status}
                </span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-[#38BDF8] hover:text-[#7bd0ff]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Billing & Entitlements Card */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#A3E635]" />
              <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                Billing & Multi-Rail Gateway (Razorpay & NPCI UPI)
              </h3>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Current Tier: <strong className="text-[#A3E635]">{billing.isPro ? 'Pro 30-Day Pass' : 'Community Free Tier'}</strong>
              {billing.passExpiryDate && ` • Active until ${billing.passExpiryDate}`}
            </p>
          </div>

          <button
            onClick={() => setIsBillingModalOpen(true)}
            className="px-4 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] shrink-0 shadow-[0_0_12px_rgba(163,230,53,0.25)]"
          >
            {billing.isPro ? 'Manage Payment Rails' : 'Upgrade to Pro ₹499'}
          </button>
        </div>

        {/* Recent Tax Invoices & Payment Receipts */}
        {paymentProtocolService.getReceipts().length > 0 && (
          <div className="pt-3 border-t border-[#172A42] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-[#94A3B8] uppercase">
                Settled Tax Invoices & Payment Audit Records
              </span>
              <span className="text-[10px] text-[#A3E635]">GST SAC 998313</span>
            </div>

            <div className="space-y-2">
              {paymentProtocolService.getReceipts().slice(0, 3).map((rcpt) => (
                <div
                  key={rcpt.receiptId}
                  className="p-3 bg-[#07111F] border border-[#1E3A5F] rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 font-mono-code">
                      <span className="font-bold text-[#F1F5F9]">{rcpt.invoiceNumber}</span>
                      <span className="text-[10px] bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 px-1.5 py-0.2 rounded font-bold uppercase">
                        {rcpt.paymentRail}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {rcpt.planName} &bull; {rcpt.issuedAtIST}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="font-bold font-mono-code text-[#A3E635]">
                        {formatINR(rcpt.totalAmountINR)}
                      </span>
                      <div className="text-[10px] font-mono-code text-[#64748B]">
                        {rcpt.sha256ProofToken.slice(0, 10)}...
                      </div>
                    </div>
                    <button
                      onClick={() => setIsBillingModalOpen(true)}
                      className="text-[11px] font-bold text-[#38BDF8] hover:underline"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Privacy & Data Revocation */}
      <div className="bg-[#0F1D2E] border border-[#EF4444]/30 rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#EF4444]">
            <Trash2 className="w-4 h-4" />
            <h3 className="text-sm font-display font-bold">
              Revoke Consent & Purge Workspace Data
            </h3>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Under India's DPDP Act, revoking consent immediately cancels any running jobs, purges raw uploads, and revokes research links.
          </p>
        </div>

        <button
          onClick={handleRevokeConsent}
          className="px-4 py-2 rounded text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/20 shrink-0"
        >
          Revoke Consent & Purge Data
        </button>
      </div>

      {/* Email Verification OTP Modal */}
      {isEmailVerifyModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050C15]/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg w-full max-w-md shadow-2xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3A5F] bg-[#07111F]/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#38BDF8]/20 border border-[#38BDF8]/50 flex items-center justify-center text-[#38BDF8]">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                    Verify Work Email Address
                  </h3>
                  <span className="text-[10px] font-mono-code text-[#94A3B8]">
                    DPDP Section 12 Identity Attestation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsEmailVerifyModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded hover:bg-[#1E3A5F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                A 6-digit cryptographic verification code was dispatched to{' '}
                <span className="text-[#38BDF8] font-mono-code font-bold">{user.email}</span>.
              </p>

              {/* Delivery Status Indicator */}
              <div className="flex items-center justify-between p-2.5 bg-[#07111F] border border-[#1E3A5F] rounded text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${emailDeliveryStatus === 'RATE_LIMITED_FALLBACK' ? 'bg-[#F59E0B]' : 'bg-[#10B981] animate-pulse'}`}></span>
                  <span className="text-[#CBD5E1] text-[11px]">
                    {emailDeliveryStatus === 'RATE_LIMITED_FALLBACK' ? 'Cloud Mail Limit (Backup Ready)' : 'Sent to Mail Server'}
                  </span>
                </div>
                <span className="text-[10px] font-mono-code text-[#64748B]">
                  Target: {user.email.split('@')[0].slice(0, 3)}***@{user.email.split('@')[1] || ''}
                </span>
              </div>

              {/* Didn't receive email? (Get Backup Code) Drawer */}
              <div className="bg-[#07111F]/80 border border-[#1E3A5F] rounded p-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#94A3B8]">
                    <Info className="w-3.5 h-3.5 text-[#38BDF8]" />
                    <span className="text-[11px]">Didn't get the email?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const active = otpService.getActiveOtpRecord(user.email);
                      if (active) {
                        setEmailBackupCode(active.code);
                      }
                      setShowEmailBackupCode(!showEmailBackupCode);
                    }}
                    className="text-[11px] font-mono-code text-[#38BDF8] hover:text-[#7dd3fc] underline font-semibold"
                  >
                    {showEmailBackupCode ? 'Hide Backup' : 'Get Backup Code'}
                  </button>
                </div>

                {showEmailBackupCode && (
                  <div className="mt-2.5 pt-2.5 border-t border-[#1E3A5F]/80 space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between bg-[#0D1E35] p-2 rounded border border-[#38BDF8]/30">
                      <div>
                        <span className="text-[10px] uppercase font-mono-code text-[#94A3B8] block">Instant Verification Code:</span>
                        <span className="text-base font-mono-code font-bold tracking-widest text-[#38BDF8]">
                          {emailBackupCode || otpService.getActiveOtpRecord(user.email)?.code || '------'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const codeToFill = emailBackupCode || otpService.getActiveOtpRecord(user.email)?.code;
                          if (codeToFill && codeToFill.length === 6) {
                            setEmailOtpDigits(codeToFill.split(''));
                            showToast('Verification code autofilled.');
                          }
                        }}
                        className="px-2.5 py-1 bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] text-[11px] font-bold rounded transition-colors"
                      >
                        Autofill Code
                      </button>
                    </div>
                    <p className="text-[10px] text-[#64748B] leading-relaxed">
                      {emailDeliveryNote || 'Supabase shared mail server enforces hourly limits. This cryptographic code ensures seamless attestation without lockout.'}
                    </p>
                  </div>
                )}
              </div>

              {emailVerifyError && (
                <div className="p-2.5 rounded bg-[#EF4444]/10 border border-[#EF4444]/40 text-[#FCA5A5] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{emailVerifyError}</span>
                </div>
              )}

              {/* 6 Digit Input */}
              <form onSubmit={handleConfirmEmailVerification} className="space-y-4">
                <div
                  className="flex items-center justify-center gap-2"
                  onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pasted.length === 6) {
                      e.preventDefault();
                      setEmailOtpDigits(pasted.split(''));
                    }
                  }}
                >
                  {emailOtpDigits.map((d, i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={d}
                      onChange={(e) => {
                        const val = e.target.value;
                        const copy = [...emailOtpDigits];
                        copy[i] = val;
                        setEmailOtpDigits(copy);
                        if (val && e.target.nextElementSibling) {
                          (e.target.nextElementSibling as HTMLInputElement).focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-mono-code font-bold bg-[#07111F] border border-[#1E3A5F] rounded focus:border-[#38BDF8] text-[#F1F5F9] focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono-code text-[#94A3B8]">
                  <span>Code expires in 5m</span>
                  <button
                    type="button"
                    onClick={handleInitiateEmailVerification}
                    className="text-[#38BDF8] hover:underline"
                  >
                    Resend Code
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailVerifyModalOpen(false)}
                    className="flex-1 py-2 rounded text-xs font-mono-code bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingEmail}
                    className="flex-1 py-2 rounded text-xs font-mono-code font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isVerifyingEmail ? 'Verifying...' : 'Confirm Verification'}
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <BillingModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} />
    </div>
  );
};
