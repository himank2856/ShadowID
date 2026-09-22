/**
 * ShadowID - Reusable Empty Investigation State
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Shield, Scan, FileCheck2, ArrowRight } from 'lucide-react';

interface EmptyInvestigationStateProps {
  moduleName?: string;
  description?: string;
}

export const EmptyInvestigationState: React.FC<EmptyInvestigationStateProps> = ({
  moduleName,
  description = 'Your account currently has no active investigations loaded. Create a new digital footprint assessment or import a synthetic verification benchmark to analyze.',
}) => {
  const { navigate, user, openAuthModal, showToast } = useApp();

  return (
    <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg p-8 sm:p-12 text-center space-y-4 max-w-2xl mx-auto my-8 animate-fadeIn">
      <div className="w-14 h-14 rounded-full bg-[#172A42] border-2 border-[#38BDF8] flex items-center justify-center text-[#38BDF8] mx-auto shadow-[0_0_15px_rgba(56,189,248,0.2)]">
        <Shield className="w-7 h-7 text-[#38BDF8]" />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
          {moduleName ? `No Active Investigation for ${moduleName}` : 'No Active Investigations in Account'}
        </h3>
        <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
        <button
          onClick={() => {
            if (!user) {
              openAuthModal('signin');
              showToast('Please sign in or create an account to start an assessment.');
              return;
            }
            navigate('/app/scans/new');
          }}
          className="w-full sm:w-auto px-5 py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-all"
        >
          <Scan className="w-4 h-4" />
          Start New Assessment
        </button>
        <button
          onClick={() => navigate('/app/verification')}
          className="w-full sm:w-auto px-5 py-2.5 rounded text-xs font-semibold bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F] flex items-center justify-center gap-2 transition-all"
        >
          <FileCheck2 className="w-4 h-4 text-[#38BDF8]" />
          Explore Verification Benchmarks
        </button>
      </div>
    </div>
  );
};
