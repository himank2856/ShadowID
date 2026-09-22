/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - iNSIGHTS Manual Research Page
 * Compliant with Prompt 14
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ResearchBridge } from '../../components/ResearchBridge.tsx';
import { Search, ExternalLink, ShieldCheck, FileCheck, Info } from 'lucide-react';

import { EmptyInvestigationState } from '../../components/EmptyInvestigationState.tsx';

export const ResearchPage: React.FC = () => {
  const { activeScan } = useApp();

  if (!activeScan) {
    return <EmptyInvestigationState moduleName="Reviewed Deep Search Intelligence" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#38BDF8] uppercase mb-1">
          <Search className="w-4 h-4" />
          <span>Auxiliary: iNSIGHTS Research Bridge</span>
        </div>
        <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
          Reviewed Deep Search & Threat Intelligence
        </h1>
        <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
          Bridges user investigations with external OSINT guidance using a manual import and attestation loop. Unreviewed claims never contaminate the deterministic Shadow Score.
        </p>
      </div>

      {/* Research Bridge Component */}
      <ResearchBridge claims={activeScan.researchClaims || []} />
    </div>
  );
};
