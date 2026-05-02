import assert from 'node:assert/strict';
import request from 'supertest';
import { TokenService } from './services/token.service';
import { portalRepository } from './db/portal.repository';

const { createApp } = require('../../../backend/app.js');

const DEFAULT_BOOKING_CODE = process.env.PORTAL_SMOKE_BOOKING_CODE || 'SEED-ACC-001';

function quoteIdent(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function pickValue(row: Record<string, any> | null | undefined, keys: string[]) {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

async function countRows(table: string) {
  const result = await portalRepository.query(`select count(*)::int as total from ${quoteIdent(table)}`);
  return Number(result.rows[0]?.total ?? 0);
}

async function resolveBookingFixture() {
  const bookingTable = await portalRepository.getBookingTable();
  assert.ok(bookingTable, 'Nenhuma tabela de bookings/reservations encontrada');

  const columns = await portalRepository.getColumns(bookingTable);
  const codeColumn =
    columns.includes('booking_code')
      ? 'booking_code'
      : columns.includes('bookingCode')
        ? 'bookingCode'
        : columns.includes('code')
          ? 'code'
          : null;
  const idColumn = columns.includes('id')
    ? 'id'
    : columns.includes('booking_id')
      ? 'booking_id'
      : columns.includes('bookingId')
        ? 'bookingId'
        : null;

  assert.ok(codeColumn, `Tabela ${bookingTable} não expõe coluna de código de booking`);
  assert.ok(idColumn, `Tabela ${bookingTable} não expõe coluna de identificador de booking`);

  const result = await portalRepository.query(
    `select * from ${quoteIdent(bookingTable)} where ${quoteIdent(codeColumn)} = $1 limit 1`,
    [DEFAULT_BOOKING_CODE],
  );

  const booking = result.rows[0] || null;
  assert.ok(booking, `Fixture de booking ${DEFAULT_BOOKING_CODE} não encontrada`);

  return { bookingTable, booking, idColumn };
}

async function runPortalBookingWriteSmokeTests() {
  console.log('🧪 Running guest portal booking write smoke tests...');

  const tokenTable = await portalRepository.getTokenTable();
  assert.ok(
    tokenTable,
    'Nenhuma tabela de token de portal encontrada (guest_portal_tokens, portal_tokens ou guest_tokens)',
  );

  const auditTable = await portalRepository.getPortalBookingAuditTable();
  assert.ok(auditTable, 'Nenhuma tabela portal_booking_audit encontrada');

  const { bookingTable, booking, idColumn } = await resolveBookingFixture();
  const app = await createApp();
  const tokenService = new TokenService(portalRepository as any);

  const bookingId = String(
    pickValue(booking, ['id', 'booking_id', 'bookingId', 'reservation_id', 'reservationId']),
  );
  assert.ok(bookingId && bookingId !== 'undefined', 'Booking fixture sem identificador válido');

  const bookingsBefore = await countRows(bookingTable);
  const tokensBefore = await countRows(tokenTable);
  const auditsBefore = await countRows(auditTable);

  const tokenResult = await tokenService.generateToken(bookingId);
  assert.equal(typeof tokenResult.token, 'string');
  assert.ok(tokenResult.token.length > 0, 'Token do portal não foi gerado');

  const newRequests = `Smoke test specialRequests ${Date.now()}`;
  const updateResponse = await request(app)
    .post('/api/portal/booking')
    .set('Authorization', `Bearer portal_${tokenResult.token}`)
    .send({ specialRequests: newRequests });

  assert.equal(
    updateResponse.status,
    200,
    `expected 200, got ${updateResponse.status}: ${updateResponse.text}`,
  );
  assert.ok(updateResponse.body?.booking, 'response missing booking');

  const returnedBooking = updateResponse.body.booking;
  const returnedSpecialRequests = pickValue(returnedBooking, ['special_requests', 'specialRequests']);
  assert.equal(
    returnedSpecialRequests,
    newRequests,
    'specialRequests not persisted in response',
  );

  const dbCheck = await portalRepository.query(
    `select special_requests from ${quoteIdent(bookingTable)} where ${quoteIdent(idColumn)} = $1`,
    [bookingId],
  );
  assert.equal(dbCheck.rows[0]?.special_requests, newRequests, 'specialRequests not persisted in DB');

  const auditCheck = await portalRepository.query(
    `select action, fields_changed, before_payload, after_payload
     from ${quoteIdent(auditTable)}
     where booking_id = $1
     order by created_at desc
     limit 1`,
    [bookingId],
  );
  assert.ok(auditCheck.rows[0], 'audit row missing');
  assert.equal(auditCheck.rows[0].action, 'update', 'audit row action mismatch');
  const fields = typeof auditCheck.rows[0].fields_changed === 'string'
    ? JSON.parse(auditCheck.rows[0].fields_changed)
    : auditCheck.rows[0].fields_changed;
  assert.deepEqual(fields, ['specialRequests'], 'audit fields_changed mismatch');

  const massAssignmentResponse = await request(app)
    .post('/api/portal/booking')
    .set('Authorization', `Bearer portal_${tokenResult.token}`)
    .send({ specialRequests: 'x', totalAmount: 999999 });
  assert.equal(
    massAssignmentResponse.status,
    400,
    `mass-assignment should be 400, got ${massAssignmentResponse.status}`,
  );

  const longValueResponse = await request(app)
    .post('/api/portal/booking')
    .set('Authorization', `Bearer portal_${tokenResult.token}`)
    .send({ specialRequests: 'x'.repeat(2001) });
  assert.equal(
    longValueResponse.status,
    400,
    `validation should reject >2000 chars, got ${longValueResponse.status}`,
  );

  const bookingsAfter = await countRows(bookingTable);
  const tokensAfter = await countRows(tokenTable);
  const auditsAfter = await countRows(auditTable);
  assert.equal(bookingsAfter, bookingsBefore, 'A escrita não pode criar nem apagar bookings');
  assert.equal(tokensAfter, tokensBefore + 1, 'A escrita deve apenas gerar 1 token');
  assert.equal(auditsAfter, auditsBefore + 1, 'A escrita deve inserir exatamente 1 audit row');

  console.log('[smoke:portal-booking-write] OK booking=SEED-ACC-001 fields=[specialRequests]');
}

if (require.main === module) {
  runPortalBookingWriteSmokeTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('[guest-portal] booking write smoke failed:', error);
      process.exit(1);
    });
}

module.exports = { runPortalBookingWriteSmokeTests };
