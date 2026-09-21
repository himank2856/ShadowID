/**
 * ShadowID - Master Synthetic Verification Datasets & Evaluation Engines
 * Team GIGABYTE - Build With Bharat 3.0
 */

export * from './documentVerification.ts';
export * from './impersonationVerification.ts';
export * from './exposureVerification.ts';

import { SYNTHETIC_DOCUMENT_VERIFICATIONS, runSyntheticDocumentDefense } from './documentVerification.ts';
import { SYNTHETIC_IMPERSONATION_VERIFICATIONS, runSyntheticImpersonationAudit } from './impersonationVerification.ts';
import { SYNTHETIC_EXPOSURE_VERIFICATIONS, runSyntheticExposureCheck } from './exposureVerification.ts';

export interface VerificationBenchmarkSuiteSummary {
  totalDocumentFixtures: number;
  totalImpersonationFixtures: number;
  totalExposureFixtures: number;
  readyForEvaluation: boolean;
}

export function getVerificationBenchmarkSummary(): VerificationBenchmarkSuiteSummary {
  return {
    totalDocumentFixtures: SYNTHETIC_DOCUMENT_VERIFICATIONS.length,
    totalImpersonationFixtures: SYNTHETIC_IMPERSONATION_VERIFICATIONS.length,
    totalExposureFixtures: SYNTHETIC_EXPOSURE_VERIFICATIONS.length,
    readyForEvaluation: true,
  };
}

export function runFullVerificationAudit(benchmarkCode: string) {
  const doc = SYNTHETIC_DOCUMENT_VERIFICATIONS.find((d) => d.benchmarkCode === benchmarkCode);
  if (doc) return runSyntheticDocumentDefense(doc);

  const imp = SYNTHETIC_IMPERSONATION_VERIFICATIONS.find((i) => i.benchmarkCode === benchmarkCode);
  if (imp) return runSyntheticImpersonationAudit(imp);

  const exp = SYNTHETIC_EXPOSURE_VERIFICATIONS.find((e) => e.benchmarkCode === benchmarkCode);
  if (exp) return runSyntheticExposureCheck(exp);

  return null;
}
