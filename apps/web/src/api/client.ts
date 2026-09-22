/**
 * ShadowID - Typed API Client generated from OpenAPI 3.1.0 Contract
 * Team GIGABYTE (Anshul, Tanishq, Himank) - Build With Bharat 3.0
 */

import type {
  ShadowScoreCalculation,
  ProfileComparisonData,
  DocumentAnalysisData,
  ScanJob,
  EvidenceNode,
  EvidenceEdge
} from '../types.ts';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  code: string;
  fieldErrors: Array<{ field: string; error: string }>;
  requestId: string;

  constructor(message: string, code: string, fieldErrors: any[] = [], requestId: string = '') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.requestId = requestId;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const requestId = `req-${Math.random().toString(36).substring(2, 11)}`;
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('X-Request-ID', requestId);

  // Retrieve JWT auth token if present
  const token = localStorage.getItem('shadowid_auth_token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || 'API request failed',
      data.code || 'UNKNOWN_ERROR',
      data.fieldErrors || [],
      response.headers.get('X-Request-ID') || requestId
    );
  }

  return data as T;
}

export const apiClient = {
  // Health & Readiness Probes
  getHealth: () => request<{ status: string; version: string; timestamp: string }>('/health'),
  getReadiness: () => request<{ status: string; database: boolean; redis: boolean; ocrEngine: string }>('/ready'),

  // Identity & Profile
  getCurrentUser: () => request<{
    id: string;
    email: string;
    fullName: string;
    workspaceId: string;
    role: string;
    isPro: boolean;
  }>('/me'),

  // Scoring Engine
  calculateScore: (payload: {
    exposure: number | null;
    connectability: number | null;
    impersonation: number | null;
    documentAnomaly: number | null;
  }) => request<ShadowScoreCalculation>('/scoring/calculate', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Impersonation Comparator
  compareProfiles: (payload: {
    reference: any;
    candidate: any;
  }) => request<ProfileComparisonData>('/comparisons', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Document Defense & OCR
  analyzeDocument: (payload: {
    documentCategory: string;
    sampleKey?: string;
  }) => request<DocumentAnalysisData>('/documents/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Exposure Graph
  buildGraph: (payload: {
    subjectName: string;
    city: string;
    institution?: string;
    evidenceTokens?: any[];
  }) => request<{ nodes: EvidenceNode[]; edges: EvidenceEdge[] }>('/exposure/graph', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Razorpay Billing
  createBillingOrder: () => request<{
    orderId: string;
    amountPaise: number;
    currency: string;
    keyId: string;
    productName: string;
  }>('/billing/orders', {
    method: 'POST',
  }),

  verifyPayment: (payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => request<{
    success: boolean;
    entitlement: string;
    validUntilIST: string;
  }>('/billing/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Reports
  generateJsonReport: (scanData: ScanJob) => request<{ reportJson: string }>('/reports/generate-json', {
    method: 'POST',
    body: JSON.stringify({ scanData }),
  }),
};

export const api = apiClient;

