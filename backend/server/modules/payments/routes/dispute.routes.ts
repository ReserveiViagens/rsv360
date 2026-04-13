import { Router } from 'express';
import { DisputeService } from '../services/dispute.service';

const router = Router();
const disputeService = new DisputeService();

router.get('/', async (req, res) => {
  try {
    const result = await disputeService.listDisputes();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await disputeService.getDispute(req.params.id);
    if (!result) return res.status(404).json({ error: 'Dispute not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const result = await disputeService.updateDispute(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/evidence', async (req, res) => {
  try {
    await disputeService.submitEvidence(req.params.id, req.body.evidence);
    res.json({ message: 'Evidence submitted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    await disputeService.acceptDispute(req.params.id);
    res.json({ message: 'Dispute accepted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await disputeService.getDisputeStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;