/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Document Defense & OCR Inspector
 * Compliant with Prompt 12
 */

import React, { useState } from 'react';
import { DocumentAnalysisData, DocumentOcrBox } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { FileText, Eye, AlertOctagon, CheckCircle2, ShieldAlert, Cpu, ZoomIn } from 'lucide-react';

interface DocumentDefenseViewerProps {
  data: DocumentAnalysisData;
  imageUrl?: string;
}

export const DocumentDefenseViewer: React.FC<DocumentDefenseViewerProps> = ({ data, imageUrl }) => {
  const { updateDocumentReview } = useApp();
  const [selectedBox, setSelectedBox] = useState<DocumentOcrBox | null>(data.boxes[0] || null);
  const [unmaskSensitive, setUnmaskSensitive] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>(data.humanReviewNotes || '');
  const [isVerified, setIsVerified] = useState<boolean>(data.isHumanVerified);

  const getVerdictStyle = () => {
    switch (data.verdict) {
      case 'Requires review':
      case 'Requires Urgent Forensic Review (Anomalies Flagged)':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]';
      case 'Insufficient image quality':
      case 'Advisory: Compliance Review Recommended':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]';
      default:
        return 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]';
    }
  };

  const handleSaveReview = () => {
    updateDocumentReview(isVerified, reviewNotes);
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Document Defense OCR & Geometry Inspector
            </h3>
            <span className={`text-xs font-mono-code px-2 py-0.5 rounded border ${getVerdictStyle()}`}>
              {data.verdict}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            {data.ocrEngine} • (Category: {data.documentCategory})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnmaskSensitive(!unmaskSensitive)}
            className="px-2.5 py-1.5 rounded text-xs font-mono-code bg-[#07111F] text-[#38BDF8] border border-[#1E3A5F] hover:bg-[#172A42] flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            {unmaskSensitive ? 'Mask Sensitive PII' : 'Reveal Masked PII'}
          </button>
        </div>
      </div>

      {/* Main Inspection Grid */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Document Visualizer with Bounding Boxes (7 cols) */}
        <div className="lg:col-span-7 bg-[#07111F] border border-[#1E3A5F] rounded p-4 relative flex flex-col justify-center items-center min-h-[360px] overflow-hidden">
          {/* Watermark notice */}
          <div className="absolute top-2 left-2 z-10 text-[10px] font-mono-code bg-[#0F1D2E]/90 text-[#A3E635] px-2 py-0.5 rounded border border-[#1E3A5F]">
            {data.sampleLabel} • {data.languageDetected}
          </div>

          <div className="absolute top-2 right-2 z-10 text-[10px] font-mono-code text-[#94A3B8] bg-[#0F1D2E]/90 px-2 py-0.5 rounded border border-[#1E3A5F]">
            Confidence: {data.qualityScore}%
          </div>

          {/* Real Upload Surface OR Synthetic ID Card Surface */}
          {imageUrl ? (
            <div className="w-full max-w-lg aspect-[1.58/1] bg-[#050D17] rounded-lg border-2 border-[#1E3A5F] relative shadow-xl overflow-hidden flex items-center justify-center">
              <img
                src={imageUrl}
                alt="Uploaded Document"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
              {/* Bounding Boxes Overlaid onto Real Image */}
              {data.boxes.map((box) => {
                const isSelected = selectedBox?.id === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    style={{
                      top: `${box.y}%`,
                      left: `${box.x}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute cursor-pointer transition-all rounded-sm flex items-center px-1 border text-[10px] font-mono-code overflow-hidden ${
                      box.isAnomaly
                        ? 'bg-[#EF4444]/35 border-[#EF4444] text-[#EF4444] animate-pulse ring-2 ring-[#EF4444]/50'
                        : isSelected
                        ? 'bg-[#38BDF8]/30 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.5)] ring-1 ring-[#38BDF8]'
                        : 'bg-[#A3E635]/20 border-[#A3E635]/80 text-[#F1F5F9] hover:bg-[#A3E635]/30'
                    }`}
                  >
                    <span className="truncate bg-black/60 px-0.5 rounded text-[9px]">
                      {unmaskSensitive ? box.value : box.maskedValue}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full max-w-md aspect-[1.58/1] bg-gradient-to-br from-[#121c2a] via-[#0e1824] to-[#07111f] rounded-lg border-2 border-[#1E3A5F] relative p-4 shadow-xl overflow-hidden">
              {/* Hologram / Guilloche Background Simulation */}
              <div className="absolute inset-0 opacity-10 bg-tactical-grid pointer-events-none" />
              
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-[#1E3A5F]/60 pb-2">
                <div className="text-[11px] font-bold font-display tracking-wider text-[#F1F5F9] uppercase">
                  {data.documentCategory === 'Aadhaar' && 'Government of India / भारत सरकार'}
                  {data.documentCategory === 'PAN' && 'Income Tax Department / आयकर विभाग'}
                  {data.documentCategory === 'Passport' && 'Passport / पासपोर्ट — Republic of India'}
                  {data.documentCategory === 'Generic ID' && 'Identification Credential'}
                </div>
                <span className="text-[9px] font-mono-code text-[#38BDF8] border border-[#38BDF8]/40 px-1 py-0.2 rounded">
                  FIXTURE
                </span>
              </div>

              {/* Bounding Boxes Overlaid */}
              {data.boxes.map((box) => {
                const isSelected = selectedBox?.id === box.id;
                return (
                  <div
                    key={box.id}
                    onClick={() => setSelectedBox(box)}
                    style={{
                      top: `${box.y}%`,
                      left: `${box.x}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    className={`absolute cursor-pointer transition-all rounded-sm flex items-center px-1.5 border text-[10px] font-mono-code overflow-hidden ${
                      box.isAnomaly
                        ? 'bg-[#EF4444]/25 border-[#EF4444] text-[#EF4444] animate-pulse'
                        : isSelected
                        ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.3)]'
                        : 'bg-[#A3E635]/10 border-[#A3E635]/60 text-[#A3E635] hover:border-[#A3E635]'
                    }`}
                  >
                    <span className="truncate">
                      {unmaskSensitive ? box.value : box.maskedValue}
                    </span>
                  </div>
                );
              })}

              {/* Specimen watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <span className="text-3xl font-display font-black text-white/5 uppercase rotate-[-25deg] tracking-widest">
                  SYNTHETIC SPECIMEN
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 text-[11px] text-[#64748B] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Engine: {data.ocrEngine}</span>
          </div>
        </div>

        {/* OCR Field Inspector & Anomaly Audit (5 cols) */}
        <div className="lg:col-span-5 bg-[#07111F] border border-[#1E3A5F] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
              <span className="text-[11px] font-mono-code uppercase text-[#38BDF8]">
                Extracted Bounding Box
              </span>
              {selectedBox && (
                <span
                  className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded border uppercase ${
                    selectedBox.isAnomaly
                      ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]'
                      : 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]'
                  }`}
                >
                  {selectedBox.isAnomaly ? 'Anomaly Flagged' : 'Consistent'}
                </span>
              )}
            </div>

            {selectedBox ? (
              <div className="mt-3 space-y-3">
                <div>
                  <div className="text-[11px] text-[#94A3B8]">Target Field:</div>
                  <div className="text-sm font-display font-bold text-[#F1F5F9]">
                    {selectedBox.label}
                  </div>
                </div>

                <div className="p-2.5 bg-[#0F1D2E] rounded border border-[#1E3A5F]">
                  <div className="text-[10px] font-mono-code text-[#94A3B8] mb-0.5">Extracted Value:</div>
                  <div className="text-xs font-mono-code text-[#38BDF8] break-all font-semibold">
                    {unmaskSensitive ? selectedBox.value : selectedBox.maskedValue}
                  </div>
                  <div className="mt-1 text-[10px] font-mono-code text-[#A3E635]">
                    OCR Confidence: {selectedBox.confidence}%
                  </div>
                </div>

                {selectedBox.isAnomaly && selectedBox.anomalyReason && (
                  <div className="p-2.5 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded text-xs text-[#EF4444]">
                    <div className="font-bold flex items-center gap-1 mb-0.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Visual Anomaly Reason:
                    </div>
                    {selectedBox.anomalyReason}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8] py-8 text-center">
                Select a bounding box on the card to inspect OCR token.
              </div>
            )}

            {/* Inconsistencies List */}
            {data.inconsistencies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#172A42]">
                <div className="text-[11px] font-mono-code text-[#F59E0B] uppercase mb-1.5">
                  Flagged Rule Discrepancies ({data.inconsistencies.length})
                </div>
                <ul className="text-xs text-[#CBD5E1] space-y-1 list-disc list-inside">
                  {data.inconsistencies.map((inc, i) => (
                    <li key={i}>{inc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Human Review Form */}
          <div className="mt-4 pt-3 border-t border-[#172A42]">
            <div className="text-xs font-bold text-[#F1F5F9] mb-1">
              Human Analyst Attestation
            </div>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Record forensic review notes..."
              rows={2}
              className="w-full bg-[#0F1D2E] border border-[#1E3A5F] rounded p-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
            />
            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center gap-1.5 text-xs text-[#94A3B8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded bg-[#0F1D2E] border-[#1E3A5F] text-[#A3E635] focus:ring-0"
                />
                Mark as Reviewed by Analyst
              </label>
              <button
                onClick={handleSaveReview}
                className="px-3 py-1 bg-[#A3E635] text-[#07111F] text-xs font-semibold rounded hover:bg-[#bef264]"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
