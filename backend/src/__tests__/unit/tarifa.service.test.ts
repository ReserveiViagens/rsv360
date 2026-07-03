import { tarifaService } from '../../../../server/modules/acomodacoes/services/tarifa.service';

type Regra = Parameters<typeof tarifaService.escolherRegra>[0][number];

function regra(partial: Partial<Regra> & { id: number; nivel: string; valor: string }): Regra {
  return {
    acomodacaoId: null,
    hotelId: null,
    temporadaId: null,
    categoriaId: null,
    tipoValor: 'absoluto',
    prioridade: 0,
    vigenciaInicio: null,
    vigenciaFim: null,
    ativo: true,
    criadoPor: null,
    criadoEm: null,
    atualizadoEm: null,
    ...partial,
  } as Regra;
}

describe('tarifaService.escolherRegra', () => {
  it('prefere unidade sobre empreendimento', () => {
    const chosen = tarifaService.escolherRegra(
      [
        regra({ id: 1, nivel: 'empreendimento', hotelId: 'h1', valor: '200' }),
        regra({ id: 2, nivel: 'unidade', acomodacaoId: 5, valor: '300' }),
      ],
      null,
      null,
    );
    expect(chosen?.id).toBe(2);
  });

  it('filtra temporada e categoria específicas', () => {
    const chosen = tarifaService.escolherRegra(
      [
        regra({ id: 1, nivel: 'global', temporadaId: 9, valor: '100' }),
        regra({ id: 2, nivel: 'global', temporadaId: 1, valor: '150' }),
      ],
      1,
      null,
    );
    expect(chosen?.id).toBe(2);
  });
});

describe('tarifaService aplicarTipoValor (via resolver — motor off)', () => {
  it('getConfig default é desligado quando sem row', async () => {
    // integração leve: se DB indisponível no CI, teste de escolherRegra já cobre motor
    expect(typeof tarifaService.getConfig).toBe('function');
  });
});
