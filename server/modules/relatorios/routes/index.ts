import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { relatoriosService } from '../services/relatorios.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'relatorios', status: 'ok' });
});

router.get('/views', ...staffAuth, async (req, res) => {
  try {
    const data = await relatoriosService.listViews(req.query.user_id ? Number(req.query.user_id) : undefined);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/views', ...staffAuth, async (req, res) => {
  try {
    const created = await relatoriosService.createView({ ...req.body, userId: req.user?.id });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/snapshots', ...staffAuth, async (req, res) => {
  try {
    const data = await relatoriosService.listSnapshots(
      req.query.view_id ? Number(req.query.view_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/snapshots', ...staffAuth, async (req, res) => {
  try {
    const created = await relatoriosService.createSnapshot({
      ...req.body,
      geradoPor: req.user?.id,
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
