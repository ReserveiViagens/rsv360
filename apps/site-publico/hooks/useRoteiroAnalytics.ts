'use client';

import { useEffect, useRef } from 'react';
import { computeScrollDepthPct } from '@/lib/roteiro-engagement';
import { nextScrollDepthMilestone } from '@/lib/analytics/roteiro-analytics';
import {
  flushRoteiroAnalytics,
  initRoteiroAnalyticsQueue,
  shutdownRoteiroAnalyticsQueue,
  trackRoteiroAnalyticsEvent,
} from '@/lib/analytics/roteiro-analytics-client';

const SECTIONS: Array<{ id: string; section: 'hero' | 'timeline' | 'carteira' | 'lazer' }> = [
  { id: 'hero', section: 'hero' },
  { id: 'timeline', section: 'timeline' },
  { id: 'wallet', section: 'carteira' },
  { id: 'lazer', section: 'lazer' },
];

export function useRoteiroAnalytics(token: string) {
  const scrollMaxRef = useRef(0);
  const sectionEnteredAtRef = useRef<Map<string, number>>(new Map());
  const sectionSeenRef = useRef<Set<string>>(new Set());
  const heroSentRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    initRoteiroAnalyticsQueue(token);

    if (!heroSentRef.current) {
      heroSentRef.current = true;
      trackRoteiroAnalyticsEvent({ event_type: 'hero_view', section: 'hero' });
    }

    const observers: IntersectionObserver[] = [];

    for (const { id, section } of SECTIONS) {
      const el = document.getElementById(id);
      if (!el) continue;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          if (entry.isIntersecting) {
            if (!sectionSeenRef.current.has(section)) {
              sectionSeenRef.current.add(section);
              trackRoteiroAnalyticsEvent({ event_type: 'section_view', section });
              if (section === 'lazer') {
                trackRoteiroAnalyticsEvent({ event_type: 'lazer_view', section: 'lazer' });
              }
            }
            sectionEnteredAtRef.current.set(section, Date.now());
          } else {
            const started = sectionEnteredAtRef.current.get(section);
            if (started) {
              const dwell = Date.now() - started;
              sectionEnteredAtRef.current.delete(section);
              if (dwell >= 500) {
                trackRoteiroAnalyticsEvent({
                  event_type: 'section_dwell',
                  section,
                  value_ms: dwell,
                });
              }
            }
          }
        },
        { threshold: 0.35, rootMargin: '-40px 0px' },
      );
      observer.observe(el);
      observers.push(observer);
    }

    const onScroll = () => {
      const pct = computeScrollDepthPct(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight,
      );
      const milestone = nextScrollDepthMilestone(scrollMaxRef.current, pct);
      if (milestone !== null) {
        scrollMaxRef.current = milestone;
        trackRoteiroAnalyticsEvent({
          event_type: 'scroll_depth',
          scroll_pct: milestone,
        });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        void flushRoteiroAnalytics();
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', () => {
      void flushRoteiroAnalytics();
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      shutdownRoteiroAnalyticsQueue();
    };
  }, [token]);
}

export function trackCarteiraOpen(): void {
  trackRoteiroAnalyticsEvent({ event_type: 'carteira_open', section: 'carteira' });
}
