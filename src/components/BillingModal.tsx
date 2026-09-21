/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Razorpay Test Mode Checkout & Billing Pass
 * Compliant with Prompt 15
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatINR, paiseToINR } from '../utils/formatters.ts';
import { CreditCard, Check, X, Shield, Sparkles, Loader2 } from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose }) => {
  const { billing } = useApp();
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAuthorizePayment = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      billing.upgradeToPro();
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#94A3B8] hover:text-[#F1F5F9]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-5 h-5 text-[#A3E635]" />
          <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
            Razorpay Test Checkout
          </h3>
        </div>

        <p className="text-xs text-[#94A3B8] mb-4">
          One-time 30-day Pro Pass for high-density forensic identity audits across Indian registries.
        </p>

        {/* Plan Details Card */}
        <div className="p-4 bg-[#07111F] border border-[#1E3A5F] rounded mb-4">
          <div className="flex justify-between items-baseline mb-2">
            <div>
              <span className="text-sm font-bold text-[#F1F5F9]">Pro 30-Day Pass</span>
              <div className="text-[11px] text-[#64748B]">Non-recurring test entitlement</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-display font-black text-[#A3E635]">
                {formatINR(499)}
              </span>
              <div className="text-[10px] font-mono-code text-[#94A3B8]">
                49,900 paise
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#172A42] space-y-1.5 text-xs text-[#CBD5E1]">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Full Tesseract eng/hin Document Defense scans</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Unlimited Impersonation profile comparisons</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#A3E635]" />
              <span>Cryptographically signed forensic PDF/JSON exports</span>
            </div>
          </div>
        </div>

        {/* Razorpay Test Notice */}
        <div className="p-3 bg-[#172A42]/60 rounded border border-[#38BDF8]/30 text-xs text-[#38BDF8] flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 shrink-0" />
          <span>Test Sandbox Gateway: No actual credit card charge will be made.</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9]"
          >
            Cancel
          </button>
          <button
            disabled={isAuthorizing}
            onClick={handleAuthorizePayment}
            className="px-4 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.2)] disabled:opacity-50"
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Simulating Razorpay Auth...
              </>
            ) : (
              'Authorize ₹499 Test Pass'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
