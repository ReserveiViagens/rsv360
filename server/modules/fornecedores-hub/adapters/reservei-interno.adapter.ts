import {
  ofertaCotacaoSchema,
  type OfertaCotacao,
} from '../schema';

export interface CotacaoBuscaParams {
  checkin: string;
  checkout: string;
  hospedes: number;
}

export interface IFornecedorCotacaoAdapter {
  buscarOfertas(parametros: CotacaoBuscaParams): Promise<OfertaCotacao[]>;
}

const RESERVEI_FORNECEDOR_ID = '00000000-0000-4000-8000-000000000001';

export class ReserveiInternoAdapter implements IFornecedorCotacaoAdapter {
  async buscarOfertas(parametros: CotacaoBuscaParams): Promise<OfertaCotacao[]> {
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(parametros.checkout).getTime() - new Date(parametros.checkin).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const dadosBrutos: Partial<OfertaCotacao>[] = [
      {
        fornecedorId: RESERVEI_FORNECEDOR_ID,
        nomeFornecedor: 'Operadora Reservei',
        tipo: 'hospedagem',
        titulo: 'Lacqua diRoma',
        descricao:
          'Acesso completo ao parque aquático, ideal para a família. Transporte incluso.',
        valorTotal: 1021.0,
        noites: nights,
        disponibilidade: 4,
        imagens: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
        ],
        metadata: {
          bonus: '2 ingressos para Lagoa Thermas',
          contatoSuporte: '64993197555',
          roupaDeCama: true,
          behaviorTags: ['familia'],
        },
      },
      {
        fornecedorId: RESERVEI_FORNECEDOR_ID,
        nomeFornecedor: 'Operadora Reservei',
        tipo: 'hospedagem',
        titulo: 'Piazza',
        descricao:
          'Conforto e localização privilegiada com transporte e roupa de cama inclusos.',
        valorTotal: 1321.0,
        noites: nights,
        disponibilidade: 2,
        imagens: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&h=400&fit=crop',
        ],
        metadata: {
          contatoSuporte: '64993197555',
          roupaDeCama: true,
          behaviorTags: ['casal'],
        },
      },
      {
        fornecedorId: RESERVEI_FORNECEDOR_ID,
        nomeFornecedor: 'Operadora Reservei',
        tipo: 'ingresso',
        titulo: 'Hot Park — Pacote Reservei',
        descricao: 'Ingresso dia inteiro com desconto agência.',
        valorTotal: 189 * parametros.hospedes,
        imagens: [
          'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=600&h=400&fit=crop',
        ],
        metadata: { behaviorTags: ['familia'] },
      },
    ];

    const ofertasValidadas: OfertaCotacao[] = [];
    for (const item of dadosBrutos) {
      const parse = ofertaCotacaoSchema.safeParse(item);
      if (parse.success) {
        ofertasValidadas.push(parse.data);
      } else {
        console.error(
          `[ReserveiAdapter] Falha ao normalizar ${item.titulo}:`,
          parse.error.format(),
        );
      }
    }
    return ofertasValidadas;
  }
}

module.exports = { ReserveiInternoAdapter };
