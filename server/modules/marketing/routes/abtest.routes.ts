import { Router, Request, Response } from 'express';
import {
  listAbTests,
  getAbTestById,
  createAbTest,
  updateAbTest,
  startTest,
  pauseTest,
  resumeTest,
  completeTest,
  cancelTest,
  getAbTestStats,
} from '../services/abtest.service';

const router = Router();

// GET / - Listar testes A/B
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, campaignId, page, limit } = req.query;
    const result = await listAbTests({
      status: status as "draft" | "paused" | "completed" | "running" | "cancelled" | undefined,
      campaignId: campaignId as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing A/B tests:', error);
    res.status(500).json({ error: 'Failed to list A/B tests' });
  }
});

// GET /stats - Estatísticas
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const result = await getAbTestStats({
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error getting A/B test stats:', error);
    res.status(500).json({ error: 'Failed to get A/B test stats' });
  }
});

// GET /:id - Buscar teste por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const test = await getAbTestById(req.params.id as string);
    if (!test) {
      return res.status(404).json({ error: 'A/B test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error getting A/B test:', error);
    res.status(500).json({ error: 'Failed to get A/B test' });
  }
});

// POST / - Criar teste A/B
router.post('/', async (req: Request, res: Response) => {
  try {
    const test = await createAbTest(req.body);
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating A/B test:', error);
    res.status(500).json({ error: 'Failed to create A/B test' });
  }
});

// PATCH /:id - Atualizar teste
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const test = await updateAbTest(req.params.id as string, req.body);
    if (!test) {
      return res.status(404).json({ error: 'A/B test not found or not editable' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error updating A/B test:', error);
    res.status(500).json({ error: 'Failed to update A/B test' });
  }
});

// POST /:id/start - Iniciar teste
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const test = await startTest(req.params.id as string);
    res.json(test);
  } catch (error) {
    console.error('Error starting A/B test:', error);
    res.status(500).json({ error: 'Failed to start A/B test' });
  }
});

// POST /:id/pause - Pausar teste
router.post('/:id/pause', async (req: Request, res: Response) => {
  try {
    const test = await pauseTest(req.params.id as string);
    res.json(test);
  } catch (error) {
    console.error('Error pausing A/B test:', error);
    res.status(500).json({ error: 'Failed to pause A/B test' });
  }
});

// POST /:id/resume - Retomar teste
router.post('/:id/resume', async (req: Request, res: Response) => {
  try {
    const test = await resumeTest(req.params.id as string);
    res.json(test);
  } catch (error) {
    console.error('Error resuming A/B test:', error);
    res.status(500).json({ error: 'Failed to resume A/B test' });
  }
});

// POST /:id/complete - Completar teste com resultados
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { results } = req.body;
    const test = await completeTest(req.params.id as string, results);
    res.json(test);
  } catch (error) {
    console.error('Error completing A/B test:', error);
    res.status(500).json({ error: 'Failed to complete A/B test' });
  }
});

// POST /:id/cancel - Cancelar teste
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const test = await cancelTest(req.params.id as string);
    res.json(test);
  } catch (error) {
    console.error('Error cancelling A/B test:', error);
    res.status(500).json({ error: 'Failed to cancel A/B test' });
  }
});

export default router;