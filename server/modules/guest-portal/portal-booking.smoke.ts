import assert from 'node:assert/strict';
import request from 'supertest';
import { TokenService } from './services/token.service';
import { portalRepository } from './db/portal.repository';

const { createApp } = require('../../../backend/app.js');

const DEFAULT_BOOKING_CODE = process.env.PORTAL_SMOKE_BOOKING_CODE || 'SEED-ACC-001';

type StableBooking = {
  bookingCode: string | null;
  bookingType: string | null;
  status: string | null;
  paymentStatus: string | null;
  totalAmount: string | null;
  customerEmail: string | null;
};

type StableGuest = {
  id: string | number | null;
  bookingId: string | number | null;
  name: string | null;
  email: string | null;
  document: string | null;
  phone: string | null;
};

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

function toStableString(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  return String(value);
}

function pickStableBooking(booking: Record<string, any> | null | undefined): StableBooking {
  return {
    bookingCode: toStableString(pickValue(booking, ['bookingCode', 'booking_code', 'code'])),
    bookingType: toStableString(pickValue(booking, ['bookingType', 'booking_type', 'type'])),
    status: toStableString(pickValue(booking, ['status'])),
    paymentStatus: toStableString(pickValue(booking, ['paymentStatus', 'payment_status'])),
    totalAmount: toStableString(pickValue(booking, ['totalAmount', 'total_amount', 'amount'])),
    customerEmail: toStableString(pickValue(booking, ['customerEmail', 'customer_email', 'email'])),
  };
}

function pickStableGuest(guest: Record<string, any> | null | undefined): StableGuest {
  return {
    id: pickValue(guest, ['id', 'guest_id']),
    bookingId: pickValue(guest, ['booking_id', 'bookingId']),
    name: toStableString(pickValue(guest, ['name', 'full_name'])),
    email: toStableString(pickValue(guest, ['email', 'guest_email'])),
    document: toStableString(pickValue(guest, ['document', 'cpf', 'identity_document'])),
    phone: toStableString(pickValue(guest, ['phone', 'guest_phone'])),
  };
}

function pickStableGuestFromBooking(booking: Record<string, any> | null | undefined): StableGuest {
  return {
    id: pickValue(booking, ['guest_id', 'guestId']),
    bookingId: pickValue(booking, ['id', 'booking_id', 'bookingId']),
    name: toStableString(pickValue(booking, ['customerName', 'customer_name', 'guest_name', 'name', 'full_name'])),
    email: toStableString(pickValue(booking, ['customerEmail', 'customer_email', 'guest_email', 'email'])),
    document: toStableString(pickValue(booking, ['customerDocument', 'customer_document', 'document', 'cpf'])),
    phone: toStableString(pickValue(booking, ['customerPhone', 'customer_phone', 'guest_phone', 'phone'])),
  };
}

function pickStable(response: { booking: Record<string, any> | null; guest: Record<string, any> | null }) {
  return {
    booking: pickStableBooking(response.booking),
    guest: pickStableGuest(response.guest),
  };
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

  assert.ok(codeColumn, `Tabela ${bookingTable} não expõe coluna de código de booking`);

  const result = await portalRepository.query(
    `select * from ${quoteIdent(bookingTable)} where ${quoteIdent(codeColumn)} = $1 limit 1`,
    [DEFAULT_BOOKING_CODE],
  );

  const booking = result.rows[0] || null;
  assert.ok(booking, `Fixture de booking ${DEFAULT_BOOKING_CODE} não encontrada`);

  return { bookingTable, booking };
}

async function runPortalBookingReadSmokeTests() {
  console.log('🧪 Running guest portal booking read smoke tests...');

  const tokenTable = await portalRepository.getTokenTable();
  assert.ok(
    tokenTable,
    'Nenhuma tabela de token de portal encontrada (guest_portal_tokens, portal_tokens ou guest_tokens)',
  );

  const { bookingTable, booking } = await resolveBookingFixture();
  const app = await createApp();
  const tokenService = new TokenService(portalRepository as any);
  const guestTable = await portalRepository.getGuestTable();

  const bookingId = String(
    pickValue(booking, ['id', 'booking_id', 'bookingId', 'reservation_id', 'reservationId']),
  );
  assert.ok(bookingId && bookingId !== 'undefined', 'Booking fixture sem identificador válido');

  const bookingsBefore = await countRows(bookingTable);
  const tokensBefore = await countRows(tokenTable);

  const unauthorized = await request(app).get('/api/portal/booking');
  assert.equal(unauthorized.status, 401, 'A rota deve exigir token de portal');

  const tokenResult = await tokenService.generateToken(bookingId);
  assert.equal(typeof tokenResult.token, 'string');
  assert.ok(tokenResult.token.length > 0, 'Token do portal não foi gerado');

  const tokensAfterGenerate = await countRows(tokenTable);
  assert.equal(tokensAfterGenerate, tokensBefore + 1, 'A geração do token deve inserir exatamente 1 linha');

  const withHeader = await request(app)
    .get('/api/portal/booking')
    .set('X-Portal-Token', tokenResult.token);

  const withBearer = await request(app)
    .get('/api/portal/booking')
    .set('Authorization', `Bearer portal_${tokenResult.token}`);

  assert.equal(withHeader.status, 200, 'X-Portal-Token deve autenticar a leitura');
  assert.equal(withBearer.status, 200, 'Authorization Bearer portal_<token> deve autenticar a leitura');

  assert.ok(withHeader.body?.booking && typeof withHeader.body.booking === 'object', 'booking ausente no response');
  assert.ok(withHeader.body?.guest && typeof withHeader.body.guest === 'object', 'guest ausente no response');
  assert.ok(withBearer.body?.booking && typeof withBearer.body.booking === 'object', 'booking ausente no response bearer');
  assert.ok(withBearer.body?.guest && typeof withBearer.body.guest === 'object', 'guest ausente no response bearer');

  const headerStable = pickStable(withHeader.body);
  const bearerStable = pickStable(withBearer.body);
  const expectedFallbackGuest = guestTable ? null : pickStableGuestFromBooking(booking);

  assert.deepEqual(headerStable, bearerStable, 'As duas formas de auth devem retornar o mesmo contrato estável');
  assert.deepEqual(
    headerStable.booking,
    pickStableBooking(booking),
    'O booking retornado deve refletir a fixture determinística SEED-ACC-001',
  );
  assert.ok(headerStable.guest.name || headerStable.guest.email, 'O guest retornado não pode ficar vazio');
  if (expectedFallbackGuest) {
    assert.deepEqual(
      headerStable.guest,
      expectedFallbackGuest,
      'Sem tabela dedicada de guest, o fallback deve usar os dados do booking',
    );
  }

  const bookingsAfter = await countRows(bookingTable);
  const tokensAfterValidate = await countRows(tokenTable);
  assert.equal(bookingsAfter, bookingsBefore, 'A leitura do booking não pode alterar a tabela de bookings');
  assert.equal(
    tokensAfterValidate,
    tokensBefore + 1,
    'A leitura deve apenas tocar o token existente, sem criar novas linhas',
  );

  console.log(
    JSON.stringify(
      {
        tokenTable,
        bookingTable,
        bookingCode: DEFAULT_BOOKING_CODE,
        noAuthRejected: unauthorized.status === 401,
        headerAuthOk: withHeader.status === 200,
        bearerAuthOk: withBearer.status === 200,
        stable: headerStable,
        counts: {
          bookingsBefore,
          bookingsAfter,
          tokensBefore,
          tokensAfterGenerate,
          tokensAfterValidate,
        },
      },
      null,
      2,
    ),
  );
}

if (require.main === module) {
  runPortalBookingReadSmokeTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('[guest-portal] booking read smoke failed:', error);
      process.exit(1);
    });
}

module.exports = { runPortalBookingReadSmokeTests, pickStable };
