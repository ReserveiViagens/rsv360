import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const cotacaoLeads = pgTable('cotacao_leads', {
  id: serial('id').primaryKey(),
  whatsapp: varchar('whatsapp', { length: 20 }),
  nome: varchar('nome', { length: 255 }),
  passoAbandonado: integer('passo_abandonado').notNull(),
  hotelId: text('hotel_id'),
  checkin: date('checkin'),
  checkout: date('checkout'),
  adults: integer('adults'),
  children: integer('children'),
  refIndicacao: varchar('ref_indicacao', { length: 64 }),
  canal: varchar('canal', { length: 64 }),
  payload: jsonb('payload'),
  consentimentoLgpd: boolean('consentimento_lgpd').notNull().default(false),
  enviadoWhatsapp: boolean('enviado_whatsapp').notNull().default(false),
  whatsappErro: text('whatsapp_erro'),
  sessaoId: varchar('sessao_id', { length: 64 }),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});

export type CotacaoLead = typeof cotacaoLeads.$inferSelect;
export type NovaCotacaoLead = typeof cotacaoLeads.$inferInsert;
