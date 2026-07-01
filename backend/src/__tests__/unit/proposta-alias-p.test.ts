import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildRoteiroAutenticidadeUrl } from '../../../../apps/site-publico/lib/roteiro-autenticidade';

describe('alias /p (PR 17 follow-up)', () => {
  it('página Next /p/[token] reutiliza renderPropostaTokenPage', () => {
    const pagePath = resolve(
      __dirname,
      '../../../../apps/site-publico/app/p/[token]/page.tsx',
    );
    const source = readFileSync(pagePath, 'utf8');
    expect(source).toContain('renderPropostaTokenPage');
    expect(source).toMatch(/\/p\/:token/i);
  });

  it('rotas cotacao-publica expõem GET /p/:token com publicLimiter', () => {
    const routesPath = resolve(
      __dirname,
      '../../../../server/modules/cotacao-publica/routes/index.ts',
    );
    const source = readFileSync(routesPath, 'utf8');
    expect(source).toMatch(/router\.get\('\/p\/:token', publicLimiter/);
  });

  it('buildRoteiroAutenticidadeUrl aponta para /roteiro/verificar/:token no domínio oficial', () => {
    const prev = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL;
    process.env.NEXT_PUBLIC_PUBLIC_BASE_URL = 'https://www.reserveiviagens.com.br';
    expect(buildRoteiroAutenticidadeUrl('rt-abc123')).toBe(
      'https://www.reserveiviagens.com.br/roteiro/verificar/rt-abc123',
    );
    process.env.NEXT_PUBLIC_PUBLIC_BASE_URL = prev;
  });
});
