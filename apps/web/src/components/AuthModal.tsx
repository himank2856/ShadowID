/**
 * ShadowID - Professional Forensic Authentication & OTP Verification Modal
 * DPDP Act 2023 Compliant Onboarding & Access Gateway
 * Team GIGABYTE - Build With Bharat 3.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { accountDatabase } from '../services/accountDatabase.ts';
import { otpService } from '../services/otpService.ts';
import { Role } from '../types.ts';
import {
  Shield,
  Lock,
  Mail,
  Phone,
  User,
  Building,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'reset_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'signin',
}) => {
  const { login, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'reset_password'>(defaultTab);
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState<string>('analyst@shadowid.in');
  const [loginPassword, setLoginPassword] = useState<string>('ShadowID@2026');

  // Sign Up Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('+91 ');
  const [organization, setOrganization] = useState<string>('');
  const [role, setRole] = useState<Role>('analyst');
  const [password, setPassword] = useState<string>('');
  const [signupChannel, setSignupChannel] = useState<'email' | 'sms'>('email');
  const [consentAgreed, setConsentAgreed] = useState<boolean>(true);

  // Password Reset Form State
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetNewPassword, setResetNewPassword] = useState<string>('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState<string>('');
  const [showResetPassword, setShowResetPassword] = useState<boolean>(false);

  // OTP Verification Stage State
  const [isOtpStep, setIsOtpStep] = useState<boolean>(false);
  const [otpTarget, setOtpTarget] = useState<string>('');
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'login' | 'reset_password'>('signup');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState<number>(30);
  const [devOtpPreview, setDevOtpPreview] = useState<string | null>(null);

  // Common UI State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setActiveTab(defaultTab);
    setErrorMsg(null);
  }, [defaultTab, isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let timer: any;
    if (isOtpStep && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpStep, otpCountdown]);

  if (!isOpen) return null;

  // Quick fill test account helper
  const handleQuickFill = (accType: 'analyst' | 'investigator') => {
    if (accType === 'analyst') {
      setLoginIdentifier('analyst@shadowid.in');
      setLoginPassword('ShadowID@2026');
    } else {
      setLoginIdentifier('investigator@bharat.gov.in');
      setLoginPassword('Bharat@2026');
    }
    setErrorMsg(null);
  };

  // Trigger Password Sign-In
  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (!loginIdentifier || !loginPassword) {
        throw new Error('Please enter both identifier and password.');
      }
      const user = await accountDatabase.authenticateWithPassword(
        loginIdentifier,
        loginPassword
      );
      login(user);
      showToast(`Welcome back, ${user.fullName} (${user.role.toUpperCase()})`);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger OTP Sign-In Initiation
  const handleOtpSignInRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanTarget = loginIdentifier.trim();
    if (!cleanTarget) {
      setErrorMsg('Please provide a registered mobile number or email address.');
      return;
    }

    const existingUser = accountDatabase.findByEmailOrPhone(cleanTarget);
    if (!existingUser) {
      setErrorMsg('No account found with this contact. Please create an account first.');
      return;
    }

    const channel = cleanTarget.includes('@') ? 'email' : 'sms';
    const res = otpService.generateAndSendOtp(cleanTarget, channel, 'login');

    setOtpTarget(cleanTarget);
    setOtpPurpose('login');
    setDevOtpPreview(res.otpCodePreview);
    setOtpCountdown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setIsOtpStep(true);
    showToast(`Verification code sent to ${cleanTarget}`);
  };

  // Trigger Sign-Up Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (!consentAgreed) {
      setErrorMsg('You must agree to the DPDP Act identity verification terms.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const { user, otpTarget: target, channel } = await accountDatabase.registerUser({
        fullName,
        email,
        phone,
        organization,
        designation: '',
        role,
        password,
        verificationChannel: signupChannel,
      });

      const res = otpService.generateAndSendOtp(target, channel, 'signup');

      setOtpTarget(target);
      setOtpPurpose('signup');
      setDevOtpPreview(res.otpCodePreview);
      setOtpCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setIsOtpStep(true);
      showToast(`Verification OTP dispatched to ${target} (${channel.toUpperCase()})`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Account registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Password Reset Request (Step 1)
  const handleResetRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please provide a valid registered Gmail or email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await accountDatabase.initiatePasswordReset(cleanEmail);
      setOtpTarget(cleanEmail);
      setOtpPurpose('reset_password');
      setDevOtpPreview(res.previewCode || null);
      setOtpCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      setResetStep('verify');
      showToast(`Reset OTP code dispatched to ${cleanEmail}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to initiate password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger Password Reset Completion (Step 2)
  const handleResetVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP reset code.');
      return;
    }

    if (!resetNewPassword || resetNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your new password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await accountDatabase.completePasswordReset(
        resetEmail,
        fullCode,
        resetNewPassword
      );
      showToast(res.message);

      // Sign in with the new password
      const updatedUser = await accountDatabase.authenticateWithPassword(
        resetEmail,
        resetNewPassword
      );
      login(updatedUser);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP digit box change
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-advance
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP Paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedData.length; i++) {
        newDigits[i] = pastedData[i];
      }
      setOtpDigits(newDigits);
      const focusIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[focusIndex]?.focus();
    }
  };

  // Verify OTP submission
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const fullCode = otpDigits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }

    setIsLoading(true);

    try {
      const verifyRes = accountDatabase.confirmUserOtpVerification(otpTarget, fullCode);
      if (!verifyRes.success) {
        throw new Error(verifyRes.message);
      }

      const user = accountDatabase.findByEmailOrPhone(otpTarget);
      if (user) {
        login(user);
        showToast(`Identity verified successfully! Logged in as ${user.fullName}`);
        onClose();
      } else {
        showToast('OTP verified. Please sign in with your credentials.');
        setIsOtpStep(false);
        setActiveTab('signin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpCountdown > 0) return;
    setErrorMsg(null);
    const channel = otpTarget.includes('@') ? 'email' : 'sms';
    const res = otpService.generateAndSendOtp(otpTarget, channel, otpPurpose);
    setDevOtpPreview(res.otpCodePreview);
    setOtpCountdown(30);
    setOtpDigits(['', '', '', '', '', '']);
    showToast(`New verification OTP sent to ${otpTarget}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050D17]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0F1D2E] border border-[#1E3A5F] rounded-lg shadow-2xl overflow-hidden">
        {/* Top Header Badge */}
        <div className="bg-[#121c2a] border-b border-[#1E3A5F] px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#172A42] border border-[#38BDF8] flex items-center justify-center text-[#A3E635]">
              <Shield className="w-3 h-3" />
            </div>
            <span className="text-xs font-mono-code font-bold text-[#F1F5F9]">
              ShadowID Forensic Gateway
            </span>
            <span className="text-[10px] font-mono-code bg-[#172A42] text-[#38BDF8] px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
              DPDP 2023
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded hover:bg-[#172A42] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* If we are on the OTP verification step */}
          {isOtpStep ? (
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-[#172A42] border-2 border-[#38BDF8] flex items-center justify-center text-[#38BDF8] mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-display font-bold text-[#F1F5F9]">
                  Two-Factor OTP Verification
                </h2>
                <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
                  A 6-digit authentication code has been transmitted to{' '}
                  <span className="text-[#38BDF8] font-mono-code">{otpTarget}</span>
                </p>
              </div>

              {/* Development Helper Preview */}
              {devOtpPreview && (
                <div className="bg-[#172A42]/80 border border-[#A3E635]/40 rounded p-2.5 text-center text-xs">
                  <div className="flex items-center justify-center gap-1.5 text-[#A3E635] font-mono-code">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dev/Evaluation Code: <strong>{devOtpPreview}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpDigits(devOtpPreview.split(''));
                    }}
                    className="mt-1 text-[11px] text-[#38BDF8] underline hover:text-[#7dd3fc]"
                  >
                    Click to auto-fill code
                  </button>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded p-2.5 text-xs text-[#FCA5A5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 6 Digit Input Boxes */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div
                  className="flex items-center justify-center gap-2 sm:gap-3"
                  onPaste={handleOtpPaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono-code font-bold bg-[#07111F] border border-[#1E3A5F] rounded focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] text-[#F1F5F9] focus:outline-none transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {/* Resend & Action Buttons */}
                <div className="flex items-center justify-between text-xs font-mono-code pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpStep(false);
                      setErrorMsg(null);
                    }}
                    className="text-[#94A3B8] hover:text-[#F1F5F9]"
                  >
                    ← Back to edit
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={otpCountdown > 0}
                    className={`flex items-center gap-1 ${
                      otpCountdown > 0
                        ? 'text-[#64748B] cursor-not-allowed'
                        : 'text-[#38BDF8] hover:underline'
                    }`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code & Proceed'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div>
              {/* Tab Selector (Sign In vs Create Account vs Reset Password) */}
              <div className="flex border-b border-[#1E3A5F] mb-5">
                <button
                  onClick={() => {
                    setActiveTab('signin');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-mono-code font-bold text-center border-b-2 transition-colors ${
                    activeTab === 'signin'
                      ? 'border-[#38BDF8] text-[#38BDF8]'
                      : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMsg(null);
                  }}
                  className={`flex-1 py-2 text-xs font-mono-code font-bold text-center border-b-2 transition-colors ${
                    activeTab === 'signup'
                      ? 'border-[#A3E635] text-[#A3E635]'
                      : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
                  }`}
                >
                  Create Account
                </button>
                {activeTab === 'reset_password' && (
                  <button
                    onClick={() => {
                      setActiveTab('reset_password');
                      setErrorMsg(null);
                    }}
                    className="flex-1 py-2 text-xs font-mono-code font-bold text-center border-b-2 border-[#F59E0B] text-[#F59E0B] transition-colors"
                  >
                    Reset Password
                  </button>
                )}
              </div>

              {/* Error Box */}
              {errorMsg && (
                <div className="mb-4 bg-[#EF4444]/10 border border-[#EF4444]/40 rounded p-2.5 text-xs text-[#FCA5A5] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* SIGN IN TAB */}
              {activeTab === 'signin' && (
                <div className="space-y-4">
                  {/* Method toggle: Password vs OTP */}
                  <div className="flex items-center justify-center bg-[#07111F] p-0.5 rounded border border-[#1E3A5F] text-[11px] font-mono-code">
                    <button
                      type="button"
                      onClick={() => setAuthMethod('password')}
                      className={`flex-1 py-1 rounded transition-colors ${
                        authMethod === 'password'
                          ? 'bg-[#172A42] text-[#38BDF8] font-bold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      Password Authentication
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMethod('otp')}
                      className={`flex-1 py-1 rounded transition-colors ${
                        authMethod === 'otp'
                          ? 'bg-[#172A42] text-[#A3E635] font-bold'
                          : 'text-[#94A3B8]'
                      }`}
                    >
                      Instant OTP Login
                    </button>
                  </div>

                  {authMethod === 'password' ? (
                    <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                          Email or Mobile Number
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                          <input
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="analyst@shadowid.in or +91 98881 29012"
                            className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#38BDF8]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1 flex items-center justify-between">
                          <span>Password</span>
                          <span className="text-[10px] text-[#64748B]">SHA-256 Protected</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-9 text-xs focus:outline-none focus:border-[#38BDF8]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#94A3B8]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('reset_password');
                              setResetStep('request');
                              setResetEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                              setErrorMsg(null);
                            }}
                            className="text-[11px] font-mono-code text-[#38BDF8] hover:text-[#7dd3fc] hover:underline"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded text-xs font-bold bg-[#38BDF8] text-[#07111F] hover:bg-[#7dd3fc] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Authenticating...' : 'Sign In to Forensic Console'}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpSignInRequest} className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                          Registered Mobile (+91) or Email
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                          <input
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="+91 98881 29012 or analyst@shadowid.in"
                            className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-1.5 transition-all"
                      >
                        Request 6-Digit OTP <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}

                  {/* Quick-fill helper for test accounts */}
                  <div className="pt-3 border-t border-[#172A42] text-center">
                    <div className="text-[10px] font-mono-code uppercase text-[#64748B] mb-2">
                      Pre-Seeded Accounts for Evaluation
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickFill('analyst')}
                        className="px-2.5 py-1 rounded bg-[#172A42] text-[11px] font-mono-code text-[#38BDF8] border border-[#38BDF8]/40 hover:bg-[#1E3A5F]"
                      >
                        Forensic Analyst
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickFill('investigator')}
                        className="px-2.5 py-1 rounded bg-[#172A42] text-[11px] font-mono-code text-[#A3E635] border border-[#A3E635]/40 hover:bg-[#1E3A5F]"
                      >
                        Chief Auditor
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CREATE ACCOUNT TAB */}
              {activeTab === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Himank Sharma"
                          className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Indian Mobile (+91) *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98881 29012"
                          className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Work / Official Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="investigator@agency.in"
                          className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Organization / Lab
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="Cyber Cell / Independent"
                          className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Account Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 px-3 text-xs focus:outline-none focus:border-[#A3E635]"
                      >
                        <option value="analyst">Forensic Analyst</option>
                        <option value="owner">Lead Investigator / Owner</option>
                        <option value="viewer">Compliance Auditor / Viewer</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#A3E635]"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Verification Channel Selector */}
                  <div className="p-2.5 bg-[#07111F] border border-[#1E3A5F] rounded">
                    <label className="block text-[10px] font-mono-code uppercase text-[#94A3B8] mb-1.5 flex items-center justify-between">
                      <span>OTP Verification Channel</span>
                      <span className="text-[#A3E635]">Mandatory 2FA</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono-code">
                      <button
                        type="button"
                        onClick={() => setSignupChannel('email')}
                        className={`py-1.5 px-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                          signupChannel === 'email'
                            ? 'bg-[#172A42] border-[#A3E635] text-[#A3E635] font-bold'
                            : 'bg-[#0b1420] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Gmail / Email OTP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupChannel('sms')}
                        className={`py-1.5 px-2 rounded border text-left flex items-center gap-1.5 transition-all ${
                          signupChannel === 'sms'
                            ? 'bg-[#172A42] border-[#38BDF8] text-[#38BDF8] font-bold'
                            : 'bg-[#0b1420] border-[#1E3A5F] text-[#94A3B8] hover:text-[#F1F5F9]'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">SMS (+91 Mobile)</span>
                      </button>
                    </div>
                  </div>

                  {/* DPDP Consent */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-[11px] text-[#CBD5E1]">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => setConsentAgreed(e.target.checked)}
                        className="mt-0.5 rounded border-[#1E3A5F] bg-[#07111F] text-[#A3E635] focus:ring-0"
                      />
                      <span>
                        I confirm this account is created for legitimate digital identity verification in compliance with India's DPDP Act 2023.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded text-xs font-bold bg-[#A3E635] text-[#07111F] hover:bg-[#bef264] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(163,230,53,0.3)] transition-all disabled:opacity-50"
                  >
                    {isLoading ? 'Creating Account...' : `Continue to ${signupChannel === 'email' ? 'Gmail / Email' : 'Mobile'} OTP`}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* RESET PASSWORD TAB */}
              {activeTab === 'reset_password' && (
                <div className="space-y-4">
                  {resetStep === 'request' ? (
                    <form onSubmit={handleResetRequestSubmit} className="space-y-3.5">
                      <div className="text-xs text-[#94A3B8] leading-relaxed">
                        Enter your registered Gmail or work email address. We will dispatch a 6-digit forensic OTP to verify your identity before allowing a password reset.
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                          Registered Gmail / Work Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            placeholder="e.g. himank2856@gmail.com or analyst@shadowid.in"
                            className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#F59E0B]"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('signin');
                            setErrorMsg(null);
                          }}
                          className="text-[11px] font-mono-code text-[#94A3B8] hover:text-[#F1F5F9]"
                        >
                          ← Back to Sign In
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-4 py-2 rounded text-xs font-bold bg-[#F59E0B] text-[#07111F] hover:bg-[#fbbf24] flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {isLoading ? 'Dispatching...' : 'Send 6-Digit Reset Code'}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetVerifySubmit} className="space-y-4">
                      <div className="p-3 bg-[#172A42] border border-[#F59E0B]/40 rounded text-xs text-[#CBD5E1] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#94A3B8]">Reset Target:</span>
                          <span className="text-[#F59E0B] font-mono-code font-bold">{resetEmail}</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8]">
                          Check your Gmail/email inbox for the 6-digit code.
                        </div>
                      </div>

                      {/* Dev OTP Helper */}
                      {devOtpPreview && (
                        <div className="bg-[#07111F] border border-[#A3E635]/40 rounded p-2 text-center text-xs">
                          <div className="flex items-center justify-center gap-1 text-[#A3E635] font-mono-code">
                            <Sparkles className="w-3 h-3" />
                            <span>Dev Preview Code: <strong>{devOtpPreview}</strong></span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setOtpDigits(devOtpPreview.split(''))}
                            className="mt-0.5 text-[10px] text-[#38BDF8] underline hover:text-[#7dd3fc]"
                          >
                            Auto-fill digits
                          </button>
                        </div>
                      )}

                      {/* 6 Digit Input Boxes */}
                      <div>
                        <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-2 text-center">
                          Enter 6-Digit Verification Code
                        </label>
                        <div className="flex items-center justify-center gap-2 sm:gap-2.5" onPaste={handleOtpPaste}>
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="w-9 h-11 sm:w-11 sm:h-12 text-center text-base sm:text-lg font-mono-code font-bold bg-[#07111F] border border-[#1E3A5F] rounded focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] text-[#F1F5F9] focus:outline-none transition-all"
                              autoFocus={idx === 0}
                            />
                          ))}
                        </div>
                      </div>

                      {/* New Password & Confirm Password */}
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1 flex items-center justify-between">
                            <span>New Password *</span>
                            <span className="text-[10px] text-[#64748B]">Min 6 chars</span>
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                            <input
                              type={showResetPassword ? 'text' : 'password'}
                              value={resetNewPassword}
                              onChange={(e) => setResetNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-9 text-xs focus:outline-none focus:border-[#F59E0B]"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowResetPassword(!showResetPassword)}
                              className="absolute right-3 top-2.5 text-[#64748B] hover:text-[#94A3B8]"
                            >
                              {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-mono-code uppercase text-[#94A3B8] mb-1">
                            Confirm New Password *
                          </label>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-3" />
                            <input
                              type={showResetPassword ? 'text' : 'password'}
                              value={resetConfirmPassword}
                              onChange={(e) => setResetConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              className="w-full bg-[#07111F] border border-[#1E3A5F] text-[#F1F5F9] rounded py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-[#F59E0B]"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono-code pt-1">
                        <button
                          type="button"
                          onClick={() => setResetStep('request')}
                          className="text-[#94A3B8] hover:text-[#F1F5F9]"
                        >
                          ← Change Email
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const res = otpService.sendPasswordResetOtp(resetEmail);
                            setDevOtpPreview(res.otpCodePreview);
                            setOtpCountdown(30);
                            setOtpDigits(['', '', '', '', '', '']);
                            showToast(`New reset code sent to ${resetEmail}`);
                          }}
                          disabled={otpCountdown > 0}
                          className="text-[#38BDF8] hover:text-[#7dd3fc] disabled:text-[#64748B]"
                        >
                          {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend Code'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 rounded text-xs font-bold bg-[#F59E0B] text-[#07111F] hover:bg-[#fbbf24] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
                      >
                        {isLoading ? 'Resetting Password...' : 'Verify Code & Set New Password'}
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
