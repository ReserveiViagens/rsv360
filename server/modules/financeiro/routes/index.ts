import { Router, type Response } from 'express';
import { ZodError } from 'zod';
import { staffAuth } from '../../../middleware/auth.middleware';
import { financeiroService } from '../services/financeiro.service';
import {
  ContaPagarCreateSchema,
  ContaPagarPagarSchema,
  ContaReceberCreateSchema,
  ContaReceberReceberSchema,
  TransacaoCreateSchema,
  TransacaoUpdateSchema,
  parsePositiveIntId,
} from '../schemas/financeiro-write.schema';
import { badRequest as badRequestShared } from '../../../lib/bad-request';

const router = Router();

function badRequest(res: import('express').Response, error: unknown) {
  return badRequestShared(res, error, { successEnvelope: true });
}

function asRecord(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body };
  if (out.valor !== undefined) out.valor = String(out.valor);
  if (out.valorRecebido !== undefined) out.valorRecebido = String(out.valorRecebido);
  if (out.valorPago !== undefined) out.valorPago = String(out.valorPago);
  return out;
}

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
    const id = parsePositiveIntId(req.params.id);
    const item = await financeiroService.getTransacao(id);
    if (!item) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: item });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/transacoes', ...staffAuth, async (req, res) => {
  try {
    const body = TransacaoCreateSchema.parse(req.body);
    const created = await financeiroService.createTransacao(asRecord(body));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.put('/transacoes/:id', ...staffAuth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = TransacaoUpdateSchema.parse(req.body);
    const updated = await financeiroService.updateTransacao(id, asRecord(body));
    if (!updated) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    return badRequest(res, error);
  }
});

/** SKIP body: delete has no req.body mass-assignment surface. */
router.delete('/transacoes/:id', ...staffAuth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const deleted = await financeiroService.deleteTransacao(id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Transação não encontrada' });
    res.json({ success: true, data: deleted });
  } catch (error) {
    return badRequest(res, error);
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
    const body = ContaReceberCreateSchema.parse(req.body);
    const created = await financeiroService.createContaReceber(asRecord(body));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/contas-receber/:id/receber', ...staffAuth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = ContaReceberReceberSchema.parse(req.body);
    const updated = await financeiroService.receberConta(id, String(body.valorRecebido));
    if (!updated) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    return badRequest(res, error);
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
    const body = ContaPagarCreateSchema.parse(req.body);
    const created = await financeiroService.createContaPagar(asRecord(body));
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    return badRequest(res, error);
  }
});

router.post('/contas-pagar/:id/pagar', ...staffAuth, async (req, res) => {
  try {
    const id = parsePositiveIntId(req.params.id);
    const body = ContaPagarPagarSchema.parse(req.body);
    const updated = await financeiroService.pagarConta(id, String(body.valorPago));
    if (!updated) return res.status(404).json({ success: false, error: 'Conta não encontrada' });
    res.json({ success: true, data: updated });
  } catch (error) {
    return badRequest(res, error);
  }
});

export default router;
module.exports = router;
