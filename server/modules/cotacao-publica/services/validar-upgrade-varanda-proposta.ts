import { eq } from 'drizzle-orm';
import {
  getEtapaAUnidade,
  parseUpgradeVarandaMeta,
  UPGRADE_VARANDA_DEFAULT_VALOR,
} from '@rsv360/shared';
import { db } from '../../../lib/db';
import { acomodacoes } from '../../../../backend/src/db/schema/acomodacoes';
import type { GerarPropostaPayload, PropostaAcomodacaoSnapshot } from './montar-roteiro';

export type { PropostaAcomodacaoSnapshot };

function mergeUpgradeIntent(payload: GerarPropostaPayload): boolean {
  /** Política (a): suiteUpgrade legado ≡ upgradeVaranda; nunca cobrar os dois. */
  return Boolean(payload.upgradeVaranda || payload.suiteUpgrade);
}

function resolveValorServer(codigoExterno: string, metadata: unknown): number {
  const fromMeta = parseUpgradeVarandaMeta(metadata);
  if (fromMeta.disponivel && fromMeta.valor > 0) return fromMeta.valor;
  const unit = getEtapaAUnidade(codigoExterno);
  if (unit?.upgradeVarandaRs != null && unit.upgradeVarandaRs > 0) {
    return unit.upgradeVarandaRs;
  }
  return UPGRADE_VARANDA_DEFAULT_VALOR;
}

function unidadePermiteUpgrade(codigoExterno: string, metadata: unknown): boolean {
  const unit = getEtapaAUnidade(codigoExterno);
  if (unit) return unit.upgradeVaranda === true;
  return parseUpgradeVarandaMeta(metadata).disponivel === true;
}

export async function resolveUpgradeVarandaProposta(
  payload: GerarPropostaPayload,
): Promise<PropostaAcomodacaoSnapshot> {
  const arquetipoId = payload.arquetipoId?.trim() || undefined;
  const wantsUpgrade = mergeUpgradeIntent(payload);

  let codigoExterno = payload.codigoExterno?.trim() || undefined;
  let metadata: unknown;

  const acomodacaoId = (() => {
    const raw = payload.selectedAcomodacaoId;
    if (raw == null) return null;
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : null;
  })();

  if (acomodacaoId) {
    const [row] = await db
      .select({
        codigoExterno: acomodacoes.codigoExterno,
        metadata: acomodacoes.metadata,
      })
      .from(acomodacoes)
      .where(eq(acomodacoes.id, acomodacaoId))
      .limit(1);

    if (row) {
      if (!codigoExterno && row.codigoExterno) {
        codigoExterno = row.codigoExterno;
      }
      metadata = row.metadata;
    }
  }

  const base: PropostaAcomodacaoSnapshot = {
    arquetipoId,
    codigoExterno,
    upgradeVaranda: false,
    upgradeVarandaValorResolvido: 0,
  };

  if (!wantsUpgrade) return base;

  if (!codigoExterno || !unidadePermiteUpgrade(codigoExterno, metadata)) {
    console.warn(
      '[cotacao-publica] upgrade varanda ignorado (unidade inelegivel ou sem codigo)',
      { acomodacaoId: acomodacaoId ?? undefined },
    );
    return base;
  }

  const valor = resolveValorServer(codigoExterno, metadata);
  return {
    arquetipoId,
    codigoExterno,
    upgradeVaranda: true,
    upgradeVarandaValorResolvido: valor,
  };
}
