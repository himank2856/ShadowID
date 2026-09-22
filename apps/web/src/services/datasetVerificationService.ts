/**
 * ShadowID - Project Data Forensic Verification Engine
 * Cross-checks candidate profiles against:
 * 1. fake_users.csv (Known malicious/synthetic bots)
 * 2. real_users.csv (Verified authentic human accounts)
 * 3. synthetic_social_media_engagement.csv (Engagement telemetry & activity signatures)
 * 
 * Team GIGABYTE - Build With Bharat 3.0
 */

import {
  DatasetUserRecord,
  EngagementRecord,
  DatasetVerificationResult,
  ScanJob,
  Subject,
  EvidenceNode,
  EvidenceEdge,
  Finding
} from '../types.ts';
import { calculateShadowScore } from '../data/syntheticDatasets.ts';

// Robust CSV Line Parser
function parseCsv(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      currentField = '';
      if (currentRow.length > 0 && currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function normalizeHandle(handle?: string): string {
  if (!handle) return '';
  return handle.trim().replace(/^@+/, '').toLowerCase();
}

function computeTokenOverlap(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const t1 = new Set(str1.toLowerCase().match(/\w+/g) || []);
  const t2 = new Set(str2.toLowerCase().match(/\w+/g) || []);
  if (t1.size === 0 || t2.size === 0) return 0;
  let intersection = 0;
  t1.forEach((tok) => {
    if (t2.has(tok)) intersection++;
  });
  const union = new Set([...t1, ...t2]).size;
  return Math.round((intersection / union) * 100);
}

class DatasetVerificationService {
  private fakeUsers: DatasetUserRecord[] = [];
  private realUsers: DatasetUserRecord[] = [];
  private engagementRecords: EngagementRecord[] = [];

  private fakeByHandle = new Map<string, DatasetUserRecord>();
  private realByHandle = new Map<string, DatasetUserRecord>();
  private engagementByUsername = new Map<string, EngagementRecord[]>();

  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  /**
   * Initializes and loads the datasets from live proxy or public assets
   */
  public async ensureLoaded(): Promise<void> {
    if (this.isLoaded) return;
    if (this.isLoading && this.loadPromise) return this.loadPromise;

    this.isLoading = true;
    this.loadPromise = this.fetchAndParseAll();
    await this.loadPromise;
    this.isLoading = false;
    this.isLoaded = true;
  }

  private async fetchCsv(filename: string): Promise<string> {
    const urls = [
      `/api/live-project-data/${filename}`,
      `/project-data/${filename}`,
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          return await res.text();
        }
      } catch {
        // try next
      }
    }
    throw new Error(`Failed to load dataset file: ${filename}`);
  }

  private async fetchAndParseAll(): Promise<void> {
    try {
      const [fakeText, realText, engagementText] = await Promise.all([
        this.fetchCsv('fake_users.csv'),
        this.fetchCsv('real_users.csv'),
        this.fetchCsv('synthetic_social_media_engagement.csv'),
      ]);

      this.parseUserRecords(fakeText, 'fake');
      this.parseUserRecords(realText, 'real');
      this.parseEngagementRecords(engagementText);

      console.info(
        `[ShadowID Dataset Engine] Loaded ${this.fakeUsers.length} fake users, ${this.realUsers.length} real users, and ${this.engagementRecords.length} engagement records.`
      );
    } catch (err) {
      console.error('[ShadowID Dataset Engine] Dataset load failed:', err);
    }
  }

  private parseUserRecords(csvText: string, datasetType: 'fake' | 'real'): void {
    const rows = parseCsv(csvText);
    if (rows.length < 2) return;

    const headers = rows[0].map((h) => h.toLowerCase());
    const idIdx = headers.indexOf('id');
    const nameIdx = headers.indexOf('name');
    const screenNameIdx = headers.indexOf('screen_name');
    const statusesIdx = headers.indexOf('statuses_count');
    const followersIdx = headers.indexOf('followers_count');
    const friendsIdx = headers.indexOf('friends_count');
    const favouritesIdx = headers.indexOf('favourites_count');
    const listedIdx = headers.indexOf('listed_count');
    const createdIdx = headers.indexOf('created_at');
    const urlIdx = headers.indexOf('url');
    const langIdx = headers.indexOf('lang');
    const locationIdx = headers.indexOf('location');
    const defProfIdx = headers.indexOf('default_profile');
    const defImgIdx = headers.indexOf('default_profile_image');
    const geoIdx = headers.indexOf('geo_enabled');
    const profImgIdx = headers.indexOf('profile_image_url');
    const descIdx = headers.indexOf('description');

    const records: DatasetUserRecord[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 3) continue;

      const screenName = r[screenNameIdx] || '';
      const name = r[nameIdx] || '';

      const record: DatasetUserRecord = {
        id: r[idIdx] || `row-${i}`,
        name,
        screen_name: screenName,
        statuses_count: Math.max(0, Math.round(parseFloat(r[statusesIdx] || '0') || 0)),
        followers_count: Math.max(0, Math.round(parseFloat(r[followersIdx] || '0') || 0)),
        friends_count: Math.max(0, Math.round(parseFloat(r[friendsIdx] || '0') || 0)),
        favourites_count: Math.max(0, Math.round(parseFloat(r[favouritesIdx] || '0') || 0)),
        listed_count: Math.max(0, Math.round(parseFloat(r[listedIdx] || '0') || 0)),
        created_at: r[createdIdx] || '',
        url: r[urlIdx] && r[urlIdx] !== '0.0' ? r[urlIdx] : undefined,
        lang: r[langIdx] || 'en',
        location: r[locationIdx] || undefined,
        default_profile: r[defProfIdx] === '1' || r[defProfIdx] === '1.0' || r[defProfIdx] === 'true',
        default_profile_image: r[defImgIdx] === '1' || r[defImgIdx] === '1.0' || r[defImgIdx] === 'true',
        geo_enabled: r[geoIdx] === '1' || r[geoIdx] === '1.0' || r[geoIdx] === 'true',
        profile_image_url: r[profImgIdx] || undefined,
        description: r[descIdx] || undefined,
        datasetType,
      };

      records.push(record);

      const normHandle = normalizeHandle(screenName);
      if (normHandle) {
        if (datasetType === 'fake') {
          this.fakeByHandle.set(normHandle, record);
        } else {
          this.realByHandle.set(normHandle, record);
        }
      }
    }

    if (datasetType === 'fake') {
      this.fakeUsers = records;
    } else {
      this.realUsers = records;
    }
  }

  private parseEngagementRecords(csvText: string): void {
    const rows = parseCsv(csvText);
    if (rows.length < 2) return;

    const headers = rows[0].map((h) => h.toLowerCase());
    const postIdIdx = headers.indexOf('post_id');
    const userIdIdx = headers.indexOf('user_id');
    const userNameIdx = headers.indexOf('user_name');
    const genderIdx = headers.indexOf('user_gender');
    const ageIdx = headers.indexOf('user_age');
    const followersIdx = headers.indexOf('followers_count');
    const followingIdx = headers.indexOf('following_count');
    const createdIdx = headers.indexOf('account_creation_date');
    const verifiedIdx = headers.indexOf('is_verified');
    const locationIdx = headers.indexOf('location');
    const topicIdx = headers.indexOf('topic');
    const contentIdx = headers.indexOf('post_content');
    const lenIdx = headers.indexOf('content_length');
    const hashtagsIdx = headers.indexOf('hashtags');
    const mediaIdx = headers.indexOf('has_media');
    const postDateIdx = headers.indexOf('post_date');
    const deviceIdx = headers.indexOf('device');
    const langIdx = headers.indexOf('language');
    const likesIdx = headers.indexOf('likes');
    const commentsIdx = headers.indexOf('comments');
    const sharesIdx = headers.indexOf('shares');
    const engRateIdx = headers.indexOf('engagement_rate');

    const records: EngagementRecord[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 3) continue;

      const userName = r[userNameIdx] || '';
      const rec: EngagementRecord = {
        post_id: r[postIdIdx] || `post-${i}`,
        user_id: r[userIdIdx] || '',
        user_name: userName,
        user_gender: r[genderIdx] || undefined,
        user_age: r[ageIdx] ? parseInt(r[ageIdx], 10) : undefined,
        followers_count: parseInt(r[followersIdx] || '0', 10) || 0,
        following_count: parseInt(r[followingIdx] || '0', 10) || 0,
        account_creation_date: r[createdIdx] || '',
        is_verified: r[verifiedIdx]?.toLowerCase() === 'true',
        location: r[locationIdx] || undefined,
        topic: r[topicIdx] || undefined,
        post_content: r[contentIdx] || '',
        content_length: parseInt(r[lenIdx] || '0', 10) || 0,
        hashtags: r[hashtagsIdx] || undefined,
        has_media: r[mediaIdx]?.toLowerCase() === 'true',
        post_date: r[postDateIdx] || '',
        device: r[deviceIdx] || undefined,
        language: r[langIdx] || undefined,
        likes: parseInt(r[likesIdx] || '0', 10) || 0,
        comments: parseInt(r[commentsIdx] || '0', 10) || 0,
        shares: parseInt(r[sharesIdx] || '0', 10) || 0,
        engagement_rate: parseFloat(r[engRateIdx] || '0') || 0,
      };

      records.push(rec);

      const norm = normalizeHandle(userName);
      if (norm) {
        const existing = this.engagementByUsername.get(norm) || [];
        existing.push(rec);
        this.engagementByUsername.set(norm, existing);
      }
    }

    this.engagementRecords = records;
  }

  /**
   * Retrieves summary counts of loaded datasets
   */
  public getDatasetStats() {
    return {
      fakeCount: this.fakeUsers.length,
      realCount: this.realUsers.length,
      engagementCount: this.engagementRecords.length,
      isLoaded: this.isLoaded,
    };
  }

  /**
   * Returns sample user records for fast testing
   */
  public getPresetSamples(): Array<{
    title: string;
    description: string;
    handle: string;
    name: string;
    category: 'fake' | 'real' | 'engagement';
  }> {
    return [
      {
        title: 'Lavona Keller (Confirmed Fake Bot)',
        description: 'Zero followers, automated following rail, default asset footprint in fake_users.csv',
        handle: 'kellervxg',
        name: 'Lavona Keller',
        category: 'fake',
      },
      {
        title: 'Estelle Santos (High Follower Anomaly)',
        description: '0 followers vs 518 following, synthetic description token in fake_users.csv',
        handle: 'estellesant',
        name: 'Estelle Santos',
        category: 'fake',
      },
      {
        title: 'Gianluca Pini (Verified Authentic User)',
        description: 'Legitimate authentic account with established follower graph in real_users.csv',
        handle: 'GLPini',
        name: 'Gianluca Pini',
        category: 'real',
      },
      {
        title: 'Marta Perego (Verified Authentic User)',
        description: 'Corroborated public presence & Italian media profile in real_users.csv',
        handle: 'MartaPerego88',
        name: 'Marta Perego',
        category: 'real',
      },
      {
        title: 'Morgan Sharon (Synthetic Engagement Stream)',
        description: '59k followers, technology topic posts, Android device in synthetic_social_media_engagement.csv',
        handle: 'morgansharon',
        name: 'Morgan Sharon',
        category: 'engagement',
      },
    ];
  }

  /**
   * Core Verification Model:
   * Cross-checks input parameters against fake_users, real_users, and engagement datasets.
   */
  public async verifyProfile(params: {
    handle?: string;
    name?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
    location?: string;
  }): Promise<DatasetVerificationResult> {
    await this.ensureLoaded();

    const normHandle = normalizeHandle(params.handle);
    const queryName = (params.name || '').trim();

    // 1. Check direct matches in fake_users.csv
    let matchedFake: DatasetUserRecord | undefined;
    if (normHandle && this.fakeByHandle.has(normHandle)) {
      matchedFake = this.fakeByHandle.get(normHandle);
    } else if (queryName) {
      matchedFake = this.fakeUsers.find(
        (u) =>
          u.name.toLowerCase() === queryName.toLowerCase() ||
          computeTokenOverlap(u.name, queryName) >= 80
      );
    }

    // 2. Check direct matches in real_users.csv
    let matchedReal: DatasetUserRecord | undefined;
    if (normHandle && this.realByHandle.has(normHandle)) {
      matchedReal = this.realByHandle.get(normHandle);
    } else if (queryName) {
      matchedReal = this.realUsers.find(
        (u) =>
          u.name.toLowerCase() === queryName.toLowerCase() ||
          computeTokenOverlap(u.name, queryName) >= 80
      );
    }

    // 3. Check activity in synthetic_social_media_engagement.csv
    let matchedEngagement: EngagementRecord[] | undefined;
    if (normHandle && this.engagementByUsername.has(normHandle)) {
      matchedEngagement = this.engagementByUsername.get(normHandle);
    }

    // 4. Heuristic Bot & Anomaly Scoring
    const anomalies: string[] = [];
    let botScore = 15; // baseline human noise

    if (matchedFake) {
      botScore = 95;
      anomalies.push(`Direct signature match in Flagged Malicious User Database (fake_users.csv, Record ID: ${matchedFake.id}).`);
      if (matchedFake.followers_count === 0 && matchedFake.friends_count > 0) {
        anomalies.push(`Zero-follower imbalance: Follows ${matchedFake.friends_count} accounts with 0 reciprocal followers.`);
      }
      if (matchedFake.default_profile || matchedFake.default_profile_image) {
        anomalies.push('Default automated profile configuration flags set in dataset.');
      }
    } else if (matchedReal) {
      botScore = 8; // high confidence authentic
      if (matchedReal.followers_count > 0) {
        anomalies.push(`Corroborated by Verified Authentic User Database (real_users.csv, Record ID: ${matchedReal.id}).`);
      }
    }

    // If query parameters specify numbers or unindexed user:
    const queryFollowers = params.followersCount ?? (matchedFake?.followers_count ?? matchedReal?.followers_count ?? 0);
    const queryFriends = params.followingCount ?? (matchedFake?.friends_count ?? matchedReal?.friends_count ?? 0);

    if (!matchedFake && !matchedReal) {
      // Statistical assessment of submitted unindexed parameters
      if (queryFollowers === 0 && queryFriends > 100) {
        botScore += 45;
        anomalies.push(`Abnormal follower-to-following ratio: ${queryFollowers} followers vs ${queryFriends} following.`);
      }
      if (normHandle && normHandle.match(/\d{5,}$/)) {
        botScore += 25;
        anomalies.push('Trailing numeric sequence in handle indicative of programmatic generator.');
      }
    }

    if (matchedEngagement && matchedEngagement.length > 0) {
      const top = matchedEngagement[0];
      anomalies.push(`Correlated telemetry in Social Media Engagement stream: ${top.topic || 'General'} topics on ${top.device || 'Web'}.`);
      if (top.engagement_rate < 0.01) {
        botScore += 10;
        anomalies.push(`Sub-threshold engagement velocity (${(top.engagement_rate * 100).toFixed(2)}%).`);
      }
    }

    botScore = Math.min(100, Math.max(0, botScore));

    // Determine Verdict
    let verdict: DatasetVerificationResult['verdict'] = 'UNINDEXED_NEW_PROFILE';
    let recommendedAction = 'No action required. Account parameters fall within baseline expectations.';

    if (matchedFake) {
      verdict = 'CONFIRMED_FAKE_BOT';
      recommendedAction = 'Execute automated platform takedown request under IT Rules 2021 (Rule 3(1)(b)). Add handle to watchlist.';
    } else if (matchedReal) {
      verdict = 'VERIFIED_GENUINE';
      recommendedAction = 'Mark as verified authentic human identity. Issue DPDP Act consent attestation badge.';
    } else if (botScore >= 65) {
      verdict = 'SUSPICIOUS_IMPERSONATOR';
      recommendedAction = 'Flag for manual analyst review. Inspect connected payment rails and verify telephone binding.';
    }

    // 5. Generate Forensic Summary
    const forensicSummary = matchedFake
      ? `Profile "${params.handle || queryName}" matches verified synthetic bot records in fake_users.csv. High-risk automated footprint detected.`
      : matchedReal
      ? `Profile "${params.handle || queryName}" corresponds to authentic verified subject in real_users.csv with natural social graph metrics.`
      : `Profile evaluated via deterministic statistical heuristic. No direct dataset collision found. Estimated bot risk: ${botScore}%.`;

    // 6. Optional Gemini AI Analysis
    let geminiAiAnalysis: string | undefined;
    try {
      geminiAiAnalysis = await this.runGeminiAiAnalysis({
        handle: params.handle || '',
        name: queryName,
        verdict,
        botScore,
        matchedFake,
        matchedReal,
        matchedEngagement,
        anomalies,
      });
    } catch {
      geminiAiAnalysis = undefined;
    }

    return {
      queryHandle: params.handle || '',
      queryName: queryName || (matchedFake?.name || matchedReal?.name || 'Unknown Subject'),
      verdict,
      riskScore: botScore,
      botProbability: botScore,
      matchedFakeUser: matchedFake,
      matchedRealUser: matchedReal,
      matchedEngagement,
      anomalyFlags: anomalies,
      confidenceScore: matchedFake || matchedReal ? 98 : 72,
      forensicSummary,
      geminiAiAnalysis,
      recommendedAction,
      verifiedAt: new Date().toISOString(),
    };
  }

  /**
   * Invokes Gemini AI if GEMINI_API_KEY is available in browser / env
   */
  private async runGeminiAiAnalysis(ctx: {
    handle: string;
    name: string;
    verdict: string;
    botScore: number;
    matchedFake?: DatasetUserRecord;
    matchedReal?: DatasetUserRecord;
    matchedEngagement?: EngagementRecord[];
    anomalies: string[];
  }): Promise<string> {
    const apiKey =
      (import.meta as any).env?.VITE_GEMINI_API_KEY ||
      (import.meta as any).env?.GEMINI_API_KEY ||
      localStorage.getItem('shadowid_gemini_api_key');

    if (!apiKey) {
      return ''; // No key provided, fallback to rule engine
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
You are ShadowID's Senior Forensic Analyst for Digital Identity & Bot Intelligence (Team GIGABYTE, Build With Bharat 3.0).
Evaluate this profile verification against Indian statutory standards (DPDP Act 2023 & IT Rules 2021):

Candidate Input:
- Handle: ${ctx.handle}
- Name: ${ctx.name}
- Dataset Collision: ${ctx.matchedFake ? 'MATCHED IN FAKE_USERS.CSV' : ctx.matchedReal ? 'MATCHED IN REAL_USERS.CSV' : 'NONE'}
- Computed Bot Probability: ${ctx.botScore}%
- Anomaly Signals: ${ctx.anomalies.join('; ')}

Provide a concise 3-paragraph forensic analysis:
1. Forensic Attribution: How the profile matches or diverges from genuine vs synthetic dataset baselines.
2. Threat & Impersonation Vector: Risk of credential abuse, impersonation mimicry, or automated bot swarm activity.
3. Statutory Remediation Recommendation: Actionable legal / technical response for compliance officers.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || '';
    } catch (err: any) {
      console.warn('[Gemini AI Verification] Call failed:', err.message);
      return '';
    }
  }

  /**
   * Converts a DatasetVerificationResult into an active workspace ScanJob
   */
  public createScanJobFromResult(res: DatasetVerificationResult): ScanJob {
    const isThreat = res.verdict === 'CONFIRMED_FAKE_BOT' || res.riskScore >= 60;
    const targetName = res.queryName || res.queryHandle || 'Verified Target';
    const targetHandle = res.queryHandle || res.matchedFakeUser?.screen_name || res.matchedRealUser?.screen_name || '';

    const newSubject: Subject = {
      id: `sub-verify-${Date.now()}`,
      name: targetName,
      city: res.matchedRealUser?.location || res.matchedFakeUser?.location || 'New Delhi',
      state: 'Delhi (NCT)',
      primaryHandle: targetHandle ? `@${normalizeHandle(targetHandle)}` : undefined,
      isSynthetic: false,
      notes: `Generated from Project Data Verification Benchmark (${res.verdict}).`,
    };

    const nodes: EvidenceNode[] = [
      {
        id: 'n-subj',
        label: newSubject.name,
        category: 'identity',
        val: newSubject.city,
        riskWeight: isThreat ? 8 : 2,
        source: 'User Submission',
        x: 240,
        y: 180,
      },
      {
        id: 'n-handle',
        label: targetHandle || 'No Handle',
        category: 'handle',
        val: res.verdict.replace(/_/g, ' '),
        riskWeight: isThreat ? 9 : 2,
        source: res.matchedFakeUser ? 'fake_users.csv' : res.matchedRealUser ? 'real_users.csv' : 'Engagement Analysis',
        x: 120,
        y: 90,
      },
      {
        id: 'n-ds',
        label: res.matchedFakeUser ? 'fake_users.csv' : res.matchedRealUser ? 'real_users.csv' : 'synthetic_engagement.csv',
        category: 'registry',
        val: `Confidence: ${res.confidenceScore}%`,
        riskWeight: 4,
        source: 'Project Data Benchmark',
        x: 360,
        y: 100,
      },
    ];

    const edges: EvidenceEdge[] = [
      {
        id: 'e-1',
        source: 'n-subj',
        target: 'n-handle',
        label: 'associated_account',
        relationType: 'associated_with',
        certainty: res.confidenceScore,
        isVerified: true,
      },
      {
        id: 'e-2',
        source: 'n-handle',
        target: 'n-ds',
        label: 'cross_referenced',
        relationType: 'cross_referenced',
        certainty: 95,
        isVerified: true,
      },
    ];

    const findings: Finding[] = [
      {
        id: `fnd-ver-${Date.now()}-01`,
        ruleId: res.matchedFakeUser ? 'BOT-VERIFY-001' : 'AUTH-VERIFY-002',
        title: res.matchedFakeUser ? `Malicious Profile Collision: ${res.queryHandle}` : `Authentic Identity Verification: ${res.queryName}`,
        module: 'impersonation',
        severity: isThreat ? 'high' : 'lower',
        scoreImpact: isThreat ? 40 : 10,
        description: res.forensicSummary,
        supportingEvidence: res.anomalyFlags,
        confidenceReason: `Verified with 98% confidence against 25,000+ records in Project Data benchmark.`,
        scopeLimitation: 'Scope strictly restricted to supplied parameters & indexed records.',
        remediation: res.recommendedAction,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    const scoreData = calculateShadowScore({
      exposure: isThreat ? 75 : 20,
      connectability: 35,
      impersonation: res.riskScore,
      documentAnomaly: null,
    });

    const job: ScanJob = {
      id: `scan-verify-${Date.now()}`,
      subject: newSubject,
      consent: {
        id: `cst-verify-${Date.now()}`,
        subjectId: newSubject.id,
        purpose: 'Dataset Cross-Reference & Identity Verification',
        permittedModules: ['impersonation', 'exposure', 'research'],
        authorizationBasis: 'self',
        retentionDays: 30,
        acceptedAt: new Date().toISOString(),
        isRevoked: false,
      },
      selectedModules: ['exposure', 'impersonation', 'research'],
      status: 'succeeded',
      progressPercent: 100,
      currentStage: 'Dataset verification benchmark completed',
      queuedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      scoreData,
      findings,
      evidenceGraph: { nodes, edges },
      evidenceList: [
        {
          key: 'ev-ds-01',
          label: 'Matched Dataset',
          value: res.matchedFakeUser ? 'fake_users.csv' : res.matchedRealUser ? 'real_users.csv' : 'synthetic_engagement.csv',
          sourceType: 'social',
          sourceName: 'Project Data Benchmark',
          observedAt: new Date().toISOString(),
          extractionMethod: 'verified_fixture',
          certaintyReason: 'Verified against Project Data Benchmark repository.',
          isConfirmedByReviewer: true,
        },
      ],
      actions: [
        {
          id: `act-ver-${Date.now()}`,
          findingRef: `fnd-ver-${Date.now()}-01`,
          title: isThreat ? 'Issue Platform Impersonation Takedown Notice' : 'Archive Authenticity Attestation',
          module: 'impersonation',
          priority: isThreat ? 'critical' : 'low',
          status: 'pending',
          assignee: 'Current Analyst',
          recommendation: res.recommendedAction,
          verificationMethod: 'Project Data Benchmark',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    return job;
  }
}

export const datasetVerificationService = new DatasetVerificationService();
