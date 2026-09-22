/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Operations Rail & Subject Switcher
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  LayoutDashboard,
  Scan,
  Globe,
  Users,
  FileText,
  Search,
  FileCheck,
  CheckSquare,
  Settings,
  ChevronRight,
  UserCheck,
  Shield,
  Layers,
  FileCheck2,
} from 'lucide-react';

export const AppSidebar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    scans,
    activeScanId,
    setActiveScanId,
    activeScan,
    user,
    role,
    t,
    openAuthModal,
    showToast,
  } = useApp();

  const handleNav = (path: string) => {
    if (path === '/app/scans/new' && !user) {
      openAuthModal('signin');
      showToast('Please sign in or create an account to start a scan.');
      return;
    }
    navigate(path);
  };

  const navItems = [
    { label: t.navOverview, path: '/app/overview', icon: LayoutDashboard },
    { label: t.navNewScan, path: '/app/scans/new', icon: Scan },
    { label: 'Verification Lab', path: '/app/verification', icon: FileCheck2 },
    { label: t.navExposure, path: '/app/exposure', icon: Globe },
    { label: t.navImpersonation, path: '/app/impersonation', icon: Users },
    { label: t.navDocuments, path: '/app/documents', icon: FileText },
    { label: t.navResearch, path: '/app/research', icon: Search },
    { label: t.navReports, path: '/app/reports', icon: FileCheck },
    { label: t.navActions, path: '/app/actions', icon: CheckSquare },
    { label: t.navSettings, path: '/app/settings', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-[#0F1D2E] border-r border-[#1E3A5F] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        {/* Active Subject Selector */}
        <div>
          <label className="block text-[10px] font-mono-code uppercase text-[#94A3B8] mb-1.5 flex items-center justify-between">
            <span>Target Investigation</span>
            <span className="text-[#38BDF8]">{Object.keys(scans).length} Active</span>
          </label>
          {Object.keys(scans).length > 0 && activeScan ? (
            <>
              <select
                value={activeScanId}
                onChange={(e) => setActiveScanId(e.target.value)}
                className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded p-2 text-xs font-medium focus:outline-none focus:border-[#38BDF8]"
              >
                {Object.entries(scans).map(([key, scan]) => (
                  <option key={key} value={key} className="bg-[#07111F]">
                    {scan.subject.name} ({scan.subject.city})
                  </option>
                ))}
              </select>

              {/* Mini active subject info pill */}
              <div className="mt-2 p-2 bg-[#07111F] rounded border border-[#1E3A5F] text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Territory:</span>
                  <span className="text-[#CBD5E1] font-mono-code">{activeScan.subject.city}, {activeScan.subject.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Handle:</span>
                  <span className="text-[#38BDF8] font-mono-code">{activeScan.subject.primaryHandle || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#94A3B8]">Retention TTL:</span>
                  <span className="text-[#A3E635] font-mono-code">{activeScan.consent.retentionDays} Days</span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-3 bg-[#07111F] rounded border border-[#1E3A5F] text-xs text-center space-y-2">
              <div className="text-[11px] text-[#94A3B8]">No active investigation loaded.</div>
              <button
                onClick={() => handleNav('/app/scans/new')}
                className="w-full py-1.5 px-2 bg-[#172A42] hover:bg-[#1E3A5F] text-[#38BDF8] rounded text-[11px] font-mono-code font-semibold border border-[#38BDF8]/40 transition-colors"
              >
                + New Assessment
              </button>
            </div>
          )}
        </div>

        {/* Navigation Section */}
        <div className="pt-2 border-t border-[#172A42]">
          <div className="text-[10px] font-mono-code uppercase text-[#64748B] mb-2 px-2">
            Intelligence Operations
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-all ${
                    isActive
                      ? 'bg-[#172A42] text-[#A3E635] font-bold border border-[#A3E635]/40 shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                      : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#07111F]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#A3E635]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#A3E635]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Workspace Footer Info */}
      <div className="pt-4 border-t border-[#172A42] text-[11px] font-mono-code text-[#64748B] space-y-1">
        <div className="flex items-center justify-between">
          <span>Analyst:</span>
          <span className="text-[#F1F5F9] font-medium truncate max-w-[130px]">
            {user ? user.fullName : 'Guest Investigator'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Auth Status:</span>
          <span className="text-[#A3E635] font-bold">
            {user?.isVerified ? 'DPDP Verified' : 'Unauthenticated'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Jurisdiction:</span>
          <span className="text-[#38BDF8]">IN (Bharat 3.0)</span>
        </div>
      </div>
    </aside>
  );
};
