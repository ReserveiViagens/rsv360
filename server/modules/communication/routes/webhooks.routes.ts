// Communication Routes — Webhooks

import { Router } from 'express';
import { z } from 'zod';
import { WebhooksService } from '../services';
import { WhatsAppBusinessProvider } from '../providers/whatsapp/whatsapp-business.provider';

const router = Router();

// Validation schemas
const createWebhookSchema = z.object({
  enterpriseId: z.string(),
  provider: z.string(),
  url: z.string().url(),
  secret: z.string().min(16),
  events: z.array(z.string()),
  isActive: z.boolean().optional(),
});

// POST /whatsapp - WhatsApp webhook
router.post('/whatsapp', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-hub-signature-256'] as string;

    // Process WhatsApp webhook
    const result = await WebhooksService.processProviderWebhook('whatsapp', {
      provider: 'whatsapp',
      event: 'message', // TODO: Determine actual event type from payload
      data: payload,
      signature,
      timestamp: req.headers['x-hub-timestamp'] as string,
    });

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /whatsapp - WhatsApp webhook verification (Meta requirement)
router.get('/whatsapp', async (req, res) => {
  try {
    const mode = req.query['hub.mode'] as string;
    const token = req.query['hub.verify_token'] as string;
    const challenge = req.query['hub.challenge'] as string;

    const provider = new WhatsAppBusinessProvider();
    const verified = provider.verifyWebhook?.(mode, token, challenge) || null;
    if (verified) return res.status(200).send(verified);
    res.status(403).send('Forbidden');
  } catch (error: any) {
    console.error('WhatsApp webhook verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /sendgrid - SendGrid webhook
router.post('/sendgrid', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-twilio-email-event-webhook-signature'] as string;

    // Process SendGrid webhook
    const result = await WebhooksService.processProviderWebhook('sendgrid', {
      provider: 'sendgrid',
      event: payload.event || 'unknown',
      data: payload,
      signature,
      timestamp: req.headers['x-twilio-email-event-webhook-timestamp'] as string,
    });

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('SendGrid webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /twilio - Twilio webhook
router.post('/twilio', async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers['x-twilio-signature'] as string;

    // Process Twilio webhook
    const result = await WebhooksService.processProviderWebhook('twilio', {
      provider: 'twilio',
      event: payload.MessageStatus || 'unknown',
      data: payload,
      signature,
      timestamp: new Date().toISOString(),
    });

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Twilio webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /firebase - Firebase webhook (for push notifications)
router.post('/firebase', async (req, res) => {
  try {
    const payload = req.body;

    // Process Firebase webhook
    const result = await WebhooksService.processProviderWebhook('firebase', {
      provider: 'firebase',
      event: payload.event || 'unknown',
      data: payload,
      timestamp: new Date().toISOString(),
    });

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Firebase webhook error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /register - Register webhook
router.post('/register', async (req, res) => {
  try {
    const data = createWebhookSchema.parse(req.body);

    const result = await WebhooksService.createWebhook(data);

    if (result.success) {
      res.status(201).json({ success: true, webhook: result.webhook });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Webhook register error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET / - List webhooks
router.get('/', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const webhooks = await WebhooksService.listWebhooks(enterpriseId);

    res.json({ success: true, webhooks });
  } catch (error: any) {
    console.error('Webhooks list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /:id - Update webhook
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = createWebhookSchema.partial().parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await WebhooksService.updateWebhook(id, enterpriseId, data);

    if (result.success) {
      res.json({ success: true, webhook: result.webhook });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Webhook update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /:id - Delete webhook
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await WebhooksService.deleteWebhook(id, enterpriseId);

    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Webhook delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;