import { Router } from 'express';
import { authenticateJwt, optionalJwt, requireRole, staffAuth } from '../../../middleware/auth.middleware';
import { publicLimiter } from '../../../middleware/public-limiter';
import { requireTurnstile } from '../../../middleware/turnstile.middleware';
import { propostasService } from '../services/propostas.service';
import { recordPropostaGerada } from '../metrics';
import { PropostaExpiradaError, isPropostaExpiradaError } from '../proposta-validade';
import {
  recotarPropostaPorToken,
  isPropostaRecotacaoError,
} from '../services/proposta-recotacao.service';
import { gerarQrVoucherPng, isQrVoucherError } from '../services/qr-voucher.service';

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

router.get('/templates/:templateId', ...staffAuth, async (req, res) => {
  try {
    const item = await propostasService.getTemplate(Number(req.params.templateId));
    if (!item) return res.status(404).json({ success: false, error: 'Template não encontrado' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.put('/templates/:templateId', ...staffAuth, async (req, res) => {
  try {
    const updated = await propostasService.updateTemplate(Number(req.params.templateId), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Template não encontrado' });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.delete('/templates/:templateId', ...staffAuth, async (req, res) => {
  try {
    const deleted = await propostasService.deleteTemplate(Number(req.params.templateId));
    if (!deleted) return res.status(404).json({ success: false, error: 'Template não encontrado' });
    res.json({ success: true, data: deleted });
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
    recordPropostaGerada('from_orcamento');
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:token/og', publicLimiter, async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token.startsWith('rt-')) return next();
    const { buildPropostaOgByToken } = await import('../services/proposta-og.service');
    const data = await buildPropostaOgByToken(token);
    if (!data) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:token/recotar', publicLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || /^\d+$/.test(token)) {
      return res.status(400).json({ success: false, error: 'Token público inválido' });
    }

    const data = await recotarPropostaPorToken(token);
    res.status(201).json({ success: true, data });
  } catch (error) {
    if (isPropostaRecotacaoError(error)) {
      const err = error as Error & { statusCode?: number };
      return res.status(err.statusCode ?? 403).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:token/vouchers/:voucherId/qr.png', publicLimiter, async (req, res) => {
  try {
    const { token, voucherId } = req.params;
    if (!token || /^\d+$/.test(token)) {
      return res.status(400).json({ success: false, error: 'Token público inválido' });
    }

    const png = await gerarQrVoucherPng(token, voucherId);
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'private, max-age=300');
    res.send(png);
  } catch (error) {
    if (isQrVoucherError(error)) {
      const err = error as Error & { statusCode?: number };
      return res.status(err.statusCode ?? 403).json({ success: false, error: err.message });
    }
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/:token/validade', publicLimiter, optionalJwt, async (req, res) => {
  try {
    const { cotacaoPublicaService } = await import('../../cotacao-publica/services/cotacao-publica.service');
    const data = await cotacaoPublicaService.getValidadeByToken(req.params.token);
    if (!data) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:token/eventos', publicLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || /^\d+$/.test(token)) {
      return res.status(400).json({ success: false, error: 'Token público inválido' });
    }

    const {
      resolvePropostaPublicaByToken,
      registrarEventosCinematicos,
    } = await import('../services/proposta-cinematic-events.service');

    const resolved = await resolvePropostaPublicaByToken(token);
    if (resolved.kind === 'not_found') {
      return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    }
    if (resolved.kind === 'forbidden') {
      return res.status(403).json({ success: false, error: 'Proposta não é pública' });
    }

    const body = req.body ?? {};
    const data = await registrarEventosCinematicos(resolved.propostaId, {
      session_id: String(body.session_id ?? ''),
      tempo_pagina_segundos: body.tempo_pagina_segundos,
      scroll: body.scroll,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/visualizacao', optionalJwt, async (req, res) => {
  try {
    const data = await propostasService.registrarVisualizacao(Number(req.params.id), req.user?.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/revelar-comparativo', ...staffAuth, async (req, res) => {
  try {
    const data = await propostasService.revelarComparativoManual(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/aprovacao/solicitar', ...staffAuth, async (req, res) => {
  try {
    const { solicitarAlteracao } = await import('../aprovacao');
    const data = await solicitarAlteracao(Number(req.params.id), {
      id: req.user!.id,
      role: req.user!.role ?? 'user',
    });
    res.json({ success: true, data });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 400).json({ success: false, error: err.message });
  }
});

router.post('/:id/aprovacao/aprovar', ...staffAuth, async (req, res) => {
  try {
    const { aprovar } = await import('../aprovacao');
    const { hasMinRole } = await import('../rbac');
    if (!hasMinRole(req.user?.role, 'supervisor')) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    const data = await aprovar(Number(req.params.id), {
      id: req.user!.id,
      role: req.user!.role ?? 'admin',
    });
    res.json({ success: true, data });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 400).json({ success: false, error: err.message });
  }
});

router.post('/:id/aprovacao/negar', ...staffAuth, async (req, res) => {
  try {
    const { negar } = await import('../aprovacao');
    const { hasMinRole } = await import('../rbac');
    if (!hasMinRole(req.user?.role, 'supervisor')) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }
    const data = await negar(Number(req.params.id), {
      id: req.user!.id,
      role: req.user!.role ?? 'admin',
    }, String(req.body.motivo ?? ''));
    res.json({ success: true, data });
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    res.status(err.statusCode ?? 400).json({ success: false, error: err.message });
  }
});

router.post('/:id/indicacao', optionalJwt, async (req, res) => {
  try {
    const { registrarIndicacao } = await import('../mgm');
    const item = await propostasService.getById(Number(req.params.id));
    if (!item?.tokenPublico) {
      return res.status(400).json({ success: false, error: 'Proposta sem token público' });
    }
    const data = await registrarIndicacao({
      indicadorId: Number(req.body.indicadorId),
      tokenProposta: item.tokenPublico,
      canal: req.body.canal,
      indicadoEmail: req.body.indicadoEmail,
      indicadoTelefone: req.body.indicadoTelefone,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/ia-sugerir', ...staffAuth, async (req, res) => {
  try {
    const { sugerirPacoteFromProposta } = await import('../ia-copiloto');
    const data = await sugerirPacoteFromProposta(Number(req.params.id));
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/pacotes-template/from-proposta', ...staffAuth, async (req, res) => {
  try {
    const { criarTemplateFromProposta } = await import('../ia-copiloto');
    const data = await criarTemplateFromProposta(
      Number(req.params.id),
      req.body.enterpriseId ? Number(req.body.enterpriseId) : undefined,
    );
    res.status(201).json({ success: true, data });
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

router.get('/:id/chat', publicLimiter, optionalJwt, async (req, res) => {
  try {
    const messages = await propostasService.listChat(Number(req.params.id));
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/:id/chat', publicLimiter, requireTurnstile, optionalJwt, async (req, res) => {
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

router.post('/:id/responder', publicLimiter, requireTurnstile, optionalJwt, async (req, res) => {
  try {
    const action = req.body.action as 'accept' | 'reject';
    if (!action || !['accept', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'action deve ser accept ou reject' });
    }
    const updated = await propostasService.respondPublic(
      Number(req.params.id),
      action,
      req.body.clientName ?? req.user?.name,
    );
    const payload: Record<string, unknown> = { success: true, data: updated };
    if (action === 'accept' && updated?.tokenPublico) {
      payload.proximoDestino = `/roteiro/${updated.tokenPublico}`;
    }
    res.json(payload);
  } catch (error) {
    if (isPropostaExpiradaError(error)) {
      return res.status(403).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

export default router;

module.exports = router;
