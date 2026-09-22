/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Document Defense & OCR Inspector
 * Compliant with Build With Bharat 3.0 Statutory Standards
 */

import React, { useState } from 'react';
import { DocumentAnalysisData, DocumentOcrBox } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import {
  FileText,
  Eye,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Users,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

interface DocumentDefenseViewerProps {
  data: DocumentAnalysisData;
  imageUrl?: string;
  onBack?: () => void;
  onRemoveDocument?: () => void;
  selectedTargetType?: 'Aadhaar' | 'PAN' | 'Passport';
  onChangeTargetType?: (type: 'Aadhaar' | 'PAN' | 'Passport') => void;
}

export const DocumentDefenseViewer: React.FC<DocumentDefenseViewerProps> = ({
  data,
  imageUrl,
  onBack,
  onRemoveDocument,
  selectedTargetType,
  onChangeTargetType,
}) => {
  const { updateDocumentReview, showToast } = useApp();
  const [selectedBox, setSelectedBox] = useState<DocumentOcrBox | null>(data.boxes[0] || null);
  const [unmaskSensitive, setUnmaskSensitive] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>(data.humanReviewNotes || '');
  const [isVerified, setIsVerified] = useState<boolean>(data.isHumanVerified);
  const [zoom, setZoom] = useState<number>(100);

  const threeStage = data.threeStageVerification;
  const isTypeMismatch = threeStage?.overallStatus === 'HALTED_TYPE_MISMATCH' || threeStage?.stage1TypeCheck.status === 'FAILED';

  const getVerdictStyle = () => {
    if (isTypeMismatch) {
      return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444] font-bold';
    }
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
    showToast('Document forensic review saved successfully.');
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl p-5 space-y-5 shadow-2xl">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1E3A5F] border border-[#1E3A5F] flex items-center gap-1.5 transition-all shadow-sm"
              title="Return to document selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <FileText className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-base font-display font-bold text-[#F1F5F9]">
                Document Defense OCR & Geometry Inspector
              </h3>
              <span className={`text-xs font-mono-code px-2.5 py-0.5 rounded-full border ${getVerdictStyle()}`}>
                {isTypeMismatch ? 'TYPE MISMATCH - SCAN HALTED' : data.verdict}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Target: <strong className="text-[#F1F5F9]">{selectedTargetType || threeStage?.expectedCategory || data.documentCategory}</strong> • Detected: <strong className={isTypeMismatch ? 'text-[#EF4444]' : 'text-[#A3E635]'}>{threeStage?.detectedCategory || data.documentCategory}</strong> • {data.ocrEngine}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setUnmaskSensitive(!unmaskSensitive)}
            className="px-3 py-1.5 rounded-lg text-xs font-mono-code bg-[#07111F] text-[#38BDF8] border border-[#1E3A5F] hover:bg-[#172A42] flex items-center gap-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            {unmaskSensitive ? 'Mask Sensitive PII' : 'Reveal Masked PII'}
          </button>

          {onRemoveDocument && (
            <button
              onClick={onRemoveDocument}
              className="px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/25 flex items-center gap-1.5 transition-all shadow-sm"
              title="Discard this document and choose another"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Progressive 3-Scan Pipeline Status Display */}
      {threeStage && (
        <div className="bg-[#07111F] border border-[#1E3A5F] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#172A42] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-mono-code uppercase font-bold text-[#F1F5F9] tracking-wider">
                Progressive 3-Scan Verification Pipeline
              </span>
            </div>
            <div className="text-[11px] font-mono-code text-[#94A3B8]">
              Target: <span className="text-[#F59E0B] font-bold">{threeStage.expectedCategory}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Scan 1: Document Type Verification */}
            <div
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                threeStage.stage1TypeCheck.status === 'PASSED'
                  ? 'bg-[#A3E635]/10 border-[#A3E635]/40 text-[#CBD5E1]'
                  : 'bg-[#EF4444]/15 border-[#EF4444] text-[#FCA5A5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono-code font-bold uppercase flex items-center gap-1.5">
                    {threeStage.stage1TypeCheck.status === 'PASSED' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#EF4444]" />
                    )}
                    Scan 1: Type Match
                  </span>
                  <span
                    className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded font-bold ${
                      threeStage.stage1TypeCheck.status === 'PASSED'
                        ? 'bg-[#A3E635]/20 text-[#A3E635]'
                        : 'bg-[#EF4444]/30 text-[#EF4444]'
                    }`}
                  >
                    {threeStage.stage1TypeCheck.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F1F5F9] mb-1">
                  Expected: {threeStage.expectedCategory} • Detected: {threeStage.detectedCategory}
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {threeStage.stage1TypeCheck.verdictMessage}
                </p>
              </div>

              {threeStage.stage1TypeCheck.status === 'FAILED' && (
                <div className="mt-2 pt-2 border-t border-[#EF4444]/30 flex flex-col gap-1.5">
                  <span className="text-[10px] text-[#FCA5A5] font-mono-code font-bold">
                    ⛔ Scans 2 & 3 Aborted: Incorrect document type
                  </span>
                  {onChangeTargetType && threeStage.detectedCategory !== 'Generic ID' && (
                    <button
                      onClick={() => onChangeTargetType(threeStage.detectedCategory as any)}
                      className="text-[11px] text-[#38BDF8] hover:underline font-mono-code text-left"
                    >
                      Switch Target to {threeStage.detectedCategory} Card & Re-scan
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Scan 2: Originality & Statutory Database Check */}
            <div
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                threeStage.stage2AuthenticityCheck.status === 'PASSED'
                  ? 'bg-[#A3E635]/10 border-[#A3E635]/40 text-[#CBD5E1]'
                  : threeStage.stage2AuthenticityCheck.status === 'SKIPPED'
                  ? 'bg-[#0F1D2E]/60 border-[#1E3A5F] text-[#64748B]'
                  : 'bg-[#EF4444]/15 border-[#EF4444] text-[#FCA5A5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono-code font-bold uppercase flex items-center gap-1.5">
                    {threeStage.stage2AuthenticityCheck.status === 'PASSED' ? (
                      <ShieldCheck className="w-4 h-4 text-[#A3E635]" />
                    ) : threeStage.stage2AuthenticityCheck.status === 'SKIPPED' ? (
                      <AlertOctagon className="w-4 h-4 text-[#64748B]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                    )}
                    Scan 2: Originality & DB
                  </span>
                  <span
                    className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded font-bold ${
                      threeStage.stage2AuthenticityCheck.status === 'PASSED'
                        ? 'bg-[#A3E635]/20 text-[#A3E635]'
                        : threeStage.stage2AuthenticityCheck.status === 'SKIPPED'
                        ? 'bg-[#1E3A5F] text-[#94A3B8]'
                        : 'bg-[#EF4444]/30 text-[#EF4444]'
                    }`}
                  >
                    {threeStage.stage2AuthenticityCheck.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F1F5F9] mb-1">
                  Checksum & Forensic Baseline Check
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {threeStage.stage2AuthenticityCheck.verdictMessage}
                </p>
              </div>

              {threeStage.stage2AuthenticityCheck.details?.checksumType && (
                <div className="mt-2 pt-2 border-t border-[#1E3A5F] text-[10px] font-mono-code text-[#38BDF8]">
                  {threeStage.stage2AuthenticityCheck.details.checksumType}:{' '}
                  <span className={threeStage.stage2AuthenticityCheck.details.checksumValid ? 'text-[#A3E635]' : 'text-[#EF4444]'}>
                    {threeStage.stage2AuthenticityCheck.details.checksumValid ? 'Valid' : 'Failed'}
                  </span>
                </div>
              )}
            </div>

            {/* Scan 3: Duplicate & Impersonation Database Scan */}
            <div
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                threeStage.stage3DuplicateCheck.status === 'PASSED'
                  ? 'bg-[#A3E635]/10 border-[#A3E635]/40 text-[#CBD5E1]'
                  : threeStage.stage3DuplicateCheck.status === 'SKIPPED'
                  ? 'bg-[#0F1D2E]/60 border-[#1E3A5F] text-[#64748B]'
                  : 'bg-[#EF4444]/15 border-[#EF4444] text-[#FCA5A5]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono-code font-bold uppercase flex items-center gap-1.5">
                    {threeStage.stage3DuplicateCheck.status === 'PASSED' ? (
                      <Users className="w-4 h-4 text-[#A3E635]" />
                    ) : threeStage.stage3DuplicateCheck.status === 'SKIPPED' ? (
                      <Database className="w-4 h-4 text-[#64748B]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                    )}
                    Scan 3: Duplicate Check
                  </span>
                  <span
                    className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded font-bold ${
                      threeStage.stage3DuplicateCheck.status === 'PASSED'
                        ? 'bg-[#A3E635]/20 text-[#A3E635]'
                        : threeStage.stage3DuplicateCheck.status === 'SKIPPED'
                        ? 'bg-[#1E3A5F] text-[#94A3B8]'
                        : 'bg-[#EF4444]/30 text-[#EF4444]'
                    }`}
                  >
                    {threeStage.stage3DuplicateCheck.status}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F1F5F9] mb-1">
                  Cross-Account Reuse & Clone Scan
                </div>
                <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                  {threeStage.stage3DuplicateCheck.verdictMessage}
                </p>
              </div>

              {threeStage.stage3DuplicateCheck.details?.duplicateMatches &&
                threeStage.stage3DuplicateCheck.details.duplicateMatches.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#EF4444]/30 text-[10px] font-mono-code text-[#FCA5A5]">
                    ⚠️ Matched in {threeStage.stage3DuplicateCheck.details.duplicateMatches[0].source}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Critical Type Mismatch Banner */}
      {isTypeMismatch && (
        <div className="bg-[#EF4444]/15 border-2 border-[#EF4444] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-bold text-[#EF4444]">
              <XCircle className="w-5 h-5 shrink-0" />
              <span>Document Type Rejected: Expected {threeStage?.expectedCategory || selectedTargetType}, Detected {threeStage?.detectedCategory || data.documentCategory}</span>
            </div>
            <p className="text-xs text-[#FCA5A5] leading-relaxed">
              This verification job was restricted strictly to <strong>{threeStage?.expectedCategory || selectedTargetType}</strong>. Because the uploaded document was identified as <strong>{threeStage?.detectedCategory || data.documentCategory}</strong>, it failed Scan 1. Per protocol, Scan 2 (Database Authenticity) and Scan 3 (Duplicate Check) have been aborted.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onRemoveDocument && (
              <button
                onClick={onRemoveDocument}
                className="px-4 py-2 bg-[#EF4444] text-white text-xs font-bold rounded-lg hover:bg-[#dc2626] transition-all flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove & Re-upload</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Document Visualizer Column (7 cols) - FIXED VISIBILITY & SCALING */}
        <div className="lg:col-span-7 bg-[#07111F] border border-[#1E3A5F] rounded-xl p-4 flex flex-col space-y-3">
          {/* Visualizer Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#172A42]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono-code bg-[#0F1D2E] text-[#A3E635] px-2 py-0.5 rounded border border-[#1E3A5F]">
                {data.sampleLabel}
              </span>
              <span className="text-[11px] font-mono-code text-[#94A3B8]">
                Tokens: <strong className="text-[#F1F5F9]">{data.boxes.length}</strong>
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg p-0.5 text-xs font-mono-code">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1 hover:bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-1.5 text-[10px] text-[#38BDF8] font-bold">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(220, z + 15))}
                className="p-1 hover:bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="px-1.5 py-0.5 text-[10px] text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#172A42] rounded ml-1"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Full Visual Document Canvas (Responsive, no aspect squishing, scrollable) */}
          <div className="w-full bg-[#050D17] border border-[#1E3A5F] rounded-lg p-3 overflow-auto max-h-[600px] flex justify-center items-start min-h-[360px] custom-scrollbar">
            {imageUrl ? (
              <div
                className="relative inline-block transition-transform duration-200 select-none origin-top"
                style={{
                  transform: `scale(${zoom / 100})`,
                }}
              >
                {/* Natural aspect-ratio image - never cropped or cut off */}
                <img
                  src={imageUrl}
                  alt="Uploaded Document"
                  className="max-w-full max-h-[540px] h-auto object-contain block mx-auto rounded shadow-2xl border border-[#1E3A5F]/70"
                />

                {/* Bounding Boxes Overlaid onto Real Image with 1:1 Coordinate Mapping */}
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
                      className={`absolute cursor-pointer transition-all rounded-sm flex items-center px-1 border text-[10px] font-mono-code ${
                        box.isAnomaly
                          ? 'bg-[#EF4444]/40 border-[#EF4444] text-[#EF4444] animate-pulse ring-2 ring-[#EF4444]/60 z-20'
                          : isSelected
                          ? 'bg-[#38BDF8]/40 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.7)] ring-2 ring-[#38BDF8] z-30'
                          : 'bg-[#A3E635]/20 border-[#A3E635]/80 text-[#F1F5F9] hover:bg-[#A3E635]/40 z-10'
                      }`}
                      title={`${box.label} (${box.confidence}%)`}
                    >
                      <span className="truncate bg-black/80 px-1 py-0.2 rounded text-[9px] font-bold text-white">
                        {unmaskSensitive ? box.value : box.maskedValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Synthetic Benchmark Document Card */
              <div className="w-full max-w-xl bg-gradient-to-br from-[#121c2a] via-[#0e1824] to-[#07111f] rounded-xl border-2 border-[#1E3A5F] relative p-5 shadow-2xl">
                <div className="absolute inset-0 opacity-10 bg-tactical-grid pointer-events-none" />

                {/* Card Header */}
                <div className="flex justify-between items-center border-b border-[#1E3A5F]/60 pb-3 mb-4">
                  <div>
                    <div className="text-xs font-bold font-display tracking-wider text-[#F1F5F9] uppercase">
                      {data.documentCategory === 'Aadhaar' && 'Government of India / भारत सरकार'}
                      {data.documentCategory === 'PAN' && 'Income Tax Department / आयकर विभाग'}
                      {data.documentCategory === 'Passport' && 'Passport / पासपोर्ट — Republic of India'}
                      {data.documentCategory === 'Generic ID' && 'Identification Credential'}
                    </div>
                    <div className="text-[10px] font-mono-code text-[#94A3B8]">
                      Official Statutory Identity Specification
                    </div>
                  </div>
                  <span className="text-[10px] font-mono-code text-[#38BDF8] border border-[#38BDF8]/40 px-2 py-0.5 rounded-full bg-[#38BDF8]/10 font-bold">
                    BENCHMARK SPECIMEN
                  </span>
                </div>

                {/* Bounding Box Tokens Visual Grid */}
                <div className="relative min-h-[220px] bg-[#07111F]/60 rounded-lg p-3 border border-[#1E3A5F]/40">
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
                        className={`absolute cursor-pointer transition-all rounded-sm flex items-center px-1.5 border text-[10px] font-mono-code ${
                          box.isAnomaly
                            ? 'bg-[#EF4444]/30 border-[#EF4444] text-[#EF4444] animate-pulse ring-1 ring-[#EF4444]'
                            : isSelected
                            ? 'bg-[#38BDF8]/25 border-[#38BDF8] text-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                            : 'bg-[#A3E635]/15 border-[#A3E635]/70 text-[#A3E635] hover:border-[#A3E635]'
                        }`}
                      >
                        <span className="truncate font-semibold">
                          {unmaskSensitive ? box.value : box.maskedValue}
                        </span>
                      </div>
                    );
                  })}

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-3xl font-display font-black text-white/5 uppercase rotate-[-20deg] tracking-widest">
                      BENCHMARK SPECIMEN
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{data.ocrEngine}</span>
            </span>
            <span>Quality Score: {data.qualityScore}%</span>
          </div>
        </div>

        {/* Right Column: OCR Field Inspector & Audit Details (5 cols) */}
        <div className="lg:col-span-5 bg-[#07111F] border border-[#1E3A5F] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Field Inspector Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
              <span className="text-xs font-mono-code uppercase font-bold text-[#38BDF8] tracking-wider">
                Extracted Field Inspector
              </span>
              {selectedBox && (
                <span
                  className={`text-[10px] font-mono-code px-2 py-0.5 rounded-full border uppercase font-bold ${
                    selectedBox.isAnomaly
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]'
                      : 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]'
                  }`}
                >
                  {selectedBox.isAnomaly ? 'Anomaly Flagged' : 'Consistent'}
                </span>
              )}
            </div>

            {selectedBox ? (
              <div className="space-y-3">
                <div>
                  <div className="text-[11px] text-[#94A3B8]">Token Identifier:</div>
                  <div className="text-sm font-display font-bold text-[#F1F5F9] break-words">
                    {selectedBox.label}
                  </div>
                </div>

                <div className="p-3 bg-[#0F1D2E] rounded-lg border border-[#1E3A5F] space-y-1">
                  <div className="text-[10px] font-mono-code text-[#94A3B8]">Extracted Value:</div>
                  <div className="text-xs font-mono-code text-[#38BDF8] break-all font-bold">
                    {unmaskSensitive ? selectedBox.value : selectedBox.maskedValue}
                  </div>
                  <div className="text-[10px] font-mono-code text-[#A3E635] pt-1">
                    OCR Confidence: {selectedBox.confidence}%
                  </div>
                </div>

                {selectedBox.isAnomaly && selectedBox.anomalyReason && (
                  <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-lg text-xs text-[#EF4444] space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertOctagon className="w-4 h-4 shrink-0" />
                      <span>Visual Anomaly Reason:</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#FCA5A5]">
                      {selectedBox.anomalyReason}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#94A3B8] py-8 text-center bg-[#0F1D2E]/50 rounded-lg border border-[#1E3A5F]/50">
                Click any bounding box on the document image to inspect its neural OCR token and forensic consistency.
              </div>
            )}

            {/* Flagged Inconsistencies & Anomalies */}
            {data.inconsistencies.length > 0 && (
              <div className="pt-3 border-t border-[#172A42] space-y-2">
                <div className="text-xs font-mono-code text-[#F59E0B] uppercase font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flagged Discrepancies ({data.inconsistencies.length})</span>
                </div>
                <div className="max-h-40 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                  {data.inconsistencies.map((inc, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-[#0F1D2E] border border-[#1E3A5F] text-[11px] text-[#CBD5E1] flex items-start gap-2"
                    >
                      <span className="text-[#EF4444] font-bold shrink-0">•</span>
                      <span className="leading-snug">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Human Review Form */}
          <div className="pt-3 border-t border-[#172A42] space-y-2">
            <div className="text-xs font-bold text-[#F1F5F9] flex items-center justify-between">
              <span>Human Analyst Attestation</span>
              <span className="text-[10px] font-mono-code text-[#94A3B8]">Audit Record</span>
            </div>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Record forensic review notes, statutory remarks, or UIDAI attestation notes..."
              rows={2}
              className="w-full bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg p-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8] resize-none"
            />
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-xs text-[#94A3B8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="rounded bg-[#0F1D2E] border-[#1E3A5F] text-[#A3E635] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Attest as Reviewed</span>
              </label>
              <button
                onClick={handleSaveReview}
                className="px-3.5 py-1.5 bg-[#A3E635] text-[#07111F] text-xs font-bold rounded-lg hover:bg-[#bef264] transition-all shadow-sm"
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
