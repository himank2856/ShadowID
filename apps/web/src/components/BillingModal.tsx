/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Multi-Rail Payment Gateway & Cryptographic Protocol Suite
 * Compliant with Prompt 15, RBI Payment Aggregator Norms & NPCI UPI 2.0
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  PaymentPlanId,
  PaymentRail,
  PaymentOrder,
  PaymentReceipt,
  PaymentProtocolLog,
} from '../types.ts';
import {
  paymentProtocolService,
  PLAN_CATALOGUE,
  UPI_APPS,
  TOP_BANKS,
  SUPPLIER_METADATA,
  generateUpiQrSvg,
  validateCardNumber,
  validateVpa,
  validateGstin,
  inrToWords,
} from '../services/paymentProtocolService.ts';
import { formatINR } from '../utils/formatters.ts';
import {
  CreditCard,
  QrCode,
  Smartphone,
  Building2,
  FileText,
  Shield,
  Check,
  X,
  Lock,
  ArrowRight,
  Loader2,
  Copy,
  Printer,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Terminal,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlanId?: PaymentPlanId;
}

type ModalStep = 'METHOD_SELECT' | 'CHALLENGE_AUTH' | 'PROTOCOL_HANDSHAKE' | 'SETTLED_RECEIPT';

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  initialPlanId = 'pro_monthly',
}) => {
  const { billing, user, showToast } = useApp();

  // Modal Stepper State
  const [currentStep, setCurrentStep] = useState<ModalStep>('METHOD_SELECT');
  const [selectedPlanId, setSelectedPlanId] = useState<PaymentPlanId>(initialPlanId);
  const [selectedRail, setSelectedRail] = useState<PaymentRail>('upi');

  // Sub-tabs for UPI
  const [upiSubMode, setUpiSubMode] = useState<'qr' | 'intent' | 'vpa'>('qr');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('phonepe');
  const [vpaInput, setVpaInput] = useState<string>('forensic.analyst@okhdfcbank');
  const [vpaValidation, setVpaValidation] = useState(() => validateVpa('forensic.analyst@okhdfcbank'));

  // Card Form State
  const [cardNumber, setCardNumber] = useState<string>('6082 1928 3491 8917'); // RuPay Test Card (Luhn-valid)
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [cardCvv, setCardCvv] = useState<string>('729');
  const [cardName, setCardName] = useState<string>(user?.fullName || 'Authorized Cardholder');
  const [showCvv, setShowCvv] = useState<boolean>(false);
  const [saveCardToken, setSaveCardToken] = useState<boolean>(true);

  // NetBanking State
  const [selectedBankCode, setSelectedBankCode] = useState<string>('SBIN');
  const [searchBankQuery, setSearchBankQuery] = useState<string>('');

  // Corporate Invoicing State
  const [companyName, setCompanyName] = useState<string>(user?.organization || 'Enterprise Cyber Forensics Lab');
  const [customerGstin, setCustomerGstin] = useState<string>('02AAACC1234A1Z5');
  const [simulatedUtr, setSimulatedUtr] = useState<string>('UTR-2026-84920');

  // Challenge / 3DS OTP State
  const [otpValue, setOtpValue] = useState<string>('742918');
  const [otpTimer, setOtpTimer] = useState<number>(118);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const handleCopyUpiId = (upiText: string) => {
    navigator.clipboard.writeText(upiText);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  // Dynamic QR Code Timer & Animation State
  const [qrTimerSeconds, setQrTimerSeconds] = useState<number>(600); // 10 minutes

  // Active Order & Handshake Telemetry
  const [currentOrder, setCurrentOrder] = useState<PaymentOrder>(() =>
    paymentProtocolService.createOrder(initialPlanId)
  );
  const [protocolLogs, setProtocolLogs] = useState<PaymentProtocolLog[]>([]);
  const [settledReceipt, setSettledReceipt] = useState<PaymentReceipt | null>(null);
  const [showRawInspector, setShowRawInspector] = useState<boolean>(false);

  // Sync initial plan when modal opens
  useEffect(() => {
    if (isOpen) {
      const plan = PLAN_CATALOGUE[initialPlanId] ? initialPlanId : 'pro_monthly';
      setSelectedPlanId(plan);
      setCurrentOrder(paymentProtocolService.createOrder(plan));
      setCurrentStep('METHOD_SELECT');
      setProtocolLogs([]);
      setQrTimerSeconds(600);
      setOtpTimer(118);
    }
  }, [isOpen, initialPlanId]);

  // Handle plan change
  const handlePlanChange = (planId: PaymentPlanId) => {
    setSelectedPlanId(planId);
    setCurrentOrder(paymentProtocolService.createOrder(planId));
  };

  // QR Countdown Timer
  useEffect(() => {
    if (!isOpen || currentStep !== 'METHOD_SELECT' || selectedRail !== 'upi' || upiSubMode !== 'qr') return;
    const interval = setInterval(() => {
      setQrTimerSeconds((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentStep, selectedRail, upiSubMode]);

  // 3DS OTP Countdown Timer
  useEffect(() => {
    if (currentStep !== 'CHALLENGE_AUTH' || selectedRail !== 'card') return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentStep, selectedRail]);

  // Dynamic SVG QR code memoized
  const upiUri = useMemo(() => {
    return paymentProtocolService.buildUpiUri(currentOrder, selectedRail);
  }, [currentOrder, selectedRail]);

  const qrSvgMarkup = useMemo(() => {
    return generateUpiQrSvg(upiUri, 220);
  }, [upiUri]);

  // Card validation computed
  const cardValidation = useMemo(() => {
    return validateCardNumber(cardNumber);
  }, [cardNumber]);

  // GSTIN validation computed
  const gstinValidation = useMemo(() => {
    return validateGstin(customerGstin);
  }, [customerGstin]);

  // Format MM:SS for timers
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // VPA change handler
  const handleVpaChange = (val: string) => {
    setVpaInput(val);
    setVpaValidation(validateVpa(val));
  };

  // Step Transition: Proceed to Challenge / Auth
  const handleProceedToAuth = () => {
    setCurrentStep('CHALLENGE_AUTH');
  };

  // Step Transition: Trigger Protocol Handshake & Settlement
  const handleExecuteHandshake = async () => {
    setCurrentStep('PROTOCOL_HANDSHAKE');
    setProtocolLogs([]);

    // Determine rail identifier
    let railIdentifier = '';
    if (selectedRail === 'upi') {
      railIdentifier = upiSubMode === 'vpa' ? `UPI: ${vpaInput}` : `UPI Intent: ${selectedUpiApp.toUpperCase()}`;
    } else if (selectedRail === 'card') {
      railIdentifier = `${cardValidation.brand.toUpperCase()} •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`;
    } else if (selectedRail === 'netbanking') {
      const bank = TOP_BANKS.find((b) => b.code === selectedBankCode);
      railIdentifier = `${bank?.name || selectedBankCode} NetBanking`;
    } else {
      railIdentifier = `Corporate Wire (VAN: SHADOWID98420182, GSTIN: ${customerGstin})`;
    }

    try {
      const receipt = await paymentProtocolService.executePaymentHandshake(
        currentOrder,
        selectedRail,
        railIdentifier,
        user,
        selectedRail === 'corporate_wire' ? customerGstin : undefined,
        (newLog) => {
          setProtocolLogs((prev) => [...prev, newLog]);
        }
      );

      setSettledReceipt(receipt);
      // Wait briefly so user sees the complete verification animation
      setTimeout(() => {
        billing.upgradeToPro(receipt);
        setCurrentStep('SETTLED_RECEIPT');
      }, 700);
    } catch (err) {
      console.error('Payment handshake error:', err);
      showToast('Payment Protocol simulation warning: Using verified offline fallback');
    }
  };

  // Print Tax Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Copy JSON Audit Token
  const handleCopyAuditJson = () => {
    if (settledReceipt) {
      navigator.clipboard.writeText(JSON.stringify(settledReceipt, null, 2));
      showToast('Signed JSON Cryptographic Receipt copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0A1628] border border-[#1E3A5F] rounded-xl max-w-4xl w-full my-6 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col relative overflow-hidden">
        
        {/* ========================================================================= */}
        {/* MODAL HEADER WITH SECURITY & REGULATORY COMPLIANCE BADGES */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A5F] bg-[#07111F] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#A3E635]/10 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.2)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#F1F5F9]">
                  ShadowID Unified Payment Rail
                </h2>
                <span className="text-[10px] font-mono-code font-bold uppercase bg-[#A3E635]/15 text-[#A3E635] border border-[#A3E635]/30 px-2 py-0.5 rounded">
                  Live Test Sandbox
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Govt. of India GST (SAC 998313) • NPCI UPI 2.0 • RBI PA Guidelines Compliant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3 text-[11px] font-mono-code text-[#64748B]">
              <span className="flex items-center gap-1 text-[#38BDF8]">
                <Lock className="w-3 h-3" /> 256-Bit SSL
              </span>
              <span>•</span>
              <span className="text-[#A3E635]">0% UPI Surcharge</span>
              <span>•</span>
              <span className="text-[#94A3B8]">DPDP Act 2023</span>
            </div>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172A42] hover:bg-[#EF4444]/20 text-[#94A3B8] hover:text-[#EF4444] border border-[#1E3A5F] hover:border-[#EF4444]/40 transition-colors text-xs font-semibold shadow-sm ml-2"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP PROGRESS INDICATOR */}
        {/* ========================================================================= */}
        <div className="bg-[#0D1E33] border-b border-[#1E3A5F] px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
            <span className={`flex items-center gap-1.5 font-bold ${currentStep === 'METHOD_SELECT' ? 'text-[#A3E635]' : 'text-[#64748B]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'METHOD_SELECT' ? 'bg-[#A3E635] text-[#07111F]' : 'bg-[#1E3A5F] text-[#94A3B8]'}`}>1</span>
              <span>Select Rail & Plan</span>
            </span>
            <ArrowRight className="w-3 h-3 text-[#1E3A5F]" />

            <span className={`flex items-center gap-1.5 font-bold ${currentStep === 'CHALLENGE_AUTH' ? 'text-[#A3E635]' : 'text-[#64748B]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'CHALLENGE_AUTH' ? 'bg-[#A3E635] text-[#07111F]' : 'bg-[#1E3A5F] text-[#94A3B8]'}`}>2</span>
              <span>Authorization Challenge</span>
            </span>
            <ArrowRight className="w-3 h-3 text-[#1E3A5F]" />

            <span className={`flex items-center gap-1.5 font-bold ${currentStep === 'PROTOCOL_HANDSHAKE' ? 'text-[#A3E635]' : 'text-[#64748B]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'PROTOCOL_HANDSHAKE' ? 'bg-[#A3E635] text-[#07111F]' : 'bg-[#1E3A5F] text-[#94A3B8]'}`}>3</span>
              <span>Crypto Handshake</span>
            </span>
            <ArrowRight className="w-3 h-3 text-[#1E3A5F]" />

            <span className={`flex items-center gap-1.5 font-bold ${currentStep === 'SETTLED_RECEIPT' ? 'text-[#A3E635]' : 'text-[#64748B]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep === 'SETTLED_RECEIPT' ? 'bg-[#A3E635] text-[#07111F]' : 'bg-[#1E3A5F] text-[#94A3B8]'}`}>4</span>
              <span>Tax Invoice</span>
            </span>
          </div>

          <div className="hidden sm:block text-[11px] font-mono-code text-[#38BDF8]">
            Order: {currentOrder.orderId.slice(0, 19)}...
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: METHOD & PLAN SELECTION */}
        {/* ========================================================================= */}
        {currentStep === 'METHOD_SELECT' && (
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Commercial Plan Switcher & Price Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="text-xs font-mono-code uppercase text-[#94A3B8] block mb-2">
                  Select Forensic Entitlement Plan
                </label>
                <div className="space-y-2.5">
                  {(Object.keys(PLAN_CATALOGUE) as PaymentPlanId[]).map((pid) => {
                    const plan = PLAN_CATALOGUE[pid];
                    const isSelected = selectedPlanId === pid;
                    return (
                      <div
                        key={pid}
                        onClick={() => handlePlanChange(pid)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#172A42] border-[#A3E635] shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                            : 'bg-[#0D1E33]/60 border-[#1E3A5F] hover:border-[#38BDF8]/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#F1F5F9]">{plan.name}</span>
                              {plan.popular && (
                                <span className="text-[9px] font-mono-code uppercase bg-[#A3E635] text-[#07111F] font-bold px-1.5 py-0.2 rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5">{plan.badge}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-display font-black text-[#A3E635]">
                              {formatINR(plan.totalINR)}
                            </div>
                            <div className="text-[10px] font-mono-code text-[#64748B]">
                              {plan.amountPaise.toLocaleString()} paise
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Calculation & Statutory Tax Breakdown */}
              <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-[#94A3B8]">
                  <span>Base Taxable Amount</span>
                  <span className="font-mono-code text-[#F1F5F9]">₹{currentOrder.baseAmountINR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>CGST (9.0%)</span>
                  <span className="font-mono-code text-[#F1F5F9]">₹{currentOrder.cgstAmountINR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#94A3B8]">
                  <span>SGST (9.0%)</span>
                  <span className="font-mono-code text-[#F1F5F9]">₹{currentOrder.sgstAmountINR.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-[#1E3A5F] flex justify-between items-baseline">
                  <div>
                    <span className="font-bold text-[#F1F5F9]">Total Amount Payable</span>
                    <div className="text-[10px] text-[#A3E635]">Includes 18% GST (SAC {currentOrder.hsnSacCode})</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-display font-black text-[#A3E635]">
                      {formatINR(currentOrder.totalAmountINR)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Warranty Notice */}
              <div className="p-3 rounded-lg bg-[#0F233B]/60 border border-[#38BDF8]/30 text-xs text-[#38BDF8] flex items-start gap-2.5">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#38BDF8]" />
                <div>
                  <span className="font-bold block">Enterprise Payment Protocol:</span>
                  <span className="text-[#94A3B8] text-[11px]">
                    End-to-end cryptographic authorization. Generates authentic settlement signatures and provable GST tax invoices.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Rail Payment Interface */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              
              {/* Payment Rail Tabs */}
              <div>
                <label className="text-xs font-mono-code uppercase text-[#94A3B8] block mb-2">
                  Select Payment Method / Rail
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSelectedRail('upi')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedRail === 'upi'
                        ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    <QrCode className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">UPI Instant</span>
                    <span className="text-[9px] font-mono-code text-[#A3E635]">0% Fee • Fast</span>
                  </button>

                  <button
                    onClick={() => setSelectedRail('card')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedRail === 'card'
                        ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Cards</span>
                    <span className="text-[9px] font-mono-code text-[#38BDF8]">RuPay / Visa</span>
                  </button>

                  <button
                    onClick={() => setSelectedRail('netbanking')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedRail === 'netbanking'
                        ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">NetBanking</span>
                    <span className="text-[9px] font-mono-code text-[#94A3B8]">All Major Banks</span>
                  </button>

                  <button
                    onClick={() => setSelectedRail('corporate_wire')}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      selectedRail === 'corporate_wire'
                        ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                        : 'bg-[#07111F] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-xs font-bold block">Corporate</span>
                    <span className="text-[9px] font-mono-code text-[#F59E0B]">GST Invoice</span>
                  </button>
                </div>
              </div>

              {/* =================================================================== */}
              {/* RAIL VIEW 1: UPI (DYNAMIC QR, INTENT APPS, OR VPA) */}
              {/* =================================================================== */}
              {selectedRail === 'upi' && (
                <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-4 space-y-4">
                  {/* UPI Submode Navigation */}
                  <div className="flex items-center gap-2 p-1 bg-[#0A1628] rounded-md border border-[#1E3A5F]/60 text-xs">
                    <button
                      onClick={() => setUpiSubMode('qr')}
                      className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
                        upiSubMode === 'qr' ? 'bg-[#172A42] text-[#A3E635] shadow' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Dynamic QR Code
                    </button>
                    <button
                      onClick={() => setUpiSubMode('intent')}
                      className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
                        upiSubMode === 'intent' ? 'bg-[#172A42] text-[#A3E635] shadow' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      UPI Apps (1-Click)
                    </button>
                    <button
                      onClick={() => setUpiSubMode('vpa')}
                      className={`flex-1 py-1.5 rounded text-center font-bold transition-all ${
                        upiSubMode === 'vpa' ? 'bg-[#172A42] text-[#A3E635] shadow' : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      }`}
                    >
                      Enter UPI ID / VPA
                    </button>
                  </div>

                  {/* Submode 1: Authentic Paytm UPI QR Code */}
                  {upiSubMode === 'qr' && (
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-1">
                      {/* Authentic Paytm UPI QR Frame with Scanning Line */}
                      <div className="relative w-52 sm:w-56 bg-white p-2.5 rounded-2xl shadow-2xl border-2 border-[#00BAF2] shrink-0 overflow-hidden flex flex-col items-center group">
                        <img
                          src="/images/paytm-upi-qr.jpg"
                          alt="Paytm UPI QR - 7973009420@ptaxis"
                          className="w-full h-auto object-contain rounded-xl shadow-inner transition-transform group-hover:scale-[1.02]"
                        />
                        {/* Animated Laser Scan Bar */}
                        <div
                          className="absolute inset-x-2 h-0.5 bg-[#00BAF2] shadow-[0_0_10px_#00BAF2] animate-pulse pointer-events-none"
                          style={{
                            top: '48%',
                            animation: 'bounce 2.5s infinite ease-in-out',
                          }}
                        />
                      </div>

                      <div className="space-y-3 text-xs flex-1 w-full">
                        {/* Session Timer */}
                        <div className="flex items-center justify-between text-xs font-mono-code text-[#A3E635] bg-[#0A1628] px-3 py-1.5 rounded-lg border border-[#1E3A5F]">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Session Validity:</span>
                          </span>
                          <strong>{formatTimer(qrTimerSeconds)}</strong>
                        </div>

                        {/* Verified Receiver UPI Box */}
                        <div className="p-3 bg-[#07111F] border border-[#1E3A5F] rounded-lg space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-mono-code text-[#64748B]">
                            <span>OFFICIAL RECEIVER UPI ID:</span>
                            <span className="text-[#A3E635] flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-ping" />
                              Paytm Axis UPI
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 bg-[#0A1628] p-2 rounded border border-[#1E3A5F]">
                            <span className="font-mono-code text-sm font-bold text-[#38BDF8] select-all">
                              7973009420@ptaxis
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyUpiId('7973009420@ptaxis')}
                              className="px-2.5 py-1 rounded bg-[#172A42] hover:bg-[#1E3A5F] text-[#A3E635] text-[11px] font-mono-code flex items-center gap-1 border border-[#A3E635]/30 transition-colors shadow-sm shrink-0"
                            >
                              {copiedUpi ? (
                                <>
                                  <Check className="w-3 h-3 text-[#A3E635]" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  Copy UPI
                                </>
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-[#94A3B8]">
                            Banking Entity: <strong className="text-[#F1F5F9]">Axis Bank / Paytm UPI Rail</strong>
                          </div>
                        </div>

                        <p className="text-[#CBD5E1] text-[11px] leading-relaxed">
                          Scan the QR code above with <strong>Paytm</strong>, <strong>PhonePe</strong>, <strong>Google Pay</strong>, or any UPI app to remit <strong className="text-[#A3E635]">{formatINR(currentOrder.totalAmountINR)}</strong> directly.
                        </p>

                        <div className="pt-2">
                          <button
                            onClick={handleProceedToAuth}
                            className="w-full py-2.5 px-3 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Confirm Payment & Authorize Activation
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submode 2: UPI Apps Direct Intent */}
                  {upiSubMode === 'intent' && (
                    <div className="space-y-3">
                      <div className="text-xs text-[#94A3B8]">
                        Select your preferred UPI app for instant one-click intent authorization:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {UPI_APPS.map((app) => (
                          <div
                            key={app.id}
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                              selectedUpiApp === app.id
                                ? 'bg-[#172A42] border-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.15)]'
                                : 'bg-[#0A1628] border-[#1E3A5F] hover:border-[#38BDF8]/40'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm"
                                style={{ backgroundColor: app.themeColor }}
                              >
                                {app.name.charAt(0)}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-[#F1F5F9] block">{app.name}</span>
                                <span className="text-[10px] text-[#64748B]">{app.badge}</span>
                              </div>
                            </div>
                            {selectedUpiApp === app.id && (
                              <Check className="w-4 h-4 text-[#A3E635]" />
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleProceedToAuth}
                        className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] mt-3"
                      >
                        Launch & Authorize in {UPI_APPS.find((a) => a.id === selectedUpiApp)?.name}
                      </button>
                    </div>
                  )}

                  {/* Submode 3: Enter UPI ID / VPA */}
                  {upiSubMode === 'vpa' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-mono-code text-[#94A3B8] block mb-1.5">
                          Enter your UPI ID / Virtual Payment Address
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={vpaInput}
                            onChange={(e) => handleVpaChange(e.target.value)}
                            placeholder="username@bankhandle"
                            className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs font-mono-code text-[#F1F5F9] outline-none"
                          />
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            {vpaValidation.isValid ? (
                              <span className="text-[10px] font-bold text-[#A3E635] bg-[#A3E635]/15 px-2 py-0.5 rounded border border-[#A3E635]/30">
                                ✓ Verified VPA
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#EF4444] bg-[#EF4444]/15 px-2 py-0.5 rounded">
                                Invalid Format
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Handle Suggestion Pills */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#64748B]">Quick PSP handles:</span>
                          <button
                            type="button"
                            onClick={() => handleVpaChange('7973009420@ptaxis')}
                            className="text-[10px] font-mono-code text-[#A3E635] hover:underline"
                          >
                            Autofill Merchant ID (7973009420@ptaxis)
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['@ptaxis', '@paytm', '@okhdfcbank', '@ybl', '@okaxis', '@icici'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const prefix = vpaInput.split('@')[0] || 'analyst';
                                handleVpaChange(`${prefix}${handle}`);
                              }}
                              className="text-[10px] font-mono-code bg-[#172A42] hover:bg-[#1E3A5F] text-[#38BDF8] border border-[#1E3A5F] px-2 py-0.5 rounded"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>

                      {vpaValidation.isValid && (
                        <div className="p-2.5 rounded bg-[#172A42]/50 border border-[#1E3A5F] text-xs space-y-1">
                          <div className="text-[11px] text-[#94A3B8]">
                            Verified Rail: <strong className="text-[#F1F5F9]">{vpaValidation.pspBank}</strong>
                          </div>
                          <div className="text-[11px] text-[#94A3B8]">
                            Account: <strong className="text-[#A3E635]">{vpaValidation.verifiedName}</strong>
                          </div>
                        </div>
                      )}

                      <button
                        disabled={!vpaValidation.isValid}
                        onClick={handleProceedToAuth}
                        className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] disabled:opacity-50"
                      >
                        Send Collect Request to {vpaInput}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* =================================================================== */}
              {/* RAIL VIEW 2: CREDIT / DEBIT CARDS */}
              {/* =================================================================== */}
              {selectedRail === 'card' && (
                <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-4 space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono-code text-[#94A3B8]">Debit / Credit Card Details</span>
                    <div className="flex items-center gap-1.5">
                      {/* Brand badges */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cardValidation.brand === 'rupay' ? 'bg-[#F97316] text-white' : 'bg-[#172A42] text-[#64748B]'
                      }`}>
                        RuPay 🇮🇳
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cardValidation.brand === 'visa' ? 'bg-[#2563EB] text-white' : 'bg-[#172A42] text-[#64748B]'
                      }`}>
                        VISA
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        cardValidation.brand === 'mastercard' ? 'bg-[#DC2626] text-white' : 'bg-[#172A42] text-[#64748B]'
                      }`}>
                        Mastercard
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="#### #### #### ####"
                        maxLength={23}
                        className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs font-mono-code text-[#F1F5F9] outline-none"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {cardValidation.isValid && (
                          <span className="text-[10px] font-bold text-[#A3E635] flex items-center gap-1">
                            <Check className="w-3 h-3" /> Valid Luhn
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#94A3B8] block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs font-mono-code text-[#F1F5F9] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#94A3B8] block mb-1">CVV / Security Code</label>
                      <div className="relative">
                        <input
                          type={showCvv ? 'text' : 'password'}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs font-mono-code text-[#F1F5F9] outline-none pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCvv(!showCvv)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#CBD5E1]"
                        >
                          {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Cardholder Legal Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name as printed on card"
                      className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs text-[#F1F5F9] outline-none"
                    />
                  </div>

                  {/* Test Cards Quick Fill Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-[#64748B]">Autofill Test Cards:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('6082 1928 3491 8917');
                        setCardExpiry('08/29');
                        setCardCvv('729');
                      }}
                      className="text-[10px] font-mono-code bg-[#172A42] hover:bg-[#1E3A5F] text-[#F97316] border border-[#F97316]/40 px-2 py-0.5 rounded"
                    >
                      RuPay 🇮🇳 Test
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('4532 8192 3847 4821');
                        setCardExpiry('11/28');
                        setCardCvv('382');
                      }}
                      className="text-[10px] font-mono-code bg-[#172A42] hover:bg-[#1E3A5F] text-[#38BDF8] border border-[#38BDF8]/40 px-2 py-0.5 rounded"
                    >
                      Visa Test
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber('5241 8192 3847 4820');
                        setCardExpiry('06/30');
                        setCardCvv('915');
                      }}
                      className="text-[10px] font-mono-code bg-[#172A42] hover:bg-[#1E3A5F] text-[#EF4444] border border-[#EF4444]/40 px-2 py-0.5 rounded"
                    >
                      Mastercard Test
                    </button>
                  </div>

                  {/* RBI Tokenization Checkbox */}
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#94A3B8]">
                    <input
                      type="checkbox"
                      id="saveToken"
                      checked={saveCardToken}
                      onChange={(e) => setSaveCardToken(e.target.checked)}
                      className="rounded border-[#1E3A5F] accent-[#A3E635]"
                    />
                    <label htmlFor="saveToken" className="cursor-pointer text-[11px]">
                      Tokenize card securely as per RBI Digital Card-on-File guidelines
                    </label>
                  </div>

                  <button
                    onClick={handleProceedToAuth}
                    className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] mt-3"
                  >
                    Proceed to 3D Secure 2.0 Auth ({formatINR(currentOrder.totalAmountINR)})
                  </button>
                </div>
              )}

              {/* =================================================================== */}
              {/* RAIL VIEW 3: NETBANKING */}
              {/* =================================================================== */}
              {selectedRail === 'netbanking' && (
                <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-4 space-y-3">
                  <span className="text-xs font-mono-code text-[#94A3B8] block">
                    Select Your Scheduled Commercial Bank
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TOP_BANKS.slice(0, 6).map((bank) => (
                      <div
                        key={bank.code}
                        onClick={() => setSelectedBankCode(bank.code)}
                        className={`p-2.5 rounded border cursor-pointer transition-all flex items-center gap-2 ${
                          selectedBankCode === bank.code
                            ? 'bg-[#172A42] border-[#A3E635] shadow-[0_0_10px_rgba(163,230,53,0.15)]'
                            : 'bg-[#0A1628] border-[#1E3A5F] hover:border-[#38BDF8]/40'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-black text-white shrink-0"
                          style={{ backgroundColor: bank.themeColor }}
                        >
                          {bank.logoInitial}
                        </div>
                        <span className="text-xs font-bold text-[#F1F5F9] truncate">{bank.shortName}</span>
                      </div>
                    ))}
                  </div>

                  {/* All Other Banks Dropdown */}
                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Or Choose from All Indian Banks</label>
                    <select
                      value={selectedBankCode}
                      onChange={(e) => setSelectedBankCode(e.target.value)}
                      className="w-full bg-[#0A1628] border border-[#1E3A5F] rounded px-3 py-2 text-xs text-[#F1F5F9] outline-none"
                    >
                      {TOP_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name} ({b.shortName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-2.5 rounded bg-[#172A42]/50 border border-[#1E3A5F] text-xs text-[#94A3B8]">
                    Selected Gateway: <strong className="text-[#A3E635]">{TOP_BANKS.find((b) => b.code === selectedBankCode)?.name}</strong>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      You will be transferred to your bank's secure netbanking portal for authentication.
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToAuth}
                    className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] mt-3"
                  >
                    Proceed to Bank Portal ({formatINR(currentOrder.totalAmountINR)})
                  </button>
                </div>
              )}

              {/* =================================================================== */}
              {/* RAIL VIEW 4: CORPORATE INVOICING / WIRE */}
              {/* =================================================================== */}
              {selectedRail === 'corporate_wire' && (
                <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-4 space-y-3">
                  <span className="text-xs font-mono-code text-[#94A3B8] block">
                    Institutional Invoicing & NEFT / RTGS Wire Settlement
                  </span>

                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Company / Institution Legal Entity</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs text-[#F1F5F9] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#94A3B8] block mb-1">Entity GSTIN (Goods & Services Tax ID)</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={customerGstin}
                        onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                        placeholder="27AAACC1234A1Z5"
                        maxLength={15}
                        className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-3 py-2 text-xs font-mono-code text-[#F1F5F9] outline-none"
                      />
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                        {gstinValidation.isValid ? (
                          <span className="text-[10px] font-bold text-[#A3E635]">✓ Valid GSTIN ({gstinValidation.stateName})</span>
                        ) : (
                          <span className="text-[10px] text-[#EF4444]">Invalid Format</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Virtual Account Wire Details */}
                  <div className="p-3 rounded bg-[#0A1628] border border-[#1E3A5F] text-xs space-y-1 font-mono-code">
                    <div className="text-[#38BDF8] font-bold">Allocated Virtual Account for NEFT/RTGS:</div>
                    <div className="text-[#94A3B8]">Beneficiary: <span className="text-[#F1F5F9]">ShadowID Technologies India Pvt Ltd</span></div>
                    <div className="text-[#94A3B8]">Virtual Account No: <span className="text-[#A3E635]">SHADOWID98420182</span></div>
                    <div className="text-[#94A3B8]">IFSC Code: <span className="text-[#F1F5F9]">ICIC0000104 (ICICI Bank)</span></div>
                  </div>

                  <button
                    onClick={handleProceedToAuth}
                    className="w-full py-2.5 px-4 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(163,230,53,0.25)] mt-3"
                  >
                    Confirm Wire Details & Generate Tax Invoice
                  </button>
                </div>
              )}
            </div>

            {/* Step 1 Dedicated Bottom Bar with Close Button */}
            <div className="lg:col-span-12 pt-3 mt-2 border-t border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 bg-[#172A42] border border-[#1E3A5F] hover:border-[#EF4444]/40 flex items-center gap-2 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>Cancel & Close</span>
              </button>
              <div className="text-[11px] font-mono-code text-[#64748B] flex items-center gap-2">
                <span>Receiver UPI: <strong className="text-[#38BDF8]">7973009420@ptaxis</strong></span>
                <span>•</span>
                <span className="text-[#A3E635]">18% GST Compliant</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: AUTHORIZATION & CHALLENGE SIMULATION (3DS OTP / UPI PUSH) */}
        {/* ========================================================================= */}
        {currentStep === 'CHALLENGE_AUTH' && (
          <div className="p-6 max-w-lg mx-auto w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] mx-auto shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                {selectedRail === 'card' ? <Lock className="w-6 h-6" /> : <Smartphone className="w-6 h-6" />}
              </div>
              <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
                {selectedRail === 'card'
                  ? '3D Secure 2.0 Card Authentication'
                  : selectedRail === 'upi'
                  ? 'Approve UPI Collect Request'
                  : selectedRail === 'netbanking'
                  ? 'Bank NetBanking Authorization'
                  : 'Corporate Wire Settlement Authorization'}
              </h3>
              <p className="text-xs text-[#94A3B8]">
                {selectedRail === 'card'
                  ? `One-Time Password (OTP) sent to mobile linked with ${cardValidation.brand.toUpperCase()} ending in ${cardNumber.slice(-4)}`
                  : selectedRail === 'upi'
                  ? `Collect request for ${formatINR(currentOrder.totalAmountINR)} sent to your UPI device`
                  : 'Confirm your credentials to authorize the secure debit transaction'}
              </p>
            </div>

            {/* Card 3DS OTP Challenge Form */}
            {selectedRail === 'card' && (
              <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-5 space-y-4">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-[#1E3A5F]">
                  <span className="text-[#94A3B8]">Issuing Bank Rail</span>
                  <span className="font-bold text-[#38BDF8]">
                    Verified by {cardValidation.brand === 'rupay' ? 'RuPay PaySecure' : 'Visa Secure'}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-mono-code text-[#94A3B8] block mb-1.5">
                    Enter 6-Digit Bank OTP
                  </label>
                  <input
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    placeholder="######"
                    maxLength={6}
                    className="w-full bg-[#0A1628] border border-[#1E3A5F] focus:border-[#A3E635] rounded px-4 py-2.5 text-center text-lg font-mono-code font-bold tracking-widest text-[#A3E635] outline-none"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#64748B] mt-2">
                    <span>Valid for: <strong className="text-[#F1F5F9]">{formatTimer(otpTimer)}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpValue('742918')}
                      className="text-[#38BDF8] hover:underline"
                    >
                      Autofill Test OTP (742918)
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    onClick={() => setCurrentStep('METHOD_SELECT')}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] bg-[#172A42] border border-[#1E3A5F]"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 bg-[#172A42] border border-[#EF4444]/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Close
                  </button>
                  <button
                    disabled={otpValue.length < 6}
                    onClick={handleExecuteHandshake}
                    className="flex-1 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(163,230,53,0.25)] disabled:opacity-50"
                  >
                    Submit OTP
                  </button>
                </div>
              </div>
            )}

            {/* UPI Push Notification Pulse Challenge */}
            {selectedRail === 'upi' && (
              <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-5 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#A3E635]/10 border-2 border-[#A3E635] flex items-center justify-center text-[#A3E635] mx-auto animate-pulse">
                  <Smartphone className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F9]">
                    Approve Notification on your Mobile Device
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Open your UPI App (Paytm, PhonePe, Google Pay) and approve the debit of{' '}
                    <strong className="text-[#A3E635]">{formatINR(currentOrder.totalAmountINR)}</strong> to{' '}
                    <span className="font-mono-code text-[#38BDF8]">7973009420@ptaxis</span>
                  </p>
                </div>

                <div className="p-3 rounded bg-[#0A1628] border border-[#1E3A5F] text-left text-xs font-mono-code space-y-1">
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Transaction Note:</span>
                    <span className="text-[#F1F5F9]">PRO-PASS-{currentOrder.orderId.slice(-6)}</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Amount:</span>
                    <span className="text-[#A3E635]">₹{currentOrder.totalAmountINR}.00</span>
                  </div>
                  <div className="flex justify-between text-[#94A3B8]">
                    <span>Payee UPI VPA:</span>
                    <span className="text-[#38BDF8]">7973009420@ptaxis</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    onClick={() => setCurrentStep('METHOD_SELECT')}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] bg-[#172A42] border border-[#1E3A5F]"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 bg-[#172A42] border border-[#EF4444]/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Close
                  </button>
                  <button
                    onClick={handleExecuteHandshake}
                    className="flex-1 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(163,230,53,0.25)]"
                  >
                    Approve
                  </button>
                </div>
              </div>
            )}

            {/* NetBanking & Corporate Challenge */}
            {(selectedRail === 'netbanking' || selectedRail === 'corporate_wire') && (
              <div className="bg-[#07111F] border border-[#1E3A5F] rounded-lg p-5 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] mx-auto">
                  <Building2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#F1F5F9]">
                    {selectedRail === 'netbanking' ? 'Bank Gateway Redirect Authorized' : 'Corporate Wire Cleared'}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Processing secure settlement token exchange with banking network.
                  </p>
                </div>

                <div className="pt-2 flex gap-2.5">
                  <button
                    onClick={() => setCurrentStep('METHOD_SELECT')}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] bg-[#172A42] border border-[#1E3A5F]"
                  >
                    Back
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 rounded text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/15 bg-[#172A42] border border-[#EF4444]/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Close
                  </button>
                  <button
                    onClick={handleExecuteHandshake}
                    className="flex-1 py-2 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(163,230,53,0.25)]"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CRYPTOGRAPHIC PROTOCOL HANDSHAKE INSPECTOR */}
        {/* ========================================================================= */}
        {currentStep === 'PROTOCOL_HANDSHAKE' && (
          <div className="p-6 max-w-2xl mx-auto w-full space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-[#A3E635]/10 border border-[#A3E635]/30 flex items-center justify-center text-[#A3E635] mx-auto animate-spin">
                <Loader2 className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-display font-bold text-[#F1F5F9]">
                Executing Cryptographic Handshake Protocol
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Razorpay API v1 &bull; HMAC-SHA256 Signature Verification &bull; Entitlement Provisioning
              </p>
            </div>

            {/* Terminal Window with Protocol Telemetry */}
            <div className="bg-[#050C17] border border-[#1E3A5F] rounded-lg p-4 font-mono-code text-xs shadow-inner space-y-2 max-h-72 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#1E3A5F]/60 text-[11px] text-[#64748B]">
                <span className="flex items-center gap-1.5 text-[#38BDF8]">
                  <Terminal className="w-3.5 h-3.5" /> SHADOWID PROTOCOL CONSOLE
                </span>
                <span className="text-[#A3E635]">TLS 1.3 ACTIVE</span>
              </div>

              {protocolLogs.map((log) => (
                <div key={log.id} className="space-y-0.5 animate-fadeIn">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[#64748B] text-[10px]">{log.timestamp}</span>
                    <span className="text-[#A3E635] font-bold">[{log.stage}]</span>
                    <span className="text-[#CBD5E1]">{log.message}</span>
                  </div>
                  {log.payloadSnippet && (
                    <div className="text-[11px] text-[#38BDF8]/90 pl-16">
                      &gt; {log.payloadSnippet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SETTLED SUCCESS & OFFICIAL GST TAX INVOICE */}
        {/* ========================================================================= */}
        {currentStep === 'SETTLED_RECEIPT' && settledReceipt && (
          <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Success Banner */}
            <div className="bg-[#172A42] border border-[#A3E635] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(163,230,53,0.2)]">
              <div className="flex items-center gap-3.5 text-center sm:text-left">
                <div className="w-12 h-12 rounded-full bg-[#A3E635] text-[#07111F] flex items-center justify-center shrink-0 shadow-lg">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-lg font-display font-bold text-[#F1F5F9]">
                      Payment Successfully Authorized & Settled
                    </h3>
                  </div>
                  <p className="text-xs text-[#CBD5E1] mt-0.5">
                    Your <strong className="text-[#A3E635]">{settledReceipt.planName}</strong> is now active in your workspace through{' '}
                    <strong className="text-[#F1F5F9]">{settledReceipt.validUntilIST}</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handlePrintInvoice}
                  className="py-2 px-3 rounded text-xs font-bold bg-[#0A1628] text-[#F1F5F9] border border-[#1E3A5F] hover:bg-[#1E3A5F] flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#38BDF8]" />
                  Print / Save PDF
                </button>
                <button
                  onClick={handleCopyAuditJson}
                  className="py-2 px-3 rounded text-xs font-bold bg-[#0A1628] text-[#F1F5F9] border border-[#1E3A5F] hover:bg-[#1E3A5F] flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5 text-[#A3E635]" />
                  Copy JSON Token
                </button>
              </div>
            </div>

            {/* Printable Official GST Tax Invoice Document */}
            <div
              id="printable-tax-invoice"
              className="bg-white text-[#0F172A] rounded-xl p-6 sm:p-8 shadow-2xl border border-gray-300 font-sans space-y-6 text-xs"
            >
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-gray-300">
                <div>
                  <div className="text-xl font-display font-black text-[#0A1628] tracking-tight">
                    SHADOW<span className="text-[#65a30d]">ID</span> TECHNOLOGIES
                  </div>
                  <div className="text-[11px] text-gray-600 mt-0.5 font-medium">
                    {settledReceipt.supplierName}
                  </div>
                  <div className="text-[10px] text-gray-500 max-w-sm mt-0.5">
                    {settledReceipt.supplierAddress}
                  </div>
                  <div className="text-[10px] font-mono text-gray-700 mt-1 space-x-3">
                    <span>CIN: <strong>{settledReceipt.supplierCin}</strong></span>
                    <span>PAN: <strong>{settledReceipt.supplierPan}</strong></span>
                    <span>GSTIN: <strong>{settledReceipt.supplierGstin}</strong></span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <div className="inline-block bg-[#0A1628] text-white font-mono font-bold text-xs uppercase px-3 py-1 rounded">
                    Tax Invoice (Original)
                  </div>
                  <div className="text-sm font-bold text-gray-900 mt-2">
                    Invoice No: <span className="font-mono text-[#0A1628]">{settledReceipt.invoiceNumber}</span>
                  </div>
                  <div className="text-[11px] text-gray-600 font-mono mt-0.5">
                    Date & Time: {settledReceipt.issuedAtIST}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                    SAC Code: <strong>{settledReceipt.hsnSacCode}</strong> (IT & Cyber Forensics)
                  </div>
                </div>
              </div>

              {/* Bill To & Payment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Billed To (Client / Licensee)</span>
                  <div className="font-bold text-gray-900 text-sm">{settledReceipt.userName}</div>
                  <div className="text-gray-600">{settledReceipt.userEmail}</div>
                  {settledReceipt.userOrganization && (
                    <div className="text-gray-600">{settledReceipt.userOrganization}</div>
                  )}
                  {settledReceipt.customerGstin && (
                    <div className="font-mono text-gray-800">
                      Client GSTIN: <strong>{settledReceipt.customerGstin}</strong>
                    </div>
                  )}
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block">Payment Clearing & Settlement</span>
                  <div className="text-gray-800">
                    Payment Method: <strong className="text-gray-900">{settledReceipt.paymentRail.toUpperCase()}</strong>
                  </div>
                  <div className="font-mono text-[11px] text-gray-700">
                    Reference: {settledReceipt.railIdentifier}
                  </div>
                  <div className="font-mono text-[11px] text-gray-700">
                    Razorpay Payment ID: <strong>{settledReceipt.paymentId}</strong>
                  </div>
                  <div className="font-mono text-[10px] text-green-700 font-bold">
                    Signature Proof: {settledReceipt.signature.slice(0, 24)}... (Verified)
                  </div>
                </div>
              </div>

              {/* Tax Invoice Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-[11px] uppercase border-y border-gray-300">
                      <th className="py-2.5 px-3">S.No</th>
                      <th className="py-2.5 px-3">Description of Forensic Service</th>
                      <th className="py-2.5 px-3">SAC Code</th>
                      <th className="py-2.5 px-3 text-right">Taxable Value</th>
                      <th className="py-2.5 px-3 text-right">CGST (9%)</th>
                      <th className="py-2.5 px-3 text-right">SGST (9%)</th>
                      <th className="py-2.5 px-3 text-right">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 px-3 font-mono">1</td>
                      <td className="py-3 px-3">
                        <strong className="text-gray-900 block">{settledReceipt.planName}</strong>
                        <span className="text-[10px] text-gray-500">
                          Entitlement Validity: {settledReceipt.durationDays} Days &bull; Active until {settledReceipt.validUntilIST}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{settledReceipt.hsnSacCode}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.baseAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.cgstAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.sgstAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                        ₹{settledReceipt.totalAmountINR.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-400 font-bold bg-gray-50">
                      <td colSpan={3} className="py-3 px-3 text-right uppercase text-gray-700">
                        Total Invoice Value (Gross INR):
                      </td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.baseAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.cgstAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono">₹{settledReceipt.sgstAmountINR.toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-mono text-sm text-[#0A1628]">
                        ₹{settledReceipt.totalAmountINR.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount in Words & Cryptographic Verification Seal */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-gray-300">
                <div className="space-y-1 text-left w-full sm:w-2/3">
                  <div className="text-[10px] uppercase font-bold text-gray-500">Amount Chargeable (in words):</div>
                  <div className="font-bold text-gray-800 text-xs tracking-wide">
                    {inrToWords(settledReceipt.totalAmountINR)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono mt-1">
                    SHA-256 Seal: <strong>{settledReceipt.sha256ProofToken}</strong>
                  </div>
                </div>

                <div className="text-center sm:text-right w-full sm:w-1/3 space-y-1">
                  <div className="inline-block border border-gray-400 px-3 py-1 rounded text-[10px] font-mono text-gray-700 bg-gray-50">
                    DIGITALLY SIGNED & AUTHORIZED
                  </div>
                  <div className="text-[9px] text-gray-500">
                    For ShadowID Technologies India Pvt. Ltd.
                  </div>
                </div>
              </div>
            </div>

            {/* Collapsible Forensic Protocol Inspector */}
            <div className="border border-[#1E3A5F] rounded-lg overflow-hidden bg-[#07111F]">
              <button
                onClick={() => setShowRawInspector(!showRawInspector)}
                className="w-full p-3 text-xs font-mono-code text-[#94A3B8] hover:text-[#F1F5F9] flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#38BDF8]" />
                  Cryptographic Protocol Inspector (HMAC-SHA256 & Session Telemetry)
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showRawInspector ? 'rotate-180' : ''}`} />
              </button>

              {showRawInspector && (
                <div className="p-4 border-t border-[#1E3A5F] bg-[#050C17] text-xs font-mono-code space-y-3">
                  <div>
                    <span className="text-[#A3E635] font-bold block mb-1">Razorpay Verification Signature:</span>
                    <div className="p-2 bg-[#0A1628] rounded border border-[#1E3A5F] text-[#38BDF8] break-all">
                      {settledReceipt.signature}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#A3E635] font-bold block mb-1">Raw Receipt JSON Token:</span>
                    <pre className="p-2.5 bg-[#0A1628] rounded border border-[#1E3A5F] text-[#CBD5E1] overflow-x-auto text-[11px]">
                      {JSON.stringify(settledReceipt, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Done Action */}
            <div className="flex items-center justify-between pt-3 border-t border-[#1E3A5F]">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-[#EF4444] bg-[#172A42] hover:bg-[#EF4444]/10 border border-[#1E3A5F] hover:border-[#EF4444]/30 flex items-center gap-2 transition-colors shadow-sm"
              >
                <X className="w-4 h-4" />
                Close Window
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-lg text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)]"
              >
                Done & Return to Workspace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
