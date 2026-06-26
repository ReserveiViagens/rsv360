import { resolverOfertas } from '../../fornecedores-hub/resolver';
import { aplicarFiltroGarantia, type ResultadoAncoragem } from '../ancoragem';

export type MontarPropostaInput = {
  precoAgencia: number;
  tipo?: string;
  destino: string;
};

/** Busca ofertas (PR 4) e aplica filtro de margem (PR 6). */
export async function montarComparativoProposta(
  input: MontarPropostaInput,
): Promise<ResultadoAncoragem & { origem?: string; chave?: string }> {
  const tipo = input.tipo ?? 'hospedagem';
  const { ofertas, origem, chave } = await resolverOfertas(tipo, input.destino);
  const resultado = aplicarFiltroGarantia(input.precoAgencia, ofertas);
  return { ...resultado, origem, chave };
}
