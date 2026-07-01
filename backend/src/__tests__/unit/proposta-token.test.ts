import { gerarTokenPublicoProposta } from '../../../../server/lib/proposta-token';

describe('gerarTokenPublicoProposta', () => {
  it('usa prefixo rt- e nanoid de 21 caracteres', () => {
    const token = gerarTokenPublicoProposta();
    expect(token).toMatch(/^rt-[A-Za-z0-9_-]{21}$/);
  });

  it('gera tokens distintos', () => {
    const a = gerarTokenPublicoProposta();
    const b = gerarTokenPublicoProposta();
    expect(a).not.toBe(b);
  });
});
