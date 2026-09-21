/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Action Remediation Checklist
 * Compliant with Prompt 16
 */

import React, { useState } from 'react';
import { ActionItem, Priority } from '../types.ts';
import { useApp } from '../context/AppContext.tsx';
import { CheckSquare, Clock, AlertTriangle, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

interface ActionChecklistProps {
  actions: ActionItem[];
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ actions }) => {
  const { updateActionStatus } = useApp();
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = actions.filter((act) => {
    if (filterPriority !== 'all' && act.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && act.status !== filterStatus) return false;
    return true;
  });

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]';
      case 'high':
        return 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]';
      case 'medium':
        return 'bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]';
      default:
        return 'bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]';
    }
  };

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#172A42]">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#A3E635]" />
            <h3 className="text-base font-display font-bold text-[#F1F5F9]">
              Prioritized Action & Remediation Plan
            </h3>
            <span className="text-xs font-mono-code bg-[#172A42] text-[#A3E635] px-2 py-0.5 rounded">
              {actions.filter((a) => a.status === 'resolved').length} / {actions.length} Completed
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Targeted remediation measures. Resolving items records compliance without falsifying historical scan snapshots.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded px-2.5 py-1 text-xs focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Action Items List */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94A3B8] bg-[#07111F] rounded border border-[#1E3A5F]">
            No actions match the selected filter.
          </div>
        ) : (
          filtered.map((action) => (
            <div
              key={action.id}
              className={`bg-[#07111F] border rounded p-4 transition-all ${
                action.status === 'resolved'
                  ? 'border-[#1E3A5F]/50 opacity-70'
                  : 'border-[#1E3A5F] hover:border-[#38BDF8]/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono-code uppercase px-2 py-0.5 rounded border ${getPriorityBadge(
                        action.priority
                      )}`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#38BDF8] bg-[#172A42] px-2 py-0.5 rounded">
                      Module: {action.module}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#94A3B8]">
                      Ref: {action.findingRef}
                    </span>
                  </div>

                  <h4 className={`text-sm font-display font-bold ${
                    action.status === 'resolved' ? 'line-through text-[#94A3B8]' : 'text-[#F1F5F9]'
                  }`}>
                    {action.title}
                  </h4>

                  <p className="text-xs text-[#CBD5E1] leading-relaxed">
                    {action.recommendation}
                  </p>

                  <div className="pt-2 text-[11px] font-mono-code text-[#64748B] flex flex-wrap gap-x-4 gap-y-1">
                    <span>Assignee: <strong className="text-[#CBD5E1] font-normal">{action.assignee}</strong></span>
                    <span>Verification: <strong className="text-[#38BDF8] font-normal">{action.verificationMethod}</strong></span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
                  <div className="text-[10px] font-mono-code text-[#94A3B8] mb-0.5">Status:</div>
                  <div className="flex gap-1 bg-[#0F1D2E] p-1 rounded border border-[#1E3A5F]">
                    <button
                      onClick={() => updateActionStatus(action.id, 'pending')}
                      className={`px-2 py-1 rounded text-[11px] font-mono-code transition-colors ${
                        action.status === 'pending'
                          ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-bold border border-[#F59E0B]/40'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => updateActionStatus(action.id, 'in-progress')}
                      className={`px-2 py-1 rounded text-[11px] font-mono-code transition-colors ${
                        action.status === 'in-progress'
                          ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-bold border border-[#38BDF8]/40'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => updateActionStatus(action.id, 'resolved')}
                      className={`px-2 py-1 rounded text-[11px] font-mono-code transition-colors ${
                        action.status === 'resolved'
                          ? 'bg-[#A3E635]/20 text-[#A3E635] font-bold border border-[#A3E635]/40'
                          : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#172A42] text-[11px] text-[#64748B] flex items-center justify-between">
        <span>Remediation records are auditable.</span>
        <span className="italic">Note: Score re-calculation requires executing a fresh scan on changed evidence.</span>
      </div>
    </div>
  );
};
