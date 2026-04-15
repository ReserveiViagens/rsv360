import { Router, Request, Response } from 'express';
import {
  listFunnels,
  getFunnelById,
  createFunnel,
  updateFunnel,
  deleteFunnel,
  addLeadToFunnel,
  moveLeadToStage,
  removeLeadFromFunnel,
  getFunnelReport,
} from '../services/funnel.service';

const router = Router();

// GET / - Listar funis
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive, page, limit } = req.query;
    const result = await listFunnels({
      isActive: isActive ? isActive === 'true' : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    console.error('Error listing funnels:', error);
    res.status(500).json({ error: 'Failed to list funnels' });
  }
});

// GET /:id - Buscar funil por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const funnel = await getFunnelById(req.params.id as string);
    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }
    res.json(funnel);
  } catch (error) {
    console.error('Error getting funnel:', error);
    res.status(500).json({ error: 'Failed to get funnel' });
  }
});

// GET /:id/report - Relatório do funil
router.get('/:id/report', async (req: Request, res: Response) => {
  try {
    const result = await getFunnelReport(req.params.id as string);
    res.json(result);
  } catch (error) {
    console.error('Error getting funnel report:', error);
    res.status(500).json({ error: 'Failed to get funnel report' });
  }
});

// POST / - Criar funil
router.post('/', async (req: Request, res: Response) => {
  try {
    const funnel = await createFunnel(req.body);
    res.status(201).json(funnel);
  } catch (error) {
    console.error('Error creating funnel:', error);
    res.status(500).json({ error: 'Failed to create funnel' });
  }
});

// PATCH /:id - Atualizar funil
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const funnel = await updateFunnel(req.params.id as string, req.body);
    if (!funnel) {
      return res.status(404).json({ error: 'Funnel not found' });
    }
    res.json(funnel);
  } catch (error) {
    console.error('Error updating funnel:', error);
    res.status(500).json({ error: 'Failed to update funnel' });
  }
});

// DELETE /:id - Desativar funil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const result = await deleteFunnel(req.params.id as string);
    if (!result.success) {
      return res.status(404).json({ error: 'Funnel not found' });
    }
    res.json({ message: 'Funnel deactivated successfully' });
  } catch (error) {
    console.error('Error deleting funnel:', error);
    res.status(500).json({ error: 'Failed to delete funnel' });
  }
});

// POST /:id/leads - Adicionar lead ao funil
router.post('/:id/leads', async (req: Request, res: Response) => {
  try {
    const { leadId, initialStageId } = req.body;
    const entry = await addLeadToFunnel(req.params.id as string, leadId, initialStageId);
    res.status(201).json(entry);
  } catch (error) {
    console.error('Error adding lead to funnel:', error);
    res.status(500).json({ error: 'Failed to add lead to funnel' });
  }
});

// PATCH /entries/:entryId/stage - Mover lead para outro stage
router.patch('/entries/:entryId/stage', async (req: Request, res: Response) => {
  try {
    const { newStageId } = req.body;
    const entry = await moveLeadToStage(req.params.entryId as string, newStageId);
    res.json(entry);
  } catch (error) {
    console.error('Error moving lead to stage:', error);
    res.status(500).json({ error: 'Failed to move lead to stage' });
  }
});

// DELETE /entries/:entryId - Remover lead do funil
router.delete('/entries/:entryId', async (req: Request, res: Response) => {
  try {
    const result = await removeLeadFromFunnel(req.params.entryId as string);
    if (!result.success) {
      return res.status(404).json({ error: 'Funnel entry not found' });
    }
    res.json({ message: 'Lead removed from funnel successfully' });
  } catch (error) {
    console.error('Error removing lead from funnel:', error);
    res.status(500).json({ error: 'Failed to remove lead from funnel' });
  }
});

export default router;