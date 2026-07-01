import { ConfigService } from '../../configuracoes/config.service';

/** Calcula valido_ate com base em configuracoes.modulo_propostas (UTC no banco). */
export async function calcularValidoAte(): Promise<Date> {
  const config = await ConfigService.obterRegrasCotacao();
  const horas = config.validadeCotacaoHoras ?? 48;
  return new Date(Date.now() + horas * 60 * 60 * 1000);
}

module.exports = { calcularValidoAte };
