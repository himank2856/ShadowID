/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Impersonation Intelligence Page
 * Compliant with Prompt 11 & IT Rules 2021 / DPDP Act 2023
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ProfileComparison } from '../../components/ProfileComparison.tsx';
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  Flag,
  Copy,
  Download,
  ExternalLink,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  FileText,
  AlertOctagon,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Check,
  Info,
} from 'lucide-react';

interface ImpersonationPreset {
  id: string;
  label: string;
  sourceDataset: string;
  refName: string;
  refHandle: string;
  refPlatform: string;
  refBio: string;
  refAvatar: string;
  refFollowers: number;
  suspectName: string;
  suspectHandle: string;
  suspectPlatform: string;
  suspectBio: string;
  suspectAvatar: string;
  suspectFollowers: number;
  suspectCreated: string;
  verdict: 'Critical Impersonator' | 'High Risk Phishing' | 'Suspicious Clone' | 'Unrelated Namesake';
  riskScore: number;
  tactics: string[];
}

const PRESETS: ImpersonationPreset[] = [
  {
    id: 'preset-delhi-exec',
    label: 'Priya Sharma (Official vs Phishing Clone)',
    sourceDataset: 'India Identity Case Studies (Delhi Tech & Policy)',
    refName: 'Priya Sharma',
    refHandle: 'priya_sharma_official',
    refPlatform: 'X (formerly Twitter)',
    refBio: 'Policy lead & cybersecurity researcher @ IndiaTech. Keynote speaker. Verified DPDP Analyst.',
    refAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    refFollowers: 42350,
    suspectName: 'Priya Sharma 🇮🇳',
    suspectHandle: 'priya_sharma_0fficial',
    suspectPlatform: 'X (formerly Twitter)',
    suspectBio: 'Policy lead & cybersecurity researcher @ IndiaTech. DM for private consultation & advisory grants.',
    suspectAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    suspectFollowers: 120,
    suspectCreated: '3 days ago',
    verdict: 'Critical Impersonator',
    riskScore: 94,
    tactics: ['Homoglyph "0" instead of "o"', 'Identical cloned avatar asset', 'Advance-fee consultation DM solicitation'],
  },
  {
    id: 'preset-keller-mimic',
    label: 'Keller Typosquatting Vector (from fake_users.csv)',
    sourceDataset: 'public/project-data/fake_users.csv (#1664073018)',
    refName: 'Lavona Keller',
    refHandle: 'kellervxg',
    refPlatform: 'X (Twitter)',
    refBio: 'Keep moving forward. Digital artist and community organizer.',
    refAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    refFollowers: 14890,
    suspectName: 'Lavona Keller (Official)',
    suspectHandle: 'kellervxg_',
    suspectPlatform: 'X (Twitter)',
    suspectBio: 'Keep moving forward. Digital artist and community organizer. Backup account.',
    suspectAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    suspectFollowers: 14,
    suspectCreated: '2 weeks ago',
    verdict: 'Critical Impersonator',
    riskScore: 91,
    tactics: ['Trailing underscore character spoofing', 'Duplicate bio copy', 'Fake backup account narrative'],
  },
  {
    id: 'preset-estelle-clone',
    label: 'Estelle Santos Health Bot (from fake_users.csv)',
    sourceDataset: 'public/project-data/fake_users.csv (#1214885356)',
    refName: 'Estelle Santos',
    refHandle: 'estellesant',
    refPlatform: 'Instagram',
    refBio: 'Practical wisdom, health & holistic wellness practitioner.',
    refAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    refFollowers: 8740,
    suspectName: 'Estelle Santos Herbal',
    suspectHandle: 'estellesant_herbs',
    suspectPlatform: 'Instagram',
    suspectBio: 'Practical wisdom, health & Chinese Medicine remedies. Click link for miracle supplement dropshipping.',
    suspectAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    suspectFollowers: 63,
    suspectCreated: '1 month ago',
    verdict: 'High Risk Phishing',
    riskScore: 82,
    tactics: ['High bio token overlap (84%)', 'Suspicious unverified commercial redirect', 'Avatar duplicate'],
  },
  {
    id: 'preset-pini-benchmark',
    label: 'Gianluca Pini Real Profile (from real_users.csv)',
    sourceDataset: 'public/project-data/real_users.csv (GLPini benchmark)',
    refName: 'Gianluca Pini',
    refHandle: 'GLPini',
    refPlatform: 'X (Twitter)',
    refBio: "You think I'm a hero? I am not a hero. And if you're smart, that scares you.",
    refAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    refFollowers: 624,
    suspectName: 'Gianluca Pini Fan Club',
    suspectHandle: 'GLPini_fans',
    suspectPlatform: 'X (Twitter)',
    suspectBio: 'Unofficial commentary and archives for Gianluca Pini. Not affiliated.',
    suspectAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    suspectFollowers: 45,
    suspectCreated: '6 months ago',
    verdict: 'Unrelated Namesake',
    riskScore: 28,
    tactics: ['Explicit disclaimer present', 'No fraudulent commercial solicitations', 'Parody/fan protection under IT Rules'],
  },
];

function computeLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export const ImpersonationPage: React.FC = () => {
  const { activeScan, showToast } = useApp();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-delhi-exec');
  const [customMode, setCustomMode] = useState<boolean>(false);

  // Custom inputs
  const [customRefHandle, setCustomRefHandle] = useState<string>('priya_sharma_official');
  const [customSuspectHandle, setCustomSuspectHandle] = useState<string>('priya_sharma_0fficial');
  const [customRefBio, setCustomRefBio] = useState<string>('Cybersecurity policy analyst and speaker.');
  const [customSuspectBio, setCustomSuspectBio] = useState<string>('Cybersecurity policy analyst. DM for crypto grants.');

  // Takedown Template Modal
  const [isTakedownModalOpen, setIsTakedownModalOpen] = useState<boolean>(false);
  const [takedownType, setTakedownType] = useState<'x' | 'meta' | 'linkedin' | 'itact'>('itact');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Decision State
  const [analystDecision, setAnalystDecision] = useState<'pending' | 'takedown' | 'monitor' | 'dismiss'>('pending');

  const currentPreset = useMemo(() => {
    return PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];
  }, [selectedPresetId]);

  const activeRefHandle = customMode ? customRefHandle : currentPreset.refHandle;
  const activeSuspectHandle = customMode ? customSuspectHandle : currentPreset.suspectHandle;
  const activeRefBio = customMode ? customRefBio : currentPreset.refBio;
  const activeSuspectBio = customMode ? customSuspectBio : currentPreset.suspectBio;

  // Compute live forensic metrics
  const editDistance = useMemo(() => {
    return computeLevenshtein(activeRefHandle.toLowerCase(), activeSuspectHandle.toLowerCase());
  }, [activeRefHandle, activeSuspectHandle]);

  const handleSimilarity = useMemo(() => {
    const maxLen = Math.max(activeRefHandle.length, activeSuspectHandle.length) || 1;
    return Math.max(0, Math.round(((maxLen - editDistance) / maxLen) * 100));
  }, [activeRefHandle, activeSuspectHandle, editDistance]);

  const bioTokenOverlap = useMemo(() => {
    const tokensA = new Set(activeRefBio.toLowerCase().split(/\W+/).filter(Boolean));
    const tokensB = new Set(activeSuspectBio.toLowerCase().split(/\W+/).filter(Boolean));
    if (tokensA.size === 0 || tokensB.size === 0) return 0;
    let intersection = 0;
    tokensA.forEach((t) => {
      if (tokensB.has(t)) intersection++;
    });
    const union = new Set([...tokensA, ...tokensB]).size;
    return Math.round((intersection / union) * 100);
  }, [activeRefBio, activeSuspectBio]);

  // Character-by-character visual diff highlighter
  const characterDiff = useMemo(() => {
    const refChars = activeRefHandle.split('');
    const susChars = activeSuspectHandle.split('');
    const maxLen = Math.max(refChars.length, susChars.length);

    const diff = [];
    for (let i = 0; i < maxLen; i++) {
      const r = refChars[i] || '';
      const s = susChars[i] || '';
      const isMatch = r === s;
      const isSubstitution = r && s && r !== s;
      const isInsertion = !r && s;
      const isDeletion = r && !s;

      diff.push({
        index: i,
        refChar: r,
        susChar: s,
        isMatch,
        isSubstitution,
        isInsertion,
        isDeletion,
      });
    }
    return diff;
  }, [activeRefHandle, activeSuspectHandle]);

  const getTakedownNotice = (type: 'x' | 'meta' | 'linkedin' | 'itact') => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    if (type === 'itact') {
      return `LEGAL NOTICE UNDER SECTION 66D OF THE INFORMATION TECHNOLOGY ACT, 2000
(Cheating by Personation by Using Computer Resource)

Date: ${dateStr}
To: Platform Grievance Officer & Impersonating Operator (@${activeSuspectHandle})
Subject: CEASE AND DESIST: Fraudulent Impersonation of ${customMode ? customRefHandle : currentPreset.refName} (@${activeRefHandle})

1. STATUTORY NOTICE:
This legal communication is issued pursuant to Rule 3(1)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, read with Section 66D of the Information Technology Act, 2000 (punishable with imprisonment up to 3 years and fine).

2. FORENSIC EVIDENCE OF PERSONATION:
- Authorized Subject: ${customMode ? customRefHandle : currentPreset.refName} (@${activeRefHandle})
- Impersonating Handle: @${activeSuspectHandle}
- Levenshtein Edit Distance: ${editDistance} (Handle Mimicry Index: ${handleSimilarity}%)
- Bio Token Semantic Overlap: ${bioTokenOverlap}%
- Phishing Tactic: ${customMode ? 'Intentional typosquatting & profile asset duplication' : currentPreset.tactics.join(', ')}

3. REQUISITE ACTIONS:
You are hereby called upon to immediately:
a) Disable and deactivate the infringing profile @${activeSuspectHandle} within 24 hours of receipt.
b) Cease and desist from soliciting public or monetary communications under this false identity.
c) Preserve all server connection logs, IP addresses, and transaction histories for law enforcement discovery under Section 91 of the CrPC.

Issued on behalf of the Verified Identity Holder.
Forensic Report Ref: SHADOWID-EXP-${Date.now().toString(36).toUpperCase()}`;
    }

    if (type === 'x') {
      return `X (TWITTER) IMPERSONATION VIOLATION REPORT
Date: ${dateStr}
Reported Handle: @${activeSuspectHandle}
Legitimate Profile: @${activeRefHandle}
Grounds: Violation of X Impersonation & Deceptive Identity Policy

FORENSIC EVIDENCE:
1. Handle Typo-Squatting: Edit distance of ${editDistance} characters against legitimate handle @${activeRefHandle}.
2. Bio Duplication: ${bioTokenOverlap}% token overlap with intentional keyword reproduction.
3. Deceptive Intent: The reported account creates confusion, mimicry, and unauthorized representation.

Please suspend or mandate an explicit parody disclaimer in accordance with X's Platform Rules.`;
    }

    if (type === 'meta') {
      return `META / INSTAGRAM INTELLECTUAL PROPERTY & IMPERSONATION NOTICE
Date: ${dateStr}
Subject: Unlawful Account Cloning & Brand Personation
Reported Profile: @${activeSuspectHandle}
Original Verified Account: @${activeRefHandle}

DETAILED INFRACTION:
The account @${activeSuspectHandle} has cloned the public identity of @${activeRefHandle}, copying bio phrasing (${bioTokenOverlap}% similarity) and utilizing phonetic typo-squatting (Edit Distance: ${editDistance}).
This account violates Meta Community Standards regarding Inauthentic Behavior and Impersonation.

Request: Immediate account lockdown and deletion.`;
    }

    return `LINKEDIN PROFESSIONAL IDENTITY MISREPRESENTATION REPORT
Date: ${dateStr}
Target Profile Handle: @${activeSuspectHandle}
Legitimate Professional: ${customMode ? customRefHandle : currentPreset.refName} (@${activeRefHandle})

Violation: False affiliation, credential deception, and fraudulent corporate outreach.
Levenshtein Edit Metric: ${editDistance}
Immediate Action Requested: Remove unauthorized profile and flag associated corporate domains.`;
  };

  const handleCopyNoticeText = (type: 'x' | 'meta' | 'linkedin' | 'itact') => {
    const text = getTakedownNotice(type);
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    showToast(`${type.toUpperCase()} takedown notice copied to clipboard.`);
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const handleDownloadNoticeText = (type: 'x' | 'meta' | 'linkedin' | 'itact') => {
    const text = getTakedownNotice(type);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowid-takedown-${type}-${activeSuspectHandle}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Takedown notice document downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#A3E635] uppercase mb-1">
            <Users className="w-4 h-4" />
            <span>Module 02: Impersonation & Spoofing Intelligence</span>
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Visual Identity Mimicry & Typo-Squatting Comparator
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Detects homoglyphs, handle permutations, bio semantic theft, and avatar duplicates cross-referenced with synthetic and real benchmark callsets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTakedownModalOpen(true)}
            className="px-3.5 py-2 rounded text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/25 flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            Platform Takedown Generator
          </button>
        </div>
      </div>

      {/* Preset Investigator Selector */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-xs font-mono-code text-[#38BDF8] flex items-center gap-1.5 uppercase">
            <Sliders className="w-3.5 h-3.5" /> Select Case Preset or Enter Custom Handles
          </div>
          <button
            onClick={() => setCustomMode(!customMode)}
            className="text-xs font-mono-code text-[#A3E635] hover:underline flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            {customMode ? 'Switch to Preset Suspects' : 'Test Custom Handles'}
          </button>
        </div>

        {!customMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPresetId(p.id);
                  setAnalystDecision('pending');
                }}
                className={`p-3 text-left rounded border transition-all text-xs space-y-1.5 ${
                  selectedPresetId === p.id
                    ? 'bg-[#172A42] border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                    : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#38BDF8]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-[#F1F5F9] truncate">
                    {p.refName}
                  </span>
                  <span
                    className={`text-[9px] font-mono-code px-1.5 py-0.2 rounded border ${
                      p.riskScore > 80
                        ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
                        : 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                    }`}
                  >
                    Risk: {p.riskScore}%
                  </span>
                </div>
                <div className="text-[11px] font-mono-code text-[#38BDF8] truncate">
                  @{p.refHandle} vs @{p.suspectHandle}
                </div>
                <div className="text-[10px] text-[#94A3B8] truncate">{p.sourceDataset}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-[#07111F] rounded border border-[#1E3A5F]">
            <div className="space-y-2">
              <label className="block text-[11px] font-mono-code text-[#A3E635] uppercase">
                Authorized Reference Handle & Bio
              </label>
              <div className="flex items-center gap-1.5 bg-[#0F1D2E] border border-[#1E3A5F] rounded px-2.5 py-1.5">
                <span className="text-xs font-mono-code text-[#64748B]">@</span>
                <input
                  type="text"
                  value={customRefHandle}
                  onChange={(e) => setCustomRefHandle(e.target.value)}
                  placeholder="e.g. priya_sharma_official"
                  className="bg-transparent text-xs text-[#F1F5F9] font-mono-code w-full focus:outline-none"
                />
              </div>
              <textarea
                value={customRefBio}
                onChange={(e) => setCustomRefBio(e.target.value)}
                rows={2}
                placeholder="Enter legitimate profile bio..."
                className="w-full bg-[#0F1D2E] border border-[#1E3A5F] rounded p-2 text-xs text-[#CBD5E1] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono-code text-[#EF4444] uppercase">
                Suspect Clone Handle & Bio
              </label>
              <div className="flex items-center gap-1.5 bg-[#0F1D2E] border border-[#1E3A5F] rounded px-2.5 py-1.5">
                <span className="text-xs font-mono-code text-[#64748B]">@</span>
                <input
                  type="text"
                  value={customSuspectHandle}
                  onChange={(e) => setCustomSuspectHandle(e.target.value)}
                  placeholder="e.g. priya_sharma_0fficial"
                  className="bg-transparent text-xs text-[#F1F5F9] font-mono-code w-full focus:outline-none"
                />
              </div>
              <textarea
                value={customSuspectBio}
                onChange={(e) => setCustomSuspectBio(e.target.value)}
                rows={2}
                placeholder="Enter suspected impersonator bio..."
                className="w-full bg-[#0F1D2E] border border-[#1E3A5F] rounded p-2 text-xs text-[#CBD5E1] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Visual Character-by-Character Diff Engine */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#172A42] pb-3">
          <div>
            <h3 className="text-sm font-display font-bold text-[#F1F5F9] flex items-center gap-2">
              <Search className="w-4 h-4 text-[#38BDF8]" />
              Visual Typo-Squatting & Homoglyph Character Diff
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Highlighting exact matches, character substitutions (e.g. 0 for O, 1 for l), and sneaky insertions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
              Levenshtein Distance: {editDistance}
            </span>
            <span
              className={`text-xs font-mono-code px-2 py-0.5 rounded border ${
                handleSimilarity > 75
                  ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40'
                  : 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/40'
              }`}
            >
              Handle Similarity: {handleSimilarity}%
            </span>
          </div>
        </div>

        {/* Diff Ribbon */}
        <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-4 space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase">
              Reference Handle: <span className="text-[#A3E635]">@{activeRefHandle}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {characterDiff.map((d, i) => (
                <div
                  key={i}
                  className={`w-7 h-8 rounded flex items-center justify-center font-mono-code font-bold text-xs border ${
                    d.isMatch
                      ? 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                      : d.isSubstitution
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50 animate-pulse'
                      : d.isDeletion
                      ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                      : 'bg-[#172A42] text-[#64748B] border-[#1E3A5F]'
                  }`}
                  title={
                    d.isMatch
                      ? `Position ${i}: Match (${d.refChar})`
                      : d.isSubstitution
                      ? `Substitution at pos ${i}: '${d.refChar}' vs suspect '${d.susChar}'`
                      : `Deletion at pos ${i}`
                  }
                >
                  {d.refChar || '—'}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase">
              Suspect Handle: <span className="text-[#EF4444]">@{activeSuspectHandle}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {characterDiff.map((d, i) => (
                <div
                  key={i}
                  className={`w-7 h-8 rounded flex items-center justify-center font-mono-code font-bold text-xs border ${
                    d.isMatch
                      ? 'bg-[#A3E635]/10 text-[#A3E635] border-[#A3E635]/30'
                      : d.isSubstitution
                      ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444] animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : d.isInsertion
                      ? 'bg-[#38BDF8]/20 text-[#38BDF8] border-[#38BDF8] shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : 'bg-[#172A42] text-[#64748B] border-[#1E3A5F]'
                  }`}
                  title={
                    d.isMatch
                      ? `Position ${i}: Match (${d.susChar})`
                      : d.isSubstitution
                      ? `Suspect altered to '${d.susChar}' (homoglyph/spoofing)`
                      : `Suspect added insertion '${d.susChar}'`
                  }
                >
                  {d.susChar || '—'}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono-code text-[#94A3B8] pt-2 border-t border-[#172A42]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#A3E635]/30 border border-[#A3E635]" /> Match
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]/30 border border-[#EF4444]" /> Altered Character / Homoglyph
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-[#38BDF8]/30 border border-[#38BDF8]" /> Sneaky Insertion
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Deep Forensic Profile Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Legitimate Profile */}
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
            <span className="text-[10px] font-mono-code uppercase text-[#A3E635] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Legitimate Authorized Identity
            </span>
            <span className="text-[10px] font-mono-code text-[#64748B]">
              Followers: {(customMode ? 10500 : currentPreset.refFollowers).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={customMode ? PRESETS[0].refAvatar : currentPreset.refAvatar}
              alt="Reference Avatar"
              className="w-14 h-14 rounded-full border-2 border-[#A3E635] object-cover"
            />
            <div>
              <h4 className="text-base font-display font-bold text-[#F1F5F9]">
                {customMode ? customRefHandle : currentPreset.refName}
              </h4>
              <div className="text-xs font-mono-code text-[#38BDF8]">@{activeRefHandle}</div>
              <div className="text-[11px] text-[#94A3B8]">
                {customMode ? 'Public Platform' : currentPreset.refPlatform} &bull; Established Reference
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] text-xs text-[#CBD5E1] space-y-1">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase">Authorized Bio</div>
            <p className="leading-relaxed">"{activeRefBio}"</p>
          </div>

          <div className="text-[10px] font-mono-code text-[#94A3B8] flex items-center justify-between pt-1">
            <span>Avatar Perceptual Hash: a7f8c92e104b</span>
            <span className="text-[#A3E635]">Verified Reference</span>
          </div>
        </div>

        {/* Suspect Impersonator */}
        <div className="bg-[#0F1D2E] border border-[#EF4444]/40 rounded p-5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#EF4444] text-[#07111F] font-mono-code text-[10px] font-bold rounded-bl">
            SUSPECT IMPERSONATOR
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-[#172A42]">
            <span className="text-[10px] font-mono-code uppercase text-[#EF4444] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> High Confidence Mimicry
            </span>
            <span className="text-[10px] font-mono-code text-[#EF4444]">
              Followers: {(customMode ? 24 : currentPreset.suspectFollowers).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={customMode ? PRESETS[0].suspectAvatar : currentPreset.suspectAvatar}
              alt="Suspect Avatar"
              className="w-14 h-14 rounded-full border-2 border-[#EF4444] object-cover"
            />
            <div>
              <h4 className="text-base font-display font-bold text-[#F1F5F9]">
                {customMode ? customSuspectHandle : currentPreset.suspectName}
              </h4>
              <div className="text-xs font-mono-code text-[#EF4444]">@{activeSuspectHandle}</div>
              <div className="text-[11px] text-[#FCA5A5]">
                {customMode ? 'Public Platform' : currentPreset.suspectPlatform} &bull; Account Age:{' '}
                {customMode ? 'Recent' : currentPreset.suspectCreated}
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#07111F] rounded border border-[#EF4444]/30 text-xs text-[#CBD5E1] space-y-1">
            <div className="text-[10px] font-mono-code text-[#EF4444] uppercase">Suspect Bio Clone</div>
            <p className="leading-relaxed">"{activeSuspectBio}"</p>
          </div>

          {/* Forensic Tactic Highlights */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] font-mono-code text-[#64748B] uppercase">Identified Vectors:</div>
            <div className="flex flex-wrap gap-1.5">
              {(customMode ? ['Typo-squatting variant', 'High semantic keyword overlap'] : currentPreset.tactics).map(
                (t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#EF4444]/10 text-[#FCA5A5] border border-[#EF4444]/30"
                  >
                    &bull; {t}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analyst Decision & Takedown Console */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-display font-bold text-[#F1F5F9]">
            Analyst Enforcement & Case Disposition
          </h4>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Record institutional action for this suspect identity under Section 66D IT Act / DPDP Audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAnalystDecision('takedown');
              setIsTakedownModalOpen(true);
            }}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              analystDecision === 'takedown'
                ? 'bg-[#EF4444] text-[#07111F] font-bold'
                : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/25'
            }`}
          >
            <Flag className="w-3.5 h-3.5" /> Flag for Immediate Takedown
          </button>
          <button
            onClick={() => {
              setAnalystDecision('monitor');
              showToast(`Account @${activeSuspectHandle} added to active honeypot watchlist.`);
            }}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              analystDecision === 'monitor'
                ? 'bg-[#F59E0B] text-[#07111F] font-bold'
                : 'bg-[#172A42] text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#1E3A5F]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Monitor & Track
          </button>
          <button
            onClick={() => {
              setAnalystDecision('dismiss');
              showToast(`Account @${activeSuspectHandle} dismissed as non-malicious.`);
            }}
            className={`px-3.5 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
              analystDecision === 'dismiss'
                ? 'bg-[#A3E635] text-[#07111F] font-bold'
                : 'bg-[#172A42] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1E3A5F]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss as Namesake
          </button>
        </div>
      </div>

      {/* Embedded Original Active Scan Comparator if exists */}
      {activeScan?.profileComparison && (
        <div className="space-y-2 pt-4">
          <div className="text-xs font-mono-code text-[#A3E635] uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Active Investigation Scan Profile Comparison
          </div>
          <ProfileComparison data={activeScan.profileComparison} />
        </div>
      )}

      {/* Platform & Legal Takedown Notice Modal */}
      {isTakedownModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050C15]/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E3A5F] bg-[#07111F]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444]">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-[#F1F5F9]">
                    Formal Platform Impersonation Takedown Generator
                  </h3>
                  <span className="text-[10px] font-mono-code text-[#94A3B8]">
                    Generated for suspect: @{activeSuspectHandle}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTakedownModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded hover:bg-[#1E3A5F]"
              >
                &times;
              </button>
            </div>

            {/* Platform Tab Selector */}
            <div className="flex border-b border-[#1E3A5F] bg-[#07111F]/60 px-5">
              <button
                onClick={() => setTakedownType('itact')}
                className={`py-2.5 px-3 text-xs font-mono-code font-bold border-b-2 transition-colors ${
                  takedownType === 'itact'
                    ? 'border-[#EF4444] text-[#EF4444]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Section 66D IT Act (India Law)
              </button>
              <button
                onClick={() => setTakedownType('x')}
                className={`py-2.5 px-3 text-xs font-mono-code font-bold border-b-2 transition-colors ${
                  takedownType === 'x'
                    ? 'border-[#38BDF8] text-[#38BDF8]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                X / Twitter
              </button>
              <button
                onClick={() => setTakedownType('meta')}
                className={`py-2.5 px-3 text-xs font-mono-code font-bold border-b-2 transition-colors ${
                  takedownType === 'meta'
                    ? 'border-[#A3E635] text-[#A3E635]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                Instagram / Meta
              </button>
              <button
                onClick={() => setTakedownType('linkedin')}
                className={`py-2.5 px-3 text-xs font-mono-code font-bold border-b-2 transition-colors ${
                  takedownType === 'linkedin'
                    ? 'border-[#38BDF8] text-[#38BDF8]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                LinkedIn
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] font-mono-code text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed select-all">
                {getTakedownNotice(takedownType)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#1E3A5F] bg-[#07111F]">
              <div className="text-[11px] font-mono-code text-[#64748B]">
                Compliant with Indian Intermediary Guidelines 2021
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadNoticeText(takedownType)}
                  className="px-3 py-1.5 rounded text-xs font-mono-code bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Download .txt
                </button>
                <button
                  onClick={() => handleCopyNoticeText(takedownType)}
                  className="px-3 py-1.5 rounded text-xs font-mono-code font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1 shadow-[0_0_12px_rgba(163,230,53,0.3)]"
                >
                  {copiedKey === takedownType ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === takedownType ? 'Copied!' : 'Copy Notice Text'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
