import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  cpf: varchar('cpf', { length: 14 }),
  source: varchar('source', { length: 50 }).notNull(), // 'site', 'whatsapp', 'instagram', 'indicacao', 'google'
  interest: varchar('interest', { length: 100 }), // 'hotel', 'ingresso', 'pacote', 'excursao'
  destination: varchar('destination', { length: 100 }),
  message: text('message'),
  status: varchar('status', { length: 20 }).default('novo'), // 'novo', 'contatado', 'negociando', 'convertido', 'perdido'
  assignedTo: varchar('assigned_to', { length: 255 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  convertedAt: timestamp('converted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});