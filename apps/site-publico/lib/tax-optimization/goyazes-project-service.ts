/**
 * Serviço para projetos Goyazes (Lei 13.613/2000)
 * Crédito de ICMS via patrocínio a projetos culturais em GO
 */

import type { GoyazesProject } from './types';

/**
 * Gerar modelo de projeto para submissão ao Goyazes
 */
export function generateProjectTemplate(context: {
  theme?: string;
  location?: string;
  budget?: number;
}): GoyazesProject {
  const theme = context.theme || 'Festival cultural-termal';
  const location = context.location || 'Caldas Novas e Rio Quente';
  const budget = context.budget || 100000;

  return {
    title: `${theme} em ${location}`,
    description: `Projeto cultural que integra tradições locais e termalismo, com oficinas, shows e roteiros turísticos em ${location}. Objetivo: preservar patrimônio cultural e gerar emprego no setor de turismo.`,
    budget,
    period: `${new Date().getFullYear()}-07 a ${new Date().getFullYear()}-08`,
  };
}
