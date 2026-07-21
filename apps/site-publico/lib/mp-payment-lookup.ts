/**
 * PR-02c — Server-side MP payment lookup (source of truth for baixa).
 * Event payload status is never trusted alone.
 */

export class MpApiUnavailableError extends Error {
  readonly code = 'mp_api_unavailable';

  constructor(message: string) {
    super(message);
    this.name = 'MpApiUnavailableError';
  }
}

export function isMpApiUnavailableError(error: unknown): error is MpApiUnavailableError {
  return (
    error instanceof MpApiUnavailableError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'MpApiUnavailableError')
  );
}

/** Map Mercado Pago payment.status → internal payment_status. */
export function mapMpPaymentStatus(
  mpStatus: string,
): 'paid' | 'failed' | 'cancelled' | 'refunded' | 'pending' {
  const statusMap: Record<string, 'paid' | 'failed' | 'cancelled' | 'refunded' | 'pending'> = {
    approved: 'paid',
    rejected: 'failed',
    cancelled: 'cancelled',
    refunded: 'refunded',
    partially_refunded: 'refunded',
    pending: 'pending',
    in_process: 'pending',
    in_mediation: 'pending',
    charged_back: 'failed',
  };
  return statusMap[mpStatus] ?? 'pending';
}

export function logMpStatusDivergence(input: {
  paymentId: string;
  eventStatus: string | undefined;
  apiStatus: string;
}): void {
  if (!input.eventStatus || input.eventStatus === input.apiStatus) return;
  console.warn(
    JSON.stringify({
      level: 'warn',
      event: 'mp_webhook_status_divergence',
      surface: 'site-publico',
      paymentId: input.paymentId,
      eventStatus: input.eventStatus,
      apiStatus: input.apiStatus,
      action: 'trust_api_only_no_event_status',
    }),
  );
}
