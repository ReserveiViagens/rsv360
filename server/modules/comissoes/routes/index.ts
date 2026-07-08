import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { comissoesService } from '../services/comissoes.service';

const router = Router();

const parceiroAuth = [authenticateJwt, requireRole('anfitriao', 'corretor', 'admin', 'manager')];

router.get('/health', (_req, res) => {
  res.json({ module: 'comissoes', status: 'ok' });
});

router.get('/minhas-comissoes', ...parceiroAuth, async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await comissoesService.listarMinhas(req.user!.id, page, pageSize);
    const config = await comissoesService.getConfig();
    res.json({
      success: true,
      data: {
        ...data,
        moduloAtivo: config.comissoesModuloAtivo,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
