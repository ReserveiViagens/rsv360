/**
 * PR-03b — BOLA/IDOR unit tests (propostas :id access).
 * No jest.mock on db — pure authorize helpers.
 */

import {
  assertAnonymousIdPayloadSafe,
  authorizePropostaIdRead,
  authorizePropostaIdSensitive,
  authorizePropostaVisualizacao,
  buildAnonymousIdLookupPayload,
  isRtPublicToken,
} from '../../../../server/modules/propostas/proposta-access';

const rowPublic = {
  id: 42,
  isPublica: true,
  clienteEmail: 'alice@example.com',
  tokenPublico: 'rt-abcdefghijklmnopqrstu',
  titulo: 'Pacote Caldas',
  status: 'sent',
  clienteNome: 'Alice',
  valorTotal: '1000',
  moeda: 'BRL',
};

const rowPrivate = { ...rowPublic, id: 43, isPublica: false };

describe('PR-03b proposta-access', () => {
  it('rt-* is capability token shape', () => {
    expect(isRtPublicToken('rt-abcdefghijklmnopqrstu')).toBe(true);
    expect(isRtPublicToken('RSV-20260720-123456-7890')).toBe(false);
    expect(isRtPublicToken('42')).toBe(false);
  });

  it('anonymous id payload never leaks tokenPublico / PII / chat', () => {
    const payload = buildAnonymousIdLookupPayload(rowPublic);
    expect(assertAnonymousIdPayloadSafe(payload)).toBe(true);
    expect(payload).not.toHaveProperty('tokenPublico');
    expect(payload.payloadReduzido).toBe(true);
    expect(payload.id).toBe(42);
  });

  it('anon + isPublica → redacted; anon + private → 404', () => {
    expect(authorizePropostaIdRead({ user: null, row: rowPublic })).toEqual({
      ok: true,
      mode: 'redacted',
    });
    expect(authorizePropostaIdRead({ user: null, row: rowPrivate })).toEqual({
      ok: false,
      status: 404,
    });
  });

  it('JWT without ownership → 404 (horizontal BOLA)', () => {
    expect(
      authorizePropostaIdRead({
        user: { email: 'bob@example.com', role: 'customer' },
        row: rowPublic,
      }),
    ).toEqual({ ok: false, status: 404 });
  });

  it('owner / staff → full', () => {
    expect(
      authorizePropostaIdRead({
        user: { email: 'alice@example.com', role: 'customer' },
        row: rowPublic,
      }),
    ).toEqual({ ok: true, mode: 'full' });
    expect(
      authorizePropostaIdRead({
        user: { email: 'admin@example.com', role: 'admin' },
        row: rowPrivate,
      }),
    ).toEqual({ ok: true, mode: 'full' });
  });

  it('sensitive: anon without capability → 404; with matching rt token → ok', () => {
    expect(
      authorizePropostaIdSensitive({ user: null, row: rowPublic }),
    ).toEqual({ ok: false, status: 404 });
    expect(
      authorizePropostaIdSensitive({
        user: null,
        row: rowPublic,
        capabilityToken: 'rt-abcdefghijklmnopqrstu',
      }),
    ).toEqual({ ok: true });
    expect(
      authorizePropostaIdSensitive({
        user: null,
        row: rowPublic,
        capabilityToken: 'rt-wrongtokenxxxxxxxxxx',
      }),
    ).toEqual({ ok: false, status: 404 });
  });

  it('visualizacao: public anon ok; private anon 404', () => {
    expect(
      authorizePropostaVisualizacao({ user: null, row: rowPublic }),
    ).toEqual({ ok: true });
    expect(
      authorizePropostaVisualizacao({ user: null, row: rowPrivate }),
    ).toEqual({ ok: false, status: 404 });
  });
});
