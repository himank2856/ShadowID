/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Action Remediation Checklist Page
 * Compliant with Prompt 16
 */

import React from 'react';
import { useApp } from '../../context/AppContext.tsx';
import { ActionChecklist } from '../../components/ActionChecklist.tsx';
import { CheckSquare, Shield, AlertCircle } from 'lucide-react';

export const ActionsPage: React.FC = () => {
  const { activeScan } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
        <div className="flex items-center gap-2 text-xs font-mono-code text-[#A3E635] uppercase mb-1">
          <CheckSquare className="w-4 h-4" />
          <span>Remediation Management</span>
        </div>
        <h1 className="text-xl font-display font-bold text-[#F1F5F9]">
          Incident Response & Remediation Tracker
        </h1>
        <p className="text-xs text-[#94A3B8] max-w-3xl mt-1">
          Track remediation across exposure scrubbing, impersonation platform takedowns, and document re-authentication. Auditable changes require a new scan to recalculate the Shadow Score.
        </p>
      </div>

      <ActionChecklist actions={activeScan.actions} />
    </div>
  );
};
