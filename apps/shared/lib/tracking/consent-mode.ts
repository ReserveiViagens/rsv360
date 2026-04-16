export type ConsentSnapshot = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __rsv360ConsentInitialized?: boolean;
  }
}

const STORAGE_KEY = 'rsv360-cookie-consent';

function getStoredConsent(): ConsentSnapshot | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ConsentSnapshot;
  } catch {
    return null;
  }
}

function applyConsent(next: ConsentSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagProxy(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('consent', 'update', {
    analytics_storage: next.analytics ? 'granted' : 'denied',
    ad_storage: next.marketing ? 'granted' : 'denied',
    ad_user_data: next.marketing ? 'granted' : 'denied',
    ad_personalization: next.marketing ? 'granted' : 'denied',
    functionality_storage: next.preferences ? 'granted' : 'denied',
    personalization_storage: next.preferences ? 'granted' : 'denied',
  });
}

export function initGoogleConsentMode() {
  if (typeof window === 'undefined' || window.__rsv360ConsentInitialized) {
    return;
  }

  window.__rsv360ConsentInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagProxy(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    wait_for_update: 500,
  });

  const stored = getStoredConsent();
  if (stored) {
    applyConsent(stored);
  }
}

export function saveConsentMode(next: ConsentSnapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      ...next,
      savedAt: new Date().toISOString(),
    }),
  );
  applyConsent(next);
}

export function getConsentMode(): ConsentSnapshot | null {
  return getStoredConsent();
}
