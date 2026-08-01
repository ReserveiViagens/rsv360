import {
  EngineCalculateSchema,
  PricingRuleCreateSchema,
  PricingRuleUpdateSchema,
  parsePositiveIntId as parseRevenueId,
} from '../../../../server/modules/revenue/schemas/revenue-write.schema';
import {
  ContaReceberCreateSchema,
  TransacaoCreateSchema,
  TransacaoUpdateSchema,
  parsePositiveIntId as parseFinanceiroId,
} from '../../../../server/modules/financeiro/schemas/financeiro-write.schema';

describe('PR-07c2 Zod.strict + anti mass-assignment (revenue + financeiro)', () => {
  it('rejects extra isAdmin on pricing rule create (.strict)', () => {
    const parsed = PricingRuleCreateSchema.safeParse({
      name: 'Occ high',
      rule_type: 'OCCUPANCY',
      adjustment_type: 'percentage',
      adjustment_value: 10,
      isAdmin: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects nested operator-shaped field on pricing rule update', () => {
    const parsed = PricingRuleUpdateSchema.safeParse({ description: { $ne: null } });
    expect(parsed.success).toBe(false);
  });

  it('rejects extras on engine calculate', () => {
    const parsed = EngineCalculateSchema.safeParse({
      roomTypeId: 1,
      date: '2026-08-01',
      role: 'admin',
      password: 'x',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid revenue id param (I2)', () => {
    expect(() => parseRevenueId('abc')).toThrow();
    expect(() => parseRevenueId('12.5')).toThrow();
    expect(() => parseRevenueId('-1')).toThrow();
  });

  it('accepts positive int revenue id', () => {
    expect(parseRevenueId('9')).toBe(9);
  });

  it('rejects extra isAdmin on financeiro transacao create (.strict)', () => {
    const parsed = TransacaoCreateSchema.safeParse({
      tipo: 'receita',
      descricao: 'Venda',
      valor: '100.00',
      isAdmin: true,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects operator-shaped descricao on transacao update', () => {
    const parsed = TransacaoUpdateSchema.safeParse({ descricao: { $ne: null } });
    expect(parsed.success).toBe(false);
  });

  it('rejects extras on conta receber create', () => {
    const parsed = ContaReceberCreateSchema.safeParse({
      clienteNome: 'Ana',
      descricao: 'Hospedagem',
      valor: 250,
      role: 'admin',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid financeiro id param (I2)', () => {
    expect(() => parseFinanceiroId('not-a-number')).toThrow();
    expect(parseFinanceiroId('3')).toBe(3);
  });
});
