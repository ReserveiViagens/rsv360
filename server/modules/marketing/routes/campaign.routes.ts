import { Router, Request, Response } from 'express';
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  duplicateCampaign,
} from '../services/campaign.service';

const router = Router();

// GET / - Listar campanhas
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, type, search, page, limit } = req.query;
    const result = await listCampaigns({
      status: status as string | undefined,
      type: type as string | undefined,
      search: search as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing campaigns:', error);
    res.status(500).json({ error: 'Failed to list campaigns' });
  }
});

// GET /stats - Estatísticas gerais
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await getCampaignStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    res.status(500).json({ error: 'Failed to get campaign stats' });
  }
});

// GET /:id - Buscar campanha por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await getCampaignById(req.params.id as string);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error getting campaign:', error);
    res.status(500).json({ error: 'Failed to get campaign' });
  }
});

// POST / - Criar campanha
router.post('/', async (req: Request, res: Response) => {
  try {
    const campaign = await createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PATCH /:id - Atualizar campanha
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await updateCampaign(req.params.id as string, req.body);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE /:id - Deletar campanha
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await deleteCampaign(req.params.id as string);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// POST /:id/duplicate - Duplicar campanha
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const campaign = await duplicateCampaign(req.params.id as string);
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error duplicating campaign:', error);
    res.status(500).json({ error: 'Failed to duplicate campaign' });
  }
});

export default router;