import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { campanhasViagemService } from '../services/campanhas.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'campanhas-viagem', status: 'ok' });
});

router.get('/', ...staffAuth, async (req, res) => {
  try {
    const data = await campanhasViagemService.listCampanhas(
      req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', ...staffAuth, async (req, res) => {
  try {
    const created = await campanhasViagemService.createCampanha(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/cupons', ...staffAuth, async (_req, res) => {
  try {
    const data = await campanhasViagemService.listCupons();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/cupons', ...staffAuth, async (req, res) => {
  try {
    const created = await campanhasViagemService.createCupom(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/cupons/:id/uso', ...staffAuth, async (req, res) => {
  try {
    const uso = await campanhasViagemService.usarCupom(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: uso });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
