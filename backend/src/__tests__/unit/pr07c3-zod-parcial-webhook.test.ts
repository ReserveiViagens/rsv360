import { gerarPropostaBodySchema } from '../../../../server/modules/cotacao-publica/schemas/gerar-proposta.schema';
import { roteiroAnalyticsBatchSchema } from '../../../../server/modules/roteiro-analytics/schemas/roteiro-analytics.schema';
import {
  comissoesConfigSchema,
  comissoesSugestaoIaSchema,
} from '../../../../server/modules/comissoes/schema';
import {
  configPropostaSchema,
  ofertaSchema,
} from '../../../../server/modules/fornecedores-hub/schema';
import { z } from 'zod';
import {
  MpWebhookBodySchema,
  StripeWebhookEventSchema,
} from '../../../server/modules/payments/schemas/webhook-payload.schema';
import { parsePositiveIntId } from '../../../../server/lib/parse-id';

const perguntarSchema = z
  .object({
    pergunta: z.string().min(1).max(500),
    papel: z.enum(['staff', 'anfitriao', 'ambos']).optional(),
  })
  .strict();

describe('PR-07c3 PARCIAL→strict + webhook Zod + shared parse-id', () => {
  it('rejects isAdmin on gerarProposta (.strict, was passthrough)', () => {
    const parsed = gerarPropostaBodySchema.safeParse({
      checkIn: '2026-08-10',
      checkOut: '2026-08-12',
      name: 'Ana',
      phone: '11999999999',
      isAdmin: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects extras on roteiro analytics batch', () => {
    const parsed = roteiroAnalyticsBatchSchema.safeParse({
      session_id: 's1',
      events: [{ event_type: 'page_view' }],
      role: 'admin',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects password on comissoes config', () => {
    const parsed = comissoesConfigSchema.safeParse({
      comissoesModuloAtivo: true,
      taxaPlataformaPct: 20,
      taxaCorretorPct: 5,
      password: 'x',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects $ne-shaped contexto on comissoes IA', () => {
    const parsed = comissoesSugestaoIaSchema.safeParse({
      objetivo: 'padrao',
      contexto: { $ne: null },
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects isAdmin on fornecedores oferta + configProposta', () => {
    expect(
      ofertaSchema.safeParse({
        fornecedor: 'x',
        tipo: 'hospedagem',
        titulo: 'Hotel',
        preco: 100,
        moeda: 'BRL',
        imagens: ['https://example.com/a.jpg'],
        descricao: 'd',
        fonte: 'https://example.com',
        capturadoEm: new Date().toISOString(),
        isAdmin: true,
      }).success,
    ).toBe(false);
    expect(
      configPropostaSchema.safeParse({
        permitirApenasHotel: true,
        disparoAutomatizadoCaldasAi: false,
        delayDisparoMinutos: 0,
        isAdmin: true,
      }).success,
    ).toBe(false);
  });

  it('rejects extras on agentes perguntar schema', () => {
    expect(perguntarSchema.safeParse({ pergunta: 'oi', role: 'admin' }).success).toBe(false);
  });

  it('rejects isAdmin on Stripe/MP webhook payloads after shape parse', () => {
    expect(
      StripeWebhookEventSchema.safeParse({
        id: 'evt_1',
        type: 'payment_intent.succeeded',
        isAdmin: true,
      }).success,
    ).toBe(false);
    expect(
      MpWebhookBodySchema.safeParse({
        id: '123',
        type: 'payment',
        data: { id: '456' },
        role: 'admin',
      }).success,
    ).toBe(false);
  });

  it('accepts valid MP body and shared parsePositiveIntId', () => {
    expect(
      MpWebhookBodySchema.safeParse({
        id: 'evt-1',
        type: 'payment',
        data: { id: 'pay-1' },
      }).success,
    ).toBe(true);
    expect(parsePositiveIntId('12')).toBe(12);
    expect(() => parsePositiveIntId('abc')).toThrow();
  });
});
