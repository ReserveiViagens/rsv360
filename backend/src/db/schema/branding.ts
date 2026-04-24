import { pgTable, serial, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const branding = pgTable('branding', {
  id: serial('id').primaryKey(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  tagline: varchar('tagline', { length: 500 }),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  primaryColor: varchar('primary_color', { length: 7 }).default('#1E40AF'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#F59E0B'),
  accentColor: varchar('accent_color', { length: 7 }).default('#10B981'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  whatsapp: varchar('whatsapp', { length: 20 }),
  instagram: varchar('instagram', { length: 255 }),
  facebook: varchar('facebook', { length: 255 }),
  website: varchar('website', { length: 255 }),
  address: text('address'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
