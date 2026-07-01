import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import { gerarTokenPublicoProposta } from '../../../lib/proposta-token';
import { orcamentosService } from '../../orcamentos/services/orcamentos.service';
import { propostasService } from '../../propostas/services/propostas.service';
import {
  buildOrcamentoItens,
  montarDailySchedule,
  type GerarPropostaPayload,
} from './montar-roteiro';
import { fireHotLeadNotify } from './hot-lead-notify.service';
import { buildValidadePayload, PropostaExpiradaError } from '../../propostas/proposta-validade';
import { aplicarValidadeProposta } from '../../propostas/aplicar-validade-proposta';
import { recordPropostaGerada, recordRoteiroView } from '../../propostas/metrics';

const attemptDebounceMap = new Map<string, number>();
const successCooldownMap = new Map<string, number>();
const ATTEMPT_DEBOUNCE_MS = 3_000;
const SUCCESS_COOLDOWN_MS = 45_000;

function checkAttemptDebounce(ip: string): boolean {
  const now = Date.now();
  const last = attemptDebounceMap.get(ip) ?? 0;
  if (now - last < ATTEMPT_DEBOUNCE_MS) return false;
  attemptDebounceMap.set(ip, now);
  return true;
}

function checkSuccessCooldown(ip: string): boolean {
  const now = Date.now();
  const last = successCooldownMap.get(ip) ?? 0;
  if (now - last < SUCCESS_COOLDOWN_MS) return false;
  return true;
}

function markSuccessCooldown(ip: string): void {
  successCooldownMap.set(ip, Date.now());
}

export class CotacaoPublicaService {
  async gerarProposta(payload: GerarPropostaPayload, clientIp = 'unknown') {
    if (!checkAttemptDebounce(clientIp)) {
      throw new Error('Aguarde alguns segundos antes de tentar novamente.');
    }

    if (!payload.checkIn || !payload.checkOut || !payload.name || !payload.phone) {
      throw new Error('Dados incompletos');
    }

    if (!checkSuccessCooldown(clientIp)) {
      throw new Error('Muitas solicitações. Aguarde 1 minuto.');
    }

    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(payload.checkOut).getTime() - new Date(payload.checkIn).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const hotel = payload.catalog?.hotels?.find(
      (h) => h.id === payload.hotelId || String(h.id) === String(payload.hotelId),
    );
    const titulo = `Cotação Caldas Novas — ${payload.name}`;
    const dailySchedule = montarDailySchedule(payload);
    const itensData = buildOrcamentoItens(payload);

    const subtotal = itensData.reduce((sum, i) => sum + parseFloat(i.precoTotal), 0);
    const total = payload.total ?? subtotal;

    const orcamento = await orcamentosService.create({
      titulo,
      clienteNome: payload.name,
      clienteEmail: payload.email ?? null,
      clienteTelefone: payload.phone,
      status: 'sent',
      subtotal: String(subtotal),
      total: String(total),
      notas: payload.notes ?? null,
      metadata: {
        destino: 'Caldas Novas',
        wizardProfile: payload.profile,
        checkIn: payload.checkIn,
        checkOut: payload.checkOut,
        adults: payload.adults,
        children: payload.children,
        paymentMethod: payload.paymentMethod,
        origem: 'cotacao-wizard-v2',
      },
    });

    for (const item of itensData) {
      await orcamentosService.addItem(orcamento.id, item);
    }

    const proposta = await propostasService.createFromOrcamento(orcamento.id, undefined, {
      destino: 'Caldas Novas',
      skipValidade: true,
    });

    try {
      if (payload.hotelId) {
        const { reservarVaga } = require('../../fornecedores-hub/services/reservar-vaga');
        await reservarVaga({
          parceiroId: String(payload.hotelId),
          ofertaId: String(payload.hotelId),
          propostaId: proposta.id,
        });
      }
    } catch (lockErr) {
      console.warn('[cotacao-publica] reservarVaga ignorado:', (lockErr as Error).message);
    }

    const token = gerarTokenPublicoProposta();
    const publicBase =
      process.env.COTACAO_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';
    const urlPublica = `${publicBase.replace(/\/$/, '')}/proposta/${token}`;

    const conteudo = {
      itens: itensData,
      dailySchedule,
      inclusions: {
        hotel: hotel?.title,
        nights,
        guests: payload.adults + payload.children,
        breakfast: payload.breakfastId,
        profile: payload.profile,
        previewTitle: 'Caldas Novas Premium',
        destination: 'Caldas Novas, GO',
      },
      media: {
        heroImage:
          hotel?.images?.[0] ??
          (Array.isArray(hotel?.metadata?.images) ? hotel.metadata.images[0] : undefined) ??
          dailySchedule[0]?.image,
      },
      origem: 'cotacao-wizard-v2',
    };

    await db
      .update(propostas)
      .set({
        tokenPublico: token,
        isPublica: true,
        status: 'sent',
        conteudo,
        metadata: {
          hitlMode: 'ai',
          wizardProfile: payload.profile,
          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          adults: payload.adults,
          children: payload.children,
          hotelId: payload.hotelId != null ? String(payload.hotelId) : undefined,
        },
        updatedAt: new Date(),
      })
      .where(eq(propostas.id, proposta.id));

    const validoAte = await aplicarValidadeProposta(proposta.id);

    await propostasService.registrarVisualizacao(proposta.id);

    fireHotLeadNotify({
      propostaId: proposta.id,
      clienteNome: payload.name,
      clienteTelefone: payload.phone,
      hotel: hotel?.title ?? 'Caldas Novas',
      datas: `${payload.checkIn} → ${payload.checkOut}`,
      valor: total,
      urlPublica,
      profile: payload.profile ?? 'casal',
    });

    markSuccessCooldown(clientIp);
    recordPropostaGerada('wizard');

    return {
      propostaId: proposta.id,
      tokenPublico: token,
      validoAte: validoAte.toISOString(),
      url: `/proposta/${token}`,
      urlPublica,
    };
  }

  async getPropostaByToken(token: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;

    await propostasService.registrarVisualizacao(row.id);

    return {
      id: row.id,
      titulo: row.titulo,
      clienteNome: row.clienteNome,
      valorTotal: row.valorTotal,
      moeda: row.moeda,
      status: row.status,
      validoAte: row.validoAte,
      conteudo: row.conteudo,
      metadata: row.metadata,
      tokenPublico: row.tokenPublico,
      comparativoCache: row.comparativoCache ?? undefined,
      exibirComparativo: row.exibirComparativo ?? false,
    };
  }

  async getValidadeByToken(token: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;
    return buildValidadePayload(row);
  }

  async aceitarPropostaByToken(token: string, clientName?: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;

    const updated = await propostasService.respondPublic(row.id, 'accept', clientName);
    return {
      proposta: updated,
      proximoDestino: `/roteiro/${token}`,
    };
  }

  async getRoteiroByToken(token: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;

    const statusPermitido = ['accepted', 'paid'];
    if (!statusPermitido.includes(row.status)) {
      const err = new Error('Acesso ao roteiro premium requer proposta aceita ou paga');
      (err as Error & { statusCode: number; propostaStatus: string }).statusCode = 403;
      (err as Error & { propostaStatus: string }).propostaStatus = row.status;
      throw err;
    }

    await propostasService.logEvent(
      row.id,
      'roteiro_view',
      'Visualização do roteiro premium cinematográfico',
      { token, status: row.status },
    );
    recordRoteiroView();

    return {
      id: row.id,
      titulo: row.titulo,
      clienteNome: row.clienteNome,
      valorTotal: row.valorTotal,
      moeda: row.moeda,
      status: row.status,
      conteudo: row.conteudo,
      metadata: row.metadata,
      tokenPublico: row.tokenPublico,
      comparativoCache: row.comparativoCache ?? undefined,
      exibirComparativo: row.exibirComparativo ?? false,
    };
  }

  async verificarRoteiroByToken(token: string) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;

    const conteudo = row.conteudo as { inclusions?: { destination?: string } } | null;
    const destino = conteudo?.inclusions?.destination ?? 'Caldas Novas, GO';

    return {
      autentico: true,
      token: row.tokenPublico,
      titulo: row.titulo,
      destino,
      status: row.status,
      emitidoEm: row.createdAt,
      clienteNome: row.clienteNome,
      roteiroUrl: `/roteiro/${row.tokenPublico}`,
    };
  }

  async registrarEngagementRoteiro(
    token: string,
    input: { tempoMs?: number; scrollDepthPct?: number },
  ) {
    const [row] = await db.select().from(propostas).where(eq(propostas.tokenPublico, token));
    if (!row || !row.isPublica) return null;

    const statusPermitido = ['accepted', 'paid'];
    if (!statusPermitido.includes(row.status)) {
      const err = new Error('Evento de roteiro requer proposta aceita ou paga');
      (err as Error & { statusCode: number; propostaStatus: string }).statusCode = 403;
      (err as Error & { propostaStatus: string }).propostaStatus = row.status;
      throw err;
    }

    const eventos: string[] = [];
    const tempoMs =
      typeof input.tempoMs === 'number' && Number.isFinite(input.tempoMs)
        ? Math.max(0, Math.round(input.tempoMs))
        : null;
    const scrollDepthPct =
      typeof input.scrollDepthPct === 'number' && Number.isFinite(input.scrollDepthPct)
        ? Math.min(100, Math.max(0, Math.round(input.scrollDepthPct)))
        : null;

    if (tempoMs !== null) {
      await propostasService.logEvent(
        row.id,
        'tempo_pagina',
        'Tempo na página do roteiro cinematográfico',
        { tempoMs, token, scrollDepthPct },
      );
      eventos.push('tempo_pagina');
    }

    if (scrollDepthPct !== null) {
      await propostasService.logEvent(
        row.id,
        'cinematic_scroll',
        'Profundidade de scroll no roteiro cinematográfico',
        { scrollDepthPct, token, tempoMs },
      );
      eventos.push('cinematic_scroll');
    }

    return { propostaId: row.id, eventos };
  }
}

export const cotacaoPublicaService = new CotacaoPublicaService();
module.exports = { CotacaoPublicaService, cotacaoPublicaService, PropostaExpiradaError };
