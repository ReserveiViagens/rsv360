import {
  pgTable,
  serial,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const campanhas = pgTable('campanhas', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  nome: varchar('nome', { length: 255 }).notNull(),
  tipo: varchar('tipo', { length: 50 }),
  status: varchar('status', { length: 30 }).notNull().default('rascunho'),
  orcamento: numeric('orcamento', { precision: 12, scale: 2 }).default('0'),
  gastoAtual: numeric('gasto_atual', { precision: 12, scale: 2 }).default('0'),
  inicio: timestamp('inicio'),
  fim: timestamp('fim'),
  canais: jsonb('canais'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cupons = pgTable('cupons', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  codigo: varchar('codigo', { length: 50 }).notNull().unique(),
  tipoDesconto: varchar('tipo_desconto', { length: 20 }).notNull().default('percentage'),
  valorDesconto: numeric('valor_desconto', { precision: 12, scale: 2 }).notNull(),
  usoMaximo: integer('uso_maximo'),
  usoAtual: integer('uso_atual').default(0),
  validoDe: timestamp('valido_de'),
  validoAte: timestamp('valido_ate'),
  isActive: boolean('is_active').default(true),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cuponsUso = pgTable('cupons_uso', {
  id: serial('id').primaryKey(),
  cupomId: integer('cupom_id')
    .notNull()
    .references(() => cupons.id, { onDelete: 'cascade' }),
  clienteEmail: varchar('cliente_email', { length: 255 }),
  bookingId: integer('booking_id'),
  valorDesconto: numeric('valor_desconto', { precision: 12, scale: 2 }).notNull(),
  usedAt: timestamp('used_at').defaultNow(),
});

export type Campanha = typeof campanhas.$inferSelect;
export type NewCampanha = typeof campanhas.$inferInsert;
export type Cupom = typeof cupons.$inferSelect;
export type NewCupom = typeof cupons.$inferInsert;
export type CupomUso = typeof cuponsUso.$inferSelect;
