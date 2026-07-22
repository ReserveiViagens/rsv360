/**
 * GET /api/metrics — PR-05b bearer + PR-06a per-IP rate limit (closes CodeQL #4520).
 * Generous ceiling: 120/min/IP (Prometheus scrape ~4/min at 15s interval).
 */

import { NextRequest, NextResponse } from 'next/server';
import { isMetricsBearerAuthorized } from '@rsv360/shared';
import { getMetrics } from '@/lib/metrics';
import { jsonInternalError } from '@/lib/api-error';

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;

type Bucket = { count: number; windowStart: number };
const buckets = new Map<string, Bucket>();

function clientIp(request: NextRequest): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  return 'unknown';
}

function allowMetricsIp(ip: string): boolean {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    buckets.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

/** Test helper */
export function clearMetricsIpRateLimitForTests() {
  buckets.clear();
}

export async function GET(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (!allowMetricsIp(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429 },
      );
    }

    if (!isMetricsBearerAuthorized(request.headers.get('authorization'))) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const metrics = await getMetrics();

    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return jsonInternalError(error, 'metrics_collect');
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
