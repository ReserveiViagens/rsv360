import { z } from 'zod';

export const RelatorioViewCreateSchema = z
  .object({
    enterpriseId: z.number().int().optional().nullable(),
    nome: z.string().min(1).max(255),
    tipo: z.string().min(1).max(50),
    filtros: z.record(z.unknown()).optional().nullable(),
    colunas: z.union([z.array(z.unknown()), z.record(z.unknown())]).optional().nullable(),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const RelatorioSnapshotCreateSchema = z
  .object({
    viewId: z.number().int().positive().optional().nullable(),
    tipo: z.string().min(1).max(50),
    periodoInicio: z.coerce.date().optional().nullable(),
    periodoFim: z.coerce.date().optional().nullable(),
    dados: z.record(z.unknown()).optional(),
  })
  .strict();
