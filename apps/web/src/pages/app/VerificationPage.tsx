/**
 * ShadowID - Synthetic Verification Benchmark Lab
 * Live verification testbeds for Document Defense, Impersonation Mimicry, and Exposure Intelligence
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useEffect } from 'react';
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
  DatasetVerificationResult,
} from '../../types.ts';
import { datasetVerificationService } from '../../services/datasetVerificationService.ts';
import { ProjectDataAnalytics } from '../../components/ProjectDataAnalytics.tsx';
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
  UserCheck,
  RefreshCw,
  Sliders,
  Cpu,
  Fingerprint,
  Info,
  Layers,
  BarChart3,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const { addNewScan, showToast, navigate } = useApp();

  const [activeTab, setActiveTab] = useState<'datasetVerification' | 'analytics' | 'documents' | 'impersonation' | 'exposure'>('datasetVerification');
  const [selectedDocId, setSelectedDocId] = useState<string>(SYNTHETIC_DOCUMENT_VERIFICATIONS[0].id);
  const [selectedImpId, setSelectedImpId] = useState<string>(SYNTHETIC_IMPERSONATION_VERIFICATIONS[0].id);
  const [selectedExpId, setSelectedExpId] = useState<string>(SYNTHETIC_EXPOSURE_VERIFICATIONS[0].id);

  // Project Data Verifier State
  const [queryHandle, setQueryHandle] = useState<string>('kellervxg');
  const [queryName, setQueryName] = useState<string>('Lavona Keller');
  const [queryFollowers, setQueryFollowers] = useState<string>('0');
  const [queryFollowing, setQueryFollowing] = useState<string>('0');
  const [queryLocation, setQueryLocation] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [datasetStats, setDatasetStats] = useState({ fakeCount: 0, realCount: 0, engagementCount: 0, isLoaded: false });
  const [verificationResult, setVerificationResult] = useState<DatasetVerificationResult | null>(null);

  // Load datasets on mount and run initial demo verification
  useEffect(() => {
    let isMounted = true;
    datasetVerificationService.ensureLoaded().then(() => {
      if (!isMounted) return;
      setDatasetStats(datasetVerificationService.getDatasetStats());
      datasetVerificationService.verifyProfile({ handle: 'kellervxg', name: 'Lavona Keller' }).then((res) => {
        if (isMounted) setVerificationResult(res);
      });
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRunVerification = async (handleToVerify = queryHandle, nameToVerify = queryName) => {
    setIsVerifying(true);
    try {
      const res = await datasetVerificationService.verifyProfile({
        handle: handleToVerify,
        name: nameToVerify,
        followersCount: queryFollowers ? parseInt(queryFollowers, 10) : undefined,
        followingCount: queryFollowing ? parseInt(queryFollowing, 10) : undefined,
        location: queryLocation || undefined,
      });
      setVerificationResult(res);
      showToast(`Verification completed for @${res.queryHandle || res.queryName}: ${res.verdict.replace(/_/g, ' ')}`);
    } catch (err: any) {
      showToast(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSelectPreset = (preset: { handle: string; name: string }) => {
    setQueryHandle(preset.handle);
    setQueryName(preset.name);
    handleRunVerification(preset.handle, preset.name);
  };

  const handleImportVerificationScan = () => {
    if (!verificationResult) return;
    const scanJob = datasetVerificationService.createScanJobFromResult(verificationResult);
    addNewScan(scanJob);
    showToast(`Verification for @${verificationResult.queryHandle || verificationResult.queryName} imported to active workspace.`);
    navigate('/app/overview');
  };

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
      <div className="flex flex-wrap border-b border-[#1E3A5F] bg-[#0F1D2E] rounded-t p-1 gap-1">
        <button
          onClick={() => setActiveTab('datasetVerification')}
          className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all min-w-[180px] ${
            activeTab === 'datasetVerification'
              ? 'bg-[#172A42] text-[#A3E635] border border-[#A3E635]/40 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Database className="w-4 h-4 text-[#A3E635]" />
          <span>Live Account Verifier</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#A3E635]/20 text-[#A3E635] font-mono-code">
            Project Data (25k+)
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all min-w-[170px] ${
            activeTab === 'analytics'
              ? 'bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#38BDF8]" />
          <span>Graphical Analytics</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#38BDF8]/20 text-[#38BDF8] font-mono-code">
            Charts
          </span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all min-w-[160px] ${
            activeTab === 'documents'
              ? 'bg-[#172A42] text-[#A3E635] border border-[#A3E635]/40 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Document Defense ({SYNTHETIC_DOCUMENT_VERIFICATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impersonation')}
          className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all min-w-[160px] ${
            activeTab === 'impersonation'
              ? 'bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Impersonation ({SYNTHETIC_IMPERSONATION_VERIFICATIONS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exposure')}
          className={`flex-1 py-2.5 px-3 rounded text-xs font-mono-code font-bold flex items-center justify-center gap-1.5 transition-all min-w-[160px] ${
            activeTab === 'exposure'
              ? 'bg-[#172A42] text-[#F59E0B] border border-[#F59E0B]/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
              : 'text-[#94A3B8] hover:text-[#F1F5F9]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Exposure ({SYNTHETIC_EXPOSURE_VERIFICATIONS.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: DATASET LIVE USER VERIFICATION */}
      {activeTab === 'datasetVerification' && (
        <div className="space-y-5">
          {/* Dataset Status & Presets Bar */}
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#172A42]">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#A3E635]" />
                  <h2 className="text-sm font-display font-bold text-[#F1F5F9]">
                    Project Data Forensic Verification Engine
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30">
                    Live Indexed
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Cross-checks entered accounts against <strong>fake_users.csv</strong> (2,501 records), <strong>real_users.csv</strong> (2,501 records), and <strong>synthetic_social_media_engagement.csv</strong> (20,001 posts).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono-code">
                <div className="px-2.5 py-1 bg-[#07111F] rounded border border-[#1E3A5F] text-[#EF4444]">
                  Fake Users: {datasetStats.fakeCount || 2501}
                </div>
                <div className="px-2.5 py-1 bg-[#07111F] rounded border border-[#1E3A5F] text-[#A3E635]">
                  Real Users: {datasetStats.realCount || 2501}
                </div>
                <div className="px-2.5 py-1 bg-[#07111F] rounded border border-[#1E3A5F] text-[#38BDF8]">
                  Posts: {datasetStats.engagementCount || 20001}
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <div className="text-[11px] font-mono-code uppercase text-[#94A3B8] mb-2 flex items-center justify-between">
                <span>Quick Test Fixtures from Project Data:</span>
                <span className="text-[#64748B]">Click to load & verify</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {datasetVerificationService.getPresetSamples().map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono-code border flex items-center gap-1.5 transition-all ${
                      queryHandle.toLowerCase() === preset.handle.toLowerCase()
                        ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] shadow-[0_0_8px_rgba(163,230,53,0.2)]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#CBD5E1] hover:border-[#38BDF8]/60'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        preset.category === 'fake'
                          ? 'bg-[#EF4444]'
                          : preset.category === 'real'
                          ? 'bg-[#A3E635]'
                          : 'bg-[#38BDF8]'
                      }`}
                    />
                    <span>@{preset.handle}</span>
                    <span className="text-[#64748B] text-[10px]">({preset.name})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add User to Verify Form */}
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#38BDF8]" />
                <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                  Add Account / User to Verify
                </h3>
              </div>
              <span className="text-[11px] font-mono-code text-[#64748B]">
                DPDP Act 2023 Compliant Model Inference
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunVerification();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs"
            >
              <div>
                <label className="block text-[11px] font-mono-code text-[#94A3B8] mb-1">
                  Screen Name / Handle *
                </label>
                <input
                  type="text"
                  value={queryHandle}
                  onChange={(e) => setQueryHandle(e.target.value)}
                  placeholder="e.g. kellervxg"
                  required
                  className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2.5 text-[#F1F5F9] font-mono-code focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-code text-[#94A3B8] mb-1">
                  Full / Display Name
                </label>
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  placeholder="e.g. Lavona Keller"
                  className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2.5 text-[#F1F5F9] focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-code text-[#94A3B8] mb-1">
                  Followers Count
                </label>
                <input
                  type="number"
                  value={queryFollowers}
                  onChange={(e) => setQueryFollowers(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2.5 text-[#F1F5F9] font-mono-code focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-code text-[#94A3B8] mb-1">
                  Following / Friends
                </label>
                <input
                  type="number"
                  value={queryFollowing}
                  onChange={(e) => setQueryFollowing(e.target.value)}
                  placeholder="0"
                  className="w-full bg-[#07111F] border border-[#1E3A5F] rounded p-2.5 text-[#F1F5F9] font-mono-code focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isVerifying || (!queryHandle && !queryName)}
                  className="w-full py-2.5 px-4 bg-[#A3E635] text-[#07111F] font-bold rounded flex items-center justify-center gap-2 hover:bg-[#bef264] disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(163,230,53,0.25)]"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5" />
                      <span>Verify Model</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Verification Results Section */}
          {verificationResult && (
            <div className="space-y-4">
              {/* Verdict Card Banner */}
              <div
                className={`p-5 rounded border relative overflow-hidden transition-all ${
                  verificationResult.verdict === 'CONFIRMED_FAKE_BOT'
                    ? 'bg-[#1A0C10] border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                    : verificationResult.verdict === 'VERIFIED_GENUINE'
                    ? 'bg-[#0B1A14] border-[#A3E635] shadow-[0_0_20px_rgba(163,230,53,0.15)]'
                    : verificationResult.verdict === 'SUSPICIOUS_IMPERSONATOR'
                    ? 'bg-[#1C1408] border-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                    : 'bg-[#0F1D2E] border-[#38BDF8] shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {verificationResult.verdict === 'CONFIRMED_FAKE_BOT' ? (
                        <div className="px-2.5 py-1 rounded text-xs font-mono-code font-bold bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                          <span>CONFIRMED MALICIOUS BOT SIGNATURE</span>
                        </div>
                      ) : verificationResult.verdict === 'VERIFIED_GENUINE' ? (
                        <div className="px-2.5 py-1 rounded text-xs font-mono-code font-bold bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>VERIFIED AUTHENTIC HUMAN IDENTITY</span>
                        </div>
                      ) : verificationResult.verdict === 'SUSPICIOUS_IMPERSONATOR' ? (
                        <div className="px-2.5 py-1 rounded text-xs font-mono-code font-bold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>SUSPICIOUS BOT MIMICRY ANOMALY</span>
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded text-xs font-mono-code font-bold bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5" />
                          <span>UNINDEXED STATISTICAL BASELINE</span>
                        </div>
                      )}

                      <span className="text-[11px] font-mono-code text-[#94A3B8]">
                        Confidence: {verificationResult.confidenceScore}%
                      </span>
                    </div>

                    <h3 className="text-xl font-display font-bold text-[#F1F5F9]">
                      @{verificationResult.queryHandle || 'target'} ({verificationResult.queryName})
                    </h3>

                    <p className="text-xs text-[#CBD5E1] max-w-2xl">
                      {verificationResult.forensicSummary}
                    </p>
                  </div>

                  {/* Score & Import CTA */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
                    <div className="text-left lg:text-right">
                      <div className="text-[10px] font-mono-code text-[#94A3B8] uppercase">
                        Bot Probability & Risk Index
                      </div>
                      <div
                        className={`text-3xl font-display font-bold ${
                          verificationResult.riskScore >= 75
                            ? 'text-[#EF4444]'
                            : verificationResult.riskScore >= 40
                            ? 'text-[#F59E0B]'
                            : 'text-[#A3E635]'
                        }`}
                      >
                        {verificationResult.riskScore}%
                      </div>
                    </div>

                    <button
                      onClick={handleImportVerificationScan}
                      className="px-4 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all"
                    >
                      <Scan className="w-3.5 h-3.5" />
                      Import as Active Investigation
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Signals vs Matched Record */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Forensic Signals & Statutory Compliance */}
                <div className="space-y-4">
                  {/* Anomaly Checklist */}
                  <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-2.5">
                    <div className="text-xs font-mono-code uppercase text-[#94A3B8] flex items-center justify-between">
                      <span>Forensic Signals & Anomaly Indicators</span>
                      <span className="text-[#38BDF8]">{verificationResult.anomalyFlags.length} Flags</span>
                    </div>

                    <div className="space-y-2">
                      {verificationResult.anomalyFlags.map((flag, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-[#07111F] rounded border border-[#1E3A5F] text-xs flex items-start gap-2 text-[#CBD5E1]"
                        >
                          <Fingerprint className="w-3.5 h-3.5 text-[#38BDF8] shrink-0 mt-0.5" />
                          <span>{flag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Statutory Recommendation */}
                  <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-2">
                    <div className="text-xs font-mono-code uppercase text-[#A3E635]">
                      Compliance & Statutory Remediation Protocol (IT Rules 2021)
                    </div>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed">
                      {verificationResult.recommendedAction}
                    </p>
                  </div>

                  {/* Optional Gemini AI Analysis */}
                  {verificationResult.geminiAiAnalysis && (
                    <div className="bg-[#0F1D2E] border border-[#38BDF8]/40 rounded p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#38BDF8]">
                        <Sparkles className="w-4 h-4 text-[#38BDF8]" />
                        <span>Gemini 2.5 Flash Qualitative Attribution</span>
                      </div>
                      <div className="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed font-mono-code bg-[#07111F] p-3 rounded border border-[#1E3A5F]">
                        {verificationResult.geminiAiAnalysis}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Matched Dataset Record Inspector & Engagement */}
                <div className="space-y-4">
                  {/* CSV Inspector */}
                  <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
                      <div className="text-xs font-mono-code uppercase text-[#94A3B8]">
                        Project Data Row Inspector
                      </div>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#172A42] text-[#38BDF8]">
                        {verificationResult.matchedFakeUser
                          ? 'Source: fake_users.csv'
                          : verificationResult.matchedRealUser
                          ? 'Source: real_users.csv'
                          : 'Source: Unindexed Heuristic'}
                      </span>
                    </div>

                    {verificationResult.matchedFakeUser || verificationResult.matchedRealUser ? (
                      (() => {
                        const rec = verificationResult.matchedFakeUser || verificationResult.matchedRealUser!;
                        return (
                          <div className="space-y-2 text-xs">
                            <div className="grid grid-cols-2 gap-2 font-mono-code text-[11px]">
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Dataset ID:</span>
                                <span className="text-[#F1F5F9] truncate block">{rec.id}</span>
                              </div>
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Screen Name:</span>
                                <span className="text-[#38BDF8] block">@{rec.screen_name}</span>
                              </div>
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Followers Count:</span>
                                <span
                                  className={`font-bold block ${
                                    rec.followers_count === 0 ? 'text-[#EF4444]' : 'text-[#A3E635]'
                                  }`}
                                >
                                  {rec.followers_count.toLocaleString()}
                                </span>
                              </div>
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Friends / Following:</span>
                                <span className="text-[#F1F5F9] font-bold block">
                                  {rec.friends_count.toLocaleString()}
                                </span>
                              </div>
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Statuses / Posts:</span>
                                <span className="text-[#F1F5F9] block">{rec.statuses_count}</span>
                              </div>
                              <div className="p-2 bg-[#07111F] rounded border border-[#1E3A5F]">
                                <span className="text-[#64748B] block">Created At:</span>
                                <span className="text-[#CBD5E1] truncate block">{rec.created_at || 'N/A'}</span>
                              </div>
                            </div>

                            {rec.description && (
                              <div className="p-2.5 bg-[#07111F] rounded border border-[#1E3A5F] text-xs">
                                <span className="text-[#64748B] font-mono-code text-[10px] uppercase block mb-0.5">
                                  Profile Bio in Dataset:
                                </span>
                                <span className="text-[#CBD5E1] italic">"{rec.description}"</span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 text-[10px] font-mono-code">
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  rec.default_profile
                                    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                    : 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                                }`}
                              >
                                default_profile: {String(rec.default_profile)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded border ${
                                  rec.default_profile_image
                                    ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                                    : 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                                }`}
                              >
                                default_image: {String(rec.default_profile_image)}
                              </span>
                              {rec.location && (
                                <span className="px-2 py-0.5 rounded bg-[#172A42] text-[#38BDF8] border border-[#1E3A5F]">
                                  location: {rec.location}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="p-4 bg-[#07111F] rounded border border-[#1E3A5F] text-center text-xs text-[#94A3B8]">
                        Profile parameters did not match any stored records in fake_users.csv or real_users.csv. Evaluated via statistical heuristics.
                      </div>
                    )}
                  </div>

                  {/* Correlated Engagement Telemetry */}
                  {verificationResult.matchedEngagement && verificationResult.matchedEngagement.length > 0 && (
                    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
                        <div className="text-xs font-mono-code uppercase text-[#38BDF8]">
                          Correlated Engagement Stream (synthetic_social_media_engagement.csv)
                        </div>
                        <span className="text-[10px] font-mono-code text-[#A3E635]">
                          {verificationResult.matchedEngagement.length} Posts Logged
                        </span>
                      </div>

                      <div className="space-y-2">
                        {verificationResult.matchedEngagement.slice(0, 2).map((post) => (
                          <div
                            key={post.post_id}
                            className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono-code">
                              <span className="text-[#38BDF8] uppercase font-bold">{post.topic || 'General'}</span>
                              <span className="text-[#64748B]">{post.post_date} • {post.device}</span>
                            </div>
                            <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                              "{post.post_content}"
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-mono-code text-[#94A3B8] pt-1">
                              <span>{post.hashtags || '#none'}</span>
                              <span className="text-[#A3E635]">
                                Eng. Rate: {(post.engagement_rate * 100).toFixed(2)}% (Likes: {post.likes})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Graphical Benchmark & Scatter Plot Suite */}
          <div className="pt-2">
            <ProjectDataAnalytics
              onSelectCandidateForVerification={(h, n) => {
                setQueryHandle(h);
                setQueryName(n);
                handleRunVerification(h, n);
              }}
            />
          </div>
        </div>
      )}

      {/* TAB CONTENT: GRAPHICAL ANALYTICS SUITE */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          <ProjectDataAnalytics
            onSelectCandidateForVerification={(h, n) => {
              setQueryHandle(h);
              setQueryName(n);
              setActiveTab('datasetVerification');
              handleRunVerification(h, n);
            }}
          />
        </div>
      )}

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
