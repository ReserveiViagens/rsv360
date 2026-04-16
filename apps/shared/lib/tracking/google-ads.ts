import { getConsentMode } from './consent-mode';

export function trackGoogleAdsConversion(conversionId: string, conversionLabel: string, value = 0) {
  if (
    typeof window === 'undefined' ||
    !getConsentMode()?.marketing ||
    !(window as typeof window & { gtag?: (...args: unknown[]) => void }).gtag
  ) {
    return false;
  }

  (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag('event', 'conversion', {
    send_to: `${conversionId}/${conversionLabel}`,
    value,
    currency: 'BRL',
  });

  return true;
}
