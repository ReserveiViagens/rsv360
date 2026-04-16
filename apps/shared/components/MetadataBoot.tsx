"use client";

import { useEffect } from 'react';
import { initGoogleConsentMode } from '../lib/tracking/consent-mode';
import { initBrandWatermark } from '../lib/brand-watermark';

export function MetadataBoot() {
  useEffect(() => {
    initGoogleConsentMode();
    initBrandWatermark();
  }, []);

  return null;
}
