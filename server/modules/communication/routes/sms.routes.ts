// Communication Routes — SMS

import { Router } from 'express';
import { z } from 'zod';
import { MessagesService } from '../services';

const router = Router();

// Validation schemas
const sendSmsSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  content: z.string().min(1).max(160),
});

const sendBulkSchema = z.object({
  enterpriseId: z.string(),
  leadIds: z.array(z.string()),
  content: z.string().min(1).max(160),
});

const sendOtpSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  code: z.string().length(6),
  expiryMinutes: z.number().min(1).max(60).optional(),
});

// POST /send - Send SMS
router.post('/send', async (req, res) => {
  try {
    const data = sendSmsSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'sms',
      direction: 'outbound',
      content: data.content,
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('SMS send error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-bulk - Send bulk SMS
router.post('/send-bulk', async (req, res) => {
  try {
    const data = sendBulkSchema.parse(req.body);

    const results = await Promise.allSettled(
      data.leadIds.map(leadId =>
        MessagesService.sendMessage({
          enterpriseId: data.enterpriseId,
          leadId,
          channel: 'sms',
          direction: 'outbound',
          content: data.content,
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
    console.error('SMS send-bulk error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-otp - Send OTP SMS
router.post('/send-otp', async (req, res) => {
  try {
    const data = sendOtpSchema.parse(req.body);

    const content = `Your verification code is: ${data.code}${
      data.expiryMinutes ? ` (expires in ${data.expiryMinutes} minutes)` : ''
    }`;

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'sms',
      direction: 'outbound',
      content,
      metadata: {
        otpCode: data.code,
        expiryMinutes: data.expiryMinutes || 10,
      },
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        otpCode: data.code,
        expiryMinutes: data.expiryMinutes || 10,
      });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('SMS send-otp error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /balance - Get SMS balance
router.get('/balance', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // TODO: Implement balance check logic
    res.json({
      success: true,
      balance: 1000, // Mock balance
      currency: 'USD',
      estimatedMessages: 1000,
    });
  } catch (error: any) {
    console.error('SMS balance error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /stats - Get SMS stats
router.get('/stats', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // TODO: Implement stats logic
    res.json({
      success: true,
      stats: {
        totalSms: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
      },
    });
  } catch (error: any) {
    console.error('SMS stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;