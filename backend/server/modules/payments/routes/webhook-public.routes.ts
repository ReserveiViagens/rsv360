import { Router } from 'express';
import { WebhookService, MpWebhookAuthError } from '../services/webhook.service';
import { mpWebhookIpLimiter } from '../../../../../server/middleware/mp-webhook-ip-limiter';

/**
 * Explicit public webhooks — provider callbacks verify signature inside the service.
 * /events and /retry stay on the parent router behind JWT (fail-closed).
 *
 * PR-06b: anti-flood BEFORE HMAC (high ceiling) so PR-02c 503 redelivery is not broken.
 */
const router = Router();
const webhookService = new WebhookService();

function headerString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

router.post('/stripe', async (req, res) => {
  try {
    await webhookService.processStripeWebhook(
      JSON.stringify(req.body),
      req.headers['stripe-signature'] as string,
    );
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

router.post('/mercadopago', mpWebhookIpLimiter, async (req, res) => {
  try {
    const result = await webhookService.processMPWebhook({
      body: req.body,
      query: req.query as Record<string, string | string[] | undefined>,
      xSignature: headerString(req.headers['x-signature']),
      xRequestId: headerString(req.headers['x-request-id']),
    });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof MpWebhookAuthError) {
      // Structured log — never leak secret or expected HMAC.
      console.warn(
        JSON.stringify({
          level: 'warn',
          event: 'mp_webhook_auth_failed',
          code: error.code,
          hasSignature: Boolean(headerString(req.headers['x-signature'])),
          hasRequestId: Boolean(headerString(req.headers['x-request-id'])),
          hasDataIdQuery: Boolean(
            req.query['data.id'] ?? req.query.id,
          ),
        }),
      );
      return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
module.exports = router;
