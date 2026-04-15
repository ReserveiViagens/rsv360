import { pgTable, uuid, varchar, text, integer, bigint, timestamp, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const fileStorageProvider = pgEnum('file_storage_provider', [
  'local', 's3', 'minio', 'cloudinary', 'gcs'
]);

export const fileStatus = pgEnum('file_status', [
  'uploading', 'processing', 'ready', 'error', 'deleted'
]);

export const cloudFiles = pgTable('cloud_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  storedName: varchar('stored_name', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  size: bigint('size', { mode: 'number' }).notNull(),
  provider: fileStorageProvider('provider').notNull().default('local'),
  bucket: varchar('bucket', { length: 255 }),
  path: text('path').notNull(),
  publicUrl: text('public_url'),
  cdnUrl: text('cdn_url'),
  status: fileStatus('status').notNull().default('uploading'),
  metadata: jsonb('metadata'),
  thumbnails: jsonb('thumbnails'), // { small: url, medium: url, large: url }
  uploadedBy: varchar('uploaded_by', { length: 255 }),
  entityType: varchar('entity_type', { length: 100 }), // 'accommodation', 'property', etc.
  entityId: uuid('entity_id'),
  isPublic: boolean('is_public').notNull().default(false),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cloudCdnConfig = pgTable('cloud_cdn_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 100 }).notNull(), // 'cloudfront', 'cloudflare', 'custom'
  baseUrl: text('base_url').notNull(),
  customDomain: text('custom_domain'),
  settings: jsonb('settings'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});