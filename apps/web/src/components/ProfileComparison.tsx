/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Impersonation Intelligence Profile Comparator
 * Compliant with Prompt 11
 */

import React from 'react';
import { ProfileComparisonData } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { Users, AlertTriangle, ShieldCheck, Flag, CheckCircle, ExternalLink, Hash } from 'lucide-react';

interface ProfileComparisonProps {
  data: ProfileComparisonData;
}

export const ProfileComparison: React.FC<ProfileComparisonProps> = ({ data }) => {
  const { updateProfileDecision } = useApp();
  const { referenceSubject, candidateProfile, metrics, contradictions, verdict, verdictNotes, reviewerDecision } = data;

  const getVerdictBadge = () => {
    switch (verdict) {
      case 'Needs review':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]';
      case 'Similarities found':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]';
      case 'Limited overlap':
        return 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]';
      default:
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]';
    }
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A3E635]" />
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Side-by-Side Impersonation Comparator
            </h3>
            <span className={`text-xs font-mono-code px-2 py-0.5 rounded border ${getVerdictBadge()}`}>
              Verdict: {verdict}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Analyzes name tokens, handle edit distances, bio overlap sequences, and perceptual avatar hashes.
          </p>
        </div>

        {/* Action Controls for Analyst */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateProfileDecision('flag_for_takedown')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              reviewerDecision === 'flag_for_takedown'
                ? 'bg-[#EF4444] text-[#07111F] font-bold'
                : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Flag for Takedown
          </button>
          <button
            onClick={() => updateProfileDecision('dismiss')}
            className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              reviewerDecision === 'dismiss'
                ? 'bg-[#A3E635] text-[#07111F] font-bold'
                : 'bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1E3A5F]'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Dismiss (Namesake)
          </button>
        </div>
      </div>

      {/* Side-by-Side Columns */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Reference Profile */}
        <div className="bg-[#07111F] border border-[#1E3A5F] rounded p-4 relative">
          <div className="absolute top-3 right-3 text-[10px] font-mono-code text-[#A3E635] bg-[#A3E635]/10 px-2 py-0.5 rounded border border-[#A3E635]/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Authorized Reference
          </div>

          <div className="flex items-center gap-3">
            <img
              src={referenceSubject.avatarUrl}
              alt="Reference Avatar"
              className="w-14 h-14 rounded border-2 border-[#A3E635] object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-base font-display font-bold text-[#F1F5F9]">
                {referenceSubject.name}
              </h4>
              <div className="text-xs font-mono-code text-[#38BDF8]">
                {referenceSubject.handle}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                {referenceSubject.city} • {referenceSubject.institution}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#0F1D2E] rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] leading-relaxed">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase mb-1">
              Supplied Bio Reference
            </div>
            "{referenceSubject.bio}"
          </div>

          <div className="mt-3 text-[10px] font-mono-code text-[#64748B] flex items-center gap-1">
            <Hash className="w-3 h-3 text-[#38BDF8]" />
            Avatar Perceptual Hash: <span className="text-[#CBD5E1]">{referenceSubject.avatarHash}</span>
          </div>
        </div>

        {/* Candidate Profile */}
        <div className="bg-[#07111F] border border-[#1E3A5F] rounded p-4 relative">
          <div className="absolute top-3 right-3 text-[10px] font-mono-code text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Candidate Investigation
          </div>

          <div className="flex items-center gap-3">
            <img
              src={candidateProfile.avatarUrl}
              alt="Candidate Avatar"
              className="w-14 h-14 rounded border-2 border-[#EF4444] object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <h4 className="text-base font-display font-bold text-[#F1F5F9]">
                {candidateProfile.name}
              </h4>
              <div className="text-xs font-mono-code text-[#EF4444]">
                {candidateProfile.handle}
              </div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">
                {candidateProfile.location} • {candidateProfile.platform}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#0F1D2E] rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] leading-relaxed">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase mb-1">
              Candidate Observed Bio
            </div>
            "{candidateProfile.bio}"
          </div>

          <div className="mt-3 text-[10px] font-mono-code text-[#64748B] flex items-center gap-1">
            <Hash className="w-3 h-3 text-[#EF4444]" />
            Avatar Perceptual Hash: <span className="text-[#CBD5E1]">{candidateProfile.avatarHash}</span>
          </div>
        </div>
      </div>

      {/* Forensic Similarity Metrics Bar */}
      <div className="mt-4 bg-[#07111F] p-4 rounded border border-[#1E3A5F]">
        <div className="text-xs font-mono-code uppercase text-[#38BDF8] mb-3">
          Mathematical Feature Overlap
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F]">
            <div className="text-[11px] text-[#94A3B8]">Name Token</div>
            <div className="text-lg font-display font-bold text-[#F1F5F9] mt-0.5">
              {metrics.nameTokenOverlap}%
            </div>
          </div>
          <div className="bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F]">
            <div className="text-[11px] text-[#94A3B8]">Handle Distance</div>
            <div className="text-lg font-display font-bold text-[#38BDF8] mt-0.5">
              {metrics.handleSimilarity}%
            </div>
          </div>
          <div className="bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F]">
            <div className="text-[11px] text-[#94A3B8]">Bio N-Gram</div>
            <div className="text-lg font-display font-bold text-[#A3E635] mt-0.5">
              {metrics.bioTextOverlap}%
            </div>
          </div>
          <div className="bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F]">
            <div className="text-[11px] text-[#94A3B8]">Avatar Hash</div>
            <div className="text-lg font-display font-bold text-[#EF4444] mt-0.5">
              {metrics.avatarPerceptualMatch}%
            </div>
          </div>
          <div className="bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F] col-span-2 sm:col-span-1">
            <div className="text-[11px] text-[#94A3B8]">Context Agreement</div>
            <div className="text-lg font-display font-bold text-[#F59E0B] mt-0.5">
              {metrics.contextualAgreement}%
            </div>
          </div>
        </div>
      </div>

      {/* Contradictions & Notes */}
      {contradictions.length > 0 && (
        <div className="mt-3 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded">
          <div className="text-xs font-bold text-[#EF4444] flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Detected Forensic Contradictions & Modus Operandi
          </div>
          <ul className="text-xs text-[#F1F5F9] space-y-1 list-disc list-inside">
            {contradictions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 text-xs text-[#94A3B8] italic border-l-2 border-[#38BDF8] pl-3">
        Analysis Note: {verdictNotes}
      </div>
    </div>
  );
};
