import qs from 'qs';
import { DisputeUpdateSchema } from '../../../server/modules/payments/schemas/dispute-write.schema';
import { parsePaymentUuidParam } from '../../../server/modules/payments/schemas/params.schema';
import { SubscriptionPlanUpdateSchema } from '../../../server/modules/payments/schemas/subscription-write.schema';
import {
  PropostaIdParamSchema,
  PropostaUpdateSchema,
  PropostaWriteSchema,
} from '../../../../server/modules/propostas/schemas/proposta-write.schema';
import { AddonPatchSchema } from '../../../../server/modules/acomodacoes/schemas/write-allowlist.schema';

/** Mirror of backend/app.js PR-07b query parser options (C4). */
function parseQueryLimited(str: string) {
  return qs.parse(str, { depth: 0, parameterLimit: 100, allowPrototypes: false });
}

describe('PR-07b Zod.strict + anti mass-assignment', () => {
  it('rejects extra isAdmin on dispute update (.strict)', () => {
    const parsed = DisputeUpdateSchema.safeParse({ status: 'won', isAdmin: true });
    expect(parsed.success).toBe(false);
  });

  it('rejects nested operator-shaped body field with wrong type', () => {
    const parsed = DisputeUpdateSchema.safeParse({ reason: { $ne: null } });
    expect(parsed.success).toBe(false);
  });

  it('rejects unknown keys on subscription plan update', () => {
    const parsed = SubscriptionPlanUpdateSchema.safeParse({
      name: 'Pro',
      enterpriseId: '00000000-0000-4000-8000-000000000001',
      stripeProductId: 'price_evil',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects non-uuid dispute/subscription id (I2)', () => {
    expect(() => parsePaymentUuidParam('not-a-uuid')).toThrow();
    expect(() => parsePaymentUuidParam('12')).toThrow();
  });

  it('accepts uuid id', () => {
    expect(parsePaymentUuidParam('550e8400-e29b-41d4-a716-446655440000')).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('rejects NaN / non-numeric proposta id', () => {
    expect(PropostaIdParamSchema.safeParse({ id: 'abc' }).success).toBe(false);
    expect(PropostaIdParamSchema.safeParse({ id: '12.5' }).success).toBe(false);
  });

  it('rejects mass-assignment extras on proposta write', () => {
    const parsed = PropostaWriteSchema.safeParse({
      titulo: 'Pacote',
      clienteNome: 'Ana',
      isAdmin: true,
      role: 'admin',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects extras on proposta update and addon patch', () => {
    expect(PropostaUpdateSchema.safeParse({ status: 'sent', password: 'x' }).success).toBe(false);
    expect(AddonPatchSchema.safeParse({ nome: 'Wifi', isAdmin: true }).success).toBe(false);
  });

  it('query parser depth 0 does not build deep nested objects (C4)', () => {
    const nested = parseQueryLimited('filter[role][$ne]=null');
    // depth 0 keeps bracket keys as literals — no object operator tree
    expect(nested).toEqual({ 'filter[role][$ne]': 'null' });
    const shallow = parseQueryLimited('status=sent&enterprise_id=1');
    expect(shallow).toEqual({ status: 'sent', enterprise_id: '1' });
  });
});
