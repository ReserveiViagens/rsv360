import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { ConfigService } from '../config.service';
import { configPropostaSchema } from '../../fornecedores-hub/schema';

const router = Router();
const adminAuth = [authenticateJwt, requireRole('admin')];

router.get('/health', (_req, res) => {
  res.json({ module: 'configuracoes', status: 'ok' });
});

router.get('/modulo-propostas', ...adminAuth, async (_req, res) => {
  try {
    const data = await ConfigService.obterRegrasCotacao();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/modulo-propostas', ...adminAuth, async (req, res) => {
  try {
    const parsed = configPropostaSchema.partial().safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.flatten() });
    }
    const data = await ConfigService.salvarRegrasCotacao(parsed.data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
