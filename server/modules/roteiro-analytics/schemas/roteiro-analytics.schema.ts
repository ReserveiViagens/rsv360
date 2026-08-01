import { z } from 'zod';
import {
  ROTEIRO_ANALYTICS_EVENT_TYPES,
  ROTEIRO_ANALYTICS_SECTIONS,
} from '../../../../backend/src/db/schema/roteiro-analytics';

export const roteiroAnalyticsEventSchema = z
  .object({
    event_type: z.enum(ROTEIRO_ANALYTICS_EVENT_TYPES),
    section: z.enum(ROTEIRO_ANALYTICS_SECTIONS).optional().nullable(),
    value_ms: z.number().int().min(0).optional().nullable(),
    scroll_pct: z.number().int().min(0).max(100).optional().nullable(),
    meta: z.record(z.unknown()).optional().nullable(),
  })
  .strict();

export const roteiroAnalyticsBatchSchema = z
  .object({
    session_id: z.string().min(1).max(128),
    events: z.array(roteiroAnalyticsEventSchema).min(1).max(50),
  })
  .strict();

export type RoteiroAnalyticsBatchInput = z.infer<typeof roteiroAnalyticsBatchSchema>;

export function mapBatchToRows(token: string, batch: RoteiroAnalyticsBatchInput) {
  return batch.events.map((event) => ({
    propostaToken: token,
    sessionId: batch.session_id,
    eventType: event.event_type,
    section: event.section ?? null,
    valueMs: event.value_ms ?? null,
    scrollPct: event.scroll_pct ?? null,
    meta: event.meta ?? null,
  }));
}
