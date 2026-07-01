'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { isLcpVideoElement } from '@/lib/media/smart-video';

// web-vitals retorna valores em milissegundos para LCP, FCP, TTFB, INP
const LCP_LIMIT_MS = 2500; // 2.5 segundos
const INP_LIMIT_MS = 200; // Interaction to Next Paint (substitui FID)
const CLS_LIMIT = 0.1; // CLS é adimensional

function routeLabel(): string {
  if (typeof window === 'undefined') return '';
  const path = window.location.pathname;
  if (path === '/') return 'home';
  if (path.startsWith('/cotacao')) return 'wizard';
  if (path.startsWith('/roteiro')) return 'roteiro';
  return path;
}

function sendToAnalytics(metric: Metric) {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', routeLabel(), metric.name, metric.value, metric.id);
  }
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    navigationType: metric.navigationType,
    route: routeLabel(),
  });
  try {
    if (typeof fetch !== 'undefined' && process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_WEB_VITALS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (_) {}
}

function handleMetric(metric: Metric) {
  sendToAnalytics(metric);
  if (process.env.NODE_ENV === 'development') {
    if (metric.name === 'LCP') {
      const entry = metric.entries?.[metric.entries.length - 1];
      const lcpElement = entry?.element ?? null;
      const tag = lcpElement?.tagName?.toLowerCase() ?? 'unknown';
      if (isLcpVideoElement(lcpElement)) {
        console.warn(
          `[Web Vitals] LCP em ${routeLabel()} foi <video> (${metric.value}ms) — poster/imagem deve ser o LCP`,
        );
      } else {
        console.log(`[Web Vitals] LCP em ${routeLabel()}: <${tag}> (${metric.value}ms)`);
      }
      if (metric.value > LCP_LIMIT_MS) {
        console.warn(`[Web Vitals] LCP acima do limite: ${metric.value}ms > ${LCP_LIMIT_MS}ms`);
      }
    }
    if (metric.name === 'INP' && metric.value > INP_LIMIT_MS) {
      console.warn(`[Web Vitals] INP acima do limite: ${metric.value}ms > ${INP_LIMIT_MS}ms`);
    }
    if (metric.name === 'CLS' && metric.value > CLS_LIMIT) {
      console.warn(`[Web Vitals] CLS acima do limite: ${metric.value} > ${CLS_LIMIT}`);
    }
  }
}

export function WebVitalsReporter() {
  useEffect(() => {
    onCLS(handleMetric);
    onINP(handleMetric);
    onLCP(handleMetric);
    onFCP(handleMetric);
    onTTFB(handleMetric);
  }, []);

  return null;
}
