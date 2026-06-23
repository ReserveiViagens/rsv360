import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { orcamentosService } from '../services/orcamentos.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'orcamentos', status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/', ...staffAuth, async (req, res) => {
  try {
    const data = await orcamentosService.list({
      status: req.query.status as string | undefined,
      enterpriseId: req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    });
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', ...staffAuth, async (req, res) => {
  try {
    const item = await orcamentosService.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', ...staffAuth, async (req, res) => {
  try {
    const created = await orcamentosService.create(req.body, req.user?.id);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await orcamentosService.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', ...staffAuth, async (req, res) => {
  try {
    const deleted = await orcamentosService.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Orçamento não encontrado' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/itens', ...staffAuth, async (req, res) => {
  try {
    const item = await orcamentosService.addItem(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id/itens/:itemId', ...staffAuth, async (req, res) => {
  try {
    const item = await orcamentosService.updateItem(
      Number(req.params.id),
      Number(req.params.itemId),
      req.body,
    );
    if (!item) return res.status(404).json({ success: false, error: 'Item não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id/itens/:itemId', ...staffAuth, async (req, res) => {
  try {
    const deleted = await orcamentosService.removeItem(Number(req.params.id), Number(req.params.itemId));
    if (!deleted) return res.status(404).json({ success: false, error: 'Item não encontrado' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/converter-proposta', ...staffAuth, async (req, res) => {
  try {
    const proposta = await orcamentosService.convertToProposta(Number(req.params.id), req.user?.id);
    res.status(201).json({ success: true, data: proposta });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
