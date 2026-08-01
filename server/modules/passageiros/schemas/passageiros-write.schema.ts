import { z } from 'zod';

export {
  parseNonNegativeIntParam,
  parsePositiveIntId,
  parsePositiveIntParam,
  PositiveIntIdParamSchema,
} from '../../../lib/parse-id';

const dateLike = z.union([z.string().max(64), z.coerce.date()]);
const jsonLoose = z.record(z.unknown()).nullable().optional();

export const DocumentoSchema = z
  .object({
    tipo: z.string().min(1).max(100),
    numero: z.string().max(100).optional(),
    url: z.string().max(2000).optional(),
    validade: z.string().max(64).optional(),
  })
  .strict();

export const PassageiroWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    nome: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional().nullable(),
    telefone: z.string().max(50).optional().nullable(),
    cpf: z.string().max(14).optional().nullable(),
    rg: z.string().max(20).optional().nullable(),
    dataNascimento: z.string().max(40).optional().nullable(),
    tipo: z.string().max(30).optional().nullable(),
    documentos: z.array(DocumentoSchema).optional().nullable(),
    notas: z.string().max(10000).optional().nullable(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const PassageiroCreateSchema = PassageiroWriteSchema.extend({
  nome: z.string().min(1).max(255),
}).strict();

export const PassageiroUpdateSchema = PassageiroWriteSchema;

export const FnrhWriteSchema = z
  .object({
    hotelNome: z.string().max(255).optional().nullable(),
    dataEntrada: dateLike.optional().nullable(),
    dataSaida: dateLike.optional().nullable(),
    motivoViagem: z.string().max(100).optional().nullable(),
    meioTransporte: z.string().max(100).optional().nullable(),
    status: z.string().max(30).optional(),
    payload: jsonLoose,
  })
  .strict();

export const FnrhCreateSchema = FnrhWriteSchema;
export const FnrhUpdateSchema = FnrhWriteSchema;

export const PassageiroExcursaoSchema = z
  .object({
    travelPackageId: z.coerce.number().int().positive().optional().nullable(),
    status: z.string().max(30).optional(),
    assento: z.string().max(20).optional().nullable(),
    observacoes: z.string().max(5000).optional().nullable(),
    checkInAt: dateLike.optional().nullable(),
  })
  .strict();
