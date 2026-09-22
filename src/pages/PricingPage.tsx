/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - INR Pricing & Plans (Prompt 15)
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatINR, paiseToINR } from '../utils/formatters.ts';
import { Check, Shield, Zap, Sparkles } from 'lucide-react';
import { BillingModal } from '../components/BillingModal.tsx';
import { PaymentPlanId } from '../types.ts';

export const PricingPage: React.FC = () => {
  const { billing } = useApp();
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PaymentPlanId>('pro_monthly');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono-code uppercase text-[#A3E635] bg-[#172A42] px-2.5 py-0.5 rounded border border-[#A3E635]/30">
          Transparent India-First Pricing
        </span>
        <h1 className="text-3xl font-display font-bold text-[#F1F5F9]">
          Simple, Affordable Security for Everyone
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Illustrative launch offer pricing. Billed in Indian Rupees (INR) with Razorpay Test Mode integration.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono-code text-[#38BDF8] uppercase">Community</span>
            <h3 className="text-xl font-display font-bold text-[#F1F5F9] mt-1">Free Tier</h3>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-display font-black text-[#F1F5F9]">
                {formatINR(0)}
              </span>
              <span className="text-xs text-[#94A3B8] ml-1">/ forever</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              Ideal for individual developers and students assessing basic public profile exposure.
            </p>

            <ul className="space-y-2 text-xs text-[#CBD5E1] pt-4 border-t border-[#172A42]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> 2 Full Exposure Graph Scans/month
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> 1 Impersonation Comparison
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Access to Synthetic Indian Datasets
              </li>
              <li className="flex items-center gap-2 text-[#64748B]">
                ✕ Document Defense OCR (Requires Pro)
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              disabled
              className="w-full py-2 rounded text-xs font-bold bg-[#172A42] text-[#94A3B8] border border-[#1E3A5F] cursor-default"
            >
              Current Standard Tier
            </button>
          </div>
        </div>

        {/* Pro Plan (Featured) */}
        <div className="bg-[#0F1D2E] border-2 border-[#A3E635] rounded p-6 relative flex flex-col justify-between shadow-[0_0_25px_rgba(163,230,53,0.15)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#A3E635] text-[#07111F] text-[10px] font-mono-code font-bold px-3 py-0.5 rounded-full uppercase">
            Most Popular Launch Offer
          </div>

          <div>
            <span className="text-xs font-mono-code text-[#A3E635] uppercase">Investigator Pass</span>
            <h3 className="text-xl font-display font-bold text-[#F1F5F9] mt-1">Pro 30-Day Pass</h3>
            <div className="mt-4 mb-4">
              <span className="text-4xl font-display font-black text-[#A3E635]">
                {formatINR(499)}
              </span>
              <span className="text-xs text-[#94A3B8] ml-1">/ month</span>
              <div className="text-[11px] font-mono-code text-[#64748B] mt-0.5">
                Stored as 49,900 paise (Non-recurring test pass)
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              Full access to Tesseract OCR Document Defense, unmasked PII review, and priority forensic export.
            </p>

            <ul className="space-y-2 text-xs text-[#CBD5E1] pt-4 border-t border-[#172A42]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Unlimited Exposure Correlation Scans
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Full Tesseract eng/hin Document Defense
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Perceptual Avatar Hashing Comparator
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Signed PDF/JSON Forensic Reports
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> iNSIGHTS Manual Research Workspace
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => {
                setSelectedPlanForModal('pro_monthly');
                setIsBillingModalOpen(true);
              }}
              className="w-full py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)]"
            >
              {billing.isPro ? 'Pro Pass Active • Manage' : 'Authorize ₹499 (Test Mode)'}
            </button>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded p-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono-code text-[#F59E0B] uppercase">Institutional</span>
            <h3 className="text-xl font-display font-bold text-[#F1F5F9] mt-1">Enterprise Token</h3>
            <div className="mt-4 mb-4">
              <span className="text-3xl font-display font-black text-[#F1F5F9]">
                {formatINR(14999)}
              </span>
              <span className="text-xs text-[#94A3B8] ml-1">/ mandate</span>
            </div>
            <p className="text-xs text-[#94A3B8] mb-4">
              Tailored for academic institutions, corporate forensics, and cybersecurity incident response teams.
            </p>

            <ul className="space-y-2 text-xs text-[#CBD5E1] pt-4 border-t border-[#172A42]">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Custom RBAC (Owner/Analyst/Viewer)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Private Dedicated On-Premise Worker
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> Custom Indian State Registry Adapters
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3E635]" /> SLA & Incident Review Attestation
              </li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => {
                setSelectedPlanForModal('enterprise_token');
                setIsBillingModalOpen(true);
              }}
              className="w-full py-2 rounded text-xs font-semibold bg-[#172A42] text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F]"
            >
              Order Institutional Pass (₹14,999)
            </button>
          </div>
        </div>
      </div>

      <BillingModal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        initialPlanId={selectedPlanForModal}
      />
    </div>
  );
};
