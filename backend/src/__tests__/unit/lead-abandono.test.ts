const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSendMessage = jest.fn();

jest.mock('../../../../server/lib/db', () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

jest.mock('../../../../backend/src/db/schema/cotacao-leads', () => ({
  cotacaoLeads: {
    id: 'id',
    enviadoWhatsapp: 'enviado_whatsapp',
    whatsappErro: 'whatsapp_erro',
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(() => true),
}));

jest.mock('../../../../server/modules/communication/providers/whatsapp/evolution-api.provider', () => ({
  EvolutionAPIWhatsAppProvider: jest.fn().mockImplementation(() => ({
    sendMessage: (...args: unknown[]) => mockSendMessage(...args),
  })),
}));

import { registrarLeadAbandono } from '../../../../server/modules/cotacao-publica/services/lead-abandono.service';

describe('lead-abandono.service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: 1,
            enviadoWhatsapp: false,
            consentimentoLgpd: false,
          },
        ]),
      }),
    });
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    });
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('persiste consentimento_lgpd=false e não envia WhatsApp sem consentimento', async () => {
    const result = await registrarLeadAbandono({
      passo: 2,
      whatsapp: '64999999999',
      consentimentoLgpd: false,
    });

    expect(result.analyticsOnly).toBe(true);
    expect(result.enviadoWhatsapp).toBe(false);
    expect(mockSendMessage).not.toHaveBeenCalled();
    const insertChain = mockInsert.mock.results[0].value;
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({
        consentimentoLgpd: false,
        enviadoWhatsapp: false,
        whatsapp: '64999999999',
      }),
    );
  });

  it('envia Evolution quando whatsapp + consentimento + env configurado', async () => {
    process.env.EVOLUTION_API_KEY = 'test-key';
    process.env.COTACAO_ABANDONO_WHATSAPP = '5564993197555';
    mockSendMessage.mockResolvedValue({ success: true, messageId: 'msg-1' });

    const result = await registrarLeadAbandono({
      passo: 3,
      passoNome: 'Diversão',
      whatsapp: '64999998888',
      nome: 'Maria',
      consentimentoLgpd: true,
      hotelId: 'ht-1',
    });

    expect(result.enviadoWhatsapp).toBe(true);
    expect(result.analyticsOnly).toBe(false);
    expect(mockSendMessage).toHaveBeenCalled();
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('sem whatsapp: só persiste linha (analytics/CRM)', async () => {
    const result = await registrarLeadAbandono({
      passo: 1,
      consentimentoLgpd: true,
    });

    expect(result.analyticsOnly).toBe(true);
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
