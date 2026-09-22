/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Top Navigation Bar
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import {
  Shield,
  Globe,
  User,
  CreditCard,
  Sparkles,
  Menu,
  X,
  ExternalLink,
  Lock,
  LogOut,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  Database,
} from 'lucide-react';
import { Role } from '../types.ts';
import { BillingModal } from './BillingModal.tsx';
import { AuthModal } from './AuthModal.tsx';
import { supabaseService } from '../services/supabaseService.ts';

export const Navbar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    user,
    isAuthenticated,
    openAuthModal,
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    logout,
    language,
    setLanguage,
    billing,
    t,
  } = useApp();

  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const supabaseConfig = supabaseService.getConfig();

  return (
    <>
      {/* Enterprise Security & DPDP Compliance Status Bar */}
      <div className="bg-[#0b131e] border-b border-[#1E3A5F] px-4 py-1 text-[11px] font-mono-code text-[#CBD5E1] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#A3E635]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635] animate-pulse" />
          <span className="font-medium">ShadowID Enterprise Forensic Suite</span>
          <span className="text-[#64748B] hidden sm:inline">•</span>
          <span className="text-[#38BDF8] hidden sm:inline">DPDP Act 2023 Compliant Repository</span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#94A3B8]">
          <button
            onClick={() => navigate('/app/settings')}
            className="flex items-center gap-1.5 text-[#38BDF8] hover:text-[#A3E635] transition-colors cursor-pointer bg-[#172A42]/60 px-2 py-0.5 rounded border border-[#1E3A5F]"
            title="Supabase Cloud Database Settings"
          >
            <Database className="w-3 h-3 text-[#38BDF8]" />
            <span>Supabase: <strong className="text-[#A3E635]">{supabaseConfig.accountName}</strong></span>
            <span className={`w-1.5 h-1.5 rounded-full ${supabaseConfig.isConnected ? 'bg-[#A3E635]' : 'bg-[#38BDF8]'} inline-block animate-pulse`}></span>
          </button>
          <span className="text-[#64748B]">•</span>
          <span>Cyber Threat Intelligence & Forensics Division</span>
          <span className="text-[#64748B]">•</span>
          <span className="text-[#A3E635] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> ISO 27001 Architecture
          </span>
        </div>
      </div>

      {/* Main Bar */}
      <header className="bg-[#07111F]/90 backdrop-blur border-b border-[#1E3A5F] sticky top-0 z-40 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => navigate(currentRoute.startsWith('/app') ? '/app/overview' : '/')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded bg-[#172A42] border border-[#38BDF8] flex items-center justify-center text-[#A3E635] shadow-[0_0_10px_rgba(56,189,248,0.25)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-lg text-[#F1F5F9] tracking-tight flex items-center gap-1.5">
                ShadowID
                <span className="text-[10px] font-mono-code bg-[#172A42] text-[#38BDF8] px-1.5 py-0.2 rounded border border-[#38BDF8]/40">
                  IN-v1.4
                </span>
              </div>
              <div className="text-[10px] font-mono-code text-[#64748B] -mt-1 hidden sm:block">
                Digital Footprint Exposure & Document Defense
              </div>
            </div>
          </div>

          {/* Center Navigation for Public vs App */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-[#94A3B8]">
            <button
              onClick={() => navigate('/')}
              className={`hover:text-[#F1F5F9] transition-colors ${currentRoute === '/' ? 'text-[#A3E635] font-semibold' : ''}`}
            >
              Public Hero
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className={`hover:text-[#F1F5F9] transition-colors ${currentRoute === '/how-it-works' ? 'text-[#A3E635] font-semibold' : ''}`}
            >
              Architecture & iNSIGHTS
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className={`hover:text-[#F1F5F9] transition-colors ${currentRoute === '/pricing' ? 'text-[#A3E635] font-semibold' : ''}`}
            >
              INR Pricing
            </button>
            <button
              onClick={() => navigate('/app/verification')}
              className={`hover:text-[#F1F5F9] transition-colors flex items-center gap-1 ${currentRoute === '/app/verification' ? 'text-[#38BDF8] font-semibold' : ''}`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Verification Lab</span>
            </button>
            <button
              onClick={() => navigate('/app/overview')}
              className="px-3 py-1 bg-[#172A42] border border-[#38BDF8]/50 text-[#38BDF8] rounded hover:bg-[#1E3A5F] transition-colors font-medium"
            >
              Console
            </button>
          </nav>

          {/* Right Controls (Language, Auth, Billing) */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#0F1D2E] border border-[#1E3A5F] rounded p-0.5 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code ${
                  language === 'en' ? 'bg-[#172A42] text-[#A3E635] font-bold' : 'text-[#94A3B8]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono-code ${
                  language === 'hi' ? 'bg-[#172A42] text-[#A3E635] font-bold' : 'text-[#94A3B8]'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Professional Authentication Buttons / User Pill */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#38BDF8]/50 rounded px-2.5 py-1 text-xs transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#172A42] border border-[#A3E635] flex items-center justify-center text-[10px] font-bold text-[#A3E635]">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-[#F1F5F9] font-medium leading-none truncate max-w-[110px]">
                      {user.fullName}
                    </div>
                    <div className="text-[9px] font-mono-code text-[#A3E635] leading-tight flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A3E635]" />
                      <span>DPDP Verified</span>
                    </div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0F1D2E] border border-[#1E3A5F] rounded-md shadow-2xl p-3 z-50 text-xs animate-fadeIn">
                    <div className="pb-2 border-b border-[#172A42] space-y-1">
                      <div className="font-bold text-[#F1F5F9]">{user.fullName}</div>
                      <div className="text-[11px] text-[#94A3B8] truncate">{user.email}</div>
                      <div className="text-[10px] font-mono-code text-[#38BDF8]">{user.phone}</div>
                    </div>

                    <div className="py-2 border-b border-[#172A42] space-y-1 text-[11px] font-mono-code text-[#CBD5E1]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Designation:</span>
                        <span className="text-[#F1F5F9] capitalize">{user.role}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">OTP Verified:</span>
                        <span className="text-[#A3E635] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Pro Status:</span>
                        <span className={user.isPro ? 'text-[#A3E635]' : 'text-[#F59E0B]'}>
                          {user.isPro ? 'Pro Active' : 'Free Tier'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">Cloud DB:</span>
                        <span className="text-[#38BDF8] flex items-center gap-1">
                          <Database className="w-3 h-3 text-[#A3E635]" /> {supabaseConfig.accountName}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          navigate('/app/settings');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1.5 px-2 rounded text-[#CBD5E1] hover:bg-[#172A42] transition-colors"
                      >
                        Account & Security Profile
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left py-1.5 px-2 rounded text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors flex items-center gap-1.5 font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1 rounded text-xs font-mono-code text-[#CBD5E1] hover:text-[#F1F5F9] bg-[#0F1D2E] border border-[#1E3A5F] hover:border-[#38BDF8]/40 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-3 py-1 rounded text-xs font-bold font-mono-code text-[#07111F] bg-[#A3E635] hover:bg-[#bef264] shadow-[0_0_10px_rgba(163,230,53,0.25)] transition-all"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Billing Button */}
            <button
              onClick={() => setIsBillingOpen(true)}
              className={`px-2.5 py-1 rounded text-xs font-mono-code border flex items-center gap-1.5 transition-colors ${
                billing.isPro
                  ? 'bg-[#A3E635]/15 border-[#A3E635] text-[#A3E635]'
                  : 'bg-[#0F1D2E] border-[#F59E0B]/50 text-[#F59E0B] hover:bg-[#172A42]'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {billing.isPro ? 'Pro Active' : 'Upgrade ₹499'}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-[#94A3B8] hover:text-[#F1F5F9]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 pt-2 border-t border-[#1E3A5F] space-y-2 text-xs">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              Public Hero
            </button>
            <button
              onClick={() => {
                navigate('/how-it-works');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              How It Works & iNSIGHTS
            </button>
            <button
              onClick={() => {
                navigate('/pricing');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              Pricing (₹499/mo)
            </button>
            <button
              onClick={() => {
                navigate('/app/verification');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-[#38BDF8]"
            >
              Verification Lab
            </button>
            <button
              onClick={() => {
                navigate('/app/overview');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-1 text-[#A3E635] font-bold"
            >
              Launch Console
            </button>
          </div>
        )}
      </header>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
    </>
  );
};

