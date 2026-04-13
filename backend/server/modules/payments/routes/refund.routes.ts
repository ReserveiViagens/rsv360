import { Router } from 'express';
import { RefundService } from '../services/refund.service';

const router = Router();
const refundService = new RefundService();

router.post('/', async (req, res) => {
  try {
    const result = await refundService.createRefund(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await refundService.listRefunds();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await refundService.getRefund(req.params.id);
    if (!result) return res.status(404).json({ error: 'Refund not found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.post('/:id/process', async (req, res) => {
  try {
    const result = await refundService.processRefund(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await refundService.getRefundStats();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;