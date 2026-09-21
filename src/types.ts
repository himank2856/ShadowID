/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Team GIGABYTE (Anshul, Tanishq, Himank)
 * Build With Bharat 3.0, Chitkara University, Himachal Pradesh
 */

export type Role = 'owner' | 'analyst' | 'viewer';
export type Language = 'en' | 'hi';
export type Theme = 'dark' | 'light';

export type ScanStatus = 'queued' | 'running' | 'succeeded' | 'partial' | 'failed' | 'cancelled';
export type Severity = 'lower' | 'moderate' | 'elevated' | 'high';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ModuleType = 'exposure' | 'impersonation' | 'documents' | 'research';

export interface Subject {
  id: string;
  name: string;
  city: string;
  state: string;
  institution?: string;
  employer?: string;
  primaryHandle?: string;
  phoneMasked?: string;
  emailMasked?: string;
  isSynthetic: boolean;
  notes?: string;
}

export interface ConsentRecord {
  id: string;
  subjectId: string;
  purpose: string;
  permittedModules: ModuleType[];
  authorizationBasis: 'self' | 'authorized_representative' | 'synthetic_demo';
  retentionDays: number;
  acceptedAt: string;
  isRevoked: boolean;
  revokedAt?: string;
}

export interface EvidenceAttribute {
  key: string;
  label: string;
  value: string;
  sourceType: 'telecom' | 'registry' | 'social' | 'document' | 'upi' | 'web';
  sourceName: string;
  sourceUrl?: string;
  observedAt: string;
  extractionMethod: 'manual_submission' | 'ocr_eng_hin' | 'insights_research' | 'verified_fixture';
  certaintyReason: string;
  isConfirmedByReviewer: boolean;
}

export interface EvidenceNode {
  id: string;
  label: string;
  category: 'identity' | 'handle' | 'telecom' | 'employer' | 'document' | 'registry' | 'financial';
  val: string;
  riskWeight: number; // 0 to 10
  source: string;
  x?: number;
  y?: number;
}

export interface EvidenceEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  relationType: 'leaked_in' | 'associated_with' | 'contradicts' | 'same_handle' | 'cross_referenced';
  certainty: number; // 0 to 100%
  isVerified: boolean;
}

export interface Finding {
  id: string;
  ruleId: string;
  title: string;
  module: ModuleType;
  severity: Severity;
  scoreImpact: number;
  description: string;
  supportingEvidence: string[];
  confidenceReason: string;
  scopeLimitation: string;
  remediation: string;
  status: 'active' | 'mitigated' | 'false_positive_rejected';
  createdAt: string;
}

export interface ProfileComparisonData {
  id: string;
  referenceSubject: {
    name: string;
    handle: string;
    bio: string;
    institution: string;
    city: string;
    avatarUrl: string;
    avatarHash: string;
  };
  candidateProfile: {
    platform: string;
    profileUrl: string;
    name: string;
    handle: string;
    bio: string;
    location: string;
    avatarUrl: string;
    avatarHash: string;
    followers: number;
    createdDate: string;
  };
  metrics: {
    nameTokenOverlap: number; // 0 - 100%
    handleSimilarity: number; // 0 - 100%
    bioTextOverlap: number;   // 0 - 100%
    avatarPerceptualMatch: number; // 0 - 100%
    contextualAgreement: number; // 0 - 100%
  };
  contradictions: string[];
  verdict: 'Limited overlap' | 'Similarities found' | 'Needs review' | 'Insufficient evidence';
  verdictNotes: string;
  reviewerDecision?: 'dismiss' | 'flag_for_takedown' | 'monitor';
}

export interface DocumentOcrBox {
  id: string;
  label: string;
  value: string;
  maskedValue: string;
  confidence: number; // 0 - 100
  x: number; // percentage
  y: number;
  width: number;
  height: number;
  isAnomaly: boolean;
  anomalyReason?: string;
}

export interface DocumentAnalysisData {
  id: string;
  documentCategory: 'Aadhaar' | 'PAN' | 'Passport' | 'Generic ID';
  sampleLabel: string;
  filename: string;
  mimeType: string;
  fileSizeBytes: number;
  ocrEngine: 'Tesseract eng/hin v5.3 + OpenCV Preprocessing';
  qualityScore: number; // 0 - 100
  languageDetected: 'English' | 'Hindi (देवनागरी)' | 'Bilingual (Eng/Hin)';
  verdict: 'Requires review' | 'No configured inconsistencies found' | 'Insufficient image quality';
  summary: string;
  boxes: DocumentOcrBox[];
  inconsistencies: string[];
  humanReviewNotes?: string;
  isHumanVerified: boolean;
}

export interface ResearchClaim {
  id: string;
  claim: string;
  sourceReference: string;
  uncertaintyRating: 'low' | 'moderate' | 'high';
  inferenceType: 'supplied_fact' | 'derived_inference' | 'external_guidance';
  reviewerStatus: 'unreviewed' | 'accepted' | 'rejected';
  reviewerNotes?: string;
}

export interface ActionItem {
  id: string;
  findingRef: string;
  title: string;
  module: ModuleType;
  priority: Priority;
  status: 'pending' | 'in-progress' | 'resolved';
  assignee: string;
  recommendation: string;
  verificationMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComponentScores {
  exposure: number | null;        // 35% weight
  connectability: number | null;  // 25% weight
  impersonation: number | null;   // 25% weight
  documentAnomaly: number | null; // 15% weight
}

export interface ShadowScoreCalculation {
  score: number | null; // 0 - 100
  coverage: number;     // 0 - 100%
  isProvisional: boolean;
  provisionalReason?: string;
  severityBand: Severity;
  componentScores: ComponentScores;
  weights: {
    exposure: number;
    connectability: number;
    impersonation: number;
    documentAnomaly: number;
  };
  contributions: {
    exposure: number;
    connectability: number;
    impersonation: number;
    documentAnomaly: number;
  };
  inputSnapshotHash: string;
}

export interface ScanJob {
  id: string;
  subject: Subject;
  consent: ConsentRecord;
  selectedModules: ModuleType[];
  status: ScanStatus;
  progressPercent: number;
  currentStage: string;
  queuedAt: string;
  completedAt?: string;
  scoreData: ShadowScoreCalculation;
  findings: Finding[];
  evidenceGraph: {
    nodes: EvidenceNode[];
    edges: EvidenceEdge[];
  };
  evidenceList: EvidenceAttribute[];
  profileComparison?: ProfileComparisonData;
  documentAnalysis?: DocumentAnalysisData;
  researchClaims?: ResearchClaim[];
  actions: ActionItem[];
}

export interface UserAccount {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: Role;
  organization?: string;
  designation?: string;
  isVerified: boolean;
  verificationMethod: 'otp_mobile' | 'otp_email' | 'none';
  verifiedAt?: string;
  isPro: boolean;
  passExpiryDate?: string;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
}

export interface OtpRecord {
  id: string;
  target: string;
  code: string;
  channel: 'sms' | 'email';
  purpose: 'signup' | 'login' | 'verify_phone' | 'verify_email';
  expiresAt: number;
  attempts: number;
  isUsed: boolean;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UserAccount;
  expiresAt: number;
}

export interface VerificationDocumentRecord {
  id: string;
  benchmarkCode: string;
  category: 'Aadhaar' | 'PAN' | 'Passport' | 'Voter ID' | 'Driving License';
  documentNumberMasked: string;
  holderName: string;
  dob: string;
  stateOrCircle: string;
  validityStatus: 'VERIFIED_AUTHENTIC' | 'TAMPERED_NUMERAL' | 'FONT_MISMATCH' | 'DIGITAL_SIG_MISMATCH' | 'EXPIRED_VALIDITY';
  authenticityScore: number; // 0 - 100
  securityFeatures: {
    guillochePattern: boolean;
    microprinting: boolean;
    ghostImage: boolean;
    qrSignatureValid: boolean;
    fontConsistency: boolean;
  };
  detectedAnomalies: string[];
  ocrExtraction: {
    language: string;
    tokenCount: number;
    sampleSnippet: string;
    rawTokens: Array<{ text: string; confidence: number; x: number; y: number; width: number; height: number; flag?: string }>;
  };
}

export interface VerificationImpersonationRecord {
  id: string;
  benchmarkCode: string;
  targetSubject: {
    name: string;
    handle: string;
    platform: string;
    city: string;
    institution: string;
    officialUpi?: string;
  };
  suspectProfile: {
    name: string;
    handle: string;
    platform: string;
    claimedCity: string;
    bio: string;
    avatarSimilarityPercent: number;
    upiPayeeId?: string;
  };
  metrics: {
    handleLevenshteinDist: number;
    bioNgramOverlap: number;
    avatarPerceptualDiff: number;
    overallMimicryScore: number;
  };
  contradictions: string[];
  classification: 'CONFIRMED_IMPERSONATION' | 'HIGH_RISK_MIMICRY' | 'BENIGN_HOMONYM';
  recommendedAction: string;
}

export interface VerificationExposureRecord {
  id: string;
  benchmarkCode: string;
  identifierType: 'phone' | 'email' | 'repository' | 'whois';
  identifierMasked: string;
  traiCircle?: string;
  carrier?: string;
  leakSource: string;
  severity: Severity;
  crossConnectableEntities: string[];
  verifiedRemediation: string;
}

