// Communication Routes — Inbox

import { Router } from 'express';
import { z } from 'zod';
import { InboxService } from '../services';

const router = Router();

// Validation schemas
const replySchema = z.object({
  content: z.string().min(1),
  channel: z.enum(['email', 'whatsapp', 'sms', 'push']).optional(),
});

const assignSchema = z.object({
  assignedTo: z.string(),
});

// GET /conversations - List conversations
router.get('/conversations', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
    const assignedTo = req.query.assignedTo as string;
    const channel = req.query.channel as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await InboxService.listConversations({
      enterpriseId,
      isActive,
      assignedTo,
      channel: channel as any,
      search,
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Inbox conversations list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /conversations/:id - Get conversation by ID
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const conversation = await InboxService.getConversationById(id, enterpriseId);

    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error: any) {
    console.error('Inbox conversation get error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /conversations/:id/messages - Get conversation messages
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await InboxService.getConversationMessages(id, enterpriseId, {
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Inbox conversation messages error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /conversations/:id/reply - Reply to conversation
router.post('/conversations/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = replySchema.parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // Get conversation to find leadId
    const conversation = await InboxService.getConversationById(id, enterpriseId);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // TODO: Import MessagesService and send reply
    // For now, return mock response
    res.json({
      success: true,
      message: 'Reply sent successfully',
      conversationId: id,
    });
  } catch (error: any) {
    console.error('Inbox reply error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /conversations/:id/close - Close conversation
router.patch('/conversations/:id/close', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await InboxService.closeConversation(id, enterpriseId);

    if (result.success) {
      res.json({ success: true, conversation: result.conversation });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Inbox close conversation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /conversations/:id/assign - Assign conversation
router.patch('/conversations/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = assignSchema.parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await InboxService.assignConversation(id, enterpriseId, data.assignedTo);

    if (result.success) {
      res.json({ success: true, conversation: result.conversation });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Inbox assign conversation error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /conversations/:id/read - Mark conversation as read
router.patch('/conversations/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    // TODO: Implement mark as read logic
    // For now, return mock response
    res.json({
      success: true,
      message: 'Conversation marked as read',
      conversationId: id,
    });
  } catch (error: any) {
    console.error('Inbox mark read error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /stats - Get inbox stats
router.get('/stats', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const stats = await InboxService.getInboxStats(enterpriseId);

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Inbox stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;