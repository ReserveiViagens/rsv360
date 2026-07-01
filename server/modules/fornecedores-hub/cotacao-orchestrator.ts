import type { OfertaCotacao } from './schema';
import type { ConfigProposta } from './schema';
import { ConfigService } from '../configuracoes/config.service';
import {
  ReserveiInternoAdapter,
  type IFornecedorCotacaoAdapter,
  type CotacaoBuscaParams,
} from './adapters/reservei-interno.adapter';

export type ProcessarCotacaoResult = {
  configuracoesPainel: ConfigProposta;
  ofertasHospedagem: OfertaCotacao[];
  ofertasIngressos: OfertaCotacao[];
  ofertasTransporte: OfertaCotacao[];
  ofertasKit: OfertaCotacao[];
};

export class FornecedoresCotacaoHub {
  private adapters: Map<string, IFornecedorCotacaoAdapter> = new Map();

  constructor() {
    this.registrarAdapter('reservei_pacotes', new ReserveiInternoAdapter());
  }

  registrarAdapter(nome: string, adapter: IFornecedorCotacaoAdapter) {
    this.adapters.set(nome, adapter);
  }

  async processarCotacao(parametros: CotacaoBuscaParams): Promise<ProcessarCotacaoResult> {
    const promessas: Promise<OfertaCotacao[]>[] = [];

    for (const [nome, adapter] of this.adapters) {
      promessas.push(
        adapter.buscarOfertas(parametros).catch((err) => {
          console.error(`[FornecedoresCotacaoHub] Erro no adapter ${nome}:`, err);
          return [];
        }),
      );
    }

    const resultados = await Promise.all(promessas);
    const ofertas = resultados.flat();
    const configuracoesPainel = await ConfigService.obterRegrasCotacao();

    return {
      configuracoesPainel,
      ofertasHospedagem: ofertas.filter((o) => o.tipo === 'hospedagem'),
      ofertasIngressos: ofertas.filter((o) => o.tipo === 'ingresso'),
      ofertasTransporte: ofertas.filter((o) => o.tipo === 'transporte'),
      ofertasKit: ofertas.filter((o) => o.tipo === 'kit'),
    };
  }
}

export const fornecedoresCotacaoHub = new FornecedoresCotacaoHub();
module.exports = { FornecedoresCotacaoHub, fornecedoresCotacaoHub };
