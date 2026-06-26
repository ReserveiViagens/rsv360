import { z } from 'zod';
import type { OfertaNormalizada } from '@rsv360/shared';

export const ofertaSchema = z.object({
  fornecedor: z.string(),
  tipo: z.enum(['hospedagem', 'ingresso', 'transporte']),
  titulo: z.string().min(1),
  preco: z.number().positive(),
  moeda: z.literal('BRL'),
  imagens: z.array(z.string().url()),
  descricao: z.string(),
  fonte: z.string().url(),
  capturadoEm: z.string().datetime(),
});

export type OfertaValidada = z.infer<typeof ofertaSchema>;

/** Guard compile-time: Zod output deve casar com OfertaNormalizada do shared. */
type _Compat = OfertaNormalizada extends OfertaValidada ? true : never;
type _CompatReverse = OfertaValidada extends OfertaNormalizada ? true : never;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _assertCompat: [_Compat, _CompatReverse] = [true, true];
