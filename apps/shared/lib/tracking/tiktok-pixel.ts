import { getConsentMode } from './consent-mode';

declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>) => void;
      page: () => void;
      identify?: (id: string) => void;
      load?: (pixelId: string) => void;
    };
  }
}

function marketingAllowed() {
  return getConsentMode()?.marketing ?? false;
}

export function initTikTokPixel(pixelId: string) {
  if (typeof window === 'undefined' || !marketingAllowed()) {
    return false;
  }

  if (window.ttq?.load) {
    window.ttq.load(pixelId);
    window.ttq.page();
    return true;
  }

  return false;
}
