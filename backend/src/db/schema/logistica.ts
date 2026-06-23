import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const transportes = pgTable('transportes', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  tipo: varchar('tipo', { length: 50 }).notNull(),
  placa: varchar('placa', { length: 20 }),
  modelo: varchar('modelo', { length: 100 }),
  capacidade: integer('capacidade').notNull().default(0),
  motorista: varchar('motorista', { length: 255 }),
  status: varchar('status', { length: 30 }).notNull().default('disponivel'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const embarques = pgTable('embarques', {
  id: serial('id').primaryKey(),
  transporteId: integer('transporte_id')
    .notNull()
    .references(() => transportes.id, { onDelete: 'restrict' }),
  travelPackageId: integer('travel_package_id'),
  local: varchar('local', { length: 255 }).notNull(),
  dataHora: timestamp('data_hora').notNull(),
  status: varchar('status', { length: 30 }).notNull().default('agendado'),
  passageirosCount: integer('passageiros_count').default(0),
  notas: text('notas'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Transporte = typeof transportes.$inferSelect;
export type NewTransporte = typeof transportes.$inferInsert;
export type Embarque = typeof embarques.$inferSelect;
export type NewEmbarque = typeof embarques.$inferInsert;
