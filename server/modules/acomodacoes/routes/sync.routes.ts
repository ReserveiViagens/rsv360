import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { syncEmpreendimentosCaldas } from '../sync/sync-empreendimentos';

const router = Router();
const staffAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];

router.post('/empreendimentos-caldas', ...staffAuth, async (req, res) => {
  try {
    const csvPath = req.body?.csvPath as string | undefined;
    const data = await syncEmpreendimentosCaldas({ csvPath });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
