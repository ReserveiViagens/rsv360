import { boolean, integer, numeric, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const wizardAddons = pgTable('wizard_addons', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  descricao: text('descricao'),
  precoTipo: text('preco_tipo').notNull(),
  valor: numeric('valor', { precision: 12, scale: 2 }).notNull(),
  escopo: text('escopo'),
  requerConfigBanheiro: text('requer_config_banheiro'),
  ativo: boolean('ativo').notNull().default(true),
  ordem: integer('ordem').notNull().default(0),
  criadoEm: timestamp('criado_em', { withTimezone: true }).defaultNow(),
});

export type WizardAddon = typeof wizardAddons.$inferSelect;
export type NovoWizardAddon = typeof wizardAddons.$inferInsert;
