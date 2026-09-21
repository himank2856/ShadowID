/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Privacy Policy & Terms of Service (DPDP Act 2023 Principles)
 */

import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyTermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-[#1E3A5F] pb-4">
        <h1 className="text-2xl font-display font-bold text-[#F1F5F9]">
          Privacy Policy & Terms of Service
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1 font-mono-code">
          Governed by India Digital Personal Data Protection (DPDP) Act 2023 Principles • Version 1.4
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#CBD5E1] leading-relaxed">
        {/* Section 1 */}
        <section className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-2">
          <h2 className="text-sm font-display font-bold text-[#F1F5F9] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#A3E635]" />
            1. Lawful Basis & Consent-First Operating Model
          </h2>
          <p>
            ShadowID is engineered exclusively for authorized security self-assessments, defensive investigations, and vulnerability exposure management. It strictly forbids unsolicited surveillance, harassment, doxxing, or mass data scraping of individuals without lawful authority.
          </p>
          <p>
            A consent record is immutably generated for every scan, capturing the assessment purpose, subject identity, permitted module boundaries, and expiration TTL.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-2">
          <h2 className="text-sm font-display font-bold text-[#F1F5F9] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#38BDF8]" />
            2. Data Retention & Automatic Quarantine Cleanup
          </h2>
          <p>
            We adhere to strict data minimization and temporal hygiene:
          </p>
          <ul className="list-disc list-inside space-y-1 text-[#94A3B8] pl-2 font-mono-code text-[11px]">
            <li><strong className="text-[#F1F5F9]">Raw Document Images:</strong> Automatically deleted 24 hours after OCR processing.</li>
            <li><strong className="text-[#F1F5F9]">Derived OCR Artifacts & Bounding Boxes:</strong> Retained for 30 days under encrypted tenant isolation.</li>
            <li><strong className="text-[#F1F5F9]">Immediate Revocation:</strong> Users can revoke consent at any time, immediately purging active jobs and scheduled monitoring.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-2">
          <h2 className="text-sm font-display font-bold text-[#F1F5F9] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            3. Disclaimer on Document Verification
          </h2>
          <p>
            The Document Defense module performs visual and morphological checks (typography, font alignment, optical glare, impossible date sequences) using local Tesseract eng/hin and OpenCV algorithms.
          </p>
          <p className="text-[#F59E0B]">
            Notice: ShadowID does NOT connect to official UIDAI or Income Tax Department backend databases and makes no legal claim of official authenticity or issuer certification.
          </p>
        </section>
      </div>
    </div>
  );
};
