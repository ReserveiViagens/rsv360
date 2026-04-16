import { getConsentMode, initGoogleConsentMode } from './consent-mode';
import { trackMetaEvent } from './meta-pixel';
import { trackGoogleAdsConversion } from './google-ads';
import { initTikTokPixel } from './tiktok-pixel';
import { initMetaPixel } from './meta-pixel';

type ConversionData = Record<string, unknown> & {
  googleAdsConversionId?: string;
  googleAdsLabel?: string;
  value?: number;
  metaPixelId?: string;
  tiktokPixelId?: string;
};

export async function trackConversion(eventName: string, data: ConversionData = {}) {
  if (typeof window === 'undefined') {
    return null;
  }

  initGoogleConsentMode();
  const eventId = crypto.randomUUID();
  const marketingAllowed = getConsentMode()?.marketing ?? false;

  if (marketingAllowed && data.metaPixelId) {
    initMetaPixel(data.metaPixelId);
  }
  if (marketingAllowed && data.tiktokPixelId) {
    initTikTokPixel(data.tiktokPixelId);
  }
  if (marketingAllowed && data.googleAdsConversionId && data.googleAdsLabel) {
    trackGoogleAdsConversion(data.googleAdsConversionId, data.googleAdsLabel, data.value || 0);
  }

  if (marketingAllowed) {
    trackMetaEvent(eventName, { ...data, eventID: eventId });
  }

  if (marketingAllowed && window.ttq?.track) {
    window.ttq.track(eventName, { ...data, event_id: eventId });
  }

  if (marketingAllowed) {
    await fetch('/api/tracking/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventId,
        data,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => null);
  }

  return eventId;
}
