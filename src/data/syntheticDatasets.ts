/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Repeatable Indian Synthetic Test Datasets & Rule Registry
 * Prompt 8 & Prompt 13 compliant
 */

import { ScanJob, Subject, ShadowScoreCalculation, ComponentScores, Severity } from '../types.ts';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Delhi (NCT)', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

/**
 * Deterministic Shadow Score Calculator
 * Weights: Exposure 35%, Connectability 25%, Impersonation 25%, Document Anomaly 15%
 */
export function calculateShadowScore(components: ComponentScores): ShadowScoreCalculation {
  const weights = {
    exposure: 0.35,
    connectability: 0.25,
    impersonation: 0.25,
    documentAnomaly: 0.15,
  };

  let weightedSum = 0;
  let activeWeightSum = 0;
  const contributions = {
    exposure: 0,
    connectability: 0,
    impersonation: 0,
    documentAnomaly: 0,
  };

  if (components.exposure !== null) {
    weightedSum += components.exposure * weights.exposure;
    activeWeightSum += weights.exposure;
    contributions.exposure = Math.round(components.exposure * weights.exposure);
  }
  if (components.connectability !== null) {
    weightedSum += components.connectability * weights.connectability;
    activeWeightSum += weights.connectability;
    contributions.connectability = Math.round(components.connectability * weights.connectability);
  }
  if (components.impersonation !== null) {
    weightedSum += components.impersonation * weights.impersonation;
    activeWeightSum += weights.impersonation;
    contributions.impersonation = Math.round(components.impersonation * weights.impersonation);
  }
  if (components.documentAnomaly !== null) {
    weightedSum += components.documentAnomaly * weights.documentAnomaly;
    activeWeightSum += weights.documentAnomaly;
    contributions.documentAnomaly = Math.round(components.documentAnomaly * weights.documentAnomaly);
  }

  const coverage = Math.round(activeWeightSum * 100);
  if (activeWeightSum === 0) {
    return {
      score: null,
      coverage: 0,
      isProvisional: true,
      provisionalReason: 'Insufficient evidence across all modules.',
      severityBand: 'lower',
      componentScores: components,
      weights,
      contributions,
      inputSnapshotHash: 'sha256-0000000000000000',
    };
  }

  const calculatedScore = Math.round(weightedSum / activeWeightSum);
  const isProvisional = coverage < 100;
  let provisionalReason: string | undefined;

  if (isProvisional) {
    const missing: string[] = [];
    if (components.exposure === null) missing.push('Exposure');
    if (components.connectability === null) missing.push('Cross-Connectability');
    if (components.impersonation === null) missing.push('Impersonation');
    if (components.documentAnomaly === null) missing.push('Document Defense');
    provisionalReason = `Provisional assessment based on ${coverage}% module coverage. Missing: ${missing.join(', ')}.`;
  }

  let severityBand: Severity = 'lower';
  if (calculatedScore >= 75) severityBand = 'high';
  else if (calculatedScore >= 50) severityBand = 'elevated';
  else if (calculatedScore >= 25) severityBand = 'moderate';
  else severityBand = 'lower';

  return {
    score: calculatedScore,
    coverage,
    isProvisional,
    provisionalReason,
    severityBand,
    componentScores: components,
    weights,
    contributions,
    inputSnapshotHash: `sha256-${Math.abs(Math.sin(calculatedScore * 1337 + coverage)).toString(16).substring(2, 18)}`,
  };
}

/**
 * 6 Repeatable Synthetic Indian Cases from Prompt 8
 */
export const SYNTHETIC_CASES: Record<string, ScanJob> = {
  arun_s: {
    id: 'scan-synth-arun-01',
    subject: {
      id: 'sub-arun-01',
      name: 'Arun Sharma',
      city: 'Chandigarh',
      state: 'Chandigarh',
      institution: 'Punjab Engineering College (PEC)',
      employer: 'CyberMatrix Infotech',
      primaryHandle: '@arun_sharma_99',
      phoneMasked: '+91 98881 •••••',
      emailMasked: 'arun.s•••••@example.com',
      isSynthetic: true,
      notes: 'Synthetic case: Public job, university, handle, and contact disclosure across supplied profiles.',
    },
    consent: {
      id: 'cst-arun-01',
      subjectId: 'sub-arun-01',
      purpose: 'Self-assessment of public digital attack surface & cross-network correlation',
      permittedModules: ['exposure', 'impersonation', 'documents', 'research'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 30,
      acceptedAt: '2026-09-21T09:15:00Z',
      isRevoked: false,
    },
    selectedModules: ['exposure', 'impersonation', 'documents', 'research'],
    status: 'succeeded',
    progressPercent: 100,
    currentStage: 'Assessment complete with multi-vector synthesis',
    queuedAt: '2026-09-21T09:15:05Z',
    completedAt: '2026-09-21T09:15:18Z',
    scoreData: calculateShadowScore({
      exposure: 78,
      connectability: 65,
      impersonation: 60,
      documentAnomaly: 20,
    }),
    findings: [
      {
        id: 'fnd-arun-01',
        ruleId: 'EXP-CORR-004',
        title: 'High-Fidelity Cross-Platform Profile Linkage',
        module: 'exposure',
        severity: 'high',
        scoreImpact: 26,
        description: 'Exact handle match (@arun_sharma_99) combined with consistent PEC graduation year (2024) allows deterministic profile union between GitHub and LinkedIn.',
        supportingEvidence: ['ev-01 (GitHub profile)', 'ev-02 (LinkedIn directory leak)', 'ev-03 (Public Telegram bio)'],
        confidenceReason: 'Handle matches exactly; bio quotes identical project name "IndusScan".',
        scopeLimitation: 'Scope strictly restricted to supplied public profile URLs.',
        remediation: 'De-couple developer handles from career profiles and mask institution graduation dates from public view.',
        status: 'active',
        createdAt: '2026-09-21T09:15:10Z',
      },
      {
        id: 'fnd-arun-02',
        ruleId: 'EXP-TEL-002',
        title: 'Unmasked Mobile Contact on Public Technical Repo',
        module: 'exposure',
        severity: 'elevated',
        scoreImpact: 18,
        description: 'A commit message in public repository contains an unmasked Indian telecom contact (+91 98881 29012) cross-referenced to Truecaller index.',
        supportingEvidence: ['ev-04 (Git commit metadata)'],
        confidenceReason: 'Regular expression matched valid TRAI 10-digit format with Punjab telecom circle.',
        scopeLimitation: 'Evaluated only in user-submitted repository archives.',
        remediation: 'Scrub git history using git-filter-repo and rotate communication number.',
        status: 'active',
        createdAt: '2026-09-21T09:15:12Z',
      },
      {
        id: 'fnd-arun-03',
        ruleId: 'IMP-BIO-001',
        title: 'Telegram Clone with Copied Bio & Modified UPI Handle',
        module: 'impersonation',
        severity: 'high',
        scoreImpact: 22,
        description: 'Discovered candidate profile @arun_sharma_99_official using the reference avatar with an altered UPI payee identifier (arun@okaxis).',
        supportingEvidence: ['ev-05 (Candidate profile snapshot)', 'ev-06 (UPI handle metadata)'],
        confidenceReason: 'Bio token overlap is 94%; avatar perceptual hash difference is 0.04 (near clone).',
        scopeLimitation: 'Candidate was user-submitted for comparative risk analysis.',
        remediation: 'File an impersonation report via Telegram Abuse and notify close contacts about the unverified payment handle.',
        status: 'active',
        createdAt: '2026-09-21T09:15:15Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'n1', label: 'Arun Sharma', category: 'identity', val: 'PEC Chandigarh', riskWeight: 4, source: 'Supplied Reference', x: 250, y: 180 },
        { id: 'n2', label: '@arun_sharma_99', category: 'handle', val: 'GitHub & X', riskWeight: 7, source: 'Public GitHub', x: 120, y: 80 },
        { id: 'n3', label: '+91 98881 •••••', category: 'telecom', val: 'Airtel Punjab Circle', riskWeight: 8, source: 'Git Commit', x: 380, y: 80 },
        { id: 'n4', label: 'PEC Chandigarh', category: 'employer', val: 'Alumni Directory', riskWeight: 5, source: 'LinkedIn Profile', x: 100, y: 280 },
        { id: 'n5', label: 'CyberMatrix Infotech', category: 'employer', val: 'Current Employer', riskWeight: 6, source: 'Bio Statement', x: 390, y: 280 },
        { id: 'n6', label: '@arun_sharma_99_official', category: 'handle', val: 'Suspicious Clone', riskWeight: 9, source: 'Candidate Submission', x: 250, y: 340 },
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2', label: 'Primary Handle', relationType: 'same_handle', certainty: 98, isVerified: true },
        { id: 'e2', source: 'n2', target: 'n3', label: 'Telecom Leak in Commits', relationType: 'leaked_in', certainty: 95, isVerified: true },
        { id: 'e3', source: 'n1', target: 'n4', label: 'College Verification', relationType: 'associated_with', certainty: 90, isVerified: true },
        { id: 'e4', source: 'n1', target: 'n5', label: 'Employer Context', relationType: 'associated_with', certainty: 88, isVerified: true },
        { id: 'e5', source: 'n2', target: 'n6', label: 'Handle Typosquatting', relationType: 'contradicts', certainty: 94, isVerified: true },
      ],
    },
    evidenceList: [
      {
        key: 'handle',
        label: 'Developer Handle',
        value: '@arun_sharma_99',
        sourceType: 'social',
        sourceName: 'GitHub Developer Profile',
        sourceUrl: 'https://github.com/example-arun',
        observedAt: '2026-09-20T11:00:00Z',
        extractionMethod: 'manual_submission',
        certaintyReason: 'Direct user submission with author email verification.',
        isConfirmedByReviewer: true,
      },
      {
        key: 'phone',
        label: 'Telecom Identity',
        value: '+91 98881 29012 (Punjab)',
        sourceType: 'telecom',
        sourceName: 'Git Log Author Sign-Off',
        observedAt: '2026-09-20T11:05:00Z',
        extractionMethod: 'verified_fixture',
        certaintyReason: 'Unmasked phone matched in commit footer.',
        isConfirmedByReviewer: true,
      },
      {
        key: 'university',
        label: 'Academic Institution',
        value: 'Punjab Engineering College, B.Tech CSE (2020-2024)',
        sourceType: 'registry',
        sourceName: 'Alumni Roster (Sample Public)',
        observedAt: '2026-09-20T11:10:00Z',
        extractionMethod: 'verified_fixture',
        certaintyReason: 'Confirmed against graduation list snapshot.',
        isConfirmedByReviewer: true,
      },
    ],
    profileComparison: {
      id: 'cmp-arun-01',
      referenceSubject: {
        name: 'Arun Sharma',
        handle: '@arun_sharma_99',
        bio: 'B.Tech CSE PEC Chandigarh | Security Researcher building IndusScan | Open to OSS collaborations',
        institution: 'Punjab Engineering College',
        city: 'Chandigarh',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'd41d8cd98f00b204e9800998ecf8427e',
      },
      candidateProfile: {
        platform: 'Telegram / Web Directory',
        profileUrl: 'https://t.me/example-candidate-arun',
        name: 'Arun Sharma (Official)',
        handle: '@arun_sharma_99_official',
        bio: 'Security Researcher building IndusScan | DM for private security audits & consultations. UPI: arun@okaxis',
        location: 'Chandigarh / Mohali',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'd41d8cd98f00b204e9800998ecf8427e',
        followers: 412,
        createdDate: '12 Aug 2026',
      },
      metrics: {
        nameTokenOverlap: 92,
        handleSimilarity: 88,
        bioTextOverlap: 89,
        avatarPerceptualMatch: 99,
        contextualAgreement: 72,
      },
      contradictions: [
        'Candidate requests direct financial remuneration via UPI handle not linked to reference.',
        'Candidate handle introduces "_official" suffix common in identity mimicry.',
      ],
      verdict: 'Needs review',
      verdictNotes: 'Near-identical avatar and bio overlap strongly indicate intentional mimicry. Discrepancy in payment rail warrants high caution.',
      reviewerDecision: 'flag_for_takedown',
    },
    documentAnalysis: {
      id: 'doc-arun-01',
      documentCategory: 'PAN',
      sampleLabel: 'SAMPLE_PAN_ARUN_S.PNG',
      filename: 'sample_pan_card_fixture.png',
      mimeType: 'image/png',
      fileSizeBytes: 428000,
      ocrEngine: 'Tesseract eng/hin v5.3 + OpenCV Preprocessing',
      qualityScore: 92,
      languageDetected: 'English',
      verdict: 'No configured inconsistencies found',
      summary: 'Deterministic OCR completed on sample Indian Income Tax PAN card. Layout geometry and checksum verify against sample rules.',
      boxes: [
        { id: 'b1', label: 'Permanent Account Number', value: 'ABCPS1234D', maskedValue: 'ABCPS••••D', confidence: 96, x: 22, y: 38, width: 45, height: 12, isAnomaly: false },
        { id: 'b2', label: 'Name', value: 'ARUN SHARMA', maskedValue: 'ARUN SHARMA', confidence: 98, x: 22, y: 52, width: 40, height: 10, isAnomaly: false },
        { id: 'b3', label: 'Father\'s Name', value: 'RAMESH SHARMA', maskedValue: 'RAMESH SHARMA', confidence: 94, x: 22, y: 64, width: 44, height: 10, isAnomaly: false },
        { id: 'b4', label: 'Date of Birth', value: '14/08/2001', maskedValue: '14/08/2001', confidence: 97, x: 22, y: 76, width: 30, height: 9, isAnomaly: false },
      ],
      inconsistencies: [],
      humanReviewNotes: 'Sample PAN verified for synthetic demo. No font mismatch detected.',
      isHumanVerified: true,
    },
    researchClaims: [
      {
        id: 'clm-01',
        claim: 'Repeated presence of student projects in public Git repositories without .gitignore of contact logs increases credential stuffing risks.',
        sourceReference: 'https://insights-ai.info/DeepSearch?query=dev-exposure-chandigarh',
        uncertaintyRating: 'low',
        inferenceType: 'external_guidance',
        reviewerStatus: 'accepted',
        reviewerNotes: 'Valid best-practice advice for developers in Indian tech hubs.',
      },
      {
        id: 'clm-02',
        claim: 'Candidate profile handle has sent unverified UPI payment links in public developer forums.',
        sourceReference: 'Manual community incident report #8831',
        uncertaintyRating: 'moderate',
        inferenceType: 'supplied_fact',
        reviewerStatus: 'accepted',
        reviewerNotes: 'Corroborates high risk of UPI fraud mimicry.',
      },
    ],
    actions: [
      {
        id: 'act-01',
        findingRef: 'fnd-arun-03',
        title: 'Report Impersonator Telegram Handle to Platform Trust & Safety',
        module: 'impersonation',
        priority: 'critical',
        status: 'pending',
        assignee: 'Arun Sharma (Self)',
        recommendation: 'Submit official impersonation ticket attaching reference profile and candidate screenshots.',
        verificationMethod: 'Platform ticket reference number or link takedown confirmation.',
        createdAt: '2026-09-21T09:16:00Z',
        updatedAt: '2026-09-21T09:16:00Z',
      },
      {
        id: 'act-02',
        findingRef: 'fnd-arun-02',
        title: 'Scrub Unmasked Mobile Number from Public Git Commit History',
        module: 'exposure',
        priority: 'high',
        status: 'in-progress',
        assignee: 'DevOps / Lead Dev',
        recommendation: 'Run git-filter-repo to scrub "+91 98881" across all branches and force push clean refs.',
        verificationMethod: 'Re-scan repository commit logs for telecom pattern.',
        createdAt: '2026-09-21T09:16:00Z',
        updatedAt: '2026-09-21T09:20:00Z',
      },
      {
        id: 'act-03',
        findingRef: 'fnd-arun-01',
        title: 'Configure Distinct Handle for Public Social Media',
        module: 'exposure',
        priority: 'medium',
        status: 'pending',
        assignee: 'Arun Sharma (Self)',
        recommendation: 'Separate personal social handles from code repository author handles to break automated OSINT graph bridges.',
        verificationMethod: 'Manual inspection of search engine indexing.',
        createdAt: '2026-09-21T09:16:00Z',
        updatedAt: '2026-09-21T09:16:00Z',
      },
    ],
  },

  kavya_m: {
    id: 'scan-synth-kavya-02',
    subject: {
      id: 'sub-kavya-02',
      name: 'Kavya Mahajan',
      city: 'Shimla',
      state: 'Himachal Pradesh',
      institution: 'Himachal Pradesh University (HPU)',
      employer: 'Himachal Tourism Council (Contract)',
      primaryHandle: '@kavya_hp_m',
      phoneMasked: '+91 94180 •••••',
      emailMasked: 'kavya.m•••••@example.org',
      isSynthetic: true,
      notes: 'Synthetic case: Limited evidence footprint and an unrelated namesake in another state.',
    },
    consent: {
      id: 'cst-kavya-02',
      subjectId: 'sub-kavya-02',
      purpose: 'Risk assessment of namesake collision and personal information exposure',
      permittedModules: ['exposure', 'impersonation'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 30,
      acceptedAt: '2026-09-21T08:00:00Z',
      isRevoked: false,
    },
    selectedModules: ['exposure', 'impersonation'],
    status: 'partial',
    progressPercent: 100,
    currentStage: 'Partial assessment (Document Defense unselected)',
    queuedAt: '2026-09-21T08:00:05Z',
    completedAt: '2026-09-21T08:00:15Z',
    scoreData: calculateShadowScore({
      exposure: 28,
      connectability: 20,
      impersonation: 15,
      documentAnomaly: null,
    }),
    findings: [
      {
        id: 'fnd-kavya-01',
        ruleId: 'IMP-NAME-002',
        title: 'Benign Namesake Collision Discovered (Unrelated Profile)',
        module: 'impersonation',
        severity: 'lower',
        scoreImpact: 6,
        description: 'Profile identified in Mumbai bearing identical name "Kavya Mahajan" but completely distinct professional domain (Fintech Banking) and education (St. Xavier\'s).',
        supportingEvidence: ['ev-kavya-candidate (LinkedIn Bombay Profile)'],
        confidenceReason: 'Zero city, institution, or mutual network overlap. Clearly an independent namesake.',
        scopeLimitation: 'Namesakes must not be treated as impersonators without independent corroboration.',
        remediation: 'No action required; do not issue takedown against unrelated namesake.',
        status: 'active',
        createdAt: '2026-09-21T08:00:10Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'kn1', label: 'Kavya Mahajan (HP)', category: 'identity', val: 'Shimla HPU', riskWeight: 2, source: 'Supplied Profile', x: 200, y: 150 },
        { id: 'kn2', label: '@kavya_hp_m', category: 'handle', val: 'Instagram & X', riskWeight: 3, source: 'Supplied Handle', x: 100, y: 80 },
        { id: 'kn3', label: 'Kavya Mahajan (Mumbai)', category: 'identity', val: 'Investment Banking', riskWeight: 2, source: 'Public Search Result', x: 350, y: 150 },
      ],
      edges: [
        { id: 'ke1', source: 'kn1', target: 'kn2', label: 'Verified Handle', relationType: 'associated_with', certainty: 95, isVerified: true },
        { id: 'ke2', source: 'kn1', target: 'kn3', label: 'Independent Namesake (Contradictory)', relationType: 'contradicts', certainty: 99, isVerified: true },
      ],
    },
    evidenceList: [
      {
        key: 'name',
        label: 'Subject Name',
        value: 'Kavya Mahajan',
        sourceType: 'social',
        sourceName: 'Supplied State Profile',
        observedAt: '2026-09-21T07:45:00Z',
        extractionMethod: 'manual_submission',
        certaintyReason: 'Primary user identity verified for demo.',
        isConfirmedByReviewer: true,
      },
    ],
    profileComparison: {
      id: 'cmp-kavya-02',
      referenceSubject: {
        name: 'Kavya Mahajan',
        handle: '@kavya_hp_m',
        bio: 'Environmental Educator & Heritage guide based in Shimla, Himachal Pradesh.',
        institution: 'HPU Shimla',
        city: 'Shimla',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'a1b2c3d4e5f6071829',
      },
      candidateProfile: {
        platform: 'Corporate Directory',
        profileUrl: 'https://example.com/kavya-mumbai',
        name: 'Kavya Mahajan',
        handle: '@kavya_fintech_bom',
        bio: 'Risk Analyst at Global Equities Mumbai | Alum St. Xavier\'s College',
        location: 'Mumbai, Maharashtra',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&auto=format&fit=crop&q=80',
        avatarHash: '998877665544332211',
        followers: 1280,
        createdDate: '15 Jan 2022',
      },
      metrics: {
        nameTokenOverlap: 100,
        handleSimilarity: 25,
        bioTextOverlap: 4,
        avatarPerceptualMatch: 8,
        contextualAgreement: 0,
      },
      contradictions: [
        'Geographic divergence: Shimla, Himachal Pradesh vs Mumbai, Maharashtra',
        'Distinct careers: Environmental Heritage vs Investment Banking',
      ],
      verdict: 'Limited overlap',
      verdictNotes: 'Candidate is an independent namesake with zero malicious correlation or identity mimicry signals.',
      reviewerDecision: 'dismiss',
    },
    actions: [],
  },

  meera_r: {
    id: 'scan-synth-meera-03',
    subject: {
      id: 'sub-meera-03',
      name: 'Meera Ramanathan',
      city: 'Bengaluru',
      state: 'Karnataka',
      institution: 'IISc Bengaluru',
      employer: 'Natura BioLabs',
      primaryHandle: '@meera_biotech',
      phoneMasked: '+91 97412 •••••',
      emailMasked: 'm.raman•••••@example.com',
      isSynthetic: true,
      notes: 'Synthetic case: Repeated avatar and bio with a conflicting contact link (phishing funnel).',
    },
    consent: {
      id: 'cst-meera-03',
      subjectId: 'sub-meera-03',
      purpose: 'Identify fraudulent recruiter profiles recycling personal credentials',
      permittedModules: ['exposure', 'impersonation', 'research'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 30,
      acceptedAt: '2026-09-21T06:30:00Z',
      isRevoked: false,
    },
    selectedModules: ['exposure', 'impersonation', 'research'],
    status: 'succeeded',
    progressPercent: 100,
    currentStage: 'Synthesis complete',
    queuedAt: '2026-09-21T06:30:05Z',
    completedAt: '2026-09-21T06:30:16Z',
    scoreData: calculateShadowScore({
      exposure: 52,
      connectability: 48,
      impersonation: 84,
      documentAnomaly: null,
    }),
    findings: [
      {
        id: 'fnd-meera-01',
        ruleId: 'IMP-AVT-003',
        title: 'Recycled Avatar & Bio Funneling to Malicious WhatsApp Link',
        module: 'impersonation',
        severity: 'high',
        scoreImpact: 30,
        description: 'Candidate profile copied the IISc research bio and avatar verbatim, but inserted a third-party WhatsApp shortlink (wa.me/9188000...) requesting candidate interview fees.',
        supportingEvidence: ['ev-meera-ref', 'ev-meera-fake'],
        confidenceReason: 'Avatar hash match = 100%; Bio text sequence match = 96%. Extracted external link points to unverified operator.',
        scopeLimitation: 'Scope bounded to user-submitted scam reports.',
        remediation: 'Issue urgent public disclaimer on genuine LinkedIn/X and report phone number to Indian National Cyber Crime Reporting Portal (cybercrime.gov.in).',
        status: 'active',
        createdAt: '2026-09-21T06:30:12Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'mn1', label: 'Meera Ramanathan', category: 'identity', val: 'IISc BioLabs', riskWeight: 4, source: 'Supplied Profile', x: 240, y: 160 },
        { id: 'mn2', label: '@meera_biotech', category: 'handle', val: 'LinkedIn & ResearchGate', riskWeight: 5, source: 'Genuine Handle', x: 120, y: 80 },
        { id: 'mn3', label: 'wa.me/9188000XXXXX', category: 'telecom', val: 'Phishing WhatsApp Gateway', riskWeight: 9, source: 'Candidate Profile Bio', x: 380, y: 240 },
        { id: 'mn4', label: 'Natura BioLabs', category: 'employer', val: 'Biotech Corp', riskWeight: 3, source: 'Supplied Employer', x: 100, y: 260 },
      ],
      edges: [
        { id: 'me1', source: 'mn1', target: 'mn2', label: 'Primary Handle', relationType: 'same_handle', certainty: 100, isVerified: true },
        { id: 'me2', source: 'mn1', target: 'mn4', label: 'Legitimate Affiliation', relationType: 'associated_with', certainty: 95, isVerified: true },
        { id: 'me3', source: 'mn2', target: 'mn3', label: 'Conflicting External Gateway', relationType: 'contradicts', certainty: 98, isVerified: true },
      ],
    },
    evidenceList: [
      {
        key: 'researcher',
        label: 'Professional Profile',
        value: 'Dr. Meera Ramanathan, Computational Biology',
        sourceType: 'social',
        sourceName: 'Institutional Bio',
        observedAt: '2026-09-21T06:20:00Z',
        extractionMethod: 'manual_submission',
        certaintyReason: 'Institutional email verified.',
        isConfirmedByReviewer: true,
      },
    ],
    profileComparison: {
      id: 'cmp-meera-03',
      referenceSubject: {
        name: 'Meera Ramanathan, Ph.D.',
        handle: '@meera_biotech',
        bio: 'Research Scientist at Natura BioLabs | IISc Alum | Genomics & Drug Discovery. Queries: m.raman@example.com',
        institution: 'IISc Bengaluru',
        city: 'Bengaluru',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'ee55ffaa11223344',
      },
      candidateProfile: {
        platform: 'Professional Messaging Group',
        profileUrl: 'https://example.com/meera-recruiter-fake',
        name: 'Meera Ramanathan (HR & Talent)',
        handle: '@meera_biotech_career',
        bio: 'Research Scientist at Natura BioLabs | Hiring Freshers & BioTech Analysts! Connect on WhatsApp: wa.me/918800021000',
        location: 'Bengaluru, Karnataka',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'ee55ffaa11223344',
        followers: 890,
        createdDate: '18 Sep 2026',
      },
      metrics: {
        nameTokenOverlap: 88,
        handleSimilarity: 82,
        bioTextOverlap: 86,
        avatarPerceptualMatch: 100,
        contextualAgreement: 55,
      },
      contradictions: [
        'Candidate presents as recruiting freshers for monetary application processing.',
        'Contact diverted to unverified third-party WhatsApp gateway (+91 88000 •••••).',
      ],
      verdict: 'Needs review',
      verdictNotes: 'Exact avatar reuse and high bio overlap combined with conflicting monetization rail confirms hostile identity mimicry.',
      reviewerDecision: 'flag_for_takedown',
    },
    actions: [
      {
        id: 'act-meera-01',
        findingRef: 'fnd-meera-01',
        title: 'Report Phishing Contact Number to National Cyber Crime Portal',
        module: 'impersonation',
        priority: 'critical',
        status: 'pending',
        assignee: 'Meera Ramanathan',
        recommendation: 'Log an alert on cybercrime.gov.in under "Job Fraud & Identity Theft" providing the fake WhatsApp contact.',
        verificationMethod: 'Cybercrime acknowledgement receipt.',
        createdAt: '2026-09-21T06:31:00Z',
        updatedAt: '2026-09-21T06:31:00Z',
      },
    ],
  },

  rohan_k: {
    id: 'scan-synth-rohan-04',
    subject: {
      id: 'sub-rohan-04',
      name: 'Rohan Kapoor',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      institution: 'IIM Lucknow',
      employer: 'Avadh Agro Trading',
      primaryHandle: '@rohan_agro_lko',
      phoneMasked: '+91 99350 •••••',
      emailMasked: 'rohan.k•••••@example.com',
      isSynthetic: true,
      notes: 'Synthetic case: Similar name but contradictory profile context and disparate business entities.',
    },
    consent: {
      id: 'cst-rohan-04',
      subjectId: 'sub-rohan-04',
      purpose: 'Distinguish personal commercial footprint from namesake distributor',
      permittedModules: ['exposure', 'impersonation'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 30,
      acceptedAt: '2026-09-21T05:15:00Z',
      isRevoked: false,
    },
    selectedModules: ['exposure', 'impersonation'],
    status: 'succeeded',
    progressPercent: 100,
    currentStage: 'Completed',
    queuedAt: '2026-09-21T05:15:05Z',
    completedAt: '2026-09-21T05:15:14Z',
    scoreData: calculateShadowScore({
      exposure: 34,
      connectability: 26,
      impersonation: 22,
      documentAnomaly: null,
    }),
    findings: [
      {
        id: 'fnd-rohan-01',
        ruleId: 'IMP-CONTR-001',
        title: 'Disparate Industry Context Refutes Identity Impersonation',
        module: 'impersonation',
        severity: 'lower',
        scoreImpact: 8,
        description: 'Candidate profile "Rohan Kapoor" in Delhi operates in Fashion & Textile export, completely unrelated to Agriculture commodities in Lucknow.',
        supportingEvidence: ['ev-rohan-delhi-gst'],
        confidenceReason: 'Independent GST registrations verified across different states and NIC codes.',
        scopeLimitation: 'Business registry sample records.',
        remediation: 'Clarify company domain on business cards; no threat action required.',
        status: 'active',
        createdAt: '2026-09-21T05:15:10Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'rn1', label: 'Rohan Kapoor (LKO)', category: 'identity', val: 'Agro Trading Lucknow', riskWeight: 3, source: 'Supplied Profile', x: 180, y: 150 },
        { id: 'rn2', label: 'Rohan Kapoor (DEL)', category: 'identity', val: 'Textiles Delhi', riskWeight: 2, source: 'Supplied Candidate', x: 340, y: 150 },
      ],
      edges: [
        { id: 're1', source: 'rn1', target: 'rn2', label: 'Distinct Entity Separation', relationType: 'contradicts', certainty: 96, isVerified: true },
      ],
    },
    evidenceList: [],
    profileComparison: {
      id: 'cmp-rohan-04',
      referenceSubject: {
        name: 'Rohan Kapoor',
        handle: '@rohan_agro_lko',
        bio: 'Director at Avadh Agro Trading Co. | Agribusiness & Grain Supply Chain | Alum IIM Lucknow',
        institution: 'IIM Lucknow',
        city: 'Lucknow',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
        avatarHash: 'aabbcc112233',
      },
      candidateProfile: {
        platform: 'B2B Trade Directory',
        profileUrl: 'https://example.com/rohan-textiles-delhi',
        name: 'Rohan Kapoor',
        handle: '@kapoor_fabrics_del',
        bio: 'Founder, Kapoor Textiles & Apparel Okhla | Indian Cotton Exporters',
        location: 'New Delhi, Delhi',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
        avatarHash: '445566778899',
        followers: 2400,
        createdDate: '10 Feb 2021',
      },
      metrics: {
        nameTokenOverlap: 100,
        handleSimilarity: 30,
        bioTextOverlap: 8,
        avatarPerceptualMatch: 12,
        contextualAgreement: 5,
      },
      contradictions: [
        'Sector divergence: Agricultural commodities vs Garment export',
        'Headquarters: Lucknow, UP vs Okhla, New Delhi',
      ],
      verdict: 'Limited overlap',
      verdictNotes: 'Legitimate distinct business owner; no evidence of identity usurpation or brand confusion.',
      reviewerDecision: 'dismiss',
    },
    actions: [],
  },

  sana_a: {
    id: 'scan-synth-sana-05',
    subject: {
      id: 'sub-sana-05',
      name: 'Sana Ansari',
      city: 'Mumbai',
      state: 'Maharashtra',
      institution: 'St. Xavier\'s College, Mumbai',
      employer: 'Gateway Media Labs',
      primaryHandle: '@sana_ansari_mumbai',
      phoneMasked: '+91 98200 •••••',
      emailMasked: 'sana.a•••••@example.com',
      isSynthetic: true,
      notes: 'Synthetic case: Inconsistent fields and tampering indicators on a clearly marked SAMPLE document.',
    },
    consent: {
      id: 'cst-sana-05',
      subjectId: 'sub-sana-05',
      purpose: 'Document Defense analysis of submitted identity token with suspected font and date anomalies',
      permittedModules: ['documents', 'exposure'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 1, // 24 hour document retention
      acceptedAt: '2026-09-21T04:10:00Z',
      isRevoked: false,
    },
    selectedModules: ['documents', 'exposure'],
    status: 'succeeded',
    progressPercent: 100,
    currentStage: 'Document Defense anomaly triage complete',
    queuedAt: '2026-09-21T04:10:05Z',
    completedAt: '2026-09-21T04:10:19Z',
    scoreData: calculateShadowScore({
      exposure: 30,
      connectability: 25,
      impersonation: null,
      documentAnomaly: 85,
    }),
    findings: [
      {
        id: 'fnd-sana-01',
        ruleId: 'DOC-ANOM-001',
        title: 'Micro-Typography Inconsistency & Chronological Date Discrepancy',
        module: 'documents',
        severity: 'high',
        scoreImpact: 32,
        description: 'OCR analysis of sample Aadhaar layout identified secondary font overlay (Arial) in the Year of Birth field, alongside an impossible issue date preceding the subject\'s birth year.',
        supportingEvidence: ['doc-sana-sample-05 (Sample Identification Image)'],
        confidenceReason: 'Bounding box #b2 font glyph metrics deviate >3.8 std deviations from standard government template font.',
        scopeLimitation: 'Checked solely against visual consistency rules; no claim of government registry validation.',
        remediation: 'Request resubmission of official e-Aadhaar with valid digitally signed QR code or reject documentation as altered.',
        status: 'active',
        createdAt: '2026-09-21T04:10:15Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'sn1', label: 'Sana Ansari', category: 'identity', val: 'Mumbai Media', riskWeight: 3, source: 'Supplied Subject', x: 200, y: 150 },
        { id: 'sn2', label: 'SAMPLE_AADHAAR_SANA.PNG', category: 'document', val: 'Font Alteration Detected', riskWeight: 9, source: 'Uploaded Document', x: 350, y: 150 },
      ],
      edges: [
        { id: 'se1', source: 'sn1', target: 'sn2', label: 'Document Review Required', relationType: 'contradicts', certainty: 94, isVerified: false },
      ],
    },
    evidenceList: [],
    documentAnalysis: {
      id: 'doc-sana-05',
      documentCategory: 'Aadhaar',
      sampleLabel: 'SAMPLE_AADHAAR_SANA_ALTERED.PNG',
      filename: 'sample_altered_aadhaar_fixture.png',
      mimeType: 'image/png',
      fileSizeBytes: 612000,
      ocrEngine: 'Tesseract eng/hin v5.3 + OpenCV Preprocessing',
      qualityScore: 88,
      languageDetected: 'Bilingual (Eng/Hin)',
      verdict: 'Requires review',
      summary: 'OCR extracted bilingual labels successfully. Detected altered font geometry in Year of Birth field and mismatch between issue and birth timestamps.',
      boxes: [
        { id: 'sb1', label: 'Aadhaar Number', value: 'XXXX XXXX 9021', maskedValue: '•••• •••• 9021', confidence: 95, x: 20, y: 75, width: 48, height: 10, isAnomaly: false },
        { id: 'sb2', label: 'Year of Birth (DOB)', value: '1998', maskedValue: '1998', confidence: 64, x: 20, y: 55, width: 32, height: 9, isAnomaly: true, anomalyReason: 'Font glyph mismatch (Arial detected instead of official Sans-Serif UIDAI typeface). Mismatch in baseline alignment.' },
        { id: 'sb3', label: 'Name (English)', value: 'Sana Ansari', maskedValue: 'Sana Ansari', confidence: 97, x: 20, y: 38, width: 35, height: 9, isAnomaly: false },
        { id: 'sb4', label: 'Name (Devanagari)', value: 'सना अंसारी', maskedValue: 'सना अंसारी', confidence: 91, x: 20, y: 26, width: 35, height: 9, isAnomaly: false },
      ],
      inconsistencies: [
        'Typeface mismatch in Date of Birth container (+12px baseline offset).',
        'Issue watermark timestamp timestamp "2010" conflicts with declared child enrollment rule.',
      ],
      humanReviewNotes: 'Marked as synthetic demo sample. Anomaly visually prominent on inspection.',
      isHumanVerified: true,
    },
    actions: [
      {
        id: 'act-sana-01',
        findingRef: 'fnd-sana-01',
        title: 'Request Digitally Signed e-Aadhaar XML / QR Verification',
        module: 'documents',
        priority: 'critical',
        status: 'pending',
        assignee: 'Verification Analyst',
        recommendation: 'Reject flat raster graphic and ask user to provide offline paperless e-Aadhaar XML or QR scan.',
        verificationMethod: 'Cryptographic UIDAI public key signature check.',
        createdAt: '2026-09-21T04:11:00Z',
        updatedAt: '2026-09-21T04:11:00Z',
      },
    ],
  },

  dev_p: {
    id: 'scan-synth-dev-06',
    subject: {
      id: 'sub-dev-06',
      name: 'Dev Parthasarathy',
      city: 'Chennai',
      state: 'Tamil Nadu',
      institution: 'IIT Madras',
      employer: 'Coromandel Tech Solutions',
      primaryHandle: '@dev_chennai_tech',
      phoneMasked: '+91 94440 •••••',
      emailMasked: 'dev.p•••••@example.org',
      isSynthetic: true,
      notes: 'Synthetic case: Poor-quality document scan with insufficient OCR extraction and low image resolution.',
    },
    consent: {
      id: 'cst-dev-06',
      subjectId: 'sub-dev-06',
      purpose: 'Document Defense verification on mobile phone photograph upload',
      permittedModules: ['documents'],
      authorizationBasis: 'synthetic_demo',
      retentionDays: 1,
      acceptedAt: '2026-09-21T03:00:00Z',
      isRevoked: false,
    },
    selectedModules: ['documents'],
    status: 'partial',
    progressPercent: 100,
    currentStage: 'Document Defense OCR triage complete (Low image quality)',
    queuedAt: '2026-09-21T03:00:05Z',
    completedAt: '2026-09-21T03:00:14Z',
    scoreData: calculateShadowScore({
      exposure: null,
      connectability: null,
      impersonation: null,
      documentAnomaly: 40,
    }),
    findings: [
      {
        id: 'fnd-dev-01',
        ruleId: 'DOC-QUAL-002',
        title: 'Severe Glare & Sub-Threshold DPI Precludes Legitimate Verification',
        module: 'documents',
        severity: 'moderate',
        scoreImpact: 14,
        description: 'Uploaded image exhibits severe specular glare covering 42% of the ID surface with effective resolution under 110 DPI. OCR text confidence average fell below threshold (38%).',
        supportingEvidence: ['doc-dev-sample-06 (Low Quality Photograph)'],
        confidenceReason: 'OpenCV Laplacian blur index < 65; specular reflection mask covers key name and identifier fields.',
        scopeLimitation: 'Quality defect must not be mischaracterized as fraudulent manipulation.',
        remediation: 'Capture document flat under diffuse daylight without flash, ensuring minimum 300 DPI.',
        status: 'active',
        createdAt: '2026-09-21T03:00:10Z',
      },
    ],
    evidenceGraph: {
      nodes: [
        { id: 'dn1', label: 'Dev Parthasarathy', category: 'identity', val: 'Chennai', riskWeight: 2, source: 'Supplied Profile', x: 200, y: 150 },
        { id: 'dn2', label: 'SAMPLE_PASSPORT_BLURRED.JPG', category: 'document', val: 'Low Resolution Scan', riskWeight: 5, source: 'Uploaded Image', x: 350, y: 150 },
      ],
      edges: [
        { id: 'de1', source: 'dn1', target: 'dn2', label: 'Insufficient Extraction', relationType: 'associated_with', certainty: 40, isVerified: false },
      ],
    },
    evidenceList: [],
    documentAnalysis: {
      id: 'doc-dev-06',
      documentCategory: 'Passport',
      sampleLabel: 'SAMPLE_INDIAN_PASSPORT_BLURRY.JPG',
      filename: 'sample_blurry_passport_fixture.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 184000,
      ocrEngine: 'Tesseract eng/hin v5.3 + OpenCV Preprocessing',
      qualityScore: 34,
      languageDetected: 'English',
      verdict: 'Insufficient image quality',
      summary: 'OCR extraction failed to meet minimum 70% confidence threshold due to intense flash glare and focal blur. Requires re-upload.',
      boxes: [
        { id: 'db1', label: 'Passport Type', value: 'P', maskedValue: 'P', confidence: 58, x: 10, y: 20, width: 10, height: 8, isAnomaly: false },
        { id: 'db2', label: 'Country Code', value: 'IND', maskedValue: 'IND', confidence: 62, x: 22, y: 20, width: 15, height: 8, isAnomaly: false },
        { id: 'db3', label: 'Passport No', value: '[UNREADABLE_GLARE]', maskedValue: '••••••••', confidence: 18, x: 60, y: 20, width: 25, height: 8, isAnomaly: true, anomalyReason: 'Specular glare saturates sensor pixels.' },
        { id: 'db4', label: 'MRZ Zone', value: 'P<IND<<<<<<<<<<<<<<<<<<<<<<', maskedValue: 'P<IND••••••••••••••••••••••', confidence: 35, x: 10, y: 78, width: 80, height: 16, isAnomaly: true, anomalyReason: 'Focal blur across bottom optical characters.' },
      ],
      inconsistencies: [
        'Image resolution is 104 DPI (minimum requirement: 300 DPI).',
        'Direct flash reflectance covers MRZ checksum characters.',
      ],
      humanReviewNotes: 'Rejection due to photographic quality, not intentional fraud.',
      isHumanVerified: true,
    },
    actions: [
      {
        id: 'act-dev-01',
        findingRef: 'fnd-dev-01',
        title: 'Re-upload High-Resolution Document Image',
        module: 'documents',
        priority: 'high',
        status: 'pending',
        assignee: 'Dev Parthasarathy',
        recommendation: 'Position passport on dark matte surface in natural ambient light; turn off camera flash.',
        verificationMethod: 'Automated OpenCV image sharpness check on upload.',
        createdAt: '2026-09-21T03:01:00Z',
        updatedAt: '2026-09-21T03:01:00Z',
      },
    ],
  },
};
