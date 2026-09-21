/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Interactive Synthetic Demo Hub
 * Compliant with Prompt 2, 8, & 18
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { SYNTHETIC_CASES } from '../data/syntheticDatasets.ts';
import { ShadowScore } from '../components/ShadowScore.tsx';
import { EvidenceGraph } from '../components/EvidenceGraph.tsx';
import { ProfileComparison } from '../components/ProfileComparison.tsx';
import { DocumentDefenseViewer } from '../components/DocumentDefenseViewer.tsx';
import { ResearchBridge } from '../components/ResearchBridge.tsx';
import { ActionChecklist } from '../components/ActionChecklist.tsx';
import { Shield, Sparkles, ArrowRight, Play, Eye, Users, FileText, CheckCircle2 } from 'lucide-react';

export const DemoPage: React.FC = () => {
  const { scans, activeScanId, setActiveScanId, activeScan, navigate } = useApp();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-[#0F1D2E] border-2 border-[#38BDF8] rounded p-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] animate-ping" />
              <span className="text-xs font-mono-code uppercase text-[#38BDF8] tracking-wider">
                Isolated Synthetic Sandbox Mode
              </span>
            </div>
            <h1 className="text-2xl font-display font-bold text-[#F1F5F9] mt-1">
              3-Minute Proof-of-Concept Interactive Tour
            </h1>
            <p className="text-xs text-[#CBD5E1] max-w-2xl mt-1">
              Explore how the deterministic engine evaluates exposure, identifies impersonation mimicry, and detects document typography anomalies using 6 repeatable Indian test cases.
            </p>
          </div>

          <button
            onClick={() => navigate('/app/overview')}
            className="px-5 py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-2 shrink-0 shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all"
          >
            Launch Full Console <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Case Switcher */}
      <div>
        <div className="text-xs font-mono-code uppercase text-[#94A3B8] mb-2 flex items-center justify-between">
          <span>Select Test Dataset (Prompt 8 Specifications)</span>
          <span className="text-[#38BDF8]">{Object.keys(SYNTHETIC_CASES).length} Verified Fixtures</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {Object.entries(scans).map(([key, item]) => {
            const isSelected = activeScanId === key;
            return (
              <button
                key={key}
                onClick={() => setActiveScanId(key)}
                className={`p-2.5 rounded border text-left transition-all ${
                  isSelected
                    ? 'bg-[#172A42] border-[#A3E635] text-[#F1F5F9] shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                    : 'bg-[#0F1D2E] border-[#1E3A5F] text-[#94A3B8] hover:border-[#38BDF8]/40'
                }`}
              >
                <div className="text-xs font-bold text-[#F1F5F9] truncate">
                  {item.subject.name}
                </div>
                <div className="text-[10px] font-mono-code text-[#38BDF8] truncate">
                  {item.subject.city}
                </div>
                <div className="text-[10px] font-mono-code text-[#A3E635] mt-1">
                  Score: {item.scoreData.score !== null ? item.scoreData.score : 'N/A'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Module Previews for Selected Subject */}
      <div className="space-y-6">
        {/* Active Shadow Score */}
        <ShadowScore scoreData={activeScan.scoreData} />

        {/* Evidence Graph */}
        <EvidenceGraph
          nodes={activeScan.evidenceGraph.nodes}
          edges={activeScan.evidenceGraph.edges}
        />

        {/* Impersonation Comparator */}
        {activeScan.profileComparison && (
          <ProfileComparison data={activeScan.profileComparison} />
        )}

        {/* Document Defense */}
        {activeScan.documentAnalysis && (
          <DocumentDefenseViewer data={activeScan.documentAnalysis} />
        )}

        {/* iNSIGHTS Research Bridge */}
        {activeScan.researchClaims && (
          <ResearchBridge claims={activeScan.researchClaims} />
        )}

        {/* Action Checklist */}
        <ActionChecklist actions={activeScan.actions} />
      </div>
    </div>
  );
};
