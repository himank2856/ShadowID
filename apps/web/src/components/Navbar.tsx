/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Top Navigation Bar
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Shield, Globe, User, CreditCard, Sparkles, Menu, X, ExternalLink } from 'lucide-react';
import { Role } from '../types.ts';
import { BillingModal } from './BillingModal.tsx';

export const Navbar: React.FC = () => {
  const { currentRoute, navigate, role, setRole, language, setLanguage, billing, t } = useApp();
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Synthetic Demo Warning Banner */}
      <div className="bg-[#121c2a] border-b border-[#1E3A5F] px-4 py-1 text-[11px] font-mono-code text-[#A3E635] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#A3E635] animate-pulse" />
          <span>{t.syntheticNotice}</span>
        </div>
        <div className="hidden sm:block text-[#94A3B8]">
          Team GIGABYTE: Anshul, Tanishq, Himank | Build With Bharat 3.0 (Chitkara Univ, HP)
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
              onClick={() => navigate('/demo')}
              className={`hover:text-[#F1F5F9] transition-colors ${currentRoute === '/demo' ? 'text-[#A3E635] font-semibold' : ''}`}
            >
              Interactive Demo
            </button>
            <button
              onClick={() => navigate('/app/overview')}
              className="px-3 py-1 bg-[#172A42] border border-[#38BDF8]/50 text-[#38BDF8] rounded hover:bg-[#1E3A5F] transition-colors"
            >
              Launch Console
            </button>
          </nav>

          {/* Right Controls (Language, Role, Billing) */}
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

            {/* Role Switcher */}
            <div className="hidden sm:flex items-center bg-[#0F1D2E] border border-[#1E3A5F] rounded px-2 py-1 text-xs">
              <User className="w-3.5 h-3.5 text-[#38BDF8] mr-1" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="bg-transparent text-[#F1F5F9] text-xs focus:outline-none cursor-pointer"
              >
                <option value="owner" className="bg-[#0F1D2E]">{t.roleOwner}</option>
                <option value="analyst" className="bg-[#0F1D2E]">{t.roleAnalyst}</option>
                <option value="viewer" className="bg-[#0F1D2E]">{t.roleViewer}</option>
              </select>
            </div>

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
              onClick={() => { navigate('/'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              Public Hero
            </button>
            <button
              onClick={() => { navigate('/how-it-works'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              How It Works & iNSIGHTS
            </button>
            <button
              onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              Pricing (₹499/mo)
            </button>
            <button
              onClick={() => { navigate('/demo'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-1 text-[#CBD5E1]"
            >
              Interactive Demo
            </button>
            <button
              onClick={() => { navigate('/app/overview'); setIsMobileMenuOpen(false); }}
              className="block w-full text-left py-1 text-[#A3E635] font-bold"
            >
              Launch Console
            </button>
          </div>
        )}
      </header>

      <BillingModal isOpen={isBillingOpen} onClose={() => setIsBillingOpen(false)} />
    </>
  );
};
