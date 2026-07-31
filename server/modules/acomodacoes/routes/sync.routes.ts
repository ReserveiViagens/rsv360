import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { resolveSafeCsvPath, UnsafeCsvPathError } from '../sync/safe-csv-path';
import { syncEmpreendimentosCaldas } from '../sync/sync-empreendimentos';

const router = Router();
const staffAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];

router.post('/empreendimentos-caldas', ...staffAuth, async (req, res) => {
  try {
    const rawCsvPath = req.body?.csvPath;
    const csvPath =
      rawCsvPath === undefined || rawCsvPath === null || rawCsvPath === ''
        ? undefined
        : resolveSafeCsvPath(String(rawCsvPath));
    const data = await syncEmpreendimentosCaldas({ csvPath });
    res.json({ success: true, data });
  } catch (error) {
    if (error instanceof UnsafeCsvPathError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
