import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const passageiros = pgTable('passageiros', {
  id: serial('id').primaryKey(),
  enterpriseId: integer('enterprise_id'),
  nome: varchar('nome', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  telefone: varchar('telefone', { length: 50 }),
  cpf: varchar('cpf', { length: 14 }),
  rg: varchar('rg', { length: 20 }),
  dataNascimento: date('data_nascimento'),
  tipo: varchar('tipo', { length: 30 }).default('adulto'),
  documentos: jsonb('documentos'),
  notas: text('notas'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const passageiroExcursao = pgTable('passageiro_excursao', {
  id: serial('id').primaryKey(),
  passageiroId: integer('passageiro_id')
    .notNull()
    .references(() => passageiros.id, { onDelete: 'cascade' }),
  travelPackageId: integer('travel_package_id'),
  status: varchar('status', { length: 30 }).notNull().default('reservado'),
  assento: varchar('assento', { length: 20 }),
  observacoes: text('observacoes'),
  checkInAt: timestamp('check_in_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Passageiro = typeof passageiros.$inferSelect;
export type NewPassageiro = typeof passageiros.$inferInsert;
export type PassageiroExcursao = typeof passageiroExcursao.$inferSelect;
export type NewPassageiroExcursao = typeof passageiroExcursao.$inferInsert;
