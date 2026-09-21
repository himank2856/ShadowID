/**
 * ShadowID - Synthetic Verification Benchmark Lab
 * Live verification testbeds for Document Defense, Impersonation Mimicry, and Exposure Intelligence
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import {
  SYNTHETIC_DOCUMENT_VERIFICATIONS,
  SYNTHETIC_IMPERSONATION_VERIFICATIONS,
  SYNTHETIC_EXPOSURE_VERIFICATIONS,
  runSyntheticDocumentDefense,
  runSyntheticImpersonationAudit,
  runSyntheticExposureCheck,
} from '../../data/verification/index.ts';
import {
  VerificationDocumentRecord,
  VerificationImpersonationRecord,
  VerificationExposureRecord,
  ScanJob,
} from '../../types.ts';
import {
  Shield,
  FileCheck2,
  Users,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Scan,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  ExternalLink,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { addNewScan, showToast, navigate } = useApp();

  const [activeTab, setActiveTab] = useState<'documents' | 'impersonation' | 'exposure'>('documents');
  const [selectedDocId, setSelectedDocId] = useState<string>(SYNTHETIC_DOCUMENT_VERIFICATIONS[0].id);
  const [selectedImpId, setSelectedImpId] = useState<string>(SYNTHETIC_IMPERSONATION_VERIFICATIONS[0].id);
  const [selectedExpId, setSelectedExpId] = useState<string>(SYNTHETIC_EXPOSURE_VERIFICATIONS[0].id);

  const activeDoc = SYNTHETIC_DOCUMENT_VERIFICATIONS.find((d) => d.id === selectedDocId) || SYNTHETIC_DOCUMENT_VERIFICATIONS[0];
  const activeImp = SYNTHETIC_IMPERSONATION_VERIFICATIONS.find((i) => i.id === selectedImpId) || SYNTHETIC_IMPERSONATION_VERIFICATIONS[0];
  const activeExp = SYNTHETIC_EXPOSURE_VERIFICATIONS.find((e) => e.id === selectedExpId) || SYNTHETIC_EXPOSURE_VERIFICATIONS[0];

  // Document Defense Runner
  const docAudit = runSyntheticDocumentDefense(activeDoc);
  // Impersonation Audit Runner
  const impAudit = runSyntheticImpersonationAudit(activeImp);
  // Exposure Check Runner
  const expAudit = runSyntheticExposureCheck(activeExp);

  // Helper to load fixture into active workspace
  const handleLoadAsActiveInvestigation = (title: string) => {
    showToast(`Verification dataset "${title}" imported into active workspace.`);
    navigate('/app/overview');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
              <span className="text-xs font-mono-code uppercase text-[#38BDF8] tracking-wider">
                Forensic Verification Data Suite
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-[#F1F5F9]">
              Synthetic Verification Benchmark Lab
            </h1>
            <p className="text-xs text-[#94A3B8] max-w-2xl mt-1">
              Ground-truth synthetic datasets for validating Indian identity documents, social clone mimicry, and telecom footprint connectability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#07111F] border border-[#1E3A5F] rounded text-right">
              <div className="text-[10px] font-mono-code text-[#64748B] uppercase">Test Fixtures</div>
              <div className="text-sm font-mono-code font-bold text-[#A3E635]">
                {SYNTHETIC_DOCUMENT_VERIFICATIONS.length +
                  SYNTHETIC_IMPERSONATION_VERIFICATIONS.length +
                  SYNTHETIC_EXPOSURE_VERIFICATIONS.length} Datasets
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="flex border-b border-[#1E3A5F] bg-[#0F1D2E] rounded-t p-1">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2.5 px-4 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'documents'
              ? 'bg-[#172A42] text-[#A3E635] border border-[#A3E635]/40 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Document Defense Data ({SYNTHETIC_DOCUMENT_VERIFICATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impersonation')}
          className={`flex-1 py-2.5 px-4 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'impersonation'
              ? 'bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Impersonation Pairs ({SYNTHETIC_IMPERSONATION_VERIFICATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exposure')}
          className={`flex-1 py-2.5 px-4 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'exposure'
              ? 'bg-[#172A42] text-[#F59E0B] border border-[#F59E0B]/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Exposure Telemetry ({SYNTHETIC_EXPOSURE_VERIFICATIONS.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Selector Column */}
          <div className="space-y-3">
            <div className="text-[11px] font-mono-code uppercase text-[#94A3B8] px-1">
              Select Document Verification Fixture
            </div>
            {SYNTHETIC_DOCUMENT_VERIFICATIONS.map((doc) => {
              const isSelected = doc.id === activeDoc.id;
              const isClean = doc.validityStatus === 'VERIFIED_AUTHENTIC';
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`p-3.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#172A42] border-[#A3E635] shadow-[0_0_10px_rgba(163,230,53,0.2)]'
                      : 'bg-[#0F1D2E] border-[#1E3A5F] hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code text-[#38BDF8]">
                      {doc.benchmarkCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded ${
                        isClean
                          ? 'bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30'
                          : 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                      }`}
                    >
                      {doc.validityStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-[#F1F5F9] mt-1">
                    {doc.category}: {doc.holderName}
                  </div>
                  <div className="text-xs text-[#94A3B8] font-mono-code mt-0.5">
                    {doc.documentNumberMasked} • {doc.stateOrCircle}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details & Verification Runner */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#172A42]">
                <div>
                  <span className="text-[10px] font-mono-code text-[#38BDF8]">
                    {activeDoc.benchmarkCode}
                  </span>
                  <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
                    {activeDoc.category} Verification: {activeDoc.holderName}
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono-code text-[#94A3B8]">Authenticity Score</div>
                  <div
                    className={`text-2xl font-display font-bold ${
                      activeDoc.authenticityScore >= 80
                        ? 'text-[#A3E635]'
                        : activeDoc.authenticityScore >= 50
                        ? 'text-[#F59E0B]'
                        : 'text-[#EF4444]'
                    }`}
                  >
                    {activeDoc.authenticityScore}/100
                  </div>
                </div>
              </div>

              {/* Security Feature Grid */}
              <div>
                <div className="text-xs font-mono-code uppercase text-[#94A3B8] mb-2">
                  Cryptographic & Visual Security Checks
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(activeDoc.securityFeatures).map(([feat, passed]) => (
                    <div
                      key={feat}
                      className="p-2.5 bg-[#07111F] rounded border border-[#1E3A5F] flex items-center justify-between"
                    >
                      <span className="text-[#CBD5E1] capitalize">
                        {feat.replace(/([A-Z])/g, ' $1')}
                      </span>
                      {passed ? (
                        <CheckCircle2 className="w-4 h-4 text-[#A3E635]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomalies Box */}
              {activeDoc.detectedAnomalies.length > 0 ? (
                <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded text-xs space-y-1.5">
                  <div className="font-bold text-[#FCA5A5] flex items-center gap-1.5 font-mono-code uppercase">
                    <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                    <span>Forensic Inconsistencies Detected ({activeDoc.detectedAnomalies.length})</span>
                  </div>
                  <ul className="list-disc list-inside text-[#FCA5A5] space-y-1 pl-1">
                    {activeDoc.detectedAnomalies.map((anom, i) => (
                      <li key={i}>{anom}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-3 bg-[#A3E635]/10 border border-[#A3E635]/40 rounded text-xs text-[#bef264] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#A3E635] shrink-0" />
                  <span>
                    No morphological, baseline, or cryptographic QR anomalies detected in this synthetic document.
                  </span>
                </div>
              )}

              {/* OCR Token Extract */}
              <div>
                <div className="text-xs font-mono-code uppercase text-[#94A3B8] mb-2">
                  OCR Engine Extracted Plaintext ({activeDoc.ocrExtraction.language})
                </div>
                <pre className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] text-[11px] font-mono-code text-[#CBD5E1] whitespace-pre-wrap">
                  {activeDoc.ocrExtraction.sampleSnippet}
                </pre>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  onClick={() => handleLoadAsActiveInvestigation(activeDoc.benchmarkCode)}
                  className="px-4 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all"
                >
                  <Scan className="w-3.5 h-3.5" />
                  Import to Active Investigation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: IMPERSONATION */}
      {activeTab === 'impersonation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-3">
            <div className="text-[11px] font-mono-code uppercase text-[#94A3B8] px-1">
              Select Impersonation Pair
            </div>
            {SYNTHETIC_IMPERSONATION_VERIFICATIONS.map((imp) => {
              const isSelected = imp.id === activeImp.id;
              const isThreat = imp.classification !== 'BENIGN_HOMONYM';
              return (
                <div
                  key={imp.id}
                  onClick={() => setSelectedImpId(imp.id)}
                  className={`p-3.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#172A42] border-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                      : 'bg-[#0F1D2E] border-[#1E3A5F] hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code text-[#38BDF8]">
                      {imp.benchmarkCode}
                    </span>
                    <span
                      className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded ${
                        isThreat
                          ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30'
                          : 'bg-[#A3E635]/10 text-[#A3E635] border border-[#A3E635]/30'
                      }`}
                    >
                      {imp.classification.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-[#F1F5F9] mt-1">
                    {imp.targetSubject.name} vs {imp.suspectProfile.name}
                  </div>
                  <div className="text-xs text-[#94A3B8] font-mono-code mt-0.5">
                    Platform: {imp.targetSubject.platform} • Mimicry: {imp.metrics.overallMimicryScore}%
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#172A42]">
                <div>
                  <span className="text-[10px] font-mono-code text-[#38BDF8]">
                    {activeImp.benchmarkCode}
                  </span>
                  <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
                    Profile Comparison & Mimicry Assessment
                  </h3>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono-code text-[#94A3B8]">Overall Mimicry</div>
                  <div className="text-2xl font-display font-bold text-[#EF4444]">
                    {activeImp.metrics.overallMimicryScore}%
                  </div>
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] space-y-1.5">
                  <div className="text-[10px] font-mono-code text-[#38BDF8] uppercase font-bold">
                    Official Reference Subject
                  </div>
                  <div className="font-bold text-[#F1F5F9]">{activeImp.targetSubject.name}</div>
                  <div className="text-[#94A3B8] font-mono-code">{activeImp.targetSubject.handle}</div>
                  <div className="text-[#64748B]">{activeImp.targetSubject.institution} ({activeImp.targetSubject.city})</div>
                  {activeImp.targetSubject.officialUpi && (
                    <div className="text-[11px] font-mono-code text-[#A3E635]">
                      Official UPI: {activeImp.targetSubject.officialUpi}
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[#07111F] rounded border border-[#EF4444]/40 space-y-1.5">
                  <div className="text-[10px] font-mono-code text-[#EF4444] uppercase font-bold">
                    Suspect Candidate Profile
                  </div>
                  <div className="font-bold text-[#F1F5F9]">{activeImp.suspectProfile.name}</div>
                  <div className="text-[#EF4444] font-mono-code">{activeImp.suspectProfile.handle}</div>
                  <div className="text-[#CBD5E1] text-[11px] italic">"{activeImp.suspectProfile.bio}"</div>
                  {activeImp.suspectProfile.upiPayeeId && (
                    <div className="text-[11px] font-mono-code text-[#EF4444]">
                      Altered Payee: {activeImp.suspectProfile.upiPayeeId}
                    </div>
                  )}
                </div>
              </div>

              {/* Contradictions */}
              <div className="p-3.5 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded text-xs space-y-1.5">
                <div className="font-bold text-[#FCA5A5] flex items-center gap-1.5 font-mono-code uppercase">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                  <span>Documented Contradictions</span>
                </div>
                <ul className="list-disc list-inside text-[#FCA5A5] space-y-1 pl-1">
                  {activeImp.contradictions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] text-xs">
                <span className="text-[#94A3B8]">Recommended Action: </span>
                <span className="text-[#F1F5F9] font-medium">{activeImp.recommendedAction}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXPOSURE */}
      {activeTab === 'exposure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-3">
            <div className="text-[11px] font-mono-code uppercase text-[#94A3B8] px-1">
              Select Exposure Telemetry
            </div>
            {SYNTHETIC_EXPOSURE_VERIFICATIONS.map((exp) => {
              const isSelected = exp.id === activeExp.id;
              return (
                <div
                  key={exp.id}
                  onClick={() => setSelectedExpId(exp.id)}
                  className={`p-3.5 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#172A42] border-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                      : 'bg-[#0F1D2E] border-[#1E3A5F] hover:border-[#F59E0B]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-code text-[#F59E0B]">
                      {exp.benchmarkCode}
                    </span>
                    <span className="text-[10px] font-mono-code uppercase px-1.5 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                      {exp.severity}
                    </span>
                  </div>
                  <div className="text-sm font-display font-bold text-[#F1F5F9] mt-1">
                    {exp.identifierType.toUpperCase()}: {exp.identifierMasked}
                  </div>
                  <div className="text-xs text-[#94A3B8] font-mono-code mt-0.5 truncate">
                    {exp.leakSource}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#172A42]">
                <div>
                  <span className="text-[10px] font-mono-code text-[#F59E0B]">
                    {activeExp.benchmarkCode}
                  </span>
                  <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
                    Exposure Intelligence & Leak Linkability
                  </h3>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-mono-code uppercase font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40">
                  {activeExp.severity} Severity
                </span>
              </div>

              <div className="p-3.5 bg-[#07111F] rounded border border-[#1E3A5F] text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Identifier:</span>
                  <span className="text-[#F1F5F9] font-mono-code">{activeExp.identifierMasked}</span>
                </div>
                {activeExp.traiCircle && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#94A3B8]">TRAI Circle / Region:</span>
                    <span className="text-[#38BDF8] font-mono-code">{activeExp.traiCircle} ({activeExp.carrier})</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Discovered Leak Origin:</span>
                  <span className="text-[#F1F5F9] font-medium">{activeExp.leakSource}</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-mono-code uppercase text-[#94A3B8] mb-2">
                  Correlated Identity Entities ({activeExp.crossConnectableEntities.length})
                </div>
                <div className="space-y-1.5">
                  {activeExp.crossConnectableEntities.map((ent, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-[#07111F] rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] flex items-center gap-2"
                    >
                      <Globe className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span>{ent}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#A3E635]/10 border border-[#A3E635]/40 rounded text-xs">
                <span className="font-bold text-[#A3E635] uppercase font-mono-code block mb-1">
                  Remediation Protocol:
                </span>
                <span className="text-[#bef264]">{activeExp.verifiedRemediation}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
