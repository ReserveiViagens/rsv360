import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './existing';

export const empreendimentos = pgTable('empreendimentos', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  hotelId: text('hotel_id').notNull().unique(),
  nomeOficial: text('nome_oficial').notNull(),
  nomeNormalizado: text('nome_normalizado').notNull(),
  tipo: text('tipo').notNull().default('condominio'),
  cidade: text('cidade').notNull().default('Caldas Novas'),
  status: text('status').notNull().default('aprovado'),
  criadoPor: integer('criado_por').references(() => users.id),
  websiteContentId: text('website_content_id'),
  metadata: jsonb('metadata'),
  ativo: boolean('ativo').notNull().default(true),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
  atualizadoEm: timestamp('atualizado_em', { withTimezone: true }).defaultNow(),
});

export type Empreendimento = typeof empreendimentos.$inferSelect;
export type NovoEmpreendimento = typeof empreendimentos.$inferInsert;
