import { chaveCache } from '../../../../server/modules/fornecedores-hub/cache';

describe('fornecedores-hub — chaveCache', () => {
  it('normaliza destino para slug sem acento', () => {
    expect(chaveCache('hospedagem', 'Caldas Novas')).toBe('hospedagem:caldas-novas');
    expect(chaveCache('hospedagem', 'São Paulo')).toBe('hospedagem:sao-paulo');
  });

  it('inclui tipo na chave', () => {
    expect(chaveCache('ingresso', 'Rio de Janeiro')).toBe('ingresso:rio-de-janeiro');
  });

  it('usa default quando destino vazio após normalização', () => {
    expect(chaveCache('hospedagem', '!!!')).toBe('hospedagem:default');
  });
});
