/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - App State Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScanJob, Role, Language, Theme, ActionItem, UserAccount, PaymentReceipt } from '../types.ts';
import { SYNTHETIC_CASES, calculateShadowScore } from '../data/syntheticDatasets.ts';
import { TRANSLATIONS } from '../utils/formatters.ts';
import { accountDatabase } from '../services/accountDatabase.ts';
import { paymentProtocolService } from '../services/paymentProtocolService.ts';

interface AppContextType {
  currentRoute: string;
  navigate: (route: string) => void;
  user: UserAccount | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup';
  openAuthModal: (tab?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  login: (user: UserAccount) => void;
  logout: () => void;
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  scans: Record<string, ScanJob>;
  activeScanId: string;
  setActiveScanId: (id: string) => void;
  activeScan: ScanJob | null;
  importVerificationBenchmark: (benchmarkJob: ScanJob) => void;
  updateActionStatus: (actionId: string, status: 'pending' | 'in-progress' | 'resolved') => void;
  updateClaimStatus: (claimId: string, status: 'accepted' | 'rejected') => void;
  updateDocumentReview: (isVerified: boolean, notes: string) => void;
  updateProfileDecision: (decision: 'dismiss' | 'flag_for_takedown' | 'monitor') => void;
  addNewScan: (newScan: ScanJob) => void;
  billing: {
    isPro: boolean;
    passExpiryDate?: string;
    upgradeToPro: (receipt?: PaymentReceipt) => void;
    latestReceipt: PaymentReceipt | null;
  };
  t: typeof TRANSLATIONS['en'];
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<string>('/app/overview');
  const [user, setUser] = useState<UserAccount | null>(() => accountDatabase.getActiveSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<Role>(() => user?.role || 'analyst');
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('dark');
  const [scans, setScans] = useState<Record<string, ScanJob>>(() => {
    if (user) {
      return accountDatabase.getUserScans(user.id);
    }
    return {};
  });
  const [activeScanId, setActiveScanId] = useState<string>(() => {
    if (user) {
      const userScans = accountDatabase.getUserScans(user.id);
      const keys = Object.keys(userScans);
      return keys.length > 0 ? keys[0] : '';
    }
    return '';
  });
  const [isPro, setIsPro] = useState<boolean>(() => user?.isPro || false);
  const [latestReceipt, setLatestReceipt] = useState<PaymentReceipt | null>(() => paymentProtocolService.getReceipts()[0] || null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openAuthModal = (tab: 'signin' | 'signup' = 'signin') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = (authenticatedUser: UserAccount) => {
    setUser(authenticatedUser);
    setRole(authenticatedUser.role);
    setIsPro(authenticatedUser.isPro);
    accountDatabase.setActiveSession(authenticatedUser);

    // Load scans for this user only
    const userScans = accountDatabase.getUserScans(authenticatedUser.id);
    setScans(userScans);
    const keys = Object.keys(userScans);
    setActiveScanId(keys.length > 0 ? keys[0] : '');
  };

  const logout = () => {
    accountDatabase.clearActiveSession();
    setUser(null);
    setRole('analyst');
    setIsPro(false);
    setScans({});
    setActiveScanId('');
    showToast('Signed out of forensic workspace.');
    navigate('/');
  };

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

  const activeScan: ScanJob | null = (activeScanId && scans[activeScanId]) ? scans[activeScanId] : (Object.values(scans)[0] ?? null);

  const importVerificationBenchmark = (benchmarkJob: ScanJob) => {
    setScans((prev) => ({
      [benchmarkJob.id]: benchmarkJob,
      ...prev,
    }));
    setActiveScanId(benchmarkJob.id);
    if (user) {
      accountDatabase.saveUserScan(user.id, benchmarkJob);
    }
    showToast(`Benchmark dataset imported into active workspace.`);
    navigate('/app/overview');
  };

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
    const scanWithKey = { ...newScan, id: key };
    setScans((prev) => ({
      [key]: scanWithKey,
      ...prev,
    }));
    setActiveScanId(key);
    if (user) {
      accountDatabase.saveUserScan(user.id, scanWithKey);
    }
    navigate('/app/overview');
    showToast('New assessment scan queued and initialized.');
  };

  const upgradeToPro = (receipt?: PaymentReceipt) => {
    setIsPro(true);
    if (receipt) {
      setLatestReceipt(receipt);
    }
    const expiry = receipt?.validUntilIST || '21 Oct 2026, 23:59 IST';
    if (user) {
      user.isPro = true;
      user.passExpiryDate = expiry;
      accountDatabase.setActiveSession(user);
    }
    const planTitle = receipt?.planName || 'Pro 30-Day Pass';
    showToast(`Payment Confirmed! ${planTitle} active until ${expiry}. Tax Invoice generated.`);
  };

  const t = TRANSLATIONS[language];

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        navigate,
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
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
        importVerificationBenchmark,
        updateActionStatus,
        updateClaimStatus,
        updateDocumentReview,
        updateProfileDecision,
        addNewScan,
        billing: {
          isPro,
          passExpiryDate: isPro ? (user?.passExpiryDate || '21 Oct 2026, 23:59 IST') : undefined,
          upgradeToPro,
          latestReceipt,
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
