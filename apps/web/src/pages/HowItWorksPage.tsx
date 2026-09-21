/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - How It Works & Architecture Page
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Cpu, FileCode, CheckCircle, ShieldCheck, Database, Search, ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const { navigate } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono-code uppercase text-[#38BDF8] bg-[#172A42] px-2.5 py-0.5 rounded border border-[#38BDF8]/30">
          Forensic Architecture
        </span>
        <h1 className="text-3xl font-display font-bold text-[#F1F5F9]">
          How ShadowID Evaluates Digital Risk
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Transparent, deterministic analysis based entirely on user-consented evidence without black-box hallucination.
        </p>
      </div>

      {/* 4 Pipeline Stages */}
      <div className="space-y-4">
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded bg-[#07111F] border border-[#A3E635] flex items-center justify-center font-display font-bold text-[#A3E635] shrink-0">
            01
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Consented Ingestion & Attribute Normalization
            </h3>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Users provide authorized links, public developer handles, and sample document uploads. The ingestion engine validates schema integrity, normalizes Unicode and Indian regional names, masks sensitive credentials, and records immutable consent timestamps.
            </p>
            <div className="text-[11px] font-mono-code text-[#64748B]">
              Input constraints: Bound file sizes to 10MB, max 5 pages, no arbitrary third-party web scrapers.
            </div>
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded bg-[#07111F] border border-[#38BDF8] flex items-center justify-center font-display font-bold text-[#38BDF8] shrink-0">
            02
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Tesseract eng/hin OCR & Morphological Document Defense
            </h3>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Worker threads rasterize documents into bounded memory and execute dual-script (English and Devanagari) OCR via Tesseract v5. OpenCV algorithms evaluate typography baseline consistency, font glyph alterations, Laplacian focal blur, and specular glare.
            </p>
            <div className="text-[11px] font-mono-code text-[#64748B]">
              Categories: PAN, Aadhaar, Indian Passport, Generic IDs. Output: "Requires review" / "No configured inconsistencies found".
            </div>
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded bg-[#07111F] border border-[#F59E0B] flex items-center justify-center font-display font-bold text-[#F59E0B] shrink-0">
            03
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Impersonation & Perceptual Avatar Correlation
            </h3>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              Candidate profiles are evaluated against the reference subject using Levenshtein handle distance, token frequency overlap, and dHash/pHash perceptual image difference. Disparate geography and industry sectors act as negative indicators, preventing harmless namesakes from being flagged as malicious.
            </p>
          </div>
        </div>

        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded bg-[#07111F] border border-[#EF4444] flex items-center justify-center font-display font-bold text-[#EF4444] shrink-0">
            04
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Deterministic Shadow Score Synthesis
            </h3>
            <p className="text-xs text-[#CBD5E1] leading-relaxed">
              The engine combines weighted components: Exposure (35%), Connectability (25%), Impersonation (25%), and Document Defense (15%). If any module is unassessed, the score is labeled Provisional, and missing weights are excluded from the denominator to ensure statistical honesty.
            </p>
          </div>
        </div>
      </div>

      {/* iNSIGHTS Workflow Box */}
      <div className="bg-[#07111F] border border-[#38BDF8]/40 rounded p-6">
        <div className="flex items-center gap-2 mb-2 text-[#38BDF8]">
          <Search className="w-5 h-5" />
          <h3 className="text-base font-display font-bold">
            The iNSIGHTS Manual Research Bridge
          </h3>
        </div>
        <p className="text-xs text-[#CBD5E1] leading-relaxed">
          ShadowID implements the manual review workflow specified in the presentation deck. Rather than fabricating an unverified automated Deep Search API, analysts can open the official portal (<code className="text-[#38BDF8]">https://insights-ai.info/DeepSearch</code>), paste the strict synthetic prompt, and manually import claims into the workspace. Every claim must be attested by a human analyst before influencing the assessment.
        </p>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={() => navigate('/demo')}
          className="px-6 py-2.5 bg-[#A3E635] text-[#07111F] font-bold text-xs rounded hover:bg-[#bef264] transition-all inline-flex items-center gap-2"
        >
          Test with Repeatable Indian Cases <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
