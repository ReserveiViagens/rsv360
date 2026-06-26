import { Router } from 'express';
import { authenticateJwt, requireRole } from '../../../middleware/auth.middleware';
import { buscarPrecosConcorrencia } from '../hub';
import { fornecedoresApiService } from '../services/fornecedores-api.service';

const router = Router();
const adminAuth = [authenticateJwt, requireRole('admin')];

router.get('/health', (_req, res) => {
  res.json({ module: 'fornecedores-hub', status: 'ok' });
});

router.get('/', ...adminAuth, async (_req, res) => {
  try {
    const data = await fornecedoresApiService.list();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/', ...adminAuth, async (req, res) => {
  try {
    const { nome, tipo, endpoint, apiKey, adapter, prioridade, timeoutMs, ativo, config } = req.body;
    if (!nome || !tipo || !endpoint || !apiKey || !adapter) {
      return res.status(400).json({ success: false, error: 'Campos obrigatórios ausentes' });
    }
    const created = await fornecedoresApiService.create({
      nome,
      tipo,
      endpoint,
      apiKey,
      adapter,
      prioridade,
      timeoutMs,
      ativo,
      config,
    });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.patch('/:id', ...adminAuth, async (req, res) => {
  try {
    const updated = await fornecedoresApiService.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Fornecedor API não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/buscar', ...adminAuth, async (req, res) => {
  try {
    const destino = String(req.body?.destino ?? '');
    if (!destino) {
      return res.status(400).json({ success: false, error: 'destino obrigatório' });
    }
    const ofertas = await buscarPrecosConcorrencia(destino, req.body?.params ?? {});
    res.json({ success: true, data: ofertas });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
