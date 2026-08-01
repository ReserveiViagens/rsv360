import { z } from 'zod';

export {
  parseNonNegativeIntParam,
  parsePositiveIntId,
  parsePositiveIntParam,
  PositiveIntIdParamSchema,
} from '../../../lib/parse-id';

const money = z.union([z.coerce.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]);
const dateLike = z.union([z.string().max(64), z.coerce.date()]);
const jsonLoose = z.record(z.unknown()).nullable().optional();

export const CampanhaWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    nome: z.string().min(1).max(255).optional(),
    tipo: z.string().max(50).optional().nullable(),
    status: z.string().max(30).optional(),
    orcamento: money.optional().nullable(),
    gastoAtual: money.optional().nullable(),
    inicio: dateLike.optional().nullable(),
    fim: dateLike.optional().nullable(),
    canais: jsonLoose,
    metadata: jsonLoose,
  })
  .strict();

export const CampanhaCreateSchema = CampanhaWriteSchema.extend({
  nome: z.string().min(1).max(255),
}).strict();

export const CampanhaUpdateSchema = CampanhaWriteSchema;

export const CupomWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    codigo: z.string().min(1).max(50).optional(),
    tipoDesconto: z.string().max(20).optional(),
    valorDesconto: money.optional(),
    usoMaximo: z.coerce.number().int().nonnegative().optional().nullable(),
    usoAtual: z.coerce.number().int().nonnegative().optional().nullable(),
    validoDe: dateLike.optional().nullable(),
    validoAte: dateLike.optional().nullable(),
    isActive: z.boolean().optional(),
    metadata: jsonLoose,
  })
  .strict();

export const CupomCreateSchema = CupomWriteSchema.extend({
  codigo: z.string().min(1).max(50),
  valorDesconto: money,
}).strict();

export const CupomUpdateSchema = CupomWriteSchema;

export const CupomValidarSchema = z
  .object({
    codigo: z.string().min(1).max(50),
  })
  .strict();

export const CupomUsoSchema = z
  .object({
    clienteEmail: z.string().email().max(255).optional().nullable(),
    bookingId: z.coerce.number().int().positive().optional().nullable(),
    valorDesconto: money,
  })
  .strict();
