/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Document Defense & OCR Page
 * Compliant with Prompt 12
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { DocumentDefenseViewer } from '../../components/DocumentDefenseViewer.tsx';
import { FileText, ShieldAlert, UploadCloud, Info, CheckCircle2 } from 'lucide-react';
import { SYNTHETIC_CASES } from '../../data/syntheticDatasets.ts';

export const DocumentsPage: React.FC = () => {
  const { activeScan, showToast } = useApp();
  const [activeSampleKey, setActiveSampleKey] = useState<string>('current');

  // Allow switching between sample document fixtures (Arun PAN, Sana Altered Aadhaar, Dev Blurred Passport)
  const currentDoc = activeSampleKey === 'current'
    ? activeScan.documentAnalysis
    : activeSampleKey === 'sana'
    ? SYNTHETIC_CASES.sana_a.documentAnalysis
    : activeSampleKey === 'dev'
    ? SYNTHETIC_CASES.dev_p.documentAnalysis
    : SYNTHETIC_CASES.arun_s.documentAnalysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#F59E0B] uppercase mb-1">
            <FileText className="w-4 h-4" />
            <span>Module 03: Document Defense & OCR</span>
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Optical Baseline & Typography Anomaly Engine
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Tesseract eng/hin v5.3 OCR combined with OpenCV morphological validation. Inspects baseline offsets, font typeface substitutions, and glare anomalies.
          </p>
        </div>

        {/* Sample Switcher */}
        <div className="flex items-center gap-1.5 bg-[#07111F] p-1 rounded border border-[#1E3A5F] text-xs">
          <button
            onClick={() => setActiveSampleKey('arun')}
            className={`px-2.5 py-1 rounded font-mono-code ${
              activeSampleKey === 'arun' ? 'bg-[#172A42] text-[#A3E635] font-bold' : 'text-[#94A3B8]'
            }`}
          >
            PAN (Clean)
          </button>
          <button
            onClick={() => setActiveSampleKey('sana')}
            className={`px-2.5 py-1 rounded font-mono-code ${
              activeSampleKey === 'sana' ? 'bg-[#172A42] text-[#EF4444] font-bold' : 'text-[#94A3B8]'
            }`}
          >
            Aadhaar (Altered Font)
          </button>
          <button
            onClick={() => setActiveSampleKey('dev')}
            className={`px-2.5 py-1 rounded font-mono-code ${
              activeSampleKey === 'dev' ? 'bg-[#172A42] text-[#F59E0B] font-bold' : 'text-[#94A3B8]'
            }`}
          >
            Passport (Low DPI)
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-3 bg-[#172A42]/60 rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-[#38BDF8]">Legal Integrity Notice: </strong>
          Document Defense checks purely structural and typographical visual geometry against standard layout specifications. It does NOT connect to UIDAI or Income Tax live databases and does not certify legal government authenticity.
        </div>
      </div>

      {/* Main Document Inspector */}
      {currentDoc ? (
        <DocumentDefenseViewer data={currentDoc} />
      ) : (
        <div className="p-8 bg-[#0F1D2E] border border-[#1E3A5F] rounded text-center text-xs text-[#94A3B8]">
          No document uploaded for this subject. Select a sample above or attach a file during New Assessment.
        </div>
      )}
    </div>
  );
};
