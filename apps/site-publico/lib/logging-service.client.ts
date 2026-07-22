/**
 * Client-safe logging surface.
 *
 * Must NEVER import Node-only modules (pg / fs / net / dns / tls / db).
 * Used by browser components and client telemetry (e.g. image-error-telemetry).
 */

type ClientLogContext = Record<string, unknown>;

/**
 * Warn on the client: console + optional Sentry browser.
 * No database persistence (server logging-service owns that).
 */
export async function logWarn(
  message: string,
  context?: ClientLogContext,
): Promise<void> {
  const logData = {
    level: 'warn' as const,
    message,
    context,
    timestamp: new Date().toISOString(),
  };

  console.warn('⚠️ WARN:', logData);

  try {
    const Sentry = await import('@sentry/nextjs');
    Sentry.captureMessage(message, {
      level: 'warning',
      ...(context ? { extra: context } : {}),
    });
  } catch {
    // Sentry optional on client
  }
}
