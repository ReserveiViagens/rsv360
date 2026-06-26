import { detectarObjecaoPreco } from '../../../../server/modules/propostas/objecao';

describe('objecao — detectarObjecaoPreco', () => {
  it('detecta objeção de preço', () => {
    expect(detectarObjecaoPreco('Achei muito caro')).toBe(true);
    expect(detectarObjecaoPreco('preço alto demais')).toBe(true);
  });

  it('ignora mensagem neutra', () => {
    expect(detectarObjecaoPreco('Qual a data de check-in?')).toBe(false);
    expect(detectarObjecaoPreco('')).toBe(false);
  });
});
