import { eq } from 'drizzle-orm';
import { db } from '../../../lib/db';
import { propostas } from '../../../../backend/src/db/schema/propostas';
import { gerarTokenPublicoProposta } from '../../../lib/proposta-token';
import { aplicarValidadeProposta } from '../aplicar-validade-proposta';
import {
  isPropostaExpirada,
} from '../proposta-validade';
import { propostasService } from './propostas.service';
import { recordPropostaGerada } from '../metrics';

export class PropostaRecotacaoError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'PropostaRecotacaoError';
    this.statusCode = statusCode;
  }
}

function parseMetadata(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

/** Clona proposta expirada com novo token e validade renovada. */
export async function recotarPropostaPorToken(token: string): Promise<{ novoToken: string }> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new PropostaRecotacaoError('Token inválido', 400);
  }

  const [origem] = await db.select().from(propostas).where(eq(propostas.tokenPublico, trimmed));
  if (!origem || !origem.isPublica) {
    throw new PropostaRecotacaoError('Proposta não encontrada', 404);
  }

  if (['paid', 'converted', 'cancelled'].includes(origem.status)) {
    throw new PropostaRecotacaoError(
      'Proposta paga ou encerrada não pode ser recotada',
      403,
    );
  }

  if (!isPropostaExpirada(origem)) {
    throw new PropostaRecotacaoError(
      'Recotação disponível apenas para propostas expiradas',
      403,
    );
  }

  const novoToken = gerarTokenPublicoProposta();
  const metaOrigem = parseMetadata(origem.metadata);

  const [clonada] = await db
    .insert(propostas)
    .values({
      enterpriseId: origem.enterpriseId,
      orcamentoId: origem.orcamentoId,
      codigo: origem.codigo,
      titulo: origem.titulo,
      clienteNome: origem.clienteNome,
      clienteEmail: origem.clienteEmail,
      clienteTelefone: origem.clienteTelefone,
      status: 'sent',
      valorTotal: origem.valorTotal,
      moeda: origem.moeda,
      validoAte: null,
      avisoExpiracaoEnviado: false,
      roteiroEntregue: false,
      versao: (origem.versao ?? 1) + 1,
      isPublica: true,
      tokenPublico: novoToken,
      exibirComparativo: origem.exibirComparativo ?? false,
      comparativoCache: origem.comparativoCache,
      statusAprovacao: origem.statusAprovacao ?? 'nao_requer',
      conteudo: origem.conteudo,
      metadata: {
        ...metaOrigem,
        recotacaoDe: origem.id,
        recotacaoTokenAnterior: trimmed,
        recotadoEm: new Date().toISOString(),
      },
    })
    .returning();

  await aplicarValidadeProposta(clonada.id);

  await propostasService.logEvent(
    origem.id,
    'recotacao_origem',
    'Proposta expirada clonada em nova cotação',
    { novoToken, novaPropostaId: clonada.id },
  );
  await propostasService.logEvent(
    clonada.id,
    'recotacao',
    'Nova cotação gerada a partir de proposta expirada',
    { tokenAnterior: trimmed, propostaOrigemId: origem.id },
  );

  recordPropostaGerada('recotacao');

  return { novoToken };
}

export function isPropostaRecotacaoError(error: unknown): boolean {
  return (
    error instanceof PropostaRecotacaoError ||
    (typeof error === 'object' &&
      error !== null &&
      (error as { name?: string }).name === 'PropostaRecotacaoError')
  );
}

module.exports = {
  recotarPropostaPorToken,
  PropostaRecotacaoError,
  isPropostaRecotacaoError,
};
