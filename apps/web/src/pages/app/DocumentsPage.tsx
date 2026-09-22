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
  Lock,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Trash2,
  Layers,
  FileCheck,
  IdCard,
} from 'lucide-react';
import { SYNTHETIC_DOCUMENT_VERIFICATIONS } from '../../data/verification/index.ts';
import { DocumentAnalysisData, DocumentOcrBox, ThreeStageVerificationResult } from '../../types.ts';
import { ocrService, OcrProgress } from '../../services/ocrService.ts';
import { supabaseService } from '../../services/supabaseService.ts';
import { BillingModal } from '../../components/BillingModal.tsx';

function mapVerificationDocToAnalysis(
  verDoc: (typeof SYNTHETIC_DOCUMENT_VERIFICATIONS)[0]
): DocumentAnalysisData {
  const isClean = verDoc.validityStatus === 'VERIFIED_AUTHENTIC';
  const category = (verDoc.category as 'Aadhaar' | 'PAN' | 'Passport') || 'Aadhaar';

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

  const hasDuplicate = verDoc.validityStatus === 'TAMPERED_NUMERAL' || verDoc.id === 'doc-verify-002';

  const threeStageVerification: ThreeStageVerificationResult = {
    expectedCategory: category,
    detectedCategory: category,
    overallStatus: isClean && !hasDuplicate ? 'PASSED' : 'FAILED',
    stage1TypeCheck: {
      stageNumber: 1,
      name: 'Document Type Verification',
      description: `Verify document matches selected target (${category})`,
      status: 'PASSED',
      verdictMessage: `Scan 1 Passed: Official ${category} benchmark template recognized and validated.`,
      details: {
        expectedType: category,
        detectedType: category,
        isTypeMatch: true,
      },
    },
    stage2AuthenticityCheck: {
      stageNumber: 2,
      name: 'Statutory Authenticity & Database Integrity Check',
      description: 'Scan to verify originality against statutory checksums, typography, and database records',
      status: isClean ? 'PASSED' : 'FAILED',
      verdictMessage: isClean
        ? `Scan 2 Passed: Authentic original ${category} verified. Statutory checksums and typeface valid.`
        : `Scan 2 Failed: Tampering anomalies detected in benchmark: ${verDoc.detectedAnomalies.join('; ')}`,
      details: {
        checksumValid: isClean,
        checksumType: `${category} Statutory Checksum`,
        databaseMatch: true,
        databaseMatchDetails: isClean
          ? 'Matches clean statutory benchmark standards.'
          : 'Matches known tampered anomaly pattern.',
      },
    },
    stage3DuplicateCheck: {
      stageNumber: 3,
      name: 'Duplicate & Impersonation Database Scan',
      description: 'Scan whether someone else is using this identity or created a duplicate/clone',
      status: hasDuplicate ? 'FAILED' : 'PASSED',
      verdictMessage: hasDuplicate
        ? `Scan 3 Alert: Duplicate or recycled identity detected! Card ending in 8831 flagged in secondary bot records.`
        : `Scan 3 Passed: Single authentic holder confirmed. No duplicate usage or clone records in database.`,
      details: {
        isDuplicateDetected: hasDuplicate,
        duplicateCount: hasDuplicate ? 2 : 0,
        duplicateMatches: hasDuplicate
          ? [
              {
                source: 'Forensic Benchmark Registry (IN-DOC-AADHAAR-TAMPER-02)',
                identityNumberOrName: verDoc.documentNumberMasked,
                associatedProfile: verDoc.holderName,
                riskLevel: 'CRITICAL',
                details: 'Known cloned credential reused across fraudulent bot network handles.',
              },
            ]
          : [],
      },
    },
  };

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
    threeStageVerification,
  };
}

export const DocumentsPage: React.FC = () => {
  const { activeScan, showToast, user, openAuthModal, billing } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);

  // Target Document Selection (Only chosen document type is permitted for verification)
  const [selectedTargetType, setSelectedTargetType] = useState<'Aadhaar' | 'PAN' | 'Passport'>('Aadhaar');

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

  // Trigger file selection with Auth and Pro membership guard
  const handleTriggerUpload = () => {
    if (!user) {
      openAuthModal('signin');
      showToast('Please sign in or create an account to verify documents.');
      return;
    }
    if (!billing.isPro) {
      showToast('Document verification requires Pro Membership (₹499/month). Please upgrade to proceed.');
      setIsBillingModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  // Remove / Discard Document handler
  const handleRemoveUploadedDocument = () => {
    setUploadedDoc(null);
    setUploadedImageUrl(null);
    setOcrError(null);
    setOcrProgress({ status: 'Ready for document upload', progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('Document removed. Select a document type and upload a new image.');
  };

  // Back to Selection handler
  const handleBackToSelection = () => {
    if (activeSource === 'uploaded') {
      handleRemoveUploadedDocument();
    }
    setActiveSource('benchmarks');
  };

  // Handle file selection and progressive 3-scan OCR execution
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      openAuthModal('signin');
      showToast('Please sign in or create an account to verify documents.');
      return;
    }

    if (!billing.isPro) {
      showToast('Document verification requires Pro Membership (₹499/month). Please upgrade.');
      setIsBillingModalOpen(true);
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setOcrError(null);
    setIsProcessingOcr(true);
    setOcrProgress({
      status: `Starting Progressive 3-Scan OCR for ${selectedTargetType} Card...`,
      progress: 5,
    });

    try {
      const result = await ocrService.processDocument(file, {
        expectedCategory: selectedTargetType,
        userEmail: user.email,
        onProgress: (p) => {
          setOcrProgress(p);
        },
      });

      setUploadedDoc(result.analysis);
      setUploadedImageUrl(result.imageUrl);
      setActiveSource('uploaded');

      if (result.threeStageVerification.overallStatus === 'HALTED_TYPE_MISMATCH') {
        showToast(
          `Scan 1 Rejected: Expected ${result.threeStageVerification.expectedCategory}, detected ${result.threeStageVerification.detectedCategory}. Scans 2 & 3 halted.`
        );
      } else {
        showToast(
          `All 3 Scans Complete: Extracted ${result.analysis.boxes.length} tokens (${result.detectedCategory})`
        );
      }

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

  if (!user) {
    return (
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl p-8 max-w-2xl mx-auto text-center shadow-2xl my-8">
        <div className="w-16 h-16 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#F59E0B]">
          <Lock className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172A42] border border-[#1E3A5F] text-[11px] font-mono-code text-[#F59E0B] mb-3">
          <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" /> SECURE DOCUMENT VERIFICATION ENGINE
        </div>
        <h2 className="text-xl font-display font-bold text-[#F1F5F9] mb-2">
          Sign In or Sign Up to Verify Documents
        </h2>
        <p className="text-sm text-[#94A3B8] max-w-md mx-auto mb-6 leading-relaxed">
          Statutory Aadhaar Verhoeff verification, Income Tax PAN checksum validation, and optical tamper heatmaps require an authenticated user account and a ₹499/month Pro membership.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
          <button
            onClick={() => openAuthModal('signin')}
            className="w-full px-6 py-2.5 bg-[#F59E0B] text-[#07111F] font-bold text-xs rounded hover:bg-[#fbbf24] transition-all shadow-md flex items-center justify-center gap-2"
          >
            Sign In to Account
          </button>
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full px-6 py-2.5 bg-[#172A42] border border-[#F59E0B]/40 text-[#F59E0B] font-bold text-xs rounded hover:bg-[#1E3A5F] transition-all flex items-center justify-center gap-2"
          >
            Create Free Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-code text-[#F59E0B] uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Module 03: Professional Document Defense & Neural OCR</span>
            {billing.isPro ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#A3E635] bg-[#A3E635]/15 border border-[#A3E635]/40 px-2 py-0.5 rounded-full font-bold ml-1">
                <ShieldCheck className="w-3 h-3" /> PRO ACTIVE (₹499/mo)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/40 px-2 py-0.5 rounded-full font-bold ml-1">
                <Lock className="w-3 h-3" /> ₹499/mo MEMBERSHIP REQUIRED
              </span>
            )}
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Progressive 3-Scan Document Defense
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Strict 3-Stage Pipeline: <strong>Scan 1</strong> (Target Type Filter), <strong>Scan 2</strong> (Statutory Originality & Database Check), and <strong>Scan 3</strong> (Duplicate & Impersonation Clone Scan).
          </p>
        </div>

        {/* Global Upload Button & Hidden Input */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleTriggerUpload}
            disabled={isProcessingOcr}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#F59E0B] text-[#07111F] hover:bg-[#fbbf24] flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
          >
            {isProcessingOcr ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running 3-Scan Pipeline...</span>
              </>
            ) : billing.isPro ? (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload {selectedTargetType} for Real Scan</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Unlock Real OCR (₹499/mo)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Document Type Selector (Strict Filtering Pre-Scan) */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#172A42] pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#38BDF8] uppercase font-bold">
              <FileCheck className="w-4 h-4" />
              <span>Step 1: Choose Document Type to Verify</span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Only the chosen document type will be scanned. Non-matching documents are rejected at Scan 1 and will NOT proceed to the 2nd scan.
            </p>
          </div>
          <div className="text-[11px] font-mono-code text-[#F59E0B] bg-[#F59E0B]/10 px-2.5 py-1 rounded-full border border-[#F59E0B]/30 self-start sm:self-auto">
            Target: <strong>{selectedTargetType} Card</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Aadhaar Card Selection */}
          <button
            onClick={() => {
              setSelectedTargetType('Aadhaar');
              showToast('Selected Target: Aadhaar Card (UIDAI Heuristics & Verhoeff Checksum)');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              selectedTargetType === 'Aadhaar'
                ? 'bg-[#172A42] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-[#F59E0B]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#38BDF8]/60 text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-[#F1F5F9] flex items-center gap-1.5">
                <IdCard className="w-4 h-4 text-[#F59E0B]" />
                Aadhaar Card
              </span>
              {selectedTargetType === 'Aadhaar' && (
                <span className="text-[10px] font-mono-code text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE TARGET
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              UIDAI 12-digit Verhoeff checksum algorithm, QR verification, and DPDP Act minimization check.
            </p>
          </button>

          {/* PAN Card Selection */}
          <button
            onClick={() => {
              setSelectedTargetType('PAN');
              showToast('Selected Target: PAN Card (Income Tax Structure & Entity Code)');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              selectedTargetType === 'PAN'
                ? 'bg-[#172A42] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-[#F59E0B]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#38BDF8]/60 text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-[#F1F5F9] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#38BDF8]" />
                PAN Card
              </span>
              {selectedTargetType === 'PAN' && (
                <span className="text-[10px] font-mono-code text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE TARGET
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Income Tax 10-char alphanumeric structure, 4th character entity code, and NSDL OCR-B typeface check.
            </p>
          </button>

          {/* Passport Selection */}
          <button
            onClick={() => {
              setSelectedTargetType('Passport');
              showToast('Selected Target: Passport (Republic of India & ICAO MRZ)');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all relative ${
              selectedTargetType === 'Passport'
                ? 'bg-[#172A42] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-[#F59E0B]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#38BDF8]/60 text-[#94A3B8]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold font-display text-[#F1F5F9] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#A3E635]" />
                Indian Passport
              </span>
              {selectedTargetType === 'Passport' && (
                <span className="text-[10px] font-mono-code text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded-full font-bold">
                  ACTIVE TARGET
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94A3B8] leading-relaxed">
              Republic of India ICAO Doc 9303 Machine Readable Zone (MRZ) parser and 8-character booklet check.
            </p>
          </button>
        </div>
      </div>

      {/* Pro Membership Paywall Banner if !billing.isPro */}
      {!billing.isPro && (
        <div className="bg-gradient-to-br from-[#0F1D2E] to-[#172A42] border-2 border-[#F59E0B]/60 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[11px] font-mono-code text-[#F59E0B]">
                <Lock className="w-3.5 h-3.5" /> PRO MEMBERSHIP REQUIRED • ₹499 / MONTH
              </div>
              <h2 className="text-lg font-display font-bold text-[#F1F5F9]">
                Unlock Statutory Document Verification & Real Neural OCR
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Document verification is unlocked after purchasing the <strong className="text-[#F1F5F9]">Pro Monthly Membership of ₹499/month</strong>. Get instant verification of Indian official IDs with Aadhaar Verhoeff checksums, Income Tax PAN structure verification, Passport MRZ validation, and optical tamper heatmaps.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto">
              <div className="md:text-right">
                <div className="text-2xl font-bold font-display text-[#F59E0B]">₹499 <span className="text-xs font-normal text-[#94A3B8]">/ month</span></div>
                <div className="text-[10px] font-mono-code text-[#64748B]">Instant activation via UPI & RuPay Cards</div>
              </div>
              <button
                onClick={() => setIsBillingModalOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-[#F59E0B] text-[#07111F] font-bold text-xs rounded-lg hover:bg-[#fbbf24] transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Membership (₹499/mo)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real OCR Processing Progress Bar */}
      {isProcessingOcr && (
        <div className="bg-[#0F1D2E] border border-[#F59E0B] rounded-xl p-5 space-y-3 animate-pulse shadow-xl">
          <div className="flex items-center justify-between text-xs font-mono-code">
            <span className="text-[#F59E0B] flex items-center gap-2 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-[#F59E0B]" />
              {ocrProgress.status}
            </span>
            <span className="text-[#F1F5F9] font-bold">{ocrProgress.progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#07111F] rounded-full overflow-hidden border border-[#1E3A5F]">
            <div
              className="h-full bg-gradient-to-r from-[#F59E0B] via-[#38BDF8] to-[#A3E635] transition-all duration-300 rounded-full"
              style={{ width: `${ocrProgress.progress}%` }}
            />
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono-code text-[#94A3B8] pt-1">
            <div className={`flex items-center gap-1 ${ocrProgress.progress >= 25 ? 'text-[#38BDF8]' : ''}`}>
              <span>1. Scan Type Match</span>
            </div>
            <div className={`flex items-center gap-1 ${ocrProgress.progress >= 75 ? 'text-[#38BDF8]' : ''}`}>
              <span>2. Scan Originality</span>
            </div>
            <div className={`flex items-center gap-1 ${ocrProgress.progress >= 95 ? 'text-[#A3E635]' : ''}`}>
              <span>3. Scan Duplicates</span>
            </div>
          </div>
        </div>
      )}

      {/* OCR Error Box */}
      {ocrError && (
        <div className="bg-[#EF4444]/15 border border-[#EF4444] rounded-xl p-4 text-xs text-[#FCA5A5] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#EF4444]" />
            <span>{ocrError}</span>
          </div>
          <button
            onClick={handleRemoveUploadedDocument}
            className="px-3 py-1 bg-[#EF4444] text-white text-[11px] font-bold rounded hover:bg-[#dc2626] transition-all"
          >
            Clear & Retry
          </button>
        </div>
      )}

      {/* Navigation & Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl shadow-md">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Back button if in uploaded mode */}
          {activeSource === 'uploaded' && (
            <button
              onClick={handleBackToSelection}
              className="px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1E3A5F] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Selection</span>
            </button>
          )}

          {/* Live Upload button */}
          <button
            onClick={() => {
              if (uploadedDoc) setActiveSource('uploaded');
              else handleTriggerUpload();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all ${
              activeSource === 'uploaded' && uploadedDoc
                ? 'bg-[#172A42] text-[#F59E0B] border border-[#F59E0B]/60 shadow-sm'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {billing.isPro ? (
              <Upload className="w-3.5 h-3.5" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
            )}
            <span>
              {uploadedDoc
                ? `Active Upload (${uploadedDoc.documentCategory})`
                : `Upload ${selectedTargetType} ID`}
            </span>
          </button>

          {/* Remove Document button if uploadedDoc exists */}
          {uploadedDoc && (
            <button
              onClick={handleRemoveUploadedDocument}
              className="px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/25 flex items-center gap-1.5 transition-all shadow-sm"
              title="Remove current document"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Document</span>
            </button>
          )}

          {/* Synthetic Benchmarks toggle */}
          <button
            onClick={() => setActiveSource('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all ${
              activeSource === 'benchmarks'
                ? 'bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/60 shadow-sm'
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
                  className={`px-2.5 py-1 rounded-lg font-mono-code text-[11px] transition-all ${
                    isSelected
                      ? isClean
                        ? 'bg-[#172A42] text-[#A3E635] font-bold border border-[#A3E635]/50 shadow-sm'
                        : 'bg-[#172A42] text-[#EF4444] font-bold border border-[#EF4444]/50 shadow-sm'
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

      {/* Main Document Inspector with Full Visibility */}
      {currentDoc ? (
        <DocumentDefenseViewer
          data={currentDoc}
          imageUrl={activeSource === 'uploaded' && uploadedImageUrl ? uploadedImageUrl : undefined}
          onBack={handleBackToSelection}
          onRemoveDocument={activeSource === 'uploaded' ? handleRemoveUploadedDocument : undefined}
          selectedTargetType={selectedTargetType}
          onChangeTargetType={(t) => {
            setSelectedTargetType(t);
            showToast(`Switched target document type to ${t} Card.`);
          }}
        />
      ) : (
        <div className="p-12 bg-[#0F1D2E] border border-[#1E3A5F] rounded-xl text-center space-y-3">
          <div className="w-12 h-12 bg-[#172A42] rounded-full flex items-center justify-center mx-auto text-[#94A3B8]">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#F1F5F9]">No Verification Document Active</h3>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
            Choose a target document type above (Aadhaar, PAN, or Passport) and upload an image to execute the 3-Scan verification pipeline.
          </p>
          <button
            onClick={handleTriggerUpload}
            className="px-4 py-2 bg-[#F59E0B] text-[#07111F] text-xs font-bold rounded-lg hover:bg-[#fbbf24] transition-all inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      )}

      {/* Forensic Legal Compliance Banner */}
      <div className="p-4 bg-[#172A42]/60 rounded-xl border border-[#1E3A5F] text-xs text-[#CBD5E1] flex items-start gap-3 shadow-md">
        <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <strong className="text-[#38BDF8]">DPDP Act 2023 & UIDAI Guidelines: </strong>
          Document Defense runs optical geometry, Verhoeff checksum validation, and font-typeface consistency tests client-side in your secure browser. Raw images are processed in-memory and are never stored on external unencrypted servers.
        </div>
      </div>

      {/* Pro Membership Modal */}
      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        initialPlanId="pro_monthly"
      />
    </div>
  );
};
