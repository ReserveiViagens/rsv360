import { db } from '../../../lib/db';
import { roteiroAnalyticsEvents } from '../../../../backend/src/db/schema/roteiro-analytics';
import {
  mapBatchToRows,
  roteiroAnalyticsBatchSchema,
  type RoteiroAnalyticsBatchInput,
} from '../schemas/roteiro-analytics.schema';

export async function ingestRoteiroAnalyticsBatch(
  token: string,
  body: unknown,
): Promise<void> {
  const parsed = roteiroAnalyticsBatchSchema.parse(body) as RoteiroAnalyticsBatchInput;
  const rows = mapBatchToRows(token, parsed);
  if (rows.length === 0) return;
  await db.insert(roteiroAnalyticsEvents).values(rows);
}
