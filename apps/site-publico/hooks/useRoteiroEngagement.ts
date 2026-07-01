'use client';

import { useEffect, useRef } from 'react';
import {
  buildRoteiroEngagementPayload,
  computeScrollDepthPct,
  sendRoteiroEngagementBeacon,
} from '@/lib/roteiro-engagement';

export function useRoteiroEngagement(token: string) {
  const startedAtRef = useRef<number>(Date.now());
  const maxScrollRef = useRef(0);
  const sentRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    startedAtRef.current = Date.now();
    maxScrollRef.current = 0;
    sentRef.current = false;

    const updateScroll = () => {
      const pct = computeScrollDepthPct(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      maxScrollRef.current = Math.max(maxScrollRef.current, pct);
    };

    const flush = () => {
      if (sentRef.current) return;
      sentRef.current = true;

      const payload = buildRoteiroEngagementPayload(
        Date.now() - startedAtRef.current,
        maxScrollRef.current,
      );
      sendRoteiroEngagementBeacon(token, payload);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);

    return () => {
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [token]);
}
