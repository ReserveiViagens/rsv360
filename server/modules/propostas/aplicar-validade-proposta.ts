import { eq } from 'drizzle-orm';
import { db } from '../../lib/db';
import { propostas } from '../../../backend/src/db/schema/propostas';
import { calcularValidoAte } from '../cotacao-publica/services/calcular-valido-ate';
import { ConfigService } from '../configuracoes/config.service';
import { agendarAvisoExpiracao, agendarExpiracao } from './propostas.queue';

/** Grava valido_ate e agenda jobs de expiração + aviso (configuracoes_sistema.modulo_propostas). */
export async function aplicarValidadeProposta(propostaId: number): Promise<Date> {
  const validoAte = await calcularValidoAte();

  await db
    .update(propostas)
    .set({ validoAte, updatedAt: new Date() })
    .where(eq(propostas.id, propostaId));

  try {
    await agendarExpiracao(propostaId, validoAte);
    const config = await ConfigService.obterRegrasCotacao();
    await agendarAvisoExpiracao(propostaId, validoAte, config.avisoExpiracaoHoras ?? 2);
  } catch (queueErr) {
    console.warn('[aplicar-validade-proposta] fila ignorada:', (queueErr as Error).message);
  }

  return validoAte;
}

module.exports = { aplicarValidadeProposta };
