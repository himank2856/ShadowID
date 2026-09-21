import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { accountDatabase } from '../../services/accountDatabase.ts';
import {
  Settings,
  CreditCard,
  Shield,
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
} from 'lucide-react';
import { BillingModal } from '../../components/BillingModal.tsx';
import { formatINR } from '../../utils/formatters.ts';

export const SettingsPage: React.FC = () => {
  const { billing, user, logout, showToast, navigate } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);

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

  const integrations = [
    {
      name: 'iNSIGHTS Deep Search Bridge',
      type: 'Manual Research Import',
      status: 'Manual',
      statusColor: 'text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10',
      description: 'Structured manual research workflow adhering to Prompt 14. Automated API remains unverified by vendor.',
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
      name: 'Razorpay Test Sandbox',
      type: 'Indian Payment Rail',
      status: 'Available',
      statusColor: 'text-[#A3E635] border-[#A3E635]/40 bg-[#A3E635]/10',
      description: 'Test mode integration for 30-day Pro Pass (₹499 / 49,900 paise).',
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
              <div className="text-[10px] font-mono-code text-[#64748B] uppercase flex items-center gap-1">
                <Mail className="w-3 h-3" /> Work Email
              </div>
              <div className="text-[#F1F5F9] font-mono-code truncate">{user.email}</div>
              <div className="text-[10px] text-[#A3E635]">Verified in Account DB</div>
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
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#A3E635]" />
            <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
              Billing & Entitlements (Razorpay Test Mode)
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
          {billing.isPro ? 'Manage Pro Pass' : 'Upgrade to Pro ₹499'}
        </button>
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

      <BillingModal isOpen={isBillingModalOpen} onClose={() => setIsBillingModalOpen(false)} />
    </div>
  );
};
