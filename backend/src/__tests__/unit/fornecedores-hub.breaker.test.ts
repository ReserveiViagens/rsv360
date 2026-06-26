import { comBreaker } from '../../../../server/modules/fornecedores-hub/breaker';
import type { FornecedorAdapter } from '../../../../server/modules/fornecedores-hub/types';

describe('fornecedores-hub — circuit breaker', () => {
  it('fallback retorna [] quando adapter falha repetidamente', async () => {
    const failing: FornecedorAdapter = {
      nome: 'fail',
      buscar: async () => {
        throw new Error('upstream down');
      },
    };

    const wrapped = comBreaker(failing, {
      fornecedor: 'FailCo',
      adapterKey: 'generic-hotel',
      timeoutMs: 200,
    });

    const results: unknown[][] = [];
    for (let i = 0; i < 5; i++) {
      results.push(await wrapped.buscar('Caldas', {}));
    }

    expect(results.every((r) => Array.isArray(r) && r.length === 0)).toBe(true);
  });
});
