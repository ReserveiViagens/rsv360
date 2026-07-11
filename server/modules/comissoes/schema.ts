import { z } from 'zod';

/** Split oficial Reservei Viagens / RSV360 (modelo NTX marketplace Caldas). */
export const COMISSOES_OFICIAL_RESERVEI = {
  taxaPlataformaPct: 20,
  taxaCorretorPct: 5,
  marca: 'Reservei Viagens / RSV360',
  notas:
    'Plataforma RSV360 20% · Corretor Reservei 5% · Anfitrião residual 75% (80% sem corretor).',
} as const;

export const comissoesConfigSchema = z
  .object({
    comissoesModuloAtivo: z.boolean(),
    taxaPlataformaPct: z.number().min(0).max(100),
    taxaCorretorPct: z.number().min(0).max(100),
  })
  .refine((d) => d.taxaPlataformaPct + d.taxaCorretorPct <= 100, {
    message: 'A soma plataforma + corretor não pode exceder 100%',
  });

export type ComissoesConfigInput = z.infer<typeof comissoesConfigSchema>;

export const comissoesSugestaoIaSchema = z.object({
  objetivo: z
    .enum(['padrao', 'captar_corretores', 'max_margem_plataforma', 'competir_otas'])
    .optional()
    .default('padrao'),
  contexto: z.string().max(500).optional(),
});

export type ComissoesSugestaoIaInput = z.infer<typeof comissoesSugestaoIaSchema>;

/** Confiança mínima para aprovar sugestão IA sem override explícito do admin. */
export const COMISSOES_CONFIANCA_MINIMA = 0.75;

export const comissoesSolicitarAprovacaoSchema = z
  .object({
    taxaPlataformaPct: z.number().min(0).max(100),
    taxaCorretorPct: z.number().min(0).max(100),
    margemProprietarioPct: z.number().min(0).max(100).optional(),
    fonte: z.enum(['oficial_reservei', 'heuristica', 'openai']),
    confianca: z.number().min(0).max(1),
    motivo: z.string().min(1).max(1000),
    objetivo: z.string().max(64).optional(),
    contexto: z.string().max(500).optional(),
  })
  .refine((d) => d.taxaPlataformaPct + d.taxaCorretorPct <= 100, {
    message: 'A soma plataforma + corretor não pode exceder 100%',
  });

export type ComissoesSolicitarAprovacaoInput = z.infer<typeof comissoesSolicitarAprovacaoSchema>;

export const comissoesAprovarSugestaoSchema = z.object({
  confirmouDiff: z.literal(true, {
    errorMap: () => ({ message: 'Confirmação do diff é obrigatória' }),
  }),
  overrideBaixaConfianca: z.boolean().optional().default(false),
});

export type ComissoesAprovarSugestaoInput = z.infer<typeof comissoesAprovarSugestaoSchema>;

export const comissoesRejeitarSugestaoSchema = z.object({
  motivo: z.string().max(500).optional(),
});

export type ComissoesRejeitarSugestaoInput = z.infer<typeof comissoesRejeitarSugestaoSchema>;
