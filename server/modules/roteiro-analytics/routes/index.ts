import { Router } from 'express';
import { ZodError } from 'zod';
import { publicLimiter } from '../../../middleware/public-limiter';
import { ingestRoteiroAnalyticsBatch } from '../services/roteiro-analytics.service';

const router = Router();

router.post('/:token/analytics', publicLimiter, async (req, res) => {
  try {
    const token = String(req.params.token ?? '').trim();
    if (!token) {
      return res.status(400).json({ success: false, error: 'Token inválido' });
    }
    await ingestRoteiroAnalyticsBatch(token, req.body);
    return res.status(204).send();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ success: false, error: 'Payload inválido' });
    }
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;

module.exports = router;
