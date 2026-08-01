import { z } from 'zod';

export const PositiveIntIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().finite(),
  })
  .strict();

export function parsePositiveIntId(raw: unknown): number {
  const parsed = PositiveIntIdParamSchema.safeParse({ id: raw });
  if (!parsed.success) throw parsed.error;
  return parsed.data.id;
}

/** Numeric/money fields accepted as number or digit string for Drizzle numeric columns. */
const money = z.union([z.coerce.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]);

export const TransacaoWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    tipo: z.enum(['receita', 'despesa']).optional(),
    categoria: z.string().max(100).optional().nullable(),
    descricao: z.string().min(1).max(5000).optional(),
    valor: money.optional(),
    moeda: z.string().length(3).optional(),
    status: z.string().max(30).optional(),
    metodoPagamento: z.string().max(50).optional().nullable(),
    referenciaTipo: z.string().max(50).optional().nullable(),
    referenciaId: z.coerce.number().int().positive().optional().nullable(),
    dataTransacao: z.union([z.string().max(64), z.coerce.date()]).optional(),
    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict();

export const TransacaoCreateSchema = TransacaoWriteSchema.extend({
  tipo: z.enum(['receita', 'despesa']),
  descricao: z.string().min(1).max(5000),
  valor: money,
}).strict();

export const TransacaoUpdateSchema = TransacaoWriteSchema;

export const ContaReceberCreateSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    clienteNome: z.string().min(1).max(255),
    clienteEmail: z.string().email().max(255).optional().nullable(),
    descricao: z.string().min(1).max(5000),
    valor: money,
    valorRecebido: money.optional(),
    status: z.string().max(30).optional(),
    vencimento: z.union([z.string().max(64), z.coerce.date()]).optional().nullable(),
    bookingId: z.coerce.number().int().positive().optional().nullable(),
    propostaId: z.coerce.number().int().positive().optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict();

export const ContaReceberReceberSchema = z
  .object({
    valorRecebido: money,
  })
  .strict();

export const ContaPagarCreateSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    fornecedorNome: z.string().min(1).max(255),
    descricao: z.string().min(1).max(5000),
    valor: money,
    valorPago: money.optional(),
    status: z.string().max(30).optional(),
    vencimento: z.union([z.string().max(64), z.coerce.date()]).optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict();

export const ContaPagarPagarSchema = z
  .object({
    valorPago: money,
  })
  .strict();
