import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import { canonicalizeHotelId } from '../../acomodacoes/services/resolve-hotel-id';

export const HOTEL_MISMATCH_CODE = 'HOTEL_MISMATCH' as const;

export class HotelMismatchError extends Error {
  readonly code = HOTEL_MISMATCH_CODE;
  readonly statusCode = 422;

  constructor(message = 'Acomodação não pertence ao hotel selecionado') {
    super(message);
    this.name = 'HotelMismatchError';
  }
}

/**
 * When the wizard sends selectedAcomodacaoId, the unit's hotel_id must match
 * the payload hotelId (after alias canonicalization).
 */
export async function assertHotelMatchProposta(
  acomodacaoId: number,
  payloadHotelId: string | number | null | undefined,
): Promise<void> {
  const [row] = await db
    .select({ hotelId: acomodacoes.hotelId })
    .from(acomodacoes)
    .where(eq(acomodacoes.id, acomodacaoId))
    .limit(1);

  if (!row?.hotelId) return;

  const payloadRaw =
    payloadHotelId == null || payloadHotelId === '' ? '' : String(payloadHotelId);
  if (!payloadRaw) {
    throw new HotelMismatchError();
  }

  const expected = canonicalizeHotelId(row.hotelId);
  const actual = canonicalizeHotelId(payloadRaw);
  if (expected !== actual) {
    throw new HotelMismatchError();
  }
}
