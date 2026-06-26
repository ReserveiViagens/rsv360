import type { OfertaNormalizada } from '@rsv360/shared';
import { aplicarFiltroGarantia } from '../../../../server/modules/propostas/ancoragem';

function oferta(preco: number, titulo = 'Hotel'): OfertaNormalizada {
  return {
    fornecedor: 'x',
    tipo: 'hospedagem',
    titulo,
    preco,
    moeda: 'BRL',
    imagens: [],
    descricao: '',
    fonte: 'https://example.com',
    capturadoEm: new Date().toISOString(),
  };
}

describe('ancoragem — aplicarFiltroGarantia', () => {
  it('inclui concorrente estritamente maior', () => {
    const r = aplicarFiltroGarantia(500, [oferta(600), oferta(400)]);
    expect(r.comparativo).toHaveLength(1);
    expect(r.comparativo[0].preco).toBe(600);
    expect(r.temAncora).toBe(true);
    expect(r.exibirComparativo).toBe(false);
  });

  it('descarta empate e mais barato', () => {
    const r = aplicarFiltroGarantia(500, [oferta(500), oferta(450)]);
    expect(r.comparativo).toHaveLength(0);
    expect(r.temAncora).toBe(false);
  });

  it('retorna vazio quando nenhum maior', () => {
    const r = aplicarFiltroGarantia(800, [oferta(700), oferta(100)]);
    expect(r.comparativo).toHaveLength(0);
    expect(r.temAncora).toBe(false);
  });

  it('ignora preço inválido', () => {
    const r = aplicarFiltroGarantia(500, [oferta(NaN), oferta(0), oferta(-1), oferta(600)]);
    expect(r.comparativo).toHaveLength(1);
  });

  it('precoAgencia inválido → sem comparativo', () => {
    const r = aplicarFiltroGarantia(0, [oferta(900)]);
    expect(r.comparativo).toHaveLength(0);
    expect(r.temAncora).toBe(false);
  });

  it('preserva fonte e capturadoEm nas ofertas filtradas', () => {
    const o = oferta(700);
    const r = aplicarFiltroGarantia(500, [o]);
    expect(r.comparativo[0].fonte).toBe(o.fonte);
    expect(r.comparativo[0].capturadoEm).toBe(o.capturadoEm);
  });
});
