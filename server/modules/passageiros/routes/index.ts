import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { passageirosService } from '../services/passageiros.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'passageiros', status: 'ok' });
});

router.get('/', ...staffAuth, async (req, res) => {
  try {
    const data = await passageirosService.list(
      req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    );
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', ...staffAuth, async (req, res) => {
  try {
    const item = await passageirosService.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Passageiro não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', ...staffAuth, async (req, res) => {
  try {
    const created = await passageirosService.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await passageirosService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Passageiro não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', ...staffAuth, async (req, res) => {
  try {
    const deleted = await passageirosService.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Passageiro não encontrado' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/documentos', ...staffAuth, async (req, res) => {
  try {
    const updated = await passageirosService.addDocumento(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id/documentos/:index', ...staffAuth, async (req, res) => {
  try {
    const updated = await passageirosService.removeDocumento(
      Number(req.params.id),
      Number(req.params.index),
    );
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/fnrh', ...staffAuth, async (req, res) => {
  try {
    const created = await passageirosService.createFnrh(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/fnrh/:fnrhId', ...staffAuth, async (req, res) => {
  try {
    const updated = await passageirosService.updateFnrh(Number(req.params.fnrhId), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'FNRH não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/excursoes', ...staffAuth, async (req, res) => {
  try {
    const linked = await passageirosService.linkExcursao(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: linked });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
