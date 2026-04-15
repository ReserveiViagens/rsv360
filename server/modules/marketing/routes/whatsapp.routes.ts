import { Router, Request, Response } from 'express';
import {
  listTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  listConversations,
  getConversationById,
  getOrCreateConversation,
  closeConversation,
  getMessages,
  sendMessage,
  receiveMessage,
  updateMessageStatus,
} from '../services/whatsapp.service';

const router = Router();

// Templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { status, category, page, limit } = req.query;
    const result = await listTemplates({
      status: status as string | undefined,
      category: category as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing templates:', error);
    res.status(500).json({ error: 'Failed to list templates' });
  }
});

router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const template = await getTemplateById(req.params.id as string);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({ error: 'Failed to get template' });
  }
});

router.post('/templates', async (req: Request, res: Response) => {
  try {
    const template = await createTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

router.patch('/templates/:id', async (req: Request, res: Response) => {
  try {
    const template = await updateTemplate(req.params.id as string, req.body);
    if (!template) {
      return res.status(404).json({ error: 'Template not found or not editable' });
    }
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

router.delete('/templates/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteTemplate(req.params.id as string);
    if (!result.success) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Conversations
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const { isActive, search, page, limit } = req.query;
    const result = await listConversations({
      isActive: isActive ? isActive === 'true' : undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const conversation = await getConversationById(req.params.id as string);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Failed to get conversation' });
  }
});

router.post('/conversations', async (req: Request, res: Response) => {
  try {
    const { leadId, phone } = req.body;
    const conversation = await getOrCreateConversation(leadId, phone);
    res.status(201).json(conversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

router.post('/conversations/:id/close', async (req: Request, res: Response) => {
  try {
    const conversation = await closeConversation(req.params.id as string);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (error) {
    console.error('Error closing conversation:', error);
    res.status(500).json({ error: 'Failed to close conversation' });
  }
});

// Messages
router.get('/conversations/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    const result = await getMessages(req.params.conversationId as string, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

router.post('/conversations/:conversationId/messages/send', async (req: Request, res: Response) => {
  try {
    const { content, type, templateId, mediaUrl } = req.body;
    const message = await sendMessage({
      conversationId: req.params.conversationId as string,
      content,
      type,
      templateId,
      mediaUrl,
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

router.post('/conversations/:conversationId/messages/receive', async (req: Request, res: Response) => {
  try {
    const { content, type, externalMessageId, mediaUrl } = req.body;
    const message = await receiveMessage({
      conversationId: req.params.conversationId as string,
      content,
      type,
      externalMessageId,
      mediaUrl,
    });
    res.status(201).json(message);
  } catch (error) {
    console.error('Error receiving message:', error);
    res.status(500).json({ error: 'Failed to receive message' });
  }
});

router.patch('/messages/:messageId/status', async (req: Request, res: Response) => {
  try {
    const { status, timestamp, errorCode, errorMessage } = req.body;
    const message = await updateMessageStatus(
      req.params.messageId as string,
      status,
      timestamp ? new Date(timestamp) : undefined,
      errorCode || errorMessage ? { errorCode, errorMessage } : undefined
    );
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

export default router;