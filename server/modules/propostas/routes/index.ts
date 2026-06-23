import { Router } from 'express';
import { authenticateJwt, optionalJwt, requireRole, staffAuth } from '../../../middleware/auth.middleware';
import { propostasService } from '../services/propostas.service';

const router = Router();
const agentAuth = [authenticateJwt, requireRole('admin', 'manager', 'user')];

router.get('/health', (_req, res) => {
  res.json({ module: 'propostas', status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/', ...staffAuth, async (req, res) => {
  try {
    const data = await propostasService.list({
      status: req.query.status as string | undefined,
      enterpriseId: req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    });
    res.json({ success: true, data, total: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/templates', ...staffAuth, async (req, res) => {
  try {
    const data = await propostasService.listTemplates(
      req.query.enterprise_id ? Number(req.query.enterprise_id) : undefined,
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/templates', ...staffAuth, async (req, res) => {
  try {
    const created = await propostasService.createTemplate(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/from-orcamento/:orcamentoId', ...staffAuth, async (req, res) => {
  try {
    const created = await propostasService.createFromOrcamento(
      Number(req.params.orcamentoId),
      req.user?.id,
    );
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id', optionalJwt, async (req, res) => {
  try {
    const item = await propostasService.getById(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    if (!item.isPublica && !req.user) {
      return res.status(401).json({ success: false, error: 'Autenticação necessária' });
    }
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', ...staffAuth, async (req, res) => {
  try {
    const created = await propostasService.create(req.body, req.user?.id);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await propostasService.update(Number(req.params.id), req.body, req.user?.id);
    if (!updated) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/:id/status', ...staffAuth, async (req, res) => {
  try {
    const updated = await propostasService.changeStatus(
      Number(req.params.id),
      req.body.status,
      req.user?.id,
    );
    if (!updated) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/:id', ...agentAuth, async (req, res) => {
  try {
    const deleted = await propostasService.remove(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id/chat', optionalJwt, async (req, res) => {
  try {
    const messages = await propostasService.listChat(Number(req.params.id));
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/chat', optionalJwt, async (req, res) => {
  try {
    const saved = await propostasService.addChatMessage(Number(req.params.id), req.body);
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:id/hitl', optionalJwt, async (req, res) => {
  try {
    const state = await propostasService.getHitlState(Number(req.params.id));
    if (!state) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/hitl/request', optionalJwt, async (req, res) => {
  try {
    const state = await propostasService.requestHitl(
      Number(req.params.id),
      req.body.clientName ?? req.user?.name,
    );
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/hitl/takeover', ...agentAuth, async (req, res) => {
  try {
    const state = await propostasService.takeoverHitl(Number(req.params.id), {
      id: req.user!.id,
      name: req.user!.name,
    });
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/hitl/release', ...agentAuth, async (req, res) => {
  try {
    const state = await propostasService.releaseHitl(Number(req.params.id), req.user?.id);
    res.json({ success: true, data: state });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;

module.exports = router;
