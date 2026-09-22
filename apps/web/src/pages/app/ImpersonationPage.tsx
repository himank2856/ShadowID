/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Impersonation Intelligence Page
 * Compliant with Prompt 11
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ProfileComparison } from '../../components/ProfileComparison.tsx';
import { Users, AlertTriangle, ShieldCheck, Mail, Flag, Copy } from 'lucide-react';

import { EmptyInvestigationState } from '../../components/EmptyInvestigationState.tsx';

export const ImpersonationPage: React.FC = () => {
  const { activeScan, showToast } = useApp();

  if (!activeScan) {
    return <EmptyInvestigationState moduleName="Impersonation Intelligence" />;
  }

  const handleCopyNotice = () => {
    const text = `FORMAL PLATFORM IMPERSONATION NOTICE
Subject Reference: ${activeScan.subject.name} (${activeScan.subject.primaryHandle || 'N/A'})
Reported Handle: ${activeScan.profileComparison?.candidateProfile.handle || 'Candidate'}
Platform: ${activeScan.profileComparison?.candidateProfile.platform || 'Public Platform'}
Grounds: Intentional identity mimicry, avatar asset duplication, and conflicting contact details.
Authority: Issued under IT Rules (Intermediary Guidelines and Digital Media Ethics Code).`;
    navigator.clipboard.writeText(text);
    showToast('Formal platform impersonation takedown template copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#A3E635] uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Module 02: Impersonation Intelligence</span>
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Identity Mimicry & Profile Comparator
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Calculates token overlap, handle edit distances, and perceptual image hash similarity without universal facial recognition.
          </p>
        </div>

        <button
          onClick={handleCopyNotice}
          className="px-3.5 py-2 rounded text-xs font-semibold bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center gap-1.5 shrink-0"
        >
          <Copy className="w-3.5 h-3.5" />
          Copy Takedown Template
        </button>
      </div>

      {/* Main Comparator Component */}
      {activeScan.profileComparison ? (
        <ProfileComparison data={activeScan.profileComparison} />
      ) : (
        <div className="p-8 bg-[#0F1D2E] border border-[#1E3A5F] rounded text-center text-xs text-[#94A3B8]">
          No candidate profile currently submitted for this subject. Use "New Assessment" to attach candidate links.
        </div>
      )}
    </div>
  );
};
