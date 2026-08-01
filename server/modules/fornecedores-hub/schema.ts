import { z } from 'zod';
import type { OfertaNormalizada } from '@rsv360/shared';

export const ofertaSchema = z
  .object({
    fornecedor: z.string(),
    tipo: z.enum(['hospedagem', 'ingresso', 'transporte']),
    titulo: z.string().min(1),
    preco: z.number().positive(),
    moeda: z.literal('BRL'),
    imagens: z.array(z.string().url()),
    descricao: z.string(),
    fonte: z.string().url(),
    capturadoEm: z.string().datetime(),
  })
  .strict();

/**
 * Contrato de saída = shared OfertaNormalizada.
 * Não usar z.infer aqui: com backend tsconfig strict:false (strictNullChecks off),
 * Zod marca todos os campos como opcionais e quebra o guard bidirecional.
 * Validação runtime continua em ofertaSchema (campos required).
 */
export type OfertaValidada = OfertaNormalizada;

/** Contrato estrito para ofertas do wizard / hub de cotação (PR2). */
export const ofertaCotacaoSchema = z
  .object({
    fornecedorId: z.string().uuid(),
    nomeFornecedor: z.string(),
    tipo: z.enum(['hospedagem', 'ingresso', 'transporte', 'kit']),
    titulo: z.string().min(3),
    descricao: z.string(),
    valorTotal: z.number().positive(),
    moeda: z.literal('BRL').default('BRL'),
    noites: z.number().int().positive().optional(),
    imagens: z.array(z.string().url()).optional(),
    linkReserva: z.string().url().optional(),
    disponibilidade: z.number().int().nonnegative().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export type OfertaCotacao = z.infer<typeof ofertaCotacaoSchema>;

export const configPropostaSchema = z
  .object({
    permitirApenasHotel: z.boolean(),
    disparoAutomatizadoCaldasAi: z.boolean(),
    delayDisparoMinutos: z.number().int().nonnegative(),
    validadeCotacaoHoras: z.number().int().min(1).default(48),
    urgenciaEstilo: z.enum(['countdown', 'badge', 'nenhum']).default('countdown'),
    avisoExpiracaoHoras: z.number().int().min(0).default(2),
  })
  .strict();

export type ConfigProposta = z.infer<typeof configPropostaSchema>;

export const CONFIG_PROPOSTA_PADRAO: ConfigProposta = {
  permitirApenasHotel: true,
  disparoAutomatizadoCaldasAi: true,
  delayDisparoMinutos: 120,
  validadeCotacaoHoras: 48,
  urgenciaEstilo: 'countdown',
  avisoExpiracaoHoras: 2,
};

/**
 * Guard compile-time: shape Zod (com required restaurado) ↔ OfertaNormalizada.
 * Com backend tsconfig strict:false, z.infer marca campos required do Zod como opcionais;
 * o mapped `-?` restaura a obrigatoriedade para a comparação (sem afrouxar runtime).
 */
type _ZodOut = z.infer<typeof ofertaSchema>;
type _ZodRequired = { [K in keyof _ZodOut]-?: _ZodOut[K] };
type _Compat = _ZodRequired extends OfertaNormalizada ? true : never;
type _CompatReverse = OfertaNormalizada extends _ZodRequired ? true : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _assertCompat: [_Compat, _CompatReverse] = [true, true];
