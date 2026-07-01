import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  date,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { propostas } from './propostas';

export const propostaVouchers = pgTable(
  'proposta_vouchers',
  {
    id: serial('id').primaryKey(),
    propostaId: integer('proposta_id')
      .notNull()
      .references(() => propostas.id, { onDelete: 'cascade' }),
    voucherSlug: varchar('voucher_slug', { length: 50 }).notNull(),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    hospede: varchar('hospede', { length: 255 }),
    unidade: varchar('unidade', { length: 255 }),
    checkIn: date('check_in'),
    checkOut: date('check_out'),
    voucherValidadoEm: timestamp('voucher_validado_em'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  (t) => ({
    propostaSlugUnique: uniqueIndex('proposta_vouchers_proposta_slug_unique').on(
      t.propostaId,
      t.voucherSlug,
    ),
  }),
);

export type PropostaVoucher = typeof propostaVouchers.$inferSelect;
export type NewPropostaVoucher = typeof propostaVouchers.$inferInsert;

export const VOUCHER_SLUGS = ['hotel', 'ingressos', 'checkin'] as const;
export type VoucherSlug = (typeof VOUCHER_SLUGS)[number];
