import { getConsentMode } from './consent-mode';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

function marketingAllowed() {
  return getConsentMode()?.marketing ?? false;
}

export function initMetaPixel(pixelId: string) {
  if (typeof window === 'undefined' || !marketingAllowed()) {
    return false;
  }

  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    return true;
  }

  return false;
}

export function trackMetaEvent(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !marketingAllowed() || !window.fbq) {
    return false;
  }

  window.fbq('track', event, params);
  return true;
}
