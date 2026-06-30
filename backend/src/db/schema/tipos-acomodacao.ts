import { boolean, integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const tiposAcomodacao = pgTable('tipos_acomodacao', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 64 }).notNull().unique(),
  nome: varchar('nome', { length: 255 }).notNull(),
  icone: varchar('icone', { length: 64 }),
  ativo: boolean('ativo').notNull().default(true),
  ordem: integer('ordem').notNull().default(0),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});

export type TipoAcomodacao = typeof tiposAcomodacao.$inferSelect;
export type NovoTipoAcomodacao = typeof tiposAcomodacao.$inferInsert;
