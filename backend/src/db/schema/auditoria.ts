import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';

export const auditoriaEstados = pgTable(
  'auditoria_estados',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    entidade: text('entidade').notNull(),
    entidadeId: integer('entidade_id').notNull(),
    de: text('de'),
    para: text('para').notNull(),
    autorId: integer('autor_id').notNull(),
    autorRole: text('autor_role').notNull(),
    motivo: text('motivo'),
    criadoEm: timestamp('criado_em').defaultNow(),
  },
  (t) => ({
    idxEntidade: index('idx_auditoria_entidade').on(t.entidade, t.entidadeId),
  }),
);

export type AuditoriaEstado = typeof auditoriaEstados.$inferSelect;
export type NewAuditoriaEstado = typeof auditoriaEstados.$inferInsert;
