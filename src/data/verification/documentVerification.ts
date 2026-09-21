/**
 * ShadowID - Synthetic Document Verification Benchmark Dataset
 * Team GIGABYTE - Build With Bharat 3.0
 */

import { VerificationDocumentRecord } from '../../types.ts';
import docJson from './documentVerification.json';

export const SYNTHETIC_DOCUMENT_VERIFICATIONS: VerificationDocumentRecord[] = docJson as VerificationDocumentRecord[];

export function getDocumentVerificationById(id: string): VerificationDocumentRecord | undefined {
  return SYNTHETIC_DOCUMENT_VERIFICATIONS.find((d) => d.id === id || d.benchmarkCode === id);
}

export function filterDocumentsByCategory(category: VerificationDocumentRecord['category']): VerificationDocumentRecord[] {
  return SYNTHETIC_DOCUMENT_VERIFICATIONS.filter((d) => d.category === category);
}

export function runSyntheticDocumentDefense(record: VerificationDocumentRecord) {
  const anomaliesCount = record.detectedAnomalies.length;
  const isClean = record.validityStatus === 'VERIFIED_AUTHENTIC';
  
  return {
    documentId: record.id,
    benchmarkCode: record.benchmarkCode,
    category: record.category,
    authenticityScore: record.authenticityScore,
    status: record.validityStatus,
    passedChecks: Object.entries(record.securityFeatures).filter(([_, v]) => v).length,
    totalChecks: Object.keys(record.securityFeatures).length,
    anomalies: record.detectedAnomalies,
    verdict: isClean ? 'AUTHENTIC_VERIFIED' : 'TAMPERING_FLAGGED',
    timestamp: new Date().toISOString()
  };
}
