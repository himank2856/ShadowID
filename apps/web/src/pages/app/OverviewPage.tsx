/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - App Overview Dashboard
 * Compliant with Prompt 4 & Prompt 13
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ShadowScore } from '../../components/ShadowScore.tsx';
import { EvidenceGraph } from '../../components/EvidenceGraph.tsx';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  FileText,
  Users,
  Eye,
  Scan,
  Database,
  BarChart3,
  Sparkles,
  FileCheck2,
  Cpu,
  ArrowUpRight,
  Search,
} from 'lucide-react';
import { formatISTDateTime } from '../../utils/formatters.ts';

export const OverviewPage: React.FC = () => {
  const { activeScan, navigate } = useApp();

  if (!activeScan) {
    return (
      <div className="space-y-6">
        {/* Executive Welcome & Command Center */}
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg p-6 sm:p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono-code text-[#A3E635] uppercase">
                <Shield className="w-4 h-4" />
                <span>Executive Command Console &bull; DPDP Act 2023 Compliant</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-[#F1F5F9]">
                ShadowID Digital Identity Defense Suite
              </h1>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                National cybersecurity benchmark workspace. Cross-checks candidate profiles against 25,000+ indexed records in{' '}
                <span className="text-[#38BDF8] font-mono-code">fake_users.csv</span>,{' '}
                <span className="text-[#A3E635] font-mono-code">real_users.csv</span>, and{' '}
                <span className="text-[#F59E0B] font-mono-code">synthetic_social_media_engagement.csv</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/app/scans/new')}
                className="w-full sm:w-auto px-5 py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all"
              >
                <Scan className="w-4 h-4" />
                Start New Assessment
              </button>
              <button
                onClick={() => navigate('/app/verification')}
                className="w-full sm:w-auto px-5 py-2.5 rounded text-xs font-semibold bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center justify-center gap-2 transition-all"
              >
                <Database className="w-4 h-4" />
                Live Project Data Verifier
              </button>
            </div>
          </div>
        </div>

        {/* Quick Launch Intelligence Modules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/app/verification')}
            className="p-5 bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#38BDF8]/50 rounded-lg cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                <Database className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#38BDF8] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                Live Dataset Verifier
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Cross-match any handle or name with 25,000+ indexed records and calculate ML bot scores.
              </p>
            </div>
            <span className="text-[10px] font-mono-code text-[#38BDF8]">fake_users.csv & real_users.csv &rarr;</span>
          </div>

          <div
            onClick={() => navigate('/app/verification')}
            className="p-5 bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#A3E635]/50 rounded-lg cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#A3E635] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                Graphical Analytics Suite
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Explore Followers vs Friends scatter plots, bot probability histograms, and 24h burst curves.
              </p>
            </div>
            <span className="text-[10px] font-mono-code text-[#A3E635]">Interactive Visual Charts &rarr;</span>
          </div>

          <div
            onClick={() => navigate('/app/impersonation')}
            className="p-5 bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#EF4444]/50 rounded-lg cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                <Users className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#EF4444] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                Visual Impersonation & Typo-Squatting
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Visual character diff, homoglyph detection, and 1-click Section 66D IT Act takedown letters.
              </p>
            </div>
            <span className="text-[10px] font-mono-code text-[#EF4444]">Homoglyph Diff & Takedowns &rarr;</span>
          </div>

          <div
            onClick={() => navigate('/app/research')}
            className="p-5 bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#F59E0B]/50 rounded-lg cursor-pointer transition-all space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
                <Search className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-[#F59E0B] transition-colors" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                OSINT Threat Console
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Multi-vector threat intelligence covering WHOIS domain age, botnet topology, and Indian cyber law.
              </p>
            </div>
            <span className="text-[10px] font-mono-code text-[#F59E0B]">Multi-Vector Dossiers &rarr;</span>
          </div>
        </div>
      </div>
    );
  }

  const totalFindings = activeScan.findings.length;
  const criticalFindings = activeScan.findings.filter((f) => f.severity === 'high').length;
  const pendingActions = activeScan.actions.filter((a) => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Subject Header & Quick Actions */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code uppercase text-[#38BDF8] bg-[#172A42] px-2 py-0.5 rounded border border-[#38BDF8]/30">
              Active Investigation
            </span>
            <span className="text-xs font-mono-code text-[#A3E635]">
              Queued: {formatISTDateTime(activeScan.queuedAt)}
            </span>
          </div>

          <h1 className="text-xl font-display font-bold text-[#F1F5F9] mt-1">
            {activeScan.subject.name}
          </h1>
          <div className="text-xs text-[#94A3B8] font-mono-code mt-0.5">
            Territory: {activeScan.subject.city}, {activeScan.subject.state} • Handle: {activeScan.subject.primaryHandle || 'N/A'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/app/scans/new')}
            className="px-4 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all"
          >
            <Scan className="w-3.5 h-3.5" />
            New Assessment
          </button>
          <button
            onClick={() => navigate('/app/reports')}
            className="px-3.5 py-2 rounded text-xs font-semibold bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F]"
          >
            Export Dossier
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-3.5">
          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Critical Findings</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#EF4444] mt-1">
            {criticalFindings}
          </div>
          <div className="text-[10px] font-mono-code text-[#64748B] mt-0.5">
            of {totalFindings} total items
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-3.5">
          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Pending Actions</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#F59E0B] mt-1">
            {pendingActions}
          </div>
          <div className="text-[10px] font-mono-code text-[#64748B] mt-0.5">
            requiring remediation
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-3.5">
          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Active Modules</span>
            <Eye className="w-3.5 h-3.5 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#38BDF8] mt-1">
            {activeScan.selectedModules.length}
          </div>
          <div className="text-[10px] font-mono-code text-[#64748B] mt-0.5">
            of 4 available
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-3.5">
          <div className="text-[11px] text-[#94A3B8] flex items-center justify-between">
            <span>Assessment Coverage</span>
            <Shield className="w-3.5 h-3.5 text-[#A3E635]" />
          </div>
          <div className="text-2xl font-display font-bold text-[#A3E635] mt-1">
            {activeScan.scoreData.coverage}%
          </div>
          <div className="text-[10px] font-mono-code text-[#64748B] mt-0.5">
            {activeScan.scoreData.isProvisional ? 'Provisional' : 'Complete'}
          </div>
        </div>
      </div>

      {/* Shadow Score Main Widget */}
      <ShadowScore scoreData={activeScan.scoreData} />

      {/* Evidence Correlation Graph */}
      <EvidenceGraph
        nodes={activeScan.evidenceGraph.nodes}
        edges={activeScan.evidenceGraph.edges}
      />

      {/* Key Findings Preview */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#172A42] mb-3">
          <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
            Active Forensic Findings ({activeScan.findings.length})
          </h3>
          <button
            onClick={() => navigate('/app/actions')}
            className="text-xs font-mono-code text-[#38BDF8] hover:underline flex items-center gap-1"
          >
            View remediation actions <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {activeScan.findings.map((fnd) => (
            <div
              key={fnd.id}
              className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] flex flex-col sm:flex-row sm:items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono-code uppercase px-1.5 py-0.2 rounded border ${
                      fnd.severity === 'high'
                        ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]'
                        : 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]'
                    }`}
                  >
                    {fnd.severity}
                  </span>
                  <span className="text-[10px] font-mono-code text-[#38BDF8]">
                    Rule: {fnd.ruleId}
                  </span>
                </div>
                <h4 className="text-xs font-display font-bold text-[#F1F5F9]">
                  {fnd.title}
                </h4>
                <p className="text-xs text-[#CBD5E1] leading-relaxed">
                  {fnd.description}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-mono-code text-[#EF4444] font-bold">
                  +{fnd.scoreImpact} Risk Pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
