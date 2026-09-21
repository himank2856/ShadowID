/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ShadowID - Formatters & Localization (India First)
 */

export function formatINR(amountInRupees: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amountInRupees);
}

export function paiseToINR(paise: number): string {
  return formatINR(paise / 100);
}

export function formatISTDateTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return isoDateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(date) + ' IST';
  } catch {
    return isoDateString;
  }
}

export function maskPhone(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length <= 5) return cleaned;
  return cleaned.substring(0, 8) + ' •••••';
}

export function maskEmail(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const user = parts[0];
  const domain = parts[1];
  const visible = user.substring(0, Math.min(3, user.length));
  return `${visible}•••••@${domain}`;
}

export function maskGovId(idNumber: string, type: 'Aadhaar' | 'PAN' | 'Passport' | 'Generic ID'): string {
  if (type === 'Aadhaar') {
    const digits = idNumber.replace(/\D/g, '');
    if (digits.length >= 4) {
      return `•••• •••• ${digits.slice(-4)}`;
    }
    return '•••• •••• ••••';
  }
  if (type === 'PAN') {
    const pan = idNumber.trim().toUpperCase();
    if (pan.length === 10) {
      return `${pan.slice(0, 5)}••••${pan.slice(-1)}`;
    }
    return 'ABCDE••••F';
  }
  return idNumber.replace(/.(?=.{4})/g, '•');
}

/**
 * Core bilingual localization dictionary (English & Hindi)
 */
export const TRANSLATIONS = {
  en: {
    appTitle: 'ShadowID',
    tagline: 'What You Share Is More Than What You See.',
    heroHeadline: 'See what your digital identity reveals.',
    heroSub: 'Understand public exposure, compare suspicious profiles and review document anomalies in one evidence-led workspace.',
    exploreDemo: 'Explore synthetic demo',
    startAssessment: 'Start your assessment',
    navOverview: 'Overview',
    navNewScan: 'New Scan',
    navExposure: 'Exposure Intelligence',
    navImpersonation: 'Impersonation Intelligence',
    navDocuments: 'Document Defense',
    navResearch: 'iNSIGHTS Bridge',
    navReports: 'Reports & Export',
    navActions: 'Action Checklist',
    navSettings: 'Settings & Integrations',
    proPlan: 'Pro Plan ₹499/mo',
    testModeBadge: 'Razorpay Test Mode (30-day pass)',
    syntheticNotice: 'SYNTHETIC EVIDENCE SESSION — NO REAL DATA ACCESSED',
    roleOwner: 'Owner',
    roleAnalyst: 'Analyst',
    roleViewer: 'Viewer',
    scoreHeading: 'Shadow Score',
    coverageLabel: 'Assessment Coverage',
    provisionalBadge: 'Provisional Score',
    riskLower: 'Lower Observed Risk',
    riskModerate: 'Moderate Risk',
    riskElevated: 'Elevated Risk',
    riskHigh: 'High Exposure Risk',
  },
  hi: {
    appTitle: 'शैडो आईडी (ShadowID)',
    tagline: 'जो आप साझा करते हैं, वह उससे अधिक है जो आप देखते हैं।',
    heroHeadline: 'देखें कि आपकी डिजिटल पहचान क्या उजागर करती है।',
    heroSub: 'एक साक्ष्य-आधारित कार्यक्षेत्र में सार्वजनिक जोखिम समझें, संदिग्ध प्रोफाइल की तुलना करें और दस्तावेज़ विसंगतियों की समीक्षा करें।',
    exploreDemo: 'डेमो देखें',
    startAssessment: 'मूल्यांकन शुरू करें',
    navOverview: 'सिंहावलोकन',
    navNewScan: 'नया स्कैन',
    navExposure: 'एक्सपोजर इंटेलिजेंस',
    navImpersonation: 'पहचान चोरी (Impersonation)',
    navDocuments: 'दस्तावेज़ सुरक्षा (Document Defense)',
    navResearch: 'iNSIGHTS अनुसंधान',
    navReports: 'रिपोर्ट और निर्यात',
    navActions: 'सुधार कार्यसूची',
    navSettings: 'सेटिंग्स और एकीकरण',
    proPlan: 'प्रो प्लान ₹499/माह',
    testModeBadge: 'रेज़रपे टेस्ट मोड (30 दिन का पास)',
    syntheticNotice: 'सिंथेटिक साक्ष्य सत्र — कोई वास्तविक डेटा प्रयुक्त नहीं',
    roleOwner: 'स्वामी (Owner)',
    roleAnalyst: 'विश्लेषक (Analyst)',
    roleViewer: 'दर्शक (Viewer)',
    scoreHeading: 'शैडो स्कोर',
    coverageLabel: 'मूल्यांकन कवरेज',
    provisionalBadge: 'अनंतिम स्कोर (Provisional)',
    riskLower: 'कम प्रेक्षित जोखिम',
    riskModerate: 'मध्यम जोखिम',
    riskElevated: 'बढ़ा हुआ जोखिम',
    riskHigh: 'उच्च जोखिम',
  },
};
