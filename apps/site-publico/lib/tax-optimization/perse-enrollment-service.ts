/**
 * Serviço de verificação de enquadramento Perse
 * Programa Emergencial de Retomada do Setor de Eventos/Turismo (Lei 14.148/2021)
 * Benefício: 0% PIS/COFINS/CSLL/IRPJ até dez/2026 para CNAEs de turismo
 */

import type { PerseStatus } from './types';

const ELIGIBLE_CNAES = [
  '79.11-2', // Agências de viagens
  '55.10-1', // Hotéis e similares
  '55.90-2', // Outros tipos de alojamento
  '93.19-0', // Parques de diversão
  '56.11-2', // Restaurantes
];

/**
 * Verificar se empresa pode se enquadrar no Perse
 */
export async function checkPerseEligibility(cnae?: string): Promise<PerseStatus> {
  if (!cnae) {
    return {
      eligible: true,
      enrolled: false,
      message: 'CNAE não informado. Consulte Receita Federal para habilitação.',
    };
  }

  const normalized = cnae.replace(/\D/g, '').slice(0, 7);
  const eligible = ELIGIBLE_CNAES.some((e) => e.replace(/\D/g, '').startsWith(normalized));

  return {
    eligible,
    enrolled: false,
    cnae,
    message: eligible
      ? 'CNAE elegível ao Perse. Habilite-se na Receita Federal.'
      : 'CNAE pode não ser elegível. Verifique na Receita.',
  };
}
