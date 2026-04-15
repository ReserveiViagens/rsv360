// Communication Routes — WhatsApp

import { Router } from 'express';
import { z } from 'zod';
import { MessagesService } from '../services';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  content: z.string().min(1),
  templateId: z.string().optional(),
});

const sendTemplateSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  templateId: z.string(),
  variables: z.record(z.string()).optional(),
});

const sendMediaSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  mediaUrl: z.string().url(),
  mediaType: z.enum(['image', 'video', 'document', 'audio']),
  caption: z.string().optional(),
});

const sendBulkSchema = z.object({
  enterpriseId: z.string(),
  leadIds: z.array(z.string()),
  content: z.string().min(1),
  templateId: z.string().optional(),
});

const validateNumberSchema = z.object({
  enterpriseId: z.string(),
  phoneNumber: z.string(),
});

// POST /send - Send WhatsApp message
router.post('/send', async (req, res) => {
  try {
    const data = sendMessageSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      ...data,
      channel: 'whatsapp',
      direction: 'outbound',
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-template - Send WhatsApp template
router.post('/send-template', async (req, res) => {
  try {
    const data = sendTemplateSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'whatsapp',
      direction: 'outbound',
      templateId: data.templateId,
      variables: data.variables,
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('WhatsApp send-template error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-media - Send WhatsApp media
router.post('/send-media', async (req, res) => {
  try {
    const data = sendMediaSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'whatsapp',
      direction: 'outbound',
      content: data.caption || '',
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('WhatsApp send-media error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-bulk - Send bulk WhatsApp messages
router.post('/send-bulk', async (req, res) => {
  try {
    const data = sendBulkSchema.parse(req.body);

    const results = await Promise.allSettled(
      data.leadIds.map(leadId =>
        MessagesService.sendMessage({
          enterpriseId: data.enterpriseId,
          leadId,
          channel: 'whatsapp',
          direction: 'outbound',
          content: data.content,
          templateId: data.templateId,
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
    console.error('WhatsApp send-bulk error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /validate-number - Validate WhatsApp number
router.post('/validate-number', async (req, res) => {
  try {
    const data = validateNumberSchema.parse(req.body);

    // TODO: Implement number validation logic
    // For now, return mock validation
    const isValid = data.phoneNumber.match(/^\+?[1-9]\d{10,14}$/);

    res.json({
      success: true,
      phoneNumber: data.phoneNumber,
      isValid: !!isValid,
      canReceiveMessages: !!isValid,
    });
  } catch (error: any) {
    console.error('WhatsApp validate-number error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /stats - Get WhatsApp stats
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
        totalMessages: 0,
        delivered: 0,
        read: 0,
        failed: 0,
      },
    });
  } catch (error: any) {
    console.error('WhatsApp stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;