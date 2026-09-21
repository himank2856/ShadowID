/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Deterministic Shadow Score & Explainable Breakdown
 * Adheres strictly to Prompt 13 specifications.
 */

import React from 'react';
import { ShadowScoreCalculation } from '../types.ts';
import { ShieldAlert, ShieldCheck, AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ShadowScoreProps {
  scoreData: ShadowScoreCalculation;
  compact?: boolean;
}

export const ShadowScore: React.FC<ShadowScoreProps> = ({ scoreData, compact = false }) => {
  const { score, coverage, isProvisional, provisionalReason, severityBand, componentScores, contributions, inputSnapshotHash } = scoreData;

  const getBadgeStyle = () => {
    switch (severityBand) {
      case 'high':
        return {
          bg: 'bg-[#EF4444]/15',
          border: 'border-[#EF4444]',
          text: 'text-[#EF4444]',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]',
          label: 'High Exposure Risk',
        };
      case 'elevated':
        return {
          bg: 'bg-[#F59E0B]/15',
          border: 'border-[#F59E0B]',
          text: 'text-[#F59E0B]',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          label: 'Elevated Risk',
        };
      case 'moderate':
        return {
          bg: 'bg-[#38BDF8]/15',
          border: 'border-[#38BDF8]',
          text: 'text-[#38BDF8]',
          glow: 'shadow-[0_0_15px_rgba(56,189,248,0.2)]',
          label: 'Moderate Risk',
        };
      default:
        return {
          bg: 'bg-[#A3E635]/15',
          border: 'border-[#A3E635]',
          text: 'text-[#A3E635]',
          glow: 'shadow-[0_0_15px_rgba(163,230,53,0.2)]',
          label: 'Lower Observed Risk',
        };
    }
  };

  const badge = getBadgeStyle();

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded font-display font-bold text-base border ${badge.border} ${badge.bg} ${badge.text}`}
        >
          {score !== null ? score : '—'}
        </span>
        <div className="text-xs">
          <div className="font-medium text-[#F1F5F9] leading-tight">
            {score !== null ? badge.label : 'Insufficient Evidence'}
          </div>
          <div className="text-[#94A3B8] font-mono-code text-[11px]">
            {coverage}% coverage {isProvisional && '• Provisional'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-mono-code text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded-sm border border-[#38BDF8]/20">
              Deterministic Engine v1.4
            </span>
            {isProvisional && (
              <span className="text-xs uppercase tracking-wider font-mono-code text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-sm border border-[#F59E0B]/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Provisional Assessment
              </span>
            )}
          </div>
          <h2 className="text-xl font-display font-bold text-[#F1F5F9] mt-1">
            Shadow Score Index
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-md mt-0.5">
            Mathematical synthesis of exposure depth, cross-network linkage, identity mimicry, and document anomalies.
          </p>
        </div>

        {/* Big Score Gauge */}
        <div className="text-right">
          <div
            className={`inline-flex items-center justify-center px-4 py-2 rounded border font-display font-bold text-3xl ${badge.border} ${badge.bg} ${badge.text} ${badge.glow}`}
          >
            {score !== null ? score : 'N/A'}
            <span className="text-xs text-[#94A3B8] font-sans font-normal ml-1">/100</span>
          </div>
          <div className={`text-xs font-medium mt-1 font-mono-code ${badge.text}`}>
            {score !== null ? badge.label : 'Insufficient Evidence'}
          </div>
        </div>
      </div>

      {/* Provisional Explanation Banner if partial coverage */}
      {isProvisional && provisionalReason && (
        <div className="mt-3 p-2.5 bg-[#172A42]/60 border border-[#F59E0B]/30 rounded text-xs text-[#F59E0B] flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Provisional Score Notice: </span>
            {provisionalReason} Unassessed modules are excluded from the denominator rather than counted as zero risk.
          </div>
        </div>
      )}

      {/* Component Breakdown Table */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Exposure */}
        <div className="bg-[#07111F] p-3 rounded border border-[#1E3A5F]/80">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Exposure Depth</span>
            <span className="font-mono-code text-[#A3E635]">35% wt</span>
          </div>
          <div className="text-lg font-display font-semibold text-[#F1F5F9] mt-1">
            {componentScores.exposure !== null ? `${componentScores.exposure}/100` : 'Not Assessed'}
          </div>
          <div className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
            Contribution: +{contributions.exposure} pts
          </div>
        </div>

        {/* Connectability */}
        <div className="bg-[#07111F] p-3 rounded border border-[#1E3A5F]/80">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Cross-Linkage</span>
            <span className="font-mono-code text-[#38BDF8]">25% wt</span>
          </div>
          <div className="text-lg font-display font-semibold text-[#F1F5F9] mt-1">
            {componentScores.connectability !== null ? `${componentScores.connectability}/100` : 'Not Assessed'}
          </div>
          <div className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
            Contribution: +{contributions.connectability} pts
          </div>
        </div>

        {/* Impersonation */}
        <div className="bg-[#07111F] p-3 rounded border border-[#1E3A5F]/80">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Impersonation</span>
            <span className="font-mono-code text-[#F59E0B]">25% wt</span>
          </div>
          <div className="text-lg font-display font-semibold text-[#F1F5F9] mt-1">
            {componentScores.impersonation !== null ? `${componentScores.impersonation}/100` : 'Not Assessed'}
          </div>
          <div className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
            Contribution: +{contributions.impersonation} pts
          </div>
        </div>

        {/* Document Anomaly */}
        <div className="bg-[#07111F] p-3 rounded border border-[#1E3A5F]/80">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Document Anomaly</span>
            <span className="font-mono-code text-[#EF4444]">15% wt</span>
          </div>
          <div className="text-lg font-display font-semibold text-[#F1F5F9] mt-1">
            {componentScores.documentAnomaly !== null ? `${componentScores.documentAnomaly}/100` : 'Not Assessed'}
          </div>
          <div className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
            Contribution: +{contributions.documentAnomaly} pts
          </div>
        </div>
      </div>

      {/* Coverage Progress Bar & Audit Snapshot */}
      <div className="mt-4 pt-3 border-t border-[#172A42] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-[#94A3B8]">Assessment Coverage:</span>
          <div className="w-32 bg-[#07111F] rounded-full h-2 overflow-hidden border border-[#1E3A5F]">
            <div
              className={`h-full ${coverage === 100 ? 'bg-[#A3E635]' : 'bg-[#F59E0B]'}`}
              style={{ width: `${coverage}%` }}
            />
          </div>
          <span className="font-mono-code font-bold text-[#F1F5F9]">{coverage}%</span>
        </div>

        <div className="flex items-center gap-2 text-[#64748B] font-mono-code text-[11px]">
          <span>Snapshot Hash:</span>
          <span className="bg-[#07111F] px-1.5 py-0.5 rounded border border-[#1E3A5F] text-[#38BDF8]">
            {inputSnapshotHash}
          </span>
        </div>
      </div>
    </div>
  );
};
