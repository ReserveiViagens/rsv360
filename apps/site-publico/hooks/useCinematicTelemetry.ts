'use client';

import { useEffect, useRef } from 'react';
import {
  FLUSH_INTERVAL_MS,
  buildCinematicFlushPayload,
  detectNewScrollMilestones,
  getOrCreateSessionId,
  measureScrollDepthPct,
  nextActiveMs,
  propostaCinematicEventosUrl,
  sendEngagementBeacon,
} from '@/lib/proposta-cinematic-telemetry';

export function useCinematicTelemetry(token: string | null | undefined) {
  const activeMsRef = useRef(0);
  const lastTickRef = useRef<number>(Date.now());
  const isVisibleRef = useRef(true);
  const maxScrollRef = useRef(0);
  const firedMarcosRef = useRef<Set<number>>(new Set());
  const sentMarcosRef = useRef<Set<number>>(new Set());
  const lastFlushedSecondsRef = useRef(0);
  const sessionIdRef = useRef<string>('');

  useEffect(() => {
    if (!token) return;

    sessionIdRef.current = getOrCreateSessionId(token);
    activeMsRef.current = 0;
    lastTickRef.current = Date.now();
    isVisibleRef.current = document.visibilityState === 'visible';
    maxScrollRef.current = 0;
    firedMarcosRef.current = new Set();
    sentMarcosRef.current = new Set();
    lastFlushedSecondsRef.current = 0;

    const accumulateVisibleTime = () => {
      const now = Date.now();
      const next = nextActiveMs(isVisibleRef.current, lastTickRef.current, now, activeMsRef.current);
      activeMsRef.current = next.activeMs;
      lastTickRef.current = next.lastTick;
    };

    const updateScroll = () => {
      const pct = measureScrollDepthPct();
      maxScrollRef.current = Math.max(maxScrollRef.current, pct);
      const newlyFired = detectNewScrollMilestones(pct, firedMarcosRef.current);
      for (const marco of newlyFired) {
        firedMarcosRef.current.add(marco);
      }
    };

    const flush = (force = false) => {
      accumulateVisibleTime();

      const marcosToSend = [...firedMarcosRef.current].filter((m) => !sentMarcosRef.current.has(m));
      const segundos = Math.max(0, Math.round(activeMsRef.current / 1000));
      const hasNewTempo = segundos > lastFlushedSecondsRef.current;

      if (!force && !hasNewTempo && marcosToSend.length === 0) return;

      const payload = buildCinematicFlushPayload({
        sessionId: sessionIdRef.current,
        activeMs: activeMsRef.current,
        maxScrollPct: maxScrollRef.current,
        marcosToSend,
      });

      if (!payload) return;

      sendEngagementBeacon(propostaCinematicEventosUrl(token), payload);

      if (hasNewTempo) {
        lastFlushedSecondsRef.current = segundos;
      }
      for (const marco of marcosToSend) {
        sentMarcosRef.current.add(marco);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        accumulateVisibleTime();
        isVisibleRef.current = false;
        flush(true);
      } else {
        isVisibleRef.current = true;
        lastTickRef.current = Date.now();
      }
    };

    const tickInterval = window.setInterval(() => {
      accumulateVisibleTime();
      updateScroll();
    }, 1000);

    const flushInterval = window.setInterval(() => flush(false), FLUSH_INTERVAL_MS);

    const onPageHide = () => flush(true);
    const onBeforeUnload = () => flush(true);

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      window.clearInterval(tickInterval);
      window.clearInterval(flushInterval);
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('beforeunload', onBeforeUnload);
      flush(true);
    };
  }, [token]);
}
