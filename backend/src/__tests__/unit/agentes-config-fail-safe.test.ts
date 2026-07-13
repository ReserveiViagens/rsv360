const mockSelectLimit = jest.fn();
const mockSelectWhere = jest.fn(() => ({ limit: mockSelectLimit }));
const mockSelectFrom = jest.fn(() => ({ where: mockSelectWhere }));
const mockSelect = jest.fn(() => ({ from: mockSelectFrom }));

jest.mock('../../../../server/lib/db', () => ({
  db: {
    select: () => mockSelect(),
  },
}));

jest.mock('../../../../backend/src/db/schema/configuracoes-sistema', () => ({
  configuracoesSistema: { chave: 'chave', valores: 'valores' },
}));

jest.mock('drizzle-orm', () => ({
  eq: (...args: unknown[]) => args,
}));

import { AgentesConfigService } from '../../../../server/modules/agentes/config.service';
import {
  AGENTES_CONFIG_PADRAO,
  parseAgentesModuloAtivo,
  configFromValores,
} from '../../../../server/modules/agentes/schema';

describe('Agentes — fail-safe flag (agentes_modulo_ativo === true)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('parseAgentesModuloAtivo: ausente/false/null => false; só true ativa', () => {
    expect(parseAgentesModuloAtivo({})).toBe(false);
    expect(parseAgentesModuloAtivo({ agentes_modulo_ativo: false })).toBe(false);
    expect(parseAgentesModuloAtivo({ agentes_modulo_ativo: null as unknown as boolean })).toBe(
      false,
    );
    expect(parseAgentesModuloAtivo({ agentes_modulo_ativo: 'true' as unknown as boolean })).toBe(
      false,
    );
    expect(parseAgentesModuloAtivo({ agentes_modulo_ativo: 1 as unknown as boolean })).toBe(false);
    expect(parseAgentesModuloAtivo({ agentes_modulo_ativo: true })).toBe(true);
    expect(parseAgentesModuloAtivo({ agentesModuloAtivo: true })).toBe(true);
  });

  it('isModuloAtivo retorna false quando chave ausente', async () => {
    mockSelectLimit.mockResolvedValueOnce([]);
    await expect(AgentesConfigService.isModuloAtivo()).resolves.toBe(false);
  });

  it('isModuloAtivo retorna false quando valores.agentes_modulo_ativo não é true', async () => {
    mockSelectLimit.mockResolvedValueOnce([{ valores: { agentes_modulo_ativo: false } }]);
    await expect(AgentesConfigService.isModuloAtivo()).resolves.toBe(false);

    mockSelectLimit.mockResolvedValueOnce([{ valores: {} }]);
    await expect(AgentesConfigService.isModuloAtivo()).resolves.toBe(false);
  });

  it('isModuloAtivo retorna true só com true literal', async () => {
    mockSelectLimit.mockResolvedValueOnce([{ valores: { agentes_modulo_ativo: true } }]);
    await expect(AgentesConfigService.isModuloAtivo()).resolves.toBe(true);
  });

  it('obterConfig usa padrão fail-safe (módulo OFF) quando ausente', async () => {
    mockSelectLimit.mockResolvedValueOnce([]);
    const cfg = await AgentesConfigService.obterConfig();
    expect(cfg).toEqual(AGENTES_CONFIG_PADRAO);
    expect(cfg.agentesModuloAtivo).toBe(false);
  });

  it('configFromValores lê limiares e TTLs do seed', () => {
    const cfg = configFromValores({
      agentes_modulo_ativo: false,
      limiar_semantico_hit: 0.92,
      limiar_semantico_verificar: 0.85,
      ttl_cache_institucional_dias: 7,
      ttl_cache_catalogo_horas: 24,
    });
    expect(cfg.limiarSemanticoHit).toBe(0.92);
    expect(cfg.limiarSemanticoVerificar).toBe(0.85);
    expect(cfg.ttlCacheInstitucionalDias).toBe(7);
    expect(cfg.ttlCacheCatalogoHoras).toBe(24);
  });
});
