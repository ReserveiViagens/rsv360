import {
  calcularBaseElegivelTaxa,
  calcularPlataformaTotal,
  calcularSplitComissoesCentavos,
  calcularTaxaHospede,
  resolveTaxaHospedePct,
  roundCentavosHalfUp,
} from '@rsv360/shared';

describe('taxa-hospede (shared)', () => {
  describe('roundCentavosHalfUp', () => {
    it('arredonda half-up em centavos', () => {
      expect(roundCentavosHalfUp(6.665)).toBe(6.67);
      expect(roundCentavosHalfUp(6.664)).toBe(6.66);
    });
  });

  describe('calcularBaseElegivelTaxa', () => {
    it('soma apenas categoria hotel + add-ons', () => {
      const base = calcularBaseElegivelTaxa(
        [
          { categoria: 'hotel', precoTotal: '800' },
          { categoria: 'hotel', precoTotal: '200' },
          { categoria: 'ticket', precoTotal: '150' },
          { categoria: 'accommodation', precoTotal: '70' },
          { categoria: 'insurance', precoTotal: '30' },
        ],
        50,
      );
      expect(base).toBe(1050);
    });
  });

  describe('calcularTaxaHospede', () => {
    it('flag off = zero efeito', () => {
      expect(calcularTaxaHospede(1000, 2, false)).toEqual({ pct: 2, valor: 0, ativa: false });
    });

    it('flag on com pct ausente usa default 2%', () => {
      const taxa = calcularTaxaHospede(1000, NaN, true);
      expect(taxa.pct).toBe(2);
      expect(taxa.valor).toBe(20);
      expect(taxa.ativa).toBe(true);
    });

    it('resolveTaxaHospedePct com ativa e pct ausente', () => {
      expect(resolveTaxaHospedePct(undefined, true)).toBe(2);
    });

    it('2% sobre base 1000', () => {
      expect(calcularTaxaHospede(1000, 2, true).valor).toBe(20);
    });
  });

  describe('calcularSplitComissoesCentavos', () => {
    const config = { taxaPlataformaPct: 18, taxaCorretorPct: 5 };

    it('split 18/5/77 com corretor — simulação referência', () => {
      const split = calcularSplitComissoesCentavos(1000, config, { temCorretor: true });
      expect(split.plataforma).toEqual({ percentual: 18, valor: 180 });
      expect(split.corretor).toEqual({ percentual: 5, valor: 50 });
      expect(split.proprietario).toEqual({ percentual: 77, valor: 770 });
    });

    it('sem corretor: anfitrião 82%', () => {
      const split = calcularSplitComissoesCentavos(1000, config, { temCorretor: false });
      expect(split.corretor.valor).toBe(0);
      expect(split.proprietario).toEqual({ percentual: 82, valor: 820 });
    });

    it('residual anfitrião absorve sobra em centavos', () => {
      const split = calcularSplitComissoesCentavos(333.33, config, { temCorretor: true });
      const sum = roundCentavosHalfUp(
        split.plataforma.valor + split.corretor.valor + split.proprietario.valor,
      );
      expect(sum).toBe(333.33);
    });
  });

  describe('taxa fora do split + plataforma total', () => {
    it('referência R$ 1000: hóspede 1020, plataforma 200 (180+20)', () => {
      const config = { taxaPlataformaPct: 18, taxaCorretorPct: 5 };
      const split = calcularSplitComissoesCentavos(1000, config, { temCorretor: true });
      const taxa = calcularTaxaHospede(1000, 2, true);
      const plataforma = calcularPlataformaTotal(split, taxa);
      expect(taxa.valor).toBe(20);
      expect(plataforma).toEqual({ split: 180, taxa: 20, total: 200 });
      expect(1000 + taxa.valor).toBe(1020);
      expect(split.proprietario.valor).toBe(770);
      expect(split.corretor.valor).toBe(50);
    });
  });
});
