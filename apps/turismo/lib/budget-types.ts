// Tipos e constantes relacionados a BudgetType conforme documentação
import { BudgetType } from './types/budget';

/**
 * Constantes para tipos de orçamento
 */
export const BUDGET_TYPES: Record<BudgetType, { label: string; icon: string; description: string }> = {
  hotel: {
    label: 'Hotel',
    icon: '🏨',
    description: 'Cotações para hospedagem em hotéis, resorts e pousadas',
  },
  parque: {
    label: 'Parque',
    icon: '🎢',
    description: 'Cotações para parques aquáticos, temáticos e de diversões',
  },
  atracao: {
    label: 'Atração',
    icon: '🎡',
    description: 'Cotações para atrações turísticas, monumentos e pontos de interesse',
  },
  passeio: {
    label: 'Passeio',
    icon: '🚌',
    description: 'Cotações para passeios turísticos, tours e experiências',
  },
  personalizado: {
    label: 'Personalizado',
    icon: '📋',
    description: 'Crie uma cotação personalizada do zero',
  },
};

/**
 * Categorias principais conforme documento
 */
export const MAIN_CATEGORIES = [
  'Hotéis',
  'Parques',
  'Atrações',
  'Passeios',
  'Personalizado',
] as const;

/**
 * Subcategorias por categoria principal
 */
export const SUB_CATEGORIES: Record<string, string[]> = {
  'Hotéis': [
    'Caldas Novas',
    'Rio Quente',
    'Bonito',
    'Gramado',
    'Fernando de Noronha',
    'Outros',
  ],
  'Parques': [
    'Caldas Novas',
    'Rio Quente',
    'Bonito',
    'Outros',
  ],
  'Atrações': [
    'Caldas Novas',
    'Rio Quente',
    'Bonito',
    'Outros',
  ],
  'Passeios': [
    'Caldas Novas',
    'Rio Quente',
    'Bonito',
    'Outros',
  ],
  'Personalizado': [],
};

/**
 * Função helper para obter informações do tipo de orçamento
 */
export function getBudgetTypeInfo(type: BudgetType) {
  return BUDGET_TYPES[type];
}

/**
 * Função helper para validar tipo de orçamento
 */
export function isValidBudgetType(type: string): type is BudgetType {
  return Object.keys(BUDGET_TYPES).includes(type);
}

