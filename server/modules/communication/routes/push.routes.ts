// Communication Routes — Push Notifications

import { Router } from 'express';
import { z } from 'zod';
import { MessagesService } from '../services';

const router = Router();

// Validation schemas
const sendPushSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.any()).optional(),
});

const sendBulkSchema = z.object({
  enterpriseId: z.string(),
  leadIds: z.array(z.string()),
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  image: z.string().url().optional(),
  data: z.record(z.any()).optional(),
});

const subscribeSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

const unsubscribeSchema = z.object({
  enterpriseId: z.string(),
  contactId: z.string(),
});

// POST /send - Send push notification
router.post('/send', async (req, res) => {
  try {
    const data = sendPushSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'push',
      direction: 'outbound',
      content: data.body,
      subject: data.title,
      metadata: {
        icon: data.icon,
        badge: data.badge,
        image: data.image,
        data: data.data,
      },
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Push send error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-bulk - Send bulk push notifications
router.post('/send-bulk', async (req, res) => {
  try {
    const data = sendBulkSchema.parse(req.body);

    const results = await Promise.allSettled(
      data.leadIds.map(leadId =>
        MessagesService.sendMessage({
          enterpriseId: data.enterpriseId,
          leadId,
          channel: 'push',
          direction: 'outbound',
          content: data.body,
          subject: data.title,
          metadata: {
            icon: data.icon,
            badge: data.badge,
            image: data.image,
            data: data.data,
          },
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    res.json({
      success: true,
      total: results.length,
      successful,
      failed,
    });
  } catch (error: any) {
    console.error('Push send-bulk error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /subscribe - Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const data = subscribeSchema.parse(req.body);

    // TODO: Store subscription in database
    // For now, just return success
    res.json({
      success: true,
      message: 'Subscription registered successfully',
      subscription: data.subscription,
    });
  } catch (error: any) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE /unsubscribe/:contactId - Unsubscribe from push notifications
router.delete('/unsubscribe/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // TODO: Remove subscription from database
    // For now, just return success
    res.json({
      success: true,
      message: 'Subscription removed successfully',
      contactId,
    });
  } catch (error: any) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /vapid-key - Get VAPID public key
router.get('/vapid-key', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // TODO: Get VAPID key from configuration
    // For now, return mock key
    res.json({
      success: true,
      vapidPublicKey: 'BExampleVAPIDPublicKeyForTestingPurposesOnly1234567890',
    });
  } catch (error: any) {
    console.error('Push vapid-key error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;