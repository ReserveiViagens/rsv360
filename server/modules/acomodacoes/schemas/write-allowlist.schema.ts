import { z } from 'zod';

export const AddonPatchSchema = z
  .object({
    nome: z.string().min(1).max(255).optional(),
    descricao: z.string().max(5000).optional().nullable(),
    precoTipo: z.string().max(50).optional(),
    valor: z.union([z.string(), z.number()]).optional(),
    ativo: z.boolean().optional(),
    ordem: z.number().int().optional(),
  })
  .strict();

export const TarifaCategoriaCreateSchema = z
  .object({
    slug: z.string().min(1).max(100),
    nome: z.string().min(1).max(255),
    descontoPercentual: z.union([z.string(), z.number()]).optional(),
    requerComprovacao: z.boolean().optional(),
    ativo: z.boolean().optional(),
  })
  .strict();

export const TarifaRegraCreateSchema = z
  .object({
    nivel: z.string().min(1),
    acomodacaoId: z.number().int().positive().optional().nullable(),
    hotelId: z.string().max(100).optional().nullable(),
    temporadaId: z.number().int().positive().optional().nullable(),
    categoriaId: z.number().int().positive().optional().nullable(),
    tipoValor: z.string().min(1).optional(),
    valor: z.union([z.string(), z.number()]),
    prioridade: z.number().int().optional(),
    vigenciaInicio: z.string().optional().nullable(),
    vigenciaFim: z.string().optional().nullable(),
    ativo: z.boolean().optional(),
  })
  .strict();
