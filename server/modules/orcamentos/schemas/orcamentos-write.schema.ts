import { z } from 'zod';

export {
  parsePositiveIntId,
  parsePositiveIntParam,
  PositiveIntIdParamSchema,
} from '../../../lib/parse-id';

const money = z.union([z.coerce.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]);
const dateLike = z.union([z.string().max(64), z.coerce.date()]);
const jsonLoose = z.record(z.unknown()).nullable().optional();

export const OrcamentoWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    codigo: z.string().max(50).optional().nullable(),
    titulo: z.string().min(1).max(255).optional(),
    clienteNome: z.string().min(1).max(255).optional(),
    clienteEmail: z.string().email().max(255).optional().nullable(),
    clienteTelefone: z.string().max(50).optional().nullable(),
    clienteDocumento: z.string().max(50).optional().nullable(),
    tipo: z.string().max(50).optional(),
    categoria: z.string().max(100).optional().nullable(),
    status: z.string().max(30).optional(),
    subtotal: money.optional(),
    desconto: money.optional(),
    descontoTipo: z.string().max(20).optional().nullable(),
    impostos: money.optional(),
    total: money.optional(),
    moeda: z.string().length(3).optional(),
    validoAte: dateLike.optional().nullable(),
    notas: z.string().max(10000).optional().nullable(),
    metadata: jsonLoose,
  })
  .strict();

export const OrcamentoCreateSchema = OrcamentoWriteSchema.extend({
  titulo: z.string().min(1).max(255),
  clienteNome: z.string().min(1).max(255),
}).strict();

export const OrcamentoUpdateSchema = OrcamentoWriteSchema;

export const OrcamentoItemWriteSchema = z
  .object({
    nome: z.string().min(1).max(255).optional(),
    descricao: z.string().max(10000).optional().nullable(),
    categoria: z.string().max(100).optional().nullable(),
    quantidade: z.coerce.number().int().positive().optional(),
    precoUnitario: money.optional(),
    precoTotal: money.optional(),
    detalhes: jsonLoose,
    ordem: z.coerce.number().int().nonnegative().optional(),
  })
  .strict();

export const OrcamentoItemCreateSchema = OrcamentoItemWriteSchema.extend({
  nome: z.string().min(1).max(255),
}).strict();

export const OrcamentoItemUpdateSchema = OrcamentoItemWriteSchema;
