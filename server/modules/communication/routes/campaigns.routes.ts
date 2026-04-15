// Communication Routes — Campaigns

import { Router } from 'express';
import { z } from 'zod';
import { CampaignsService } from '../services';

const router = Router();

// Validation schemas
const createCampaignSchema = z.object({
  enterpriseId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['marketing', 'transactional', 'notification']),
  channel: z.enum(['email', 'whatsapp', 'sms', 'push']),
  templateId: z.string().optional(),
  targetAudience: z.any(), // TODO: Define audience schema
  scheduledAt: z.string().datetime().optional(),
  content: z.any().optional(),
});

// GET / - List campaigns
router.get('/', async (req, res) => {
  try {
    const enterpriseId = req.query.enterpriseId as string;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await CampaignsService.listCampaigns({
      enterpriseId,
      status: status as any,
      type: type as any,
      search,
      page,
      limit,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Campaigns list error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /:id - Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const campaign = await CampaignsService.getCampaignById(id, enterpriseId);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error('Campaigns get error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST / - Create campaign
router.post('/', async (req, res) => {
  try {
    const data = createCampaignSchema.parse(req.body);

    const result = await CampaignsService.createCampaign({
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    });

    if (result.success) {
      res.status(201).json({ success: true, campaign: result.campaign });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Campaigns create error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT /:id - Update campaign
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;
    const data = createCampaignSchema.partial().parse(req.body);

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await CampaignsService.updateCampaign(id, enterpriseId, {
      ...data,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
    });

    if (result.success) {
      res.json({ success: true, campaign: result.campaign });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Campaigns update error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /:id/start - Start campaign
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await CampaignsService.startCampaign(id, enterpriseId);

    if (result.success) {
      res.json({ success: true, message: 'Campaign started successfully' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Campaigns start error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /:id/pause - Pause campaign
router.post('/:id/pause', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await CampaignsService.pauseCampaign(id, enterpriseId);

    if (result.success) {
      res.json({ success: true, message: 'Campaign paused successfully' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Campaigns pause error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /:id/cancel - Cancel campaign
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const result = await CampaignsService.cancelCampaign(id, enterpriseId);

    if (result.success) {
      res.json({ success: true, message: 'Campaign cancelled successfully' });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error: any) {
    console.error('Campaigns cancel error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /:id/stats - Get campaign stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const enterpriseId = req.query.enterpriseId as string;

    if (!enterpriseId) {
      return res.status(400).json({ success: false, error: 'enterpriseId required' });
    }

    const stats = await CampaignsService.getCampaignStats(id, enterpriseId);

    if (!stats) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Campaigns stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;