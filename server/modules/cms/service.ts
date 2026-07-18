import { sql } from 'drizzle-orm';
import { db } from '../../lib/db';
import {
  DEMO_CONTENT_IDS,
  ETAPA_A_CONTENT_IDS,
  sanitizeAmenidades,
  type AmenidadeCode,
} from './amenidades';

export type WebsiteContentRow = {
  id: number;
  page_type: string;
  content_id: string;
  title: string;
  description: string | null;
  images: unknown;
  metadata: Record<string, unknown>;
  seo_data: unknown;
  status: string | null;
  order_index: number | null;
  video_url: string | null;
  amenidades: AmenidadeCode[];
  created_at: Date | null;
  updated_at: Date | null;
  created_by: number | null;
  updated_by: number | null;
};

export type CmsContentInput = {
  pageType?: string;
  contentId?: string;
  title: string;
  description?: string;
  features?: string[];
  images?: string[];
  videoUrl?: string | null;
  amenidades?: unknown;
  orderIndex?: number;
  status?: string;
  metadata?: Record<string, unknown>;
};

function parseJsonb<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

function mapRow(row: Record<string, unknown>): WebsiteContentRow {
  const metadata = parseJsonb<Record<string, unknown>>(row.metadata, {});
  const amenidadesRaw = parseJsonb<unknown[]>(row.amenidades, []);
  const amenidades = sanitizeAmenidades(
    amenidadesRaw.length ? amenidadesRaw : metadata.amenidades,
  );
  return {
    id: Number(row.id),
    page_type: String(row.page_type),
    content_id: String(row.content_id),
    title: String(row.title),
    description: row.description != null ? String(row.description) : null,
    images: parseJsonb(row.images, []),
    metadata,
    seo_data: parseJsonb(row.seo_data, {}),
    status: row.status != null ? String(row.status) : 'active',
    order_index: row.order_index != null ? Number(row.order_index) : 0,
    video_url:
      row.video_url != null
        ? String(row.video_url)
        : metadata.videoUrl != null
          ? String(metadata.videoUrl)
          : null,
    amenidades,
    created_at: (row.created_at as Date) ?? null,
    updated_at: (row.updated_at as Date) ?? null,
    created_by: row.created_by != null ? Number(row.created_by) : null,
    updated_by: row.updated_by != null ? Number(row.updated_by) : null,
  };
}

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function mergeMetadata(
  existing: Record<string, unknown>,
  input: Partial<CmsContentInput>,
  amenidades: AmenidadeCode[],
  videoUrl: string | null,
): Record<string, unknown> {
  const next = { ...existing, ...(input.metadata ?? {}) };
  if (input.features) next.features = input.features;
  if (input.images) next.images = input.images;
  next.amenidades = amenidades;
  if (videoUrl) next.videoUrl = videoUrl;
  else delete next.videoUrl;
  return next;
}

export const cmsService = {
  async list(pageType = 'hotels', opts?: { includeInactive?: boolean }) {
    const includeInactive = opts?.includeInactive !== false;
    const result = await db.execute(sql`
      SELECT *
      FROM website_content
      WHERE page_type = ${pageType}
        AND (${includeInactive} OR status = 'active')
      ORDER BY order_index ASC NULLS LAST, id ASC
    `);
    return (result.rows as Record<string, unknown>[]).map(mapRow);
  },

  async getById(id: number) {
    const result = await db.execute(sql`
      SELECT * FROM website_content WHERE id = ${id} LIMIT 1
    `);
    const row = (result.rows as Record<string, unknown>[])[0];
    return row ? mapRow(row) : null;
  },

  async create(input: CmsContentInput, userId?: number) {
    const title = String(input.title ?? '').trim();
    if (!title) throw new Error('title é obrigatório');

    const pageType = String(input.pageType ?? 'hotels').trim() || 'hotels';
    let contentId = String(input.contentId ?? '').trim() || slugify(title);
    if (!contentId) contentId = `hotel-${Date.now()}`;

    const amenidades = sanitizeAmenidades(input.amenidades);
    const videoUrl =
      input.videoUrl === undefined || input.videoUrl === null
        ? null
        : String(input.videoUrl).trim() || null;
    const images = Array.isArray(input.images) ? input.images.map(String) : [];
    const features = Array.isArray(input.features) ? input.features.map(String) : [];
    const metadata = mergeMetadata({}, { ...input, features, images }, amenidades, videoUrl);
    const orderIndex =
      input.orderIndex != null && Number.isFinite(Number(input.orderIndex))
        ? Number(input.orderIndex)
        : 999;
    let status = String(input.status ?? 'active');
    if ((DEMO_CONTENT_IDS as readonly string[]).includes(contentId)) {
      status = 'inactive';
    }

    const result = await db.execute(sql`
      INSERT INTO website_content (
        page_type, content_id, title, description, images, metadata,
        status, order_index, video_url, amenidades, created_by, updated_by, updated_at
      ) VALUES (
        ${pageType},
        ${contentId},
        ${title},
        ${input.description ?? null},
        ${JSON.stringify(images)}::jsonb,
        ${JSON.stringify(metadata)}::jsonb,
        ${status},
        ${orderIndex},
        ${videoUrl},
        ${JSON.stringify(amenidades)}::jsonb,
        ${userId ?? null},
        ${userId ?? null},
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `);
    return mapRow((result.rows as Record<string, unknown>[])[0]);
  },

  async update(id: number, input: Partial<CmsContentInput>, userId?: number) {
    const current = await this.getById(id);
    if (!current) return null;

    const title =
      input.title !== undefined ? String(input.title).trim() : current.title;
    if (!title) throw new Error('title é obrigatório');

    const amenidades =
      input.amenidades !== undefined
        ? sanitizeAmenidades(input.amenidades)
        : current.amenidades;
    const videoUrl =
      input.videoUrl !== undefined
        ? input.videoUrl === null
          ? null
          : String(input.videoUrl).trim() || null
        : current.video_url;
    const images =
      input.images !== undefined
        ? input.images.map(String)
        : (Array.isArray(current.images) ? current.images.map(String) : []);
    const features =
      input.features !== undefined
        ? input.features.map(String)
        : Array.isArray(current.metadata.features)
          ? (current.metadata.features as string[]).map(String)
          : [];
    const metadata = mergeMetadata(
      current.metadata,
      { ...input, features, images },
      amenidades,
      videoUrl,
    );
    const orderIndex =
      input.orderIndex !== undefined && Number.isFinite(Number(input.orderIndex))
        ? Number(input.orderIndex)
        : (current.order_index ?? 0);
    let status =
      input.status !== undefined ? String(input.status) : (current.status ?? 'active');
    if ((DEMO_CONTENT_IDS as readonly string[]).includes(current.content_id)) {
      status = 'inactive';
    }

    const result = await db.execute(sql`
      UPDATE website_content SET
        title = ${title},
        description = ${input.description !== undefined ? input.description : current.description},
        images = ${JSON.stringify(images)}::jsonb,
        metadata = ${JSON.stringify(metadata)}::jsonb,
        status = ${status},
        order_index = ${orderIndex},
        video_url = ${videoUrl},
        amenidades = ${JSON.stringify(amenidades)}::jsonb,
        updated_by = ${userId ?? current.updated_by},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `);
    return mapRow((result.rows as Record<string, unknown>[])[0]);
  },

  async remove(id: number, opts?: { hard?: boolean; userId?: number }) {
    const current = await this.getById(id);
    if (!current) return { deleted: false as const, reason: 'not_found' as const };

    const isEtapaA = (ETAPA_A_CONTENT_IDS as readonly string[]).includes(current.content_id);
    if (opts?.hard) {
      if (isEtapaA) {
        return { deleted: false as const, reason: 'etapa_a_protected' as const, row: current };
      }
      await db.execute(sql`DELETE FROM website_content WHERE id = ${id}`);
      return { deleted: true as const, mode: 'hard' as const, row: current };
    }

    const result = await db.execute(sql`
      UPDATE website_content SET
        status = 'inactive',
        updated_by = ${opts?.userId ?? current.updated_by},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `);
    return {
      deleted: true as const,
      mode: 'soft' as const,
      row: mapRow((result.rows as Record<string, unknown>[])[0]),
    };
  },
};
