import { Router } from 'express';
import { optionalJwt, staffAuth } from '../../../middleware/auth.middleware';
import { campanhasViagemService } from '../services/campanhas.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'campanhas-viagem', status: 'ok' });
});

router.get('/metricas', ...staffAuth, async (req, res) => {
  try {
    const data = await campanhasViagemService.getMetricas(
      req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
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

router.get('/cupons/:id', ...staffAuth, async (req, res) => {
  try {
    const item = await campanhasViagemService.getCupom(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Cupom não encontrado' });
    res.json({ success: true, data: item });
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

router.put('/cupons/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await campanhasViagemService.updateCupom(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Cupom não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/cupons/validar', optionalJwt, async (req, res) => {
  try {
    const result = await campanhasViagemService.validarCupom(String(req.body.codigo));
    res.json({ success: true, data: result });
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

router.get('/', ...staffAuth, async (req, res) => {
  try {
    const data = await campanhasViagemService.listCampanhas(
      req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    );
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', ...staffAuth, async (req, res) => {
  try {
    const item = await campanhasViagemService.getCampanha(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
    res.json({ success: true, data: item });
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

router.put('/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await campanhasViagemService.updateCampanha(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', ...staffAuth, async (req, res) => {
  try {
    const deleted = await campanhasViagemService.deleteCampanha(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Campanha não encontrada' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
