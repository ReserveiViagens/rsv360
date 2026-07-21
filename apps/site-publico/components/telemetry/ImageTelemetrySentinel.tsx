'use client';

/**
 * PR-001c — mounts periodic ImageTelemetrySentinel heartbeats on ingressos surfaces.
 */

import { useEffect, useRef } from 'react';
import { reportImageTelemetrySentinel } from '@/lib/image-error-telemetry';

const DEFAULT_INTERVAL_MS = 60_000;

export function ImageTelemetrySentinel({
  intervalMs = DEFAULT_INTERVAL_MS,
}: {
  intervalMs?: number;
}) {
  const seq = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      const n = seq.current;
      seq.current += 1;
      await reportImageTelemetrySentinel({
        sequence: n,
        expected_interval_ms: intervalMs,
      });
    };

    void tick();
    const id = setInterval(() => {
      void tick();
    }, intervalMs);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return null;
}
