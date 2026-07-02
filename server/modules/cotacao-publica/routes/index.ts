import { Router } from 'express';
import { meetsWizardMinNights, WIZARD_MIN_NIGHTS } from '@rsv360/shared';
import { cotacaoPublicaService } from '../services/cotacao-publica.service';
import { registrarLeadAbandono } from '../services/lead-abandono.service';
import { isPropostaExpiradaError } from '../../propostas/proposta-validade';
import { publicLimiter } from '../../../middleware/public-limiter';
import { requireTurnstile } from '../../../middleware/turnstile.middleware';

const router = Router();

function statusForGerarPropostaError(message: string): number {
  if (message.includes('Muitas solicitações')) return 429;
  if (message.includes('Aguarde alguns segundos')) return 429;
  if (message === 'Dados incompletos') return 400;
  if (message.includes('Estadia mínima de')) return 400;
  return 500;
}

router.get('/health', (_req, res) => {
  res.json({ module: 'cotacao-publica', status: 'ok' });
});

router.post('/buscar-ofertas', async (req, res) => {
  try {
    const { checkin, checkout, hospedes } = req.body ?? {};
    if (!checkin || !checkout || !hospedes) {
      return res.status(400).json({ success: false, error: 'checkin, checkout e hospedes são obrigatórios' });
    }
    if (!meetsWizardMinNights(String(checkin), String(checkout))) {
      return res.status(400).json({
        success: false,
        error: `Estadia mínima de ${WIZARD_MIN_NIGHTS} noites para reservar.`,
      });
    }
    const { fornecedoresCotacaoHub } = require('../../fornecedores-hub/cotacao-orchestrator');
    const data = await fornecedoresCotacaoHub.processarCotacao({
      checkin: String(checkin),
      checkout: String(checkout),
      hospedes: Number(hospedes) || 1,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/lead-abandono', publicLimiter, async (req, res) => {
  try {
    const body = req.body ?? {};
    const passo = Number(body.passo);
    if (!Number.isFinite(passo) || passo < 0 || passo > 7) {
      return res.status(400).json({ success: false, error: 'passo inválido' });
    }
    const data = await registrarLeadAbandono({
      passo,
      passoNome: body.passoNome ? String(body.passoNome) : undefined,
      whatsapp: body.whatsapp ? String(body.whatsapp) : null,
      nome: body.nome ? String(body.nome) : null,
      hotelId: body.hotelId ? String(body.hotelId) : null,
      checkin: body.checkin ? String(body.checkin) : null,
      checkout: body.checkout ? String(body.checkout) : null,
      adults: body.adults != null ? Number(body.adults) : null,
      children: body.children != null ? Number(body.children) : null,
      ref: body.ref ? String(body.ref) : null,
      canal: body.canal ? String(body.canal) : null,
      consentimentoLgpd: body.consentimentoLgpd === true,
      sessaoId: body.sessaoId ? String(body.sessaoId) : null,
      variant: body.variant ? String(body.variant) : undefined,
      payload: typeof body.payload === 'object' && body.payload ? body.payload : undefined,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/gerar-proposta', publicLimiter, requireTurnstile, async (req, res) => {
  console.log('[cotacao-publica] Payload recebido:', req.body);
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
    const data = await cotacaoPublicaService.gerarProposta(req.body, ip);
    res.status(201).json({ success: true, data });
  } catch (error) {
    const err = error as Error;
    console.error('[cotacao-publica] gerar-proposta', err);
    const status = statusForGerarPropostaError(err.message);
    res.status(status).json({ success: false, error: err.message });
  }
});

async function respondPropostaByToken(
  res: import('express').Response,
  token: string,
): Promise<void> {
  const data = await cotacaoPublicaService.getPropostaByToken(token);
  if (!data) {
    res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    return;
  }
  res.json({ success: true, data });
}

/** Alias curto `/p/:token` (mesmo payload de `/proposta/:token`). */
router.get('/p/:token', publicLimiter, async (req, res) => {
  try {
    await respondPropostaByToken(res, req.params.token);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/proposta/:token', publicLimiter, async (req, res) => {
  try {
    await respondPropostaByToken(res, req.params.token);
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/proposta/:token/validade', publicLimiter, async (req, res) => {
  try {
    const data = await cotacaoPublicaService.getValidadeByToken(req.params.token);
    if (!data) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.post('/proposta/:token/aceitar', publicLimiter, requireTurnstile, async (req, res) => {
  try {
    const data = await cotacaoPublicaService.aceitarPropostaByToken(
      req.params.token,
      req.body?.clientName,
    );
    if (!data) return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    res.json({ success: true, status: 'sucesso', data });
  } catch (error) {
    if (isPropostaExpiradaError(error)) {
      return res.status(403).json({ success: false, error: error.message });
    }
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

router.get('/roteiro/:token/verificar', publicLimiter, async (req, res) => {
  try {
    const data = await cotacaoPublicaService.verificarRoteiroByToken(req.params.token);
    if (!data) return res.status(404).json({ success: false, error: 'Token não encontrado' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

router.get('/roteiro/:token', publicLimiter, async (req, res) => {
  try {
    const data = await cotacaoPublicaService.getRoteiroByToken(req.params.token);
    if (!data) return res.status(404).json({ success: false, error: 'Roteiro não encontrado' });
    res.json({ success: true, data });
  } catch (error) {
    const err = error as Error & { statusCode?: number; propostaStatus?: string };
    if (err.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: err.message,
        status: err.propostaStatus,
        redirect: `/proposta/${req.params.token}`,
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/roteiro/:token/evento', publicLimiter, async (req, res) => {
  try {
    const { tempoMs, scrollDepthPct } = req.body ?? {};
    const data = await cotacaoPublicaService.registrarEngagementRoteiro(req.params.token, {
      tempoMs,
      scrollDepthPct,
    });
    if (!data) return res.status(404).json({ success: false, error: 'Roteiro não encontrado' });
    res.status(201).json({ success: true, data });
  } catch (error) {
    const err = error as Error & { statusCode?: number; propostaStatus?: string };
    if (err.statusCode === 403) {
      return res.status(403).json({
        success: false,
        error: err.message,
        status: err.propostaStatus,
      });
    }
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
module.exports = router;
