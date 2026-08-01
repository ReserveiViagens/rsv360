import { z } from 'zod';

export {
  parsePositiveIntId,
  parsePositiveIntParam,
  PositiveIntIdParamSchema,
} from '../../../lib/parse-id';

const money = z.union([z.coerce.number(), z.string().regex(/^-?\d+(\.\d+)?$/)]);
const dateLike = z.union([z.string().max(64), z.coerce.date()]);
const jsonLoose = z.record(z.unknown()).nullable().optional();

export const TransporteWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    tipo: z.string().min(1).max(50).optional(),
    placa: z.string().max(20).optional().nullable(),
    modelo: z.string().max(100).optional().nullable(),
    capacidade: z.coerce.number().int().nonnegative().optional(),
    motorista: z.string().max(255).optional().nullable(),
    status: z.string().max(30).optional(),
    metadata: jsonLoose,
  })
  .strict();

export const TransporteCreateSchema = TransporteWriteSchema.extend({
  tipo: z.string().min(1).max(50),
}).strict();

export const TransporteUpdateSchema = TransporteWriteSchema;

export const EmbarqueCreateSchema = z
  .object({
    transporteId: z.coerce.number().int().positive(),
    travelPackageId: z.coerce.number().int().positive().optional().nullable(),
    local: z.string().min(1).max(255),
    dataHora: dateLike,
    status: z.string().max(30).optional(),
    passageirosCount: z.coerce.number().int().nonnegative().optional(),
    notas: z.string().max(5000).optional().nullable(),
    metadata: jsonLoose,
  })
  .strict();

export const FornecedorWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    nome: z.string().min(1).max(255).optional(),
    cnpj: z.string().max(20).optional().nullable(),
    email: z.string().email().max(255).optional().nullable(),
    telefone: z.string().max(50).optional().nullable(),
    categoria: z.string().max(100).optional().nullable(),
    status: z.string().max(30).optional(),
    metadata: jsonLoose,
  })
  .strict();

export const FornecedorCreateSchema = FornecedorWriteSchema.extend({
  nome: z.string().min(1).max(255),
}).strict();

export const FornecedorUpdateSchema = FornecedorWriteSchema;

export const ReservaLogisticaWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    fornecedorId: z.coerce.number().int().positive().optional().nullable(),
    titulo: z.string().min(1).max(255).optional(),
    tipo: z.string().max(50).optional(),
    status: z.string().max(30).optional(),
    dataInicio: dateLike.optional().nullable(),
    dataFim: dateLike.optional().nullable(),
    valor: money.optional().nullable(),
    metadata: jsonLoose,
  })
  .strict();

export const ReservaLogisticaCreateSchema = ReservaLogisticaWriteSchema.extend({
  titulo: z.string().min(1).max(255),
}).strict();

export const ReservaLogisticaUpdateSchema = ReservaLogisticaWriteSchema;

export const VoucherWriteSchema = z
  .object({
    enterpriseId: z.coerce.number().int().positive().optional().nullable(),
    codigo: z.string().min(1).max(50).optional(),
    titulo: z.string().min(1).max(255).optional(),
    passageiroNome: z.string().max(255).optional().nullable(),
    reservaId: z.coerce.number().int().positive().optional().nullable(),
    status: z.string().max(30).optional(),
    validoAte: dateLike.optional().nullable(),
    metadata: jsonLoose,
  })
  .strict();

export const VoucherCreateSchema = VoucherWriteSchema.extend({
  titulo: z.string().min(1).max(255),
}).strict();

export const VoucherUpdateSchema = VoucherWriteSchema;
