/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - iNSIGHTS Manual Research Bridge
 * Compliant with Prompt 14
 */

import React, { useState } from 'react';
import { ResearchClaim } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { Search, ExternalLink, Copy, Check, CheckCircle2, XCircle, AlertCircle, FilePlus } from 'lucide-react';

interface ResearchBridgeProps {
  claims: ResearchClaim[];
}

const OFFICIAL_VENDOR_PROMPT = `Using only the supplied fictional evidence, summarize potential identity-exposure patterns and prevention steps. Distinguish supplied facts, inferences and unknowns. Cite any external general guidance. Do not search for or enrich real people's identities. Return claims with their supporting evidence references and uncertainty.`;

export const ResearchBridge: React.FC<ResearchBridgeProps> = ({ claims }) => {
  const { updateClaimStatus, showToast } = useApp();
  const [copied, setCopied] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(OFFICIAL_VENDOR_PROMPT);
    setCopied(true);
    showToast('Official iNSIGHTS Deep Search prompt copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleImportSubmit = () => {
    if (!importText.trim()) return;
    showToast('Research claim imported. Added as "unreviewed" for analyst attestation.');
    setImportText('');
    setIsImportModalOpen(false);
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#38BDF8]" />
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              iNSIGHTS Deep Search Manual Bridge
            </h3>
            <span className="text-xs font-mono-code bg-[#172A42] text-[#38BDF8] px-2 py-0.5 rounded border border-[#38BDF8]/30">
              Integration Status: Manual Research Import
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Reviewed research workflow. External vendor claims require analyst approval before affecting subject context.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://insights-ai.info/DeepSearch"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded text-xs font-semibold bg-[#07111F] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#172A42] flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open iNSIGHTS Deep Search
          </a>
          <button
            onClick={handleCopyPrompt}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-[#172A42] text-[#A3E635] border border-[#A3E635]/40 hover:bg-[#1e3a5f] flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Prompt Copied' : 'Copy Research Prompt'}
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded text-xs font-semibold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1.5 transition-colors"
          >
            <FilePlus className="w-3.5 h-3.5" />
            Import Response
          </button>
        </div>
      </div>

      {/* Vendor Prompt Box */}
      <div className="mt-4 p-3 bg-[#07111F] border border-[#1E3A5F] rounded">
        <div className="text-[10px] font-mono-code uppercase text-[#94A3B8] mb-1 flex items-center justify-between">
          <span>Standardized Prompt Template (Prompt 14 Mandate)</span>
          <span className="text-[#38BDF8]">Strict Synthetic Boundary</span>
        </div>
        <p className="text-xs font-mono-code text-[#CBD5E1] bg-[#0F1D2E] p-2 rounded border border-[#1E3A5F]">
          "{OFFICIAL_VENDOR_PROMPT}"
        </p>
      </div>

      {/* Claims Review Table */}
      <div className="mt-4">
        <div className="text-xs font-display font-bold text-[#F1F5F9] mb-2">
          Imported Claims & Analyst Attestation Matrix ({claims.length})
        </div>

        {claims.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94A3B8] bg-[#07111F] rounded border border-[#1E3A5F]">
            No research claims imported for this session. Use "Import Response" to paste iNSIGHTS findings.
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="bg-[#07111F] border border-[#1E3A5F] rounded p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded border ${
                        claim.reviewerStatus === 'accepted'
                          ? 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]'
                          : claim.reviewerStatus === 'rejected'
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]'
                      }`}
                    >
                      Status: {claim.reviewerStatus}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#38BDF8] bg-[#172A42] px-1.5 py-0.5 rounded">
                      Type: {claim.inferenceType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#94A3B8]">
                      Uncertainty: {claim.uncertaintyRating}
                    </span>
                  </div>
                  <p className="text-xs text-[#F1F5F9] font-medium leading-relaxed">
                    "{claim.claim}"
                  </p>
                  <div className="text-[11px] font-mono-code text-[#64748B]">
                    Source: {claim.sourceReference}
                  </div>
                  {claim.reviewerNotes && (
                    <div className="text-[11px] text-[#A3E635] italic">
                      Analyst Note: {claim.reviewerNotes}
                    </div>
                  )}
                </div>

                {/* Reviewer Action Buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button
                    onClick={() => updateClaimStatus(claim.id, 'accepted')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      claim.reviewerStatus === 'accepted'
                        ? 'bg-[#A3E635] text-[#07111F]'
                        : 'bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30 hover:bg-[#A3E635]/20'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Accept Claim
                  </button>
                  <button
                    onClick={() => updateClaimStatus(claim.id, 'rejected')}
                    className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                      claim.reviewerStatus === 'rejected'
                        ? 'bg-[#EF4444] text-[#07111F]'
                        : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg max-w-lg w-full p-5 shadow-2xl">
            <h4 className="text-base font-display font-bold text-[#F1F5F9] mb-1">
              Import Manual iNSIGHTS Research Response
            </h4>
            <p className="text-xs text-[#94A3B8] mb-3">
              Paste the text or JSON claims retrieved from your authorized query on insights-ai.info/DeepSearch.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste research claims and observations here..."
              rows={6}
              className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-3 text-xs text-[#F1F5F9] font-mono-code focus:outline-none focus:border-[#38BDF8]"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-3 py-1.5 rounded text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9]"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264]"
              >
                Parse & Queue for Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
