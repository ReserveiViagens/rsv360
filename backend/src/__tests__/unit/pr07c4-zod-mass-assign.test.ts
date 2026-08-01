import {
  CampanhaCreateSchema,
  CupomCreateSchema,
  CupomUsoSchema,
  CupomValidarSchema,
} from '../../../../server/modules/campanhas/schemas/campanhas-write.schema';
import {
  EmbarqueCreateSchema,
  TransporteCreateSchema,
  VoucherCreateSchema,
} from '../../../../server/modules/logistica/schemas/logistica-write.schema';
import {
  OrcamentoCreateSchema,
  OrcamentoItemCreateSchema,
} from '../../../../server/modules/orcamentos/schemas/orcamentos-write.schema';
import {
  DocumentoSchema,
  FnrhCreateSchema,
  PassageiroCreateSchema,
} from '../../../../server/modules/passageiros/schemas/passageiros-write.schema';
import {
  PropertyAddUserSchema,
  PropertyCreateSchema,
  PropertySettingsWriteSchema,
  PropertySwitchSchema,
  PropertyUpdateSchema,
} from '../../../../server/modules/multi-property/schemas/multi-property-write.schema';
import {
  parseNonNegativeIntParam,
  parsePositiveIntId,
  parsePositiveIntParam,
} from '../../../../server/lib/parse-id';

describe('PR-07c4 residual Zod mass-assign (.strict)', () => {
  it('rejects isAdmin on campanha/cupom creates', () => {
    expect(
      CampanhaCreateSchema.safeParse({ nome: 'Summer', isAdmin: true }).success,
    ).toBe(false);
    expect(
      CupomCreateSchema.safeParse({
        codigo: 'SAVE10',
        valorDesconto: 10,
        role: 'admin',
      }).success,
    ).toBe(false);
  });

  it('rejects password on cupom validar/uso', () => {
    expect(CupomValidarSchema.safeParse({ codigo: 'X', password: 'x' }).success).toBe(false);
    expect(
      CupomUsoSchema.safeParse({ valorDesconto: '5', password: 'x' }).success,
    ).toBe(false);
  });

  it('rejects $ne-shaped fields on logística', () => {
    expect(
      TransporteCreateSchema.safeParse({
        tipo: { $ne: null },
      }).success,
    ).toBe(false);
    expect(
      EmbarqueCreateSchema.safeParse({
        transporteId: 1,
        local: 'Gate A',
        dataHora: '2026-08-01T10:00:00Z',
        isAdmin: true,
      }).success,
    ).toBe(false);
  });

  it('rejects role on voucher/orçamento/item', () => {
    expect(
      VoucherCreateSchema.safeParse({ titulo: 'Transfer', role: 'admin' }).success,
    ).toBe(false);
    expect(
      OrcamentoCreateSchema.safeParse({
        titulo: 'Pacote',
        clienteNome: 'Ana',
        password: 'x',
      }).success,
    ).toBe(false);
    expect(
      OrcamentoItemCreateSchema.safeParse({ nome: 'Diária', isAdmin: true }).success,
    ).toBe(false);
  });

  it('rejects privileged keys on passageiro/fnrh/documento', () => {
    expect(
      PassageiroCreateSchema.safeParse({ nome: 'João', isAdmin: true }).success,
    ).toBe(false);
    expect(
      FnrhCreateSchema.safeParse({ hotelNome: 'Hotel', role: 'admin' }).success,
    ).toBe(false);
    expect(
      DocumentoSchema.safeParse({ tipo: 'rg', password: 'x' }).success,
    ).toBe(false);
  });

  it('rejects owner_id/isAdmin on property create/update/settings/switch', () => {
    expect(
      PropertyCreateSchema.safeParse({ name: 'Pousada X', owner_id: 99 }).success,
    ).toBe(false);
    expect(
      PropertyUpdateSchema.safeParse({ name: 'Y', isAdmin: true }).success,
    ).toBe(false);
    expect(
      PropertySettingsWriteSchema.safeParse({ isAdmin: true }).success,
    ).toBe(false);
    expect(
      PropertySettingsWriteSchema.safeParse({
        settings: { theme: 'dark' },
        role: 'admin',
      }).success,
    ).toBe(false);
    expect(
      PropertySwitchSchema.safeParse({ propertyId: 1, password: 'x' }).success,
    ).toBe(false);
    expect(
      PropertyAddUserSchema.safeParse({ userId: 2, role: 'owner', isAdmin: true }).success,
    ).toBe(false);
  });

  it('accepts valid residual payloads and shared id parsers', () => {
    expect(CampanhaCreateSchema.safeParse({ nome: 'Campanha A' }).success).toBe(true);
    expect(
      CupomCreateSchema.safeParse({ codigo: 'VIP', valorDesconto: '15.5' }).success,
    ).toBe(true);
    expect(
      PropertyCreateSchema.safeParse({ name: 'Hotel Lago', type: 'hotel' }).success,
    ).toBe(true);
    expect(
      PropertySettingsWriteSchema.safeParse({ settings: { theme: 'dark' } }).success,
    ).toBe(true);
    expect(parsePositiveIntId('12')).toBe(12);
    expect(parsePositiveIntParam('3', 'itemId')).toBe(3);
    expect(parseNonNegativeIntParam('0', 'index')).toBe(0);
    expect(() => parsePositiveIntId('abc')).toThrow();
    expect(() => parseNonNegativeIntParam('-1', 'index')).toThrow();
  });
});
