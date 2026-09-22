/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Master Application Shell
 * Team GIGABYTE: Anshul, Tanishq, and Himank
 * Build With Bharat 3.0, Chitkara University, Himachal Pradesh
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { AppSidebar } from './components/AppSidebar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { HowItWorksPage } from './pages/HowItWorksPage.tsx';
import { PricingPage } from './pages/PricingPage.tsx';
import { PrivacyTermsPage } from './pages/PrivacyTermsPage.tsx';
import { VerificationPage } from './pages/app/VerificationPage.tsx';
import { OverviewPage } from './pages/app/OverviewPage.tsx';
import { NewScanWizard } from './components/NewScanWizard.tsx';
import { ExposurePage } from './pages/app/ExposurePage.tsx';
import { ImpersonationPage } from './pages/app/ImpersonationPage.tsx';
import { DocumentsPage } from './pages/app/DocumentsPage.tsx';
import { ResearchPage } from './pages/app/ResearchPage.tsx';
import { ActionsPage } from './pages/app/ActionsPage.tsx';
import { ReportsPage } from './pages/app/ReportsPage.tsx';
import { SettingsPage } from './pages/app/SettingsPage.tsx';
import { Shield, ExternalLink, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute, navigate, toastMessage, theme, isAuthenticated, openAuthModal } = useApp();

  const isAppRoute = currentRoute.startsWith('/app');

  const renderRoute = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/how-it-works':
        return <HowItWorksPage />;
      case '/pricing':
        return <PricingPage />;
      case '/privacy':
      case '/terms':
        return <PrivacyTermsPage />;
      case '/demo':
      case '/verification':
      case '/app/verification':
        return <VerificationPage />;
      case '/app/overview':
        return <OverviewPage />;
      case '/app/scans/new':
        return <NewScanWizard />;
      case '/app/exposure':
        return <ExposurePage />;
      case '/app/impersonation':
        return <ImpersonationPage />;
      case '/app/documents':
        return <DocumentsPage />;
      case '/app/research':
        return <ResearchPage />;
      case '/app/actions':
        return <ActionsPage />;
      case '/app/reports':
        return <ReportsPage />;
      case '/app/settings':
      case '/app/settings/integrations':
      case '/app/settings/billing':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-[#07111F] text-[#F1F5F9]' : 'bg-[#F8FAFC] text-[#0F172A]'}`}>
      <Navbar />

      {/* Main Content Body */}
      {isAppRoute ? (
        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
          <AppSidebar />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {renderRoute()}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {renderRoute()}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-[#050D17] border-t border-[#1E3A5F] py-6 px-4 text-xs text-[#64748B] print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#172A42] border border-[#38BDF8] flex items-center justify-center text-[#A3E635]">
              <Shield className="w-3 h-3" />
            </div>
            <span>
              <strong className="text-[#F1F5F9] font-normal">ShadowID</strong> — Build With Bharat 3.0 (Chitkara University, HP)
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono-code text-[#94A3B8]">
            <button onClick={() => navigate('/privacy')} className="hover:text-[#F1F5F9]">
              DPDP Privacy & Terms
            </button>
            <span>•</span>
            <button onClick={() => navigate('/how-it-works')} className="hover:text-[#F1F5F9]">
              Forensic Architecture
            </button>
            <span>•</span>
            <a
              href="https://insights-ai.info/DeepSearch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#38BDF8] flex items-center gap-1"
            >
              iNSIGHTS Deep Search <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          <div className="text-[11px]">
            Team GIGABYTE: <span className="text-[#CBD5E1]">Anshul, Tanishq & Himank</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#0F1D2E] border-2 border-[#38BDF8] text-[#F1F5F9] px-4 py-2.5 rounded shadow-2xl text-xs font-mono-code flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
