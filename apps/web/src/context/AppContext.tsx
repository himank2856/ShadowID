/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - App State Context
 */

import React, { createContext, useContext, useState } from 'react';
import { ScanJob, Role, Language, Theme, ActionItem } from '../types.ts';
import { SYNTHETIC_CASES, calculateShadowScore } from '../data/syntheticDatasets.ts';
import { TRANSLATIONS } from '../utils/formatters.ts';

interface AppContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  scans: Record<string, ScanJob>;
  activeScanId: string;
  setActiveScanId: (id: string) => void;
  activeScan: ScanJob;
  updateActionStatus: (actionId: string, status: 'pending' | 'in-progress' | 'resolved') => void;
  updateClaimStatus: (claimId: string, status: 'accepted' | 'rejected') => void;
  updateDocumentReview: (isVerified: boolean, notes: string) => void;
  updateProfileDecision: (decision: 'dismiss' | 'flag_for_takedown' | 'monitor') => void;
  addNewScan: (newScan: ScanJob) => void;
  billing: {
    isPro: boolean;
    passExpiryDate?: string;
    upgradeToPro: () => void;
  };
  t: typeof TRANSLATIONS['en'];
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('/app/overview');
  const [role, setRole] = useState<Role>('analyst');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [scans, setScans] = useState<Record<string, ScanJob>>(SYNTHETIC_CASES);
  const [activeScanId, setActiveScanId] = useState<string>('arun_s');
  const [isPro, setIsPro] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const navigate = (route: string) => {
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const activeScan: ScanJob = scans[activeScanId] || scans.arun_s;

  const updateActionStatus = (actionId: string, status: 'pending' | 'in-progress' | 'resolved') => {
    setScans((prev) => {
      const current = prev[activeScanId];
      if (!current) return prev;
      const updatedActions = current.actions.map((act) =>
        act.id === actionId ? { ...act, status, updatedAt: new Date().toISOString() } : act
      );
      showToast(`Action updated: marked as ${status.replace('-', ' ')}.`);
      return {
        ...prev,
        [activeScanId]: {
          ...current,
          actions: updatedActions,
        },
      };
    });
  };

  const updateClaimStatus = (claimId: string, status: 'accepted' | 'rejected') => {
    setScans((prev) => {
      const current = prev[activeScanId];
      if (!current || !current.researchClaims) return prev;
      const updatedClaims = current.researchClaims.map((clm) =>
        clm.id === claimId ? { ...clm, reviewerStatus: status } : clm
      );
      showToast(`Research claim marked as ${status}.`);
      return {
        ...prev,
        [activeScanId]: {
          ...current,
          researchClaims: updatedClaims,
        },
      };
    });
  };

  const updateDocumentReview = (isVerified: boolean, notes: string) => {
    setScans((prev) => {
      const current = prev[activeScanId];
      if (!current || !current.documentAnalysis) return prev;
      showToast('Document review notes and analyst verification updated.');
      return {
        ...prev,
        [activeScanId]: {
          ...current,
          documentAnalysis: {
            ...current.documentAnalysis,
            isHumanVerified: isVerified,
            humanReviewNotes: notes,
          },
        },
      };
    });
  };

  const updateProfileDecision = (decision: 'dismiss' | 'flag_for_takedown' | 'monitor') => {
    setScans((prev) => {
      const current = prev[activeScanId];
      if (!current || !current.profileComparison) return prev;
      showToast(`Profile comparison recorded: ${decision.replace(/_/g, ' ')}.`);
      return {
        ...prev,
        [activeScanId]: {
          ...current,
          profileComparison: {
            ...current.profileComparison,
            reviewerDecision: decision,
          },
        },
      };
    });
  };

  const addNewScan = (newScan: ScanJob) => {
    const key = `scan_${Date.now()}`;
    setScans((prev) => ({
      [key]: newScan,
      ...prev,
    }));
    setActiveScanId(key);
    navigate('/app/scans/new');
    showToast('New assessment scan queued and initialized.');
  };

  const upgradeToPro = () => {
    setIsPro(true);
    showToast('Razorpay Test Mode: ₹499 (49900 paise) authorized. 30-Day Pro Pass active!');
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigate,
        role,
        setRole,
        language,
        setLanguage,
        theme,
        toggleTheme,
        scans,
        activeScanId,
        setActiveScanId,
        activeScan,
        updateActionStatus,
        updateClaimStatus,
        updateDocumentReview,
        updateProfileDecision,
        addNewScan,
        billing: {
          isPro,
          passExpiryDate: isPro ? '21 Oct 2026, 23:59 IST' : undefined,
          upgradeToPro,
        },
        t,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
