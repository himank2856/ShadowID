/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Public Landing Page
 * Compliant with Prompt 4
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Shield, Eye, Users, FileText, Search, ArrowRight, CheckCircle2, Lock, Terminal, Sparkles } from 'lucide-react';
import { ShadowScore } from '../components/ShadowScore.tsx';

export const LandingPage: React.FC = () => {
  const { navigate, activeScan, t } = useApp();

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative px-4 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172A42] border border-[#38BDF8]/40 text-xs font-mono-code text-[#38BDF8]">
          <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-ping" />
          Build With Bharat 3.0 • Chitkara University, Himachal Pradesh
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#F1F5F9] tracking-tight leading-tight">
          See what your digital identity reveals.
        </h1>

        <p className="text-base sm:text-lg text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Understand public exposure, compare suspicious profiles and review document anomalies in one evidence-led workspace.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/demo')}
            className="w-full sm:w-auto px-6 py-3 rounded text-sm font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all"
          >
            Explore synthetic demo <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/app/scans/new')}
            className="w-full sm:w-auto px-6 py-3 rounded text-sm font-semibold bg-[#0F1D2E] text-[#38BDF8] border border-[#38BDF8]/60 hover:bg-[#172A42] flex items-center justify-center gap-2 transition-all"
          >
            Start your assessment
          </button>
        </div>

        {/* Live Preview Teaser Card */}
        <div className="pt-8 max-w-3xl mx-auto">
          <ShadowScore scoreData={activeScan.scoreData} />
        </div>
      </section>

      {/* Core Intelligence Pillars */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono-code uppercase text-[#38BDF8] tracking-wider">
            Evidence-Led Architecture
          </span>
          <h2 className="text-2xl font-display font-bold text-[#F1F5F9] mt-1">
            Three Core Modules + Reviewed Research
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Engineered for India's digital ecosystem with strict consent safeguards and zero reliance on paid web scraping.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 relative">
            <div className="w-10 h-10 rounded bg-[#07111F] border border-[#38BDF8] flex items-center justify-center text-[#38BDF8] mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-[#F1F5F9] mb-1">
              Exposure Intelligence
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Examines authorized supplied evidence across social handles, public repositories, and telecom leaks. Visualizes multi-vector correlation graphs without third-party surveillance.
            </p>
            <div className="text-[11px] font-mono-code text-[#A3E635]">
              Weight in Shadow Score: 35%
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 relative">
            <div className="w-10 h-10 rounded bg-[#07111F] border border-[#A3E635] flex items-center justify-center text-[#A3E635] mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-[#F1F5F9] mb-1">
              Impersonation Intelligence
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Compares a known reference profile with suspicious candidate profiles. Evaluates bio n-gram overlap, handle edit distance, and perceptual avatar hash similarity.
            </p>
            <div className="text-[11px] font-mono-code text-[#38BDF8]">
              Weight in Shadow Score: 25%
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 relative">
            <div className="w-10 h-10 rounded bg-[#07111F] border border-[#EF4444] flex items-center justify-center text-[#EF4444] mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-display font-bold text-[#F1F5F9] mb-1">
              Document Defense
            </h3>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-4">
              Tesseract eng/hin OCR with OpenCV morphological validation. Identifies typography anomalies, impossible dates, and low-DPI glare without claiming official issuer certification.
            </p>
            <div className="text-[11px] font-mono-code text-[#EF4444]">
              Weight in Shadow Score: 15%
            </div>
          </div>
        </div>
      </section>

      {/* Trust & DPDP Act Safeguards */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 flex flex-col sm:flex-row items-start gap-5">
          <div className="w-12 h-12 rounded bg-[#172A42] border border-[#A3E635] flex items-center justify-center text-[#A3E635] shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Built for India with Strict Consent & Privacy Boundaries
            </h3>
            <p className="text-xs text-[#CBD5E1] mt-1 leading-relaxed">
              ShadowID operates strictly on consented, user-supplied evidence. We do not crawl private chats, harvest unauthorized databases, or bypass privacy settings. Raw document images automatically expire within 24 hours under our automated quarantine retention policy.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono-code text-[#38BDF8]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" /> 24h Document Auto-Purge
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" /> No Paid Web-Search APIs Required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#A3E635]" /> Deterministic Audit Trail
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
