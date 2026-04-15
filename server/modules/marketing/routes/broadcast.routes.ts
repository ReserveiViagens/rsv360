import { Router, Request, Response } from 'express';
import {
  listBroadcasts,
  getBroadcastById,
  createBroadcast,
  updateBroadcast,
  scheduleBroadcast,
  executeBroadcast,
  getBroadcastRecipients,
  updateRecipientStatus,
  getBroadcastStats,
} from '../services/broadcast.service';

const router = Router();

// GET / - Listar broadcasts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, channel, campaignId, page, limit } = req.query;
    const result = await listBroadcasts({
      status: status as string | undefined,
      channel: channel as string | undefined,
      campaignId: campaignId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing broadcasts:', error);
    res.status(500).json({ error: 'Failed to list broadcasts' });
  }
});

// GET /stats - Estatísticas de broadcasts
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await getBroadcastStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting broadcast stats:', error);
    res.status(500).json({ error: 'Failed to get broadcast stats' });
  }
});

// GET /:id - Buscar broadcast por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const broadcast = await getBroadcastById(req.params.id as string);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }
    res.json(broadcast);
  } catch (error) {
    console.error('Error getting broadcast:', error);
    res.status(500).json({ error: 'Failed to get broadcast' });
  }
});

// POST / - Criar broadcast
router.post('/', async (req: Request, res: Response) => {
  try {
    const broadcast = await createBroadcast(req.body);
    res.status(201).json(broadcast);
  } catch (error) {
    console.error('Error creating broadcast:', error);
    res.status(500).json({ error: 'Failed to create broadcast' });
  }
});

// PATCH /:id - Atualizar broadcast
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const broadcast = await updateBroadcast(req.params.id as string, req.body);
    if (!broadcast) {
      return res.status(404).json({ error: 'Broadcast not found or not editable' });
    }
    res.json(broadcast);
  } catch (error) {
    console.error('Error updating broadcast:', error);
    res.status(500).json({ error: 'Failed to update broadcast' });
  }
});

// POST /:id/schedule - Agendar broadcast
router.post('/:id/schedule', async (req: Request, res: Response) => {
  try {
    const { scheduledAt } = req.body;
    const broadcast = await scheduleBroadcast(req.params.id as string, new Date(scheduledAt));
    res.json(broadcast);
  } catch (error) {
    console.error('Error scheduling broadcast:', error);
    res.status(500).json({ error: 'Failed to schedule broadcast' });
  }
});

// POST /:id/execute - Executar broadcast
router.post('/:id/execute', async (req: Request, res: Response) => {
  try {
    const { recipientIds } = req.body;
    const result = await executeBroadcast(req.params.id as string, recipientIds);
    res.json(result);
  } catch (error) {
    console.error('Error executing broadcast:', error);
    res.status(500).json({ error: 'Failed to execute broadcast' });
  }
});

// GET /:id/recipients - Listar recipients de um broadcast
router.get('/:id/recipients', async (req: Request, res: Response) => {
  try {
    const { status, page, limit } = req.query;
    const result = await getBroadcastRecipients(req.params.id as string, {
      status: status as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting broadcast recipients:', error);
    res.status(500).json({ error: 'Failed to get broadcast recipients' });
  }
});

// PATCH /recipients/:recipientId/status - Atualizar status de recipient
router.patch('/recipients/:recipientId/status', async (req: Request, res: Response) => {
  try {
    const { status, timestamp } = req.body;
    const recipient = await updateRecipientStatus(
      req.params.recipientId as string,
      status,
      timestamp ? new Date(timestamp) : undefined
    );
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json(recipient);
  } catch (error) {
    console.error('Error updating recipient status:', error);
    res.status(500).json({ error: 'Failed to update recipient status' });
  }
});

export default router;