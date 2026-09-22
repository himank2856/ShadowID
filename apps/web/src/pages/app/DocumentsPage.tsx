/**
 * ShadowID - Professional Document Defense & Neural OCR Page
 * Powered by Tesseract.js WebAssembly & Indian Statutory Tamper Defense
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { DocumentDefenseViewer } from '../../components/DocumentDefenseViewer.tsx';
import {
  FileText,
  Info,
  Upload,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldAlert,
  Database,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { SYNTHETIC_DOCUMENT_VERIFICATIONS } from '../../data/verification/index.ts';
import { DocumentAnalysisData, DocumentOcrBox } from '../../types.ts';
import { ocrService, OcrProgress } from '../../services/ocrService.ts';
import { supabaseService } from '../../services/supabaseService.ts';

function mapVerificationDocToAnalysis(
  verDoc: (typeof SYNTHETIC_DOCUMENT_VERIFICATIONS)[0]
): DocumentAnalysisData {
  const isClean = verDoc.validityStatus === 'VERIFIED_AUTHENTIC';

  const boxes: DocumentOcrBox[] = verDoc.ocrExtraction.rawTokens.map((tok, i) => ({
    id: `box-${i}`,
    label: tok.text,
    value: tok.text,
    maskedValue: tok.text,
    confidence: tok.confidence,
    x: tok.x,
    y: tok.y,
    width: tok.width,
    height: tok.height,
    isAnomaly: !!tok.flag,
    anomalyReason: tok.flag,
  }));

  return {
    id: verDoc.id,
    documentCategory: verDoc.category as any,
    sampleLabel: `${verDoc.category} Benchmark (${verDoc.benchmarkCode})`,
    filename: `${verDoc.benchmarkCode.toLowerCase()}.pdf`,
    mimeType: 'application/pdf',
    fileSizeBytes: 245000,
    ocrEngine: 'Tesseract eng/hin v5.3 + OpenCV Preprocessing',
    qualityScore: verDoc.authenticityScore,
    languageDetected: verDoc.ocrExtraction.language as any,
    verdict: isClean ? 'No configured inconsistencies found' : 'Requires review',
    summary: isClean
      ? `Synthetic verification benchmark: ${verDoc.category} verified clean without baseline or typeface anomalies.`
      : `Synthetic verification anomaly flagged: ${verDoc.detectedAnomalies.join('; ')}`,
    boxes,
    inconsistencies: verDoc.detectedAnomalies,
    humanReviewNotes: `Attested under ${verDoc.benchmarkCode}. Security features verified: ${Object.keys(
      verDoc.securityFeatures
    )
      .filter((k) => (verDoc.securityFeatures as any)[k])
      .join(', ')}.`,
    isHumanVerified: true,
  };
}

export const DocumentsPage: React.FC = () => {
  const { activeScan, showToast } = useApp();

  // Mode: 'benchmarks' or 'uploaded'
  const [activeSource, setActiveSource] = useState<'benchmarks' | 'uploaded'>('benchmarks');
  const [selectedBenchmarkId, setSelectedBenchmarkId] = useState<string>(
    SYNTHETIC_DOCUMENT_VERIFICATIONS[0].id
  );

  // Live Upload OCR State
  const [uploadedDoc, setUploadedDoc] = useState<DocumentAnalysisData | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<OcrProgress>({
    status: 'Ready for document upload',
    progress: 0,
  });
  const [ocrError, setOcrError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection and neural OCR execution
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setOcrError(null);
    setIsProcessingOcr(true);
    setOcrProgress({ status: 'Starting Neural OCR Engine...', progress: 5 });

    try {
      const result = await ocrService.processDocument(file, (p) => {
        setOcrProgress(p);
      });

      setUploadedDoc(result.analysis);
      setUploadedImageUrl(result.imageUrl);
      setActiveSource('uploaded');
      showToast(
        `Neural OCR Complete: Extracted ${result.analysis.boxes.length} tokens (${result.detectedCategory})`
      );

      // Automatically sync document record to Supabase if connected
      supabaseService.syncDocument(result.analysis, activeScan?.id);
    } catch (err: any) {
      console.error('OCR Processing failure:', err);
      setOcrError(err.message || 'Optical character recognition failed. Please try a clearer image.');
      showToast('OCR extraction encountered an error.');
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const selectedBenchmark = SYNTHETIC_DOCUMENT_VERIFICATIONS.find((d) => d.id === selectedBenchmarkId);

  const currentDoc: DocumentAnalysisData | null =
    activeSource === 'uploaded' && uploadedDoc
      ? uploadedDoc
      : selectedBenchmark
      ? mapVerificationDocToAnalysis(selectedBenchmark)
      : SYNTHETIC_DOCUMENT_VERIFICATIONS[0]
      ? mapVerificationDocToAnalysis(SYNTHETIC_DOCUMENT_VERIFICATIONS[0])
      : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#F59E0B] uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Module 03: Professional Document Defense & Neural OCR</span>
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Optical Baseline, Typography & Tamper Defense
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Live client-side Tesseract.js WebAssembly engine with Indian statutory heuristics (Aadhaar Verhoeff checksums, PAN entity code verification, and passport MRZ parsing).
          </p>
        </div>

        {/* Source Mode Toggle */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingOcr}
            className="px-4 py-2 rounded text-xs font-bold bg-[#F59E0B] text-[#07111F] hover:bg-[#fbbf24] flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
          >
            {isProcessingOcr ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running OCR...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload ID for Real OCR</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real OCR Processing Progress Bar */}
      {isProcessingOcr && (
        <div className="bg-[#0F1D2E] border border-[#F59E0B] rounded p-4 space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="text-[#F59E0B] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {ocrProgress.status}
            </span>
            <span className="text-[#F1F5F9] font-bold">{ocrProgress.progress}%</span>
          </div>
          <div className="w-full h-2 bg-[#07111F] rounded-full overflow-hidden border border-[#1E3A5F]">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] to-[#A3E635] transition-all duration-300 rounded-full"
              style={{ width: `${ocrProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* OCR Error Box */}
      {ocrError && (
        <div className="bg-[#EF4444]/15 border border-[#EF4444] rounded p-3 text-xs text-[#FCA5A5] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{ocrError}</span>
        </div>
      )}

      {/* Inspector Mode Switcher (Live Upload vs Synthetic Benchmarks) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#0F1D2E] border border-[#1E3A5F] rounded">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (uploadedDoc) setActiveSource('uploaded');
              else fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all ${
              activeSource === 'uploaded' && uploadedDoc
                ? 'bg-[#172A42] text-[#F59E0B] border border-[#F59E0B]/50'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>
              {uploadedDoc ? `Live Upload (${uploadedDoc.documentCategory})` : 'Upload New Image'}
            </span>
          </button>

          <button
            onClick={() => setActiveSource('benchmarks')}
            className={`px-3 py-1.5 rounded text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all ${
              activeSource === 'benchmarks'
                ? 'bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/50'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Synthetic Benchmarks</span>
          </button>
        </div>

        {/* Benchmarks Selector List */}
        {activeSource === 'benchmarks' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {SYNTHETIC_DOCUMENT_VERIFICATIONS.map((doc) => {
              const isSelected = selectedBenchmarkId === doc.id;
              const isClean = doc.validityStatus === 'VERIFIED_AUTHENTIC';
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedBenchmarkId(doc.id)}
                  className={`px-2 py-1 rounded font-mono-code text-[11px] transition-colors ${
                    isSelected
                      ? isClean
                        ? 'bg-[#172A42] text-[#A3E635] font-bold border border-[#A3E635]/40'
                        : 'bg-[#172A42] text-[#EF4444] font-bold border border-[#EF4444]/40'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  {doc.category} ({isClean ? 'Clean' : 'Tampered'})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Document Inspector */}
      {currentDoc ? (
        <DocumentDefenseViewer
          data={currentDoc}
          imageUrl={activeSource === 'uploaded' && uploadedImageUrl ? uploadedImageUrl : undefined}
        />
      ) : (
        <div className="p-8 bg-[#0F1D2E] border border-[#1E3A5F] rounded text-center text-xs text-[#94A3B8]">
          No verification document selected. Upload an identity card to begin OCR inspection.
        </div>
      )}

      {/* Forensic Legal Compliance Banner */}
      <div className="p-3 bg-[#172A42]/60 rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] flex items-start gap-2.5">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-[#38BDF8]">DPDP Act 2023 & UIDAI Guidelines: </strong>
          Document Defense runs optical geometry, Verhoeff checksum validation, and font-typeface consistency tests client-side in your secure browser. Raw images are kept in memory and are never sent to external untrusted scrapers.
        </div>
      </div>
    </div>
  );
};
