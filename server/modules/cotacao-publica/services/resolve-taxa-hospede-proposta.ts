import {
  calcularBaseElegivelTaxa,
  calcularTaxaHospede,
  roundCentavosHalfUp,
  type OrcamentoItemBase,
} from '@rsv360/shared';
import { comissoesService } from '../../comissoes/services/comissoes.service';
import { acomodacoesService } from '../../acomodacoes/services/acomodacoes.service';
import type { GerarPropostaPayload } from './montar-roteiro';

export interface TaxaHospedePropostaSnapshot {
  taxaHospedePct: number;
  taxaHospedeValor: number;
  taxaHospedeBase: number;
  taxaHospedeNome: string;
  taxaHospedeDescricao: string;
}

export interface TaxaHospedePropostaResolvida {
  snapshot: TaxaHospedePropostaSnapshot;
  linhaOrcamento: {
    nome: string;
    categoria: string;
    quantidade: 1;
    precoUnitario: string;
    precoTotal: string;
    ordem: number;
  };
}

function countNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

async function resolverTotalWizardAddons(
  payload: GerarPropostaPayload,
  nights: number,
  guests: number,
): Promise<number> {
  const ids = payload.wizardAddonIds ?? [];
  if (ids.length === 0) return 0;

  const addons = await acomodacoesService.listarAddons('hotel');
  let total = 0;
  for (const id of ids) {
    const addon = addons.find((a: { id: number; valor: string; precoTipo: string }) => a.id === id);
    if (!addon) continue;
    const v = parseFloat(String(addon.valor));
    if (!Number.isFinite(v) || v <= 0) continue;
    switch (addon.precoTipo) {
      case 'por_noite':
        total += v * nights;
        break;
      case 'por_estadia':
        total += v;
        break;
      case 'por_pessoa':
        total += v * guests;
        break;
      case 'por_pessoa_noite':
        total += v * guests * nights;
        break;
      default:
        total += v;
    }
  }
  return roundCentavosHalfUp(total);
}

/**
 * Resolve taxa do hóspede server-side (anti-tamper). Retorna null quando flag OFF.
 * Não altera buildOrcamentoItens — linha appendada em cotacao-publica.service.
 */
export async function resolveTaxaHospedeProposta(
  payload: GerarPropostaPayload,
  itens: OrcamentoItemBase[],
  ordemInicial: number,
): Promise<TaxaHospedePropostaResolvida | null> {
  const config = await comissoesService.getConfig();
  if (!config.taxaHospedeAtiva) return null;

  const nights = countNights(payload.checkIn, payload.checkOut);
  const guests = payload.adults + payload.children;
  const addonTotal = await resolverTotalWizardAddons(payload, nights, guests);
  const baseElegivel = calcularBaseElegivelTaxa(itens, addonTotal);
  const taxa = calcularTaxaHospede(baseElegivel, config.taxaHospedePct, true);

  if (!taxa.ativa || taxa.valor <= 0) return null;

  const nome = `${config.taxaHospedeNome} (${taxa.pct}%)`;

  return {
    snapshot: {
      taxaHospedePct: taxa.pct,
      taxaHospedeValor: taxa.valor,
      taxaHospedeBase: baseElegivel,
      taxaHospedeNome: config.taxaHospedeNome,
      taxaHospedeDescricao: config.taxaHospedeDescricao,
    },
    linhaOrcamento: {
      nome,
      categoria: 'taxa_hospede',
      quantidade: 1,
      precoUnitario: String(taxa.valor),
      precoTotal: String(taxa.valor),
      ordem: ordemInicial,
    },
  };
}

export async function obterTaxaHospedePublica() {
  const config = await comissoesService.getConfig();
  if (!config.taxaHospedeAtiva) return null;
  return {
    ativa: true,
    pct: config.taxaHospedePct,
    nome: config.taxaHospedeNome,
    descricao: config.taxaHospedeDescricao,
  };
}
