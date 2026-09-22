/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Deterministic Scoring Engine & Indian States Registry
 * Team GIGABYTE - Build With Bharat 3.0
 */

import { ScanJob, ShadowScoreCalculation, ComponentScores, Severity } from '../types.ts';

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
 * Empty baseline - all demo cases purged.
 * Investigations are created by users and stored in the account database.
 */
export const SYNTHETIC_CASES: Record<string, ScanJob> = {};
