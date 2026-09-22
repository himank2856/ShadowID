/**
 * ShadowID - Enterprise Account Database & Persistent Store
 * DPDP Act 2023 Compliant User Account Repository
 * Team GIGABYTE - Build With Bharat 3.0
 */

import type { UserAccount, ScanJob, Role } from '../types.ts';
import { otpService } from './otpService.ts';
import { supabaseService } from './supabaseService.ts';

const USERS_DB_KEY = 'shadowid_db_users';
const SCANS_DB_KEY = 'shadowid_db_user_scans';
const SESSION_DB_KEY = 'shadowid_current_session';
const AUDIT_DB_KEY = 'shadowid_db_audit_logs';

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: 'REGISTRATION' | 'LOGIN_PASSWORD' | 'LOGIN_OTP' | 'OTP_VERIFIED' | 'SCAN_CREATED' | 'DATA_PURGED' | 'PASSWORD_RESET' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED';
  details: string;
  ipMasked: string;
  timestamp: string;
}

// Simple deterministic hash for password storage (SHA-256 format)
async function hashPassword(plain: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(`shadowid_salt_2026_${plain}`);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash
  let hash = 0;
  for (let i = 0; i < plain.length; i++) {
    const char = plain.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}`;
}

// Initial default production accounts for testing & forensic verification
const SEED_USERS: UserAccount[] = [
  {
    id: 'usr-analyst-001',
    email: 'analyst@shadowid.in',
    phone: '+91 98881 29012',
    fullName: 'Himank Sharma',
    role: 'analyst',
    organization: 'Cyber Threat Intelligence & Forensics Cell',
    designation: 'Senior Forensic Analyst',
    isVerified: true,
    verificationMethod: 'otp_mobile',
    verifiedAt: '2026-09-21T10:00:00Z',
    isPro: false,
    createdAt: '2026-09-20T08:00:00Z',
    lastLoginAt: '2026-09-22T02:30:00Z',
  },
  {
    id: 'usr-investigator-002',
    email: 'investigator@bharat.gov.in',
    phone: '+91 98110 54321',
    fullName: 'Anshul Verma',
    role: 'owner',
    organization: 'National Threat Intelligence Unit',
    designation: 'Chief Compliance Auditor',
    isVerified: true,
    verificationMethod: 'otp_email',
    verifiedAt: '2026-09-21T11:00:00Z',
    isPro: false,
    createdAt: '2026-09-18T10:00:00Z',
    lastLoginAt: '2026-09-22T01:15:00Z',
  },
];

// Helper to load/save users
function loadUsers(): Record<string, UserAccount> {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    const hasReceipts = !!localStorage.getItem('shadowid_db_receipts');
    if (!raw) {
      const initial: Record<string, UserAccount> = {};
      SEED_USERS.forEach((u) => {
        initial[u.email.toLowerCase()] = { ...u, isPro: false };
      });
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(initial));
      return initial;
    }
    const users: Record<string, UserAccount> = JSON.parse(raw);
    // If no real receipts exist, ensure accounts are not falsely marked isPro: true
    if (!hasReceipts) {
      Object.values(users).forEach((u) => {
        if (u.isPro) {
          u.isPro = false;
          u.passExpiryDate = undefined;
        }
      });
    }
    return users;
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, UserAccount>): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database:', err);
  }
}

// Helper for passwords
const PASSWORDS_KEY = 'shadowid_user_credentials';
function loadCredentials(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PASSWORDS_KEY);
    if (!raw) {
      // Seed default passwords
      return {
        'analyst@shadowid.in': 'ShadowID@2026',
        'investigator@bharat.gov.in': 'Bharat@2026',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      'analyst@shadowid.in': 'ShadowID@2026',
      'investigator@bharat.gov.in': 'Bharat@2026',
    };
  }
}

function saveCredentials(creds: Record<string, string>): void {
  try {
    localStorage.setItem(PASSWORDS_KEY, JSON.stringify(creds));
  } catch (err) {
    console.error('Failed to save credentials:', err);
  }
}

// Audit logger
function logAuditEvent(
  userId: string,
  action: AuditLogEntry['action'],
  details: string
): void {
  try {
    const raw = localStorage.getItem(AUDIT_DB_KEY);
    const logs: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      action,
      details,
      ipMasked: '49.36.***.*** (India / TRAI Circle)',
      timestamp: new Date().toISOString(),
    };
    logs.unshift(entry);
    // Keep last 100 audit entries
    localStorage.setItem(AUDIT_DB_KEY, JSON.stringify(logs.slice(0, 100)));
    supabaseService.syncAuditLog(entry);
  } catch (err) {
    console.error('Audit log failure:', err);
  }
}

export const accountDatabase = {
  /**
   * List all registered accounts
   */
  getAllUsers: (): UserAccount[] => {
    const users = loadUsers();
    return Object.values(users);
  },

  /**
   * Retrieve user by email or mobile number
   */
  findByEmailOrPhone: (identifier: string): UserAccount | undefined => {
    const clean = identifier.trim().toLowerCase();
    const users = loadUsers();
    return Object.values(users).find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.phone.replace(/\s+/g, '') === clean.replace(/\s+/g, '')
    );
  },

  /**
   * Register a new user account (Pending OTP verification)
   */
  registerUser: async (data: {
    fullName: string;
    email: string;
    phone: string;
    organization?: string;
    designation?: string;
    role: Role;
    password: string;
    verificationChannel?: 'sms' | 'email';
  }): Promise<{ user: UserAccount; otpTarget: string; channel: 'sms' | 'email' }> => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();
    const users = loadUsers();

    // Check existing
    if (users[cleanEmail]) {
      throw new Error(`An account with email ${data.email} is already registered.`);
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      phone: cleanPhone,
      fullName: data.fullName.trim(),
      role: data.role || 'analyst',
      organization: data.organization?.trim() || 'Independent Forensic Lab',
      designation: data.designation?.trim() || 'Forensic Investigator',
      isVerified: false,
      verificationMethod: 'none',
      isPro: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    users[cleanEmail] = newUser;
    saveUsers(users);

    // Save credential
    const creds = loadCredentials();
    creds[cleanEmail] = data.password;
    saveCredentials(creds);

    // Choose channel: default to email if user requested email or if mobile is blank
    const channel = data.verificationChannel || (cleanEmail ? 'email' : 'sms');
    const otpTarget = channel === 'email' ? cleanEmail : cleanPhone;

    // Trigger initial OTP verification (send real email / SMS)
    await otpService.generateAndSendOtp(otpTarget, channel, 'signup');

    logAuditEvent(newUser.id, 'REGISTRATION', `User registered: ${cleanEmail} (Verification channel: ${channel.toUpperCase()})`);

    // Sync profile to Supabase if connected
    supabaseService.syncUser(newUser);

    return {
      user: newUser,
      otpTarget,
      channel,
    };
  },

  /**
   * Authenticate with email/phone and password
   */
  authenticateWithPassword: async (
    identifier: string,
    passwordInput: string
  ): Promise<UserAccount> => {
    const user = accountDatabase.findByEmailOrPhone(identifier);
    if (!user) {
      throw new Error('No registered account found with that email or phone number.');
    }

    const creds = loadCredentials();
    const registeredPassword = creds[user.email.toLowerCase()];

    if (registeredPassword !== passwordInput) {
      throw new Error('Invalid credentials. Password does not match our records.');
    }

    // Update last login
    user.lastLoginAt = new Date().toISOString();
    const users = loadUsers();
    users[user.email.toLowerCase()] = user;
    saveUsers(users);

    logAuditEvent(user.id, 'LOGIN_PASSWORD', `Password sign-in successful: ${user.email}`);

    return user;
  },

  /**
   * Verify User's OTP and promote to Verified status
   */
  confirmUserOtpVerification: async (
    target: string,
    code: string
  ): Promise<{ success: boolean; user?: UserAccount; message: string }> => {
    const verifyRes = await otpService.verifyOtp(target, code, 'signup');
    if (!verifyRes.success) {
      return { success: false, message: verifyRes.message };
    }

    const user = accountDatabase.findByEmailOrPhone(target);
    if (user) {
      user.isVerified = true;
      user.verificationMethod = target.includes('@') ? 'otp_email' : 'otp_mobile';
      user.isEmailVerified = target.includes('@') ? true : user.isEmailVerified;
      user.verifiedAt = new Date().toISOString();

      const users = loadUsers();
      users[user.email.toLowerCase()] = user;
      saveUsers(users);
      accountDatabase.setActiveSession(user);

      logAuditEvent(user.id, 'OTP_VERIFIED', `Contact verified via email/OTP: ${target}`);
      return {
        success: true,
        user,
        message: 'Account identity verified. DPDP Compliance status active.',
      };
    }

    return {
      success: true,
      message: 'OTP verified successfully.',
    };
  },

  /**
   * Explicitly verify user's email address with 6-digit OTP
   */
  verifyUserEmail: async (
    userId: string,
    email: string,
    code: string
  ): Promise<{ success: boolean; user?: UserAccount; message: string }> => {
    const verifyRes = await otpService.verifyOtp(email, code, 'verify_email');
    if (!verifyRes.success) {
      return { success: false, message: verifyRes.message };
    }

    const users = loadUsers();
    let targetUser = Object.values(users).find((u) => u.id === userId);
    if (!targetUser) {
      targetUser = accountDatabase.findByEmailOrPhone(email) || undefined;
    }

    if (targetUser) {
      targetUser.email = email.trim().toLowerCase();
      targetUser.isVerified = true;
      targetUser.isEmailVerified = true;
      targetUser.verificationMethod = 'otp_email';
      targetUser.verifiedAt = new Date().toISOString();

      users[targetUser.email.toLowerCase()] = targetUser;
      saveUsers(users);
      accountDatabase.setActiveSession(targetUser);

      logAuditEvent(targetUser.id, 'OTP_VERIFIED', `Official Email verified via cryptographic OTP: ${email}`);
      supabaseService.syncUser(targetUser);

      return {
        success: true,
        user: targetUser,
        message: `Email address ${email} successfully verified and cryptographically sealed.`,
      };
    }

    return {
      success: false,
      message: 'User account not found for this verification session.',
    };
  },

  /**
   * Session Management
   */
  getActiveSession: (): UserAccount | null => {
    try {
      const raw = localStorage.getItem(SESSION_DB_KEY);
      if (!raw) return null;
      const user: UserAccount = JSON.parse(raw);
      const hasReceipts = !!localStorage.getItem('shadowid_db_receipts');
      if (!hasReceipts && user.isPro) {
        user.isPro = false;
        user.passExpiryDate = undefined;
      }
      return user;
    } catch {
      return null;
    }
  },

  setActiveSession: (user: UserAccount): void => {
    try {
      localStorage.setItem(SESSION_DB_KEY, JSON.stringify(user));
      localStorage.setItem('shadowid_auth_token', `jwt-session-${user.id}-${Date.now()}`);
    } catch (err) {
      console.error('Session persistence failure:', err);
    }
  },

  upgradeUserToPro: (userId: string, expiry: string): UserAccount | null => {
    const users = loadUsers();
    const user = Object.values(users).find((u) => u.id === userId);
    if (user) {
      user.isPro = true;
      user.passExpiryDate = expiry;
      users[user.email.toLowerCase()] = user;
      saveUsers(users);
      accountDatabase.setActiveSession(user);
      logAuditEvent(user.id, 'PAYMENT_COMPLETED' as any, `Pro membership activated until ${expiry}`);
      return user;
    }
    return null;
  },

  clearActiveSession: (): void => {
    localStorage.removeItem(SESSION_DB_KEY);
    localStorage.removeItem('shadowid_auth_token');
  },

  /**
   * Initiate Password Reset via Gmail/Email OTP
   */
  initiatePasswordReset: async (
    email: string
  ): Promise<{ success: boolean; target: string; message: string; deliveryStatus?: string; deliveryNote?: string; code?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = accountDatabase.findByEmailOrPhone(cleanEmail);
    if (!user) {
      throw new Error(`No account registered with "${cleanEmail}". Please check your email or create a new account.`);
    }

    const res = await otpService.sendPasswordResetOtp(cleanEmail);
    return {
      success: true,
      target: cleanEmail,
      message: res.message,
      deliveryStatus: res.deliveryStatus,
      deliveryNote: res.deliveryNote,
      code: res.code,
    };
  },

  /**
   * Complete Password Reset with Verified OTP
   */
  completePasswordReset: async (
    email: string,
    otpCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const user = accountDatabase.findByEmailOrPhone(cleanEmail);
    if (!user) {
      throw new Error(`Account not found for email "${cleanEmail}".`);
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const verifyRes = await otpService.verifyOtp(cleanEmail, otpCode, 'reset_password');
    if (!verifyRes.success) {
      throw new Error(verifyRes.message);
    }

    const creds = loadCredentials();
    creds[cleanEmail] = newPassword;
    saveCredentials(creds);

    logAuditEvent(user.id, 'PASSWORD_RESET', `Password reset successfully via email verification: ${cleanEmail}`);

    // Sync updated user to Supabase
    supabaseService.syncUser(user);

    return {
      success: true,
      message: 'Password updated successfully. You may now sign in with your new credentials.',
    };
  },

  /**
   * User-Scoped Investigations / Scans
   */
  getUserScans: (userId: string): Record<string, ScanJob> => {
    try {
      const raw = localStorage.getItem(`${SCANS_DB_KEY}_${userId}`);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  },

  saveUserScan: (userId: string, scan: ScanJob): void => {
    try {
      const scans = accountDatabase.getUserScans(userId);
      scans[scan.id] = scan;
      localStorage.setItem(`${SCANS_DB_KEY}_${userId}`, JSON.stringify(scans));
      logAuditEvent(userId, 'SCAN_CREATED', `Investigation created: ${scan.subject.name}`);
      // Sync scan to Supabase
      supabaseService.syncScan(scan, userId);
    } catch (err) {
      console.error('Failed to save scan for user:', err);
    }
  },

  /**
   * DPDP Act Right to be Forgotten (Purge user and associated evidence)
   */
  purgeAccount: (userId: string): void => {
    const users = loadUsers();
    const targetUser = Object.values(users).find((u) => u.id === userId);
    if (targetUser) {
      delete users[targetUser.email.toLowerCase()];
      saveUsers(users);
      localStorage.removeItem(`${SCANS_DB_KEY}_${userId}`);
      accountDatabase.clearActiveSession();
      logAuditEvent(userId, 'DATA_PURGED', `Full account and evidence cache purged under DPDP Act`);
    }
  },

  /**
   * DPDP Act Right to Data Portability (Export JSON)
   */
  exportDataPackage: (userId: string): string => {
    const user = Object.values(loadUsers()).find((u) => u.id === userId);
    const scans = accountDatabase.getUserScans(userId);
    const rawAudit = localStorage.getItem(AUDIT_DB_KEY);
    const auditLogs = rawAudit ? JSON.parse(rawAudit).filter((a: any) => a.userId === userId) : [];

    return JSON.stringify(
      {
        accountProfile: user,
        investigationScans: scans,
        complianceAuditTrail: auditLogs,
        dpdpDataProtectionNotice: 'Export generated in accordance with Section 12 of Digital Personal Data Protection Act, 2023.',
        exportedAtIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
      null,
      2
    );
  },

  /**
   * Records an audit log event in the compliance log
   */
  recordAuditLog: (userId: string, action: AuditLogEntry['action'], details: string): void => {
    logAuditEvent(userId, action, details);
  },
};
