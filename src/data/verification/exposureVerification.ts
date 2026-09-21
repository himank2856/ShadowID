/**
 * ShadowID - Synthetic Exposure Verification Benchmark Dataset
 * Team GIGABYTE - Build With Bharat 3.0
 */

import { VerificationExposureRecord } from '../../types.ts';
import expJson from './exposureVerification.json';

export const SYNTHETIC_EXPOSURE_VERIFICATIONS: VerificationExposureRecord[] = expJson as VerificationExposureRecord[];

export function getExposureVerificationById(id: string): VerificationExposureRecord | undefined {
  return SYNTHETIC_EXPOSURE_VERIFICATIONS.find((r) => r.id === id || r.benchmarkCode === id);
}

export function runSyntheticExposureCheck(record: VerificationExposureRecord) {
  return {
    verificationId: record.id,
    benchmarkCode: record.benchmarkCode,
    type: record.identifierType,
    maskedValue: record.identifierMasked,
    leakSource: record.leakSource,
    severity: record.severity,
    linkableNodesCount: record.crossConnectableEntities.length,
    remediation: record.verifiedRemediation,
    timestamp: new Date().toISOString()
  };
}
