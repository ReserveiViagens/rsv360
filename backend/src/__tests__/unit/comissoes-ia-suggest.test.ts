import { sugerirPercentuaisComissoes } from '../../../../server/modules/comissoes/services/comissoes-ia-suggest';

describe('comissoes-ia-suggest', () => {
  it('objetivo padrao retorna split oficial Reservei 20/5/75', async () => {
    const result = await sugerirPercentuaisComissoes({ objetivo: 'padrao' });
    expect(result.taxaPlataformaPct).toBe(20);
    expect(result.taxaCorretorPct).toBe(5);
    expect(result.margemProprietarioPct).toBe(75);
    expect(result.fonte).toBe('oficial_reservei');
  });

  it('objetivo captar_corretores ajusta fatia do corretor', async () => {
    const result = await sugerirPercentuaisComissoes({ objetivo: 'captar_corretores' });
    expect(result.taxaCorretorPct).toBe(7);
    expect(result.taxaPlataformaPct + result.taxaCorretorPct).toBeLessThanOrEqual(100);
  });
});
