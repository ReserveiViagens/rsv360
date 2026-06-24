import { Router } from 'express';
import { staffAuth } from '../../../middleware/auth.middleware';
import { financeiroService } from '../services/financeiro.service';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ module: 'financeiro', status: 'ok' });
});

router.get('/', ...staffAuth, async (_req, res) => {
  try {
    const summary = await financeiroService.listSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/dashboard', ...staffAuth, async (_req, res) => {
  try {
    const summary = await financeiroService.listSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/fluxo-caixa', ...staffAuth, async (req, res) => {
  try {
    const inicio = req.query.inicio ? new Date(String(req.query.inicio)) : undefined;
    const fim = req.query.fim ? new Date(String(req.query.fim)) : undefined;
    const data = await financeiroService.getFluxoCaixa(inicio, fim);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/transacoes', ...staffAuth, async (req, res) => {
  try {
    const data = await financeiroService.listTransacoes({
      tipo: req.query.tipo as string | undefined,
      status: req.query.status as string | undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/transacoes/:id', ...staffAuth, async (req, res) => {
  try {
    const item = await financeiroService.getTransacao(Number(req.params.id));
    if (!item) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/transacoes', ...staffAuth, async (req, res) => {
  try {
    const created = await financeiroService.createTransacao(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.put('/transacoes/:id', ...staffAuth, async (req, res) => {
  try {
    const updated = await financeiroService.updateTransacao(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/transacoes/:id', ...staffAuth, async (req, res) => {
  try {
    const deleted = await financeiroService.deleteTransacao(Number(req.params.id));
    if (!deleted) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/contas-receber', ...staffAuth, async (req, res) => {
  try {
    const data = await financeiroService.listContasReceber(req.query.status as string | undefined);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/contas-receber', ...staffAuth, async (req, res) => {
  try {
    const created = await financeiroService.createContaReceber(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/contas-receber/:id/receber', ...staffAuth, async (req, res) => {
  try {
    const updated = await financeiroService.receberConta(Number(req.params.id), String(req.body.valorRecebido));
    if (!updated) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/contas-pagar', ...staffAuth, async (req, res) => {
  try {
    const data = await financeiroService.listContasPagar(req.query.status as string | undefined);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/contas-pagar', ...staffAuth, async (req, res) => {
  try {
    const created = await financeiroService.createContaPagar(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/contas-pagar/:id/pagar', ...staffAuth, async (req, res) => {
  try {
    const updated = await financeiroService.pagarConta(Number(req.params.id), String(req.body.valorPago));
    if (!updated) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;
module.exports = router;
