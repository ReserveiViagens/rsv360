import { roteiroInteligentePreviewAtivo } from '@rsv360/shared';
import { isRoteiroInteligenteEnabled } from '../../../../server/modules/cotacao-publica/services/montar-roteiro';
import { CATALOGO_TESTE } from '../fixtures/roteiro-atracoes.fixture';

describe('roteiro inteligente — flag único server + guarda preview', () => {
  const envKey = 'ROTEIRO_INTELIGENTE_ENABLED';
  let previous: string | undefined;

  beforeEach(() => {
    previous = process.env[envKey];
  });

  afterEach(() => {
    if (previous === undefined) delete process.env[envKey];
    else process.env[envKey] = previous;
  });

  it('server OFF — preview degrada para legado mesmo com catálogo disponível (anti-divergência)', () => {
    process.env[envKey] = 'false';
    expect(isRoteiroInteligenteEnabled()).toBe(false);
    expect(roteiroInteligentePreviewAtivo(false, CATALOGO_TESTE)).toBe(false);
  });

  it('server ON + catálogo — preview pode usar motor inteligente', () => {
    process.env[envKey] = 'true';
    expect(isRoteiroInteligenteEnabled()).toBe(true);
    expect(roteiroInteligentePreviewAtivo(true, CATALOGO_TESTE)).toBe(true);
  });

  it('server ON + catálogo vazio — preview degrada para legado', () => {
    expect(roteiroInteligentePreviewAtivo(true, [])).toBe(false);
    expect(roteiroInteligentePreviewAtivo(true, null)).toBe(false);
  });
});
