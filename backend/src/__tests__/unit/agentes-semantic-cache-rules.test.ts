import {
  TIPOS_CACHE_SEMANTICO_BLOQUEADOS,
  carimboMatches,
  isTipoCacheavel,
} from '../../../../server/modules/agentes/semantic-cache.service';
import type { AgenteCarimboContexto } from '../../../../backend/src/db/schema/agentes-cache-semantico';

describe('SemanticCache — regras puras (sem embedding real)', () => {
  const base: AgenteCarimboContexto = {
    agente: 'instrutor',
    entidade: 'anfitriao/unidades',
    idioma: 'pt-BR',
    perfil: 'parceiro',
    versao_base: 'v1',
  };

  it('bloqueia tipos preco e disponibilidade', () => {
    expect(TIPOS_CACHE_SEMANTICO_BLOQUEADOS).toEqual(['preco', 'disponibilidade']);
    expect(isTipoCacheavel('preco')).toBe(false);
    expect(isTipoCacheavel('disponibilidade')).toBe(false);
    expect(isTipoCacheavel('PRECO')).toBe(false);
    expect(isTipoCacheavel('onboarding')).toBe(true);
    expect(isTipoCacheavel(undefined)).toBe(true);
  });

  it('carimbo: entidade diferente => miss mesmo texto', () => {
    const a = { ...base, entidade: 'anfitriao/unidades' };
    const b = { ...base, entidade: 'anfitriao/tarifas' };
    expect(carimboMatches(a, b)).toBe(false);
    expect(carimboMatches(a, { ...a })).toBe(true);
  });

  it('carimbo exige agente/idioma/perfil/versao iguais', () => {
    expect(carimboMatches(base, { ...base, idioma: 'en' })).toBe(false);
    expect(carimboMatches(base, { ...base, perfil: 'staff' })).toBe(false);
    expect(carimboMatches(base, { ...base, versao_base: 'v2' })).toBe(false);
    expect(carimboMatches(base, { ...base, agente: 'roteiro' })).toBe(false);
  });
});
