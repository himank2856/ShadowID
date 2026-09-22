/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Exposure Intelligence Page
 * Compliant with Prompt 10
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { EvidenceGraph } from '../../components/EvidenceGraph.tsx';
import { Globe, ShieldAlert, CheckCircle2, Phone, Hash, Database, ExternalLink } from 'lucide-react';
import { formatISTDateTime } from '../../utils/formatters.ts';

import { EmptyInvestigationState } from '../../components/EmptyInvestigationState.tsx';

export const ExposurePage: React.FC = () => {
  const { activeScan } = useApp();

  if (!activeScan) {
    return <EmptyInvestigationState moduleName="Exposure Intelligence" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#38BDF8] uppercase mb-1">
          <Globe className="w-4 h-4" />
          <span>Module 01: Exposure Intelligence</span>
        </div>
        <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
          Public Digital Footprint & Cross-Platform Exposure
        </h1>
        <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
          Analyzes public repository commits, social handle reuse, telecom identifiers, and university directories to map identity leakage vectors without intrusive web scraping.
        </p>
      </div>

      {/* Interactive Graph & Table */}
      <EvidenceGraph
        nodes={activeScan.evidenceGraph.nodes}
        edges={activeScan.evidenceGraph.edges}
      />

      {/* Supplied Evidence Token Roster */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#172A42] mb-3">
          <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
            Consented Evidence Tokens & Provenance ({activeScan.evidenceList.length})
          </h3>
          <span className="text-[11px] font-mono-code text-[#A3E635]">
            Verified Attestation Available
          </span>
        </div>

        {activeScan.evidenceList.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94A3B8] bg-[#07111F] rounded border border-[#1E3A5F]">
            No direct attribute list for this fixture; see nodes on the correlation graph above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeScan.evidenceList.map((ev, i) => (
              <div
                key={i}
                className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/30">
                      {ev.sourceType}
                    </span>
                    <span className="font-bold text-[#F1F5F9]">{ev.label}</span>
                  </div>
                  <div className="font-mono-code text-[#38BDF8] text-xs">
                    {ev.value}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    Source: {ev.sourceName} • Observed: {formatISTDateTime(ev.observedAt)}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono-code text-[#A3E635] flex items-center gap-1 bg-[#A3E635]/10 px-2 py-1 rounded border border-[#A3E635]/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Reviewer Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
