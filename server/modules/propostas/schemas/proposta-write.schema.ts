import { z } from 'zod';

const positiveInt = z.coerce.number().int().positive().finite();

export const PropostaIdParamSchema = z
  .object({
    id: positiveInt,
  })
  .strict();

export const TemplateIdParamSchema = z
  .object({
    templateId: positiveInt,
  })
  .strict();

/** Staff create/update allowlist — rejects isAdmin/role/id/etc via .strict(). */
export const PropostaWriteSchema = z
  .object({
    enterpriseId: z.number().int().optional().nullable(),
    orcamentoId: z.number().int().optional().nullable(),
    codigo: z.string().max(50).optional().nullable(),
    titulo: z.string().min(1).max(255),
    clienteNome: z.string().min(1).max(255),
    clienteEmail: z.string().email().max(255).optional().nullable(),
    clienteTelefone: z.string().max(50).optional().nullable(),
    status: z.string().max(30).optional(),
    valorTotal: z.union([z.string(), z.number()]).optional(),
    moeda: z.string().length(3).optional(),
    validoAte: z.coerce.date().optional().nullable(),
    isPublica: z.boolean().optional(),
    exibirComparativo: z.boolean().optional(),
    versao: z.number().int().positive().optional(),
    conteudo: z.record(z.unknown()).optional().nullable(),
    metadata: z.record(z.unknown()).optional().nullable(),
  })
  .strict();

export const PropostaUpdateSchema = PropostaWriteSchema.partial()
  .extend({
    titulo: z.string().min(1).max(255).optional(),
    clienteNome: z.string().min(1).max(255).optional(),
  })
  .strict();

export const PacoteTemplateWriteSchema = z
  .object({
    enterpriseId: z.number().int().optional().nullable(),
    nome: z.string().min(1).max(255),
    categoria: z.string().max(100).optional().nullable(),
    descricao: z.string().max(5000).optional().nullable(),
    conteudo: z.record(z.unknown()).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const PacoteTemplateUpdateSchema = PacoteTemplateWriteSchema.partial()
  .extend({
    nome: z.string().min(1).max(255).optional(),
  })
  .strict();

export type PropostaWriteInput = z.infer<typeof PropostaWriteSchema>;
export type PropostaUpdateInput = z.infer<typeof PropostaUpdateSchema>;
