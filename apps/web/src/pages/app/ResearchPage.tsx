/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - OSINT Deep Search & Multi-Vector Threat Intelligence Console
 * Compliant with Prompt 14, DPDP Act 2023, & IT Act 2000
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ResearchBridge } from '../../components/ResearchBridge.tsx';
import {
  Search,
  Globe,
  Network,
  Shield,
  ShieldAlert,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Lock,
  Scale,
  Terminal,
  Database,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';

interface ResearchVectorItem {
  id: string;
  category: 'whois' | 'botnet' | 'breach' | 'legal';
  title: string;
  target: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  confidence: number;
  description: string;
  evidence: string;
  timestamp: string;
  status: 'confirmed' | 'investigating' | 'mitigated';
}

const OSINT_DOSSIER_PRESETS: Record<
  string,
  {
    name: string;
    subject: string;
    overview: string;
    items: ResearchVectorItem[];
  }
> = {
  delhi: {
    name: 'Case DL-2026: Delhi Tech Executive Phishing Campaign',
    subject: 'Priya Sharma / @priya_sharma_0fficial',
    overview:
      'Coordinated identity personation targeting senior policy analysts at IndiaTech summit. Leverages typosquatted handle and fake advisory grant consultation links.',
    items: [
      {
        id: 'res-1',
        category: 'whois',
        title: 'Freshly Registered Lookalike Domain',
        target: 'priyasharma-advisory.in',
        severity: 'CRITICAL',
        confidence: 96,
        description: 'Domain registered 48 hours ago via NameCheap with privacy shield enabled. DNS points to Russian bulletproof hosting ASN.',
        evidence: 'WHOIS: Reg Date 2026-09-20T04:12:00Z | Nameservers: ns1.bulletdns.top',
        timestamp: '10 mins ago',
        status: 'confirmed',
      },
      {
        id: 'res-2',
        category: 'botnet',
        title: 'Synthetic Amplification Cluster Detected',
        target: 'Syndicate #402 (fake_users.csv cohort)',
        severity: 'HIGH',
        confidence: 89,
        description: 'Cluster of 48 automated accounts with 0 followers and high friend counts retweeting target handle within 1.2s intervals.',
        evidence: 'Cross-referenced with public/project-data/synthetic_social_media_engagement.csv (burst score 9.8)',
        timestamp: '1 hour ago',
        status: 'confirmed',
      },
      {
        id: 'res-3',
        category: 'breach',
        title: 'Dark Web Pastes Credential Association',
        target: 'priya.s***@techforum-leaks.org',
        severity: 'MEDIUM',
        confidence: 78,
        description: 'Historical email hash discovered in 2024 telecom leak corpus; adversary attempting credential-stuffing against legitimate handle.',
        evidence: 'SHA-256 Match: 8e3b...f91a in BreachCorpus-IN-2024',
        timestamp: '3 hours ago',
        status: 'investigating',
      },
      {
        id: 'res-4',
        category: 'legal',
        title: 'IT Act Section 66D Statutory Grounds Established',
        target: 'Indian Penal Court & CERT-In Grievance',
        severity: 'HIGH',
        confidence: 99,
        description: 'Prima facie evidence of personation with intent to deceive for pecuniary advantage under Section 66D (cognizable offence).',
        evidence: 'Section 66D IT Act 2000 + Rule 3(1)(b) IT Intermediary Rules 2021',
        timestamp: 'Today',
        status: 'confirmed',
      },
    ],
  },
  keller: {
    name: 'Case KF-1664: Keller Autonomous Botnet Ingestion',
    subject: 'Lavona Keller / @kellervxg_',
    overview:
      'Large-scale synthetic profile farm originating from public/project-data/fake_users.csv. High status-to-follower ratio disparity.',
    items: [
      {
        id: 'res-5',
        category: 'botnet',
        title: 'CSV Callset Verification Match',
        target: 'fake_users.csv ID: 1664073018',
        severity: 'CRITICAL',
        confidence: 99,
        description: 'Direct match in project benchmark data. Account possesses 13 statuses with 0 followers and 0 friends.',
        evidence: 'public/project-data/fake_users.csv Row #2 (kellervxg)',
        timestamp: 'Verified Instant',
        status: 'confirmed',
      },
      {
        id: 'res-6',
        category: 'whois',
        title: 'Bio URL Redirection Hijack',
        target: 't.co/UvlhlFxF -> bit.ly/health-redirect',
        severity: 'HIGH',
        confidence: 92,
        description: 'Shortened link resolves to unverified third-party monetization gateway with fraudulent affiliate referral tokens.',
        evidence: 'HTTP 301 Redirect Chain Analysis: ASN 13335 (Cloudflare)',
        timestamp: '2 hours ago',
        status: 'confirmed',
      },
      {
        id: 'res-7',
        category: 'breach',
        title: 'Synthetic Avatar Extraction (GAN Detection)',
        target: 'profile_images/3310916330/3f22...',
        severity: 'HIGH',
        confidence: 94,
        description: 'Perceptual hash analysis identifies eye-alignment artifacts consistent with StyleGAN2 generated facial features.',
        evidence: 'Eye-Center Coords: (256, 256) | pHash: 0x93e4a1b0c7d2',
        timestamp: '5 hours ago',
        status: 'confirmed',
      },
    ],
  },
  general: {
    name: 'Active Workspace OSINT Scan',
    subject: 'Current Target Subject Investigation',
    overview:
      'Autonomous threat intelligence correlating public OSINT records, WHOIS registration timeline, social graph clustering, and legal frameworks.',
    items: [
      {
        id: 'res-8',
        category: 'whois',
        title: 'Digital Surface & Domain Footprint',
        target: 'Identity Surface Monitor',
        severity: 'INFO',
        confidence: 85,
        description: 'Surface footprint validated across 5 primary platforms with no conflicting unauthorized registrar listings.',
        evidence: 'Automated reverse-lookup against ICANN WHOIS and DNS zone files',
        timestamp: 'Just now',
        status: 'confirmed',
      },
      {
        id: 'res-9',
        category: 'legal',
        title: 'DPDP Section 12 Data Attestation',
        target: 'Digital Personal Data Protection Act, 2023',
        severity: 'INFO',
        confidence: 100,
        description: 'All intelligence gathering adheres to explicit analytical consent with 30-day rolling forensic log retention.',
        evidence: 'System Audit Record: S-ID-AUDIT-2026',
        timestamp: 'Active',
        status: 'confirmed',
      },
    ],
  },
};

export const ResearchPage: React.FC = () => {
  const { activeScan, showToast } = useApp();

  const [selectedCase, setSelectedCase] = useState<'delhi' | 'keller' | 'general'>('delhi');
  const [activeFilter, setActiveFilter] = useState<'all' | 'whois' | 'botnet' | 'breach' | 'legal'>('all');
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentDossier = OSINT_DOSSIER_PRESETS[selectedCase];

  const filteredItems = useMemo(() => {
    return currentDossier.items.filter((item) => {
      const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [currentDossier, activeFilter, searchQuery]);

  const handleDownloadDossier = () => {
    const jsonStr = JSON.stringify(currentDossier, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shadowid-osint-dossier-${selectedCase}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('OSINT Threat Intelligence Dossier downloaded.');
  };

  const handleCopyBriefing = () => {
    const text = `SHADOWID FORENSIC OSINT DOSSIER
Case: ${currentDossier.name}
Subject: ${currentDossier.subject}
Summary: ${currentDossier.overview}

INTELLIGENCE FINDINGS:
${currentDossier.items
  .map(
    (item, idx) =>
      `[${idx + 1}] [${item.severity}] ${item.title} (${item.target})
Confidence: ${item.confidence}% | Category: ${item.category.toUpperCase()}
Description: ${item.description}
Evidence: ${item.evidence}`
  )
  .join('\n\n')}

Regulatory Clearance: DPDP Act 2023 Section 12 & IT Act Section 66D.`;
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    showToast('Executive OSINT Intelligence Briefing copied to clipboard.');
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  const getSeverityBadge = (sev: ResearchVectorItem['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40';
      case 'HIGH':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/40';
      case 'MEDIUM':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/40';
      default:
        return 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/40';
    }
  };

  const getCategoryIcon = (cat: ResearchVectorItem['category']) => {
    switch (cat) {
      case 'whois':
        return <Globe className="w-4 h-4 text-[#38BDF8]" />;
      case 'botnet':
        return <Network className="w-4 h-4 text-[#A3E635]" />;
      case 'breach':
        return <Fingerprint className="w-4 h-4 text-[#EF4444]" />;
      case 'legal':
        return <Scale className="w-4 h-4 text-[#F59E0B]" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#38BDF8] uppercase mb-1">
            <Search className="w-4 h-4" />
            <span>Module 03: OSINT Deep Search & Threat Intelligence</span>
          </div>
          <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
            Comprehensive OSINT & Multi-Vector Research Console
          </h1>
          <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
            Aggregates WHOIS registration age, synthetic botnet engagement graphs, dark web breach attributions, and statutory Indian cyber-law precedents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadDossier}
            className="px-3 py-2 rounded text-xs font-mono-code bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Dossier
          </button>
          <button
            onClick={handleCopyBriefing}
            className="px-3 py-2 rounded text-xs font-mono-code font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-1.5 shadow-[0_0_12px_rgba(163,230,53,0.3)] transition-colors"
          >
            {copiedBrief ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedBrief ? 'Copied' : 'Copy Briefing'}
          </button>
        </div>
      </div>

      {/* Case Dossier Preset Switcher */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono-code text-[#94A3B8] uppercase flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#38BDF8]" /> Investigation Case Focus
          </span>
          <span className="text-[10px] font-mono-code text-[#A3E635]">
            4 Active Vectors &bull; Live Cross-Reference
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setSelectedCase('delhi')}
            className={`p-3 rounded text-left border transition-all text-xs space-y-1 ${
              selectedCase === 'delhi'
                ? 'bg-[#172A42] border-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#38BDF8]/40'
            }`}
          >
            <div className="font-display font-bold text-[#F1F5F9] truncate">
              Delhi Tech Exec Case
            </div>
            <div className="text-[11px] font-mono-code text-[#38BDF8] truncate">
              @priya_sharma_0fficial
            </div>
            <div className="text-[10px] text-[#94A3B8]">WHOIS + Russian Bulletproof Host</div>
          </button>

          <button
            onClick={() => setSelectedCase('keller')}
            className={`p-3 rounded text-left border transition-all text-xs space-y-1 ${
              selectedCase === 'keller'
                ? 'bg-[#172A42] border-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.2)]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#A3E635]/40'
            }`}
          >
            <div className="font-display font-bold text-[#F1F5F9] truncate">
              Keller Botnet Syndicate
            </div>
            <div className="text-[11px] font-mono-code text-[#A3E635] truncate">
              fake_users.csv Row #2
            </div>
            <div className="text-[10px] text-[#94A3B8]">GAN Avatar + 1.2s Retweet Bursts</div>
          </button>

          <button
            onClick={() => setSelectedCase('general')}
            className={`p-3 rounded text-left border transition-all text-xs space-y-1 ${
              selectedCase === 'general'
                ? 'bg-[#172A42] border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-[#07111F] border-[#1E3A5F] hover:border-[#F59E0B]/40'
            }`}
          >
            <div className="font-display font-bold text-[#F1F5F9] truncate">
              Current Active Scan Target
            </div>
            <div className="text-[11px] font-mono-code text-[#F59E0B] truncate">
              {activeScan?.subject.name || 'Universal Identity Surface'}
            </div>
            <div className="text-[10px] text-[#94A3B8]">DPDP Sec 12 Attestation Matrix</div>
          </button>
        </div>
      </div>

      {/* OSINT Multi-Vector Dossier Card */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5 space-y-4">
        {/* Case Header */}
        <div className="border-b border-[#172A42] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-display font-bold text-[#F1F5F9]">
                {currentDossier.name}
              </h3>
              <div className="text-xs font-mono-code text-[#38BDF8] mt-0.5">
                Target Subject: {currentDossier.subject}
              </div>
            </div>
            <span className="text-xs font-mono-code px-2.5 py-1 rounded bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/40 self-start sm:self-auto">
              Forensic Integrity: 100% Attested
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-2 leading-relaxed">
            {currentDossier.overview}
          </p>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#38BDF8] text-[#07111F] font-bold border-[#38BDF8]'
                  : 'bg-[#07111F] text-[#94A3B8] border-[#1E3A5F] hover:text-[#F1F5F9]'
              }`}
            >
              All Vectors ({currentDossier.items.length})
            </button>
            <button
              onClick={() => setActiveFilter('whois')}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border flex items-center gap-1 transition-colors ${
                activeFilter === 'whois'
                  ? 'bg-[#38BDF8] text-[#07111F] font-bold border-[#38BDF8]'
                  : 'bg-[#07111F] text-[#94A3B8] border-[#1E3A5F] hover:text-[#F1F5F9]'
              }`}
            >
              <Globe className="w-3 h-3" /> WHOIS & Domains
            </button>
            <button
              onClick={() => setActiveFilter('botnet')}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border flex items-center gap-1 transition-colors ${
                activeFilter === 'botnet'
                  ? 'bg-[#A3E635] text-[#07111F] font-bold border-[#A3E635]'
                  : 'bg-[#07111F] text-[#94A3B8] border-[#1E3A5F] hover:text-[#F1F5F9]'
              }`}
            >
              <Network className="w-3 h-3" /> Botnet Topology
            </button>
            <button
              onClick={() => setActiveFilter('breach')}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border flex items-center gap-1 transition-colors ${
                activeFilter === 'breach'
                  ? 'bg-[#EF4444] text-[#07111F] font-bold border-[#EF4444]'
                  : 'bg-[#07111F] text-[#94A3B8] border-[#1E3A5F] hover:text-[#F1F5F9]'
              }`}
            >
              <Fingerprint className="w-3 h-3" /> Dark Web / Leaks
            </button>
            <button
              onClick={() => setActiveFilter('legal')}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border flex items-center gap-1 transition-colors ${
                activeFilter === 'legal'
                  ? 'bg-[#F59E0B] text-[#07111F] font-bold border-[#F59E0B]'
                  : 'bg-[#07111F] text-[#94A3B8] border-[#1E3A5F] hover:text-[#F1F5F9]'
              }`}
            >
              <Scale className="w-3 h-3" /> Indian Cyber Law
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search findings..."
              className="bg-[#07111F] border border-[#1E3A5F] rounded pl-8 pr-3 py-1.5 text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#38BDF8] w-full sm:w-48"
            />
          </div>
        </div>

        {/* Findings Grid */}
        <div className="space-y-3 pt-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-[#07111F] border border-[#1E3A5F] hover:border-[#38BDF8]/40 rounded-lg space-y-2.5 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-[#172A42] border border-[#1E3A5F]">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-[#F1F5F9]">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-mono-code text-[#38BDF8]">
                      Target: {item.target}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono-code px-2 py-0.5 rounded border font-bold ${getSeverityBadge(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#172A42] text-[#A3E635] border border-[#A3E635]/30">
                    Confidence: {item.confidence}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#CBD5E1] leading-relaxed">
                {item.description}
              </p>

              <div className="p-2 bg-[#0F1D2E] rounded border border-[#1E3A5F] text-[11px] font-mono-code text-[#94A3B8] flex items-center justify-between gap-2">
                <span className="truncate">
                  <strong className="text-[#38BDF8]">Evidence:</strong> {item.evidence}
                </span>
                <span className="text-[10px] text-[#64748B] shrink-0">{item.timestamp}</span>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-xs text-[#94A3B8] bg-[#07111F] rounded border border-[#1E3A5F]">
              No threat intelligence findings matching current filter parameters.
            </div>
          )}
        </div>
      </div>

      {/* Official Prompt 14 Manual Attestation Bridge */}
      <div className="space-y-3 pt-2">
        <div className="text-xs font-mono-code text-[#A3E635] uppercase flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5" /> Prompt 14 Attestation & iNSIGHTS Research Bridge
        </div>
        <ResearchBridge claims={activeScan?.researchClaims || []} />
      </div>
    </div>
  );
};
