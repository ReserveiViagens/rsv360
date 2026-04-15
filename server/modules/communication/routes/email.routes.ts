// Communication Routes — Email

import { Router } from 'express';
import { z } from 'zod';
import { MessagesService } from '../services';

const router = Router();

// Validation schemas
const sendEmailSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  subject: z.string().min(1),
  content: z.string().min(1),
  templateId: z.string().optional(),
});

const sendTemplateSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  templateId: z.string(),
  variables: z.record(z.string()).optional(),
});

const sendBulkSchema = z.object({
  enterpriseId: z.string(),
  leadIds: z.array(z.string()),
  subject: z.string().min(1),
  content: z.string().min(1),
  templateId: z.string().optional(),
});

const sendTransactionalSchema = z.object({
  enterpriseId: z.string(),
  leadId: z.string(),
  subject: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high']).optional(),
});

const validateEmailSchema = z.object({
  enterpriseId: z.string(),
  email: z.string().email(),
});

// POST /send - Send email
router.post('/send', async (req, res) => {
  try {
    const data = sendEmailSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'email',
      direction: 'outbound',
      content: data.content,
      subject: data.subject,
      templateId: data.templateId,
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-template - Send email template
router.post('/send-template', async (req, res) => {
  try {
    const data = sendTemplateSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'email',
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
    console.error('Email send-template error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-bulk - Send bulk emails
router.post('/send-bulk', async (req, res) => {
  try {
    const data = sendBulkSchema.parse(req.body);

    const results = await Promise.allSettled(
      data.leadIds.map(leadId =>
        MessagesService.sendMessage({
          enterpriseId: data.enterpriseId,
          leadId,
          channel: 'email',
          direction: 'outbound',
          content: data.content,
          subject: data.subject,
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
    console.error('Email send-bulk error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /send-transactional - Send transactional email
router.post('/send-transactional', async (req, res) => {
  try {
    const data = sendTransactionalSchema.parse(req.body);

    const result = await MessagesService.sendMessage({
      enterpriseId: data.enterpriseId,
      leadId: data.leadId,
      channel: 'email',
      direction: 'outbound',
      content: data.content,
      subject: data.subject,
      priority: data.priority,
    });

    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Email send-transactional error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /validate - Validate email
router.post('/validate', async (req, res) => {
  try {
    const data = validateEmailSchema.parse(req.body);

    // TODO: Implement email validation logic
    // For now, return mock validation
    const isValid = data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

    res.json({
      success: true,
      email: data.email,
      isValid: !!isValid,
      canReceiveMessages: !!isValid,
    });
  } catch (error: any) {
    console.error('Email validate error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /stats - Get email stats
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
        totalEmails: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      },
    });
  } catch (error: any) {
    console.error('Email stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;