const mockWhere = jest.fn();
const mockFrom = jest.fn(() => ({ where: mockWhere }));
const mockSelect = jest.fn((..._args: unknown[]) => ({ from: mockFrom }));
const mockUpdateWhere = jest.fn().mockResolvedValue(undefined);
const mockUpdateSet = jest.fn(() => ({ where: mockUpdateWhere }));
const mockUpdate = jest.fn((..._args: unknown[]) => ({ set: mockUpdateSet }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: (...args: unknown[]) => {
      mockSelect(...args);
      return { from: mockFrom };
    },
    update: (...args: unknown[]) => {
      mockUpdate(...args);
      return { set: mockUpdateSet };
    },
  },
}));

jest.mock('../../../../backend/src/db/schema/propostas', () => ({
  propostas: { id: 'id', roteiroEntregue: 'roteiro_entregue', updatedAt: 'updated_at' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

const mockLogEvent = jest.fn();

jest.mock('../../../../server/modules/propostas/services/propostas.service', () => ({
  propostasService: { logEvent: (...args: unknown[]) => mockLogEvent(...args) },
}));

import {
  entregarLinkRoteiroPosCompra,
  temConsentimentoWhatsApp,
} from '../../../../server/modules/propostas/services/roteiro-entrega.service';

describe('roteiro-entrega.service (PR 20+)', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.EVOLUTION_API_KEY;
    delete process.env.SENDGRID_API_KEY;
    delete process.env.SMTP_HOST;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('envia em demo mode quando canais ausentes', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 7,
        isPublica: true,
        tokenPublico: 'rt-demo',
        status: 'accepted',
        roteiroEntregue: false,
        clienteNome: 'Maria',
        clienteTelefone: '62999999999',
        clienteEmail: null,
        conteudo: { inclusions: { destination: 'Caldas Novas' } },
        metadata: {},
      },
    ]);

    const result = await entregarLinkRoteiroPosCompra(7);

    expect(result).toMatchObject({ sent: true, demo: true, propostaId: 7 });
    expect(mockLogEvent).toHaveBeenCalledWith(
      7,
      'roteiro_link_demo',
      expect.any(String),
      expect.objectContaining({ demo: true }),
    );
    expect(mockUpdate).toHaveBeenCalled();
    expect(mockUpdateSet).toHaveBeenCalledWith(
      expect.objectContaining({ roteiroEntregue: true }),
    );
  });

  it('ignora proposta com status inválido', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 8,
        isPublica: true,
        tokenPublico: 'rt-sent',
        status: 'sent',
        roteiroEntregue: false,
        conteudo: {},
      },
    ]);

    const result = await entregarLinkRoteiroPosCompra(8);
    expect(result).toMatchObject({ skipped: true, reason: 'status_invalido' });
    expect(mockLogEvent).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('não reenvia se roteiro_entregue=true', async () => {
    mockWhere.mockResolvedValueOnce([
      {
        id: 9,
        isPublica: true,
        tokenPublico: 'rt-ok',
        status: 'accepted',
        roteiroEntregue: true,
        conteudo: {},
      },
    ]);

    const result = await entregarLinkRoteiroPosCompra(9);
    expect(result).toMatchObject({ skipped: true, reason: 'ja_entregue' });
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it('temConsentimentoWhatsApp exige telefone e não bloqueia aceite', () => {
    expect(
      temConsentimentoWhatsApp({
        clienteTelefone: '62999999999',
        metadata: {},
        status: 'accepted',
      }),
    ).toBe(true);
    expect(
      temConsentimentoWhatsApp({
        clienteTelefone: '62999999999',
        metadata: { consentimentoLgpd: false },
        status: 'accepted',
      }),
    ).toBe(false);
  });
});
