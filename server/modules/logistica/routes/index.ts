import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { logisticaService } from '../services/logistica.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'logistica', status: 'ok' });
});

router.get('/transportes', ...staffAuth, async (_req, res) => {
  try {
    const data = await logisticaService.listTransportes();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/transportes', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createTransporte(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/embarques', ...staffAuth, async (req, res) => {
  try {
    const data = await logisticaService.listEmbarques(
      req.query.travel_package_id ? Number(req.query.travel_package_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/embarques', ...staffAuth, async (req, res) => {
  try {
    const created = await logisticaService.createEmbarque(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
