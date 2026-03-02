/**
 * Serviço de Níveis de Verificação e Badges
 * Gerencia níveis de verificação e atribuição de badges
 */

import { queryDatabase } from './db';
import { verifyPropertyWithAI, type QualityScore } from './ai-verification-service';
import { validatePropertyAddress } from './google-maps-verification-service';

export type VerificationLevel = 'basic' | 'verified' | 'premium' | 'superhost';

export interface VerificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirements: {
    level?: VerificationLevel;
    score?: number;
    category?: string;
    minValue?: number;
  };
}

export interface PropertyVerificationStatus {
  propertyId: number;
  level: VerificationLevel;
  score: number;
  badges: string[];
  nextLevel?: VerificationLevel;
  progressToNextLevel: number; // 0-100
  requirements: {
    current: Record<string, any>;
    next: Record<string, any>;
  };
  verifiedAt?: Date;
  verifiedBy: 'ai' | 'human';
}

/**
 * Definir badges disponíveis
 */
export const AVAILABLE_BADGES: VerificationBadge[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Propriedade cadastrada',
    icon: '🏠',
    color: '#gray',
    requirements: {},
  },
  {
    id: 'verified',
    name: 'Verificado',
    description: 'Propriedade verificada com qualidade mínima',
    icon: '✅',
    color: '#green',
    requirements: {
      level: 'verified',
      score: 60,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Propriedade de alta qualidade',
    icon: '⭐',
    color: '#gold',
    requirements: {
      level: 'premium',
      score: 75,
    },
  },
  {
    id: 'superhost',
    name: 'Superhost',
    description: 'Propriedade excepcional',
    icon: '👑',
    color: '#purple',
    requirements: {
      level: 'superhost',
      score: 90,
    },
  },
  {
    id: 'high-quality-photos',
    name: 'Fotos de Alta Qualidade',
    description: 'Fotos profissionais e bem cuidadas',
    icon: '📸',
    color: '#blue',
    requirements: {
      category: 'photoQuality',
      minValue: 80,
    },
  },
  {
    id: 'detailed-description',
    name: 'Descrição Detalhada',
    description: 'Descrição completa e informativa',
    icon: '📝',
    color: '#blue',
    requirements: {
      category: 'descriptionQuality',
      minValue: 80,
    },
  },
  {
    id: 'complete-profile',
    name: 'Perfil Completo',
    description: 'Todos os dados preenchidos',
    icon: '📋',
    color: '#green',
    requirements: {
      category: 'completeness',
      minValue: 90,
    },
  },
  {
    id: 'accurate-location',
    name: 'Localização Precisa',
    description: 'Endereço validado e coordenadas corretas',
    icon: '📍',
    color: '#green',
    requirements: {
      category: 'accuracy',
      minValue: 90,
    },
  },
  {
    id: 'well-equipped',
    name: 'Bem Equipado',
    description: 'Muitas amenidades disponíveis',
    icon: '🛠️',
    color: '#blue',
    requirements: {
      category: 'amenities',
      minValue: 80,
    },
  },
  {
    id: 'verified-address',
    name: 'Endereço Verificado',
    description: 'Endereço validado pelo Google Maps',
    icon: '🗺️',
    color: '#green',
    requirements: {
      category: 'address',
      minValue: 1,
    },
  },
];

/**
 * Obter status de verificação de uma propriedade
 */
export async function getVerificationStatus(
  propertyId: number
): Promise<PropertyVerificationStatus> {
  // Buscar verificação existente
  const verification = await queryDatabase(
    `SELECT * FROM property_verifications WHERE property_id = $1`,
    [propertyId]
  );

  if (verification.length === 0) {
    // Se não existe, criar verificação inicial
    return await initializeVerification(propertyId);
  }

  const row = verification[0];
  const metadata = row.metadata ? JSON.parse(row.metadata) : {};
  const badges = row.badges ? JSON.parse(row.badges) : [];

  const level = row.verification_level as VerificationLevel;
  const score = row.quality_score || 0;

  // Calcular próximo nível e progresso
  const { nextLevel, progress } = calculateNextLevel(level, score, metadata.categories || {});

  // Obter requisitos
  const requirements = getRequirements(level, nextLevel, metadata.categories || {});

  return {
    propertyId,
    level,
    score,
    badges,
    nextLevel,
    progressToNextLevel: progress,
    requirements,
    verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
    verifiedBy: row.verified_by || 'ai',
  };
}

/**
 * Inicializar verificação
 */
async function initializeVerification(
  propertyId: number
): Promise<PropertyVerificationStatus> {
  // Executar verificação AI
  const aiResult = await verifyPropertyWithAI(propertyId);

  return {
    propertyId,
    level: aiResult.level,
    score: aiResult.score.overall,
    badges: aiResult.badges,
    nextLevel: getNextLevel(aiResult.level),
    progressToNextLevel: calculateProgress(aiResult.level, aiResult.score.overall, aiResult.score.categories),
    requirements: getRequirements(aiResult.level, getNextLevel(aiResult.level), aiResult.score.categories),
    verifiedAt: aiResult.verifiedAt,
    verifiedBy: aiResult.verifiedBy,
  };
}

/**
 * Calcular próximo nível e progresso
 */
function calculateNextLevel(
  currentLevel: VerificationLevel,
  score: number,
  categories: QualityScore['categories']
): { nextLevel?: VerificationLevel; progress: number } {
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return { nextLevel: undefined, progress: 100 };
  }

  const progress = calculateProgress(currentLevel, score, categories);
  
  return { nextLevel, progress };
}

/**
 * Obter próximo nível
 */
function getNextLevel(currentLevel: VerificationLevel): VerificationLevel | undefined {
  const levels: VerificationLevel[] = ['basic', 'verified', 'premium', 'superhost'];
  const currentIndex = levels.indexOf(currentLevel);
  
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  
  return undefined;
}

/**
 * Calcular progresso para próximo nível
 */
function calculateProgress(
  currentLevel: VerificationLevel,
  score: number,
  categories: QualityScore['categories']
): number {
  const nextLevel = getNextLevel(currentLevel);
  
  if (!nextLevel) {
    return 100;
  }

  const levelRequirements = getLevelRequirements(nextLevel);
  const requiredScore = levelRequirements.score || 0;

  if (score >= requiredScore) {
    return 100;
  }

  // Calcular progresso baseado no score atual vs necessário
  const currentLevelScore = getLevelScore(currentLevel);
  const progress = ((score - currentLevelScore) / (requiredScore - currentLevelScore)) * 100;

  return Math.max(0, Math.min(100, Math.round(progress)));
}

/**
 * Obter requisitos de um nível
 */
function getLevelRequirements(level: VerificationLevel): { score: number; categories?: Partial<QualityScore['categories']> } {
  const requirements: Record<VerificationLevel, { score: number }> = {
    basic: { score: 0 },
    verified: { score: 60 },
    premium: { score: 75 },
    superhost: { score: 90 },
  };

  return requirements[level] || { score: 0 };
}

/**
 * Obter score mínimo de um nível
 */
function getLevelScore(level: VerificationLevel): number {
  const requirements = getLevelRequirements(level);
  return requirements.score;
}

/**
 * Obter requisitos formatados
 */
function getRequirements(
  currentLevel: VerificationLevel,
  nextLevel?: VerificationLevel,
  categories?: QualityScore['categories']
): PropertyVerificationStatus['requirements'] {
  const current = getLevelRequirements(currentLevel);
  const next = nextLevel ? getLevelRequirements(nextLevel) : null;

  return {
    current: {
      level: currentLevel,
      score: current.score,
      categories: categories || {},
    },
    next: next ? {
      level: nextLevel,
      score: next.score,
      categories: {},
    } : {},
  };
}

/**
 * Atualizar badges de uma propriedade
 */
export async function updatePropertyBadges(
  propertyId: number
): Promise<string[]> {
  // Buscar verificação
  const verification = await queryDatabase(
    `SELECT * FROM property_verifications WHERE property_id = $1`,
    [propertyId]
  );

  if (verification.length === 0) {
    return [];
  }

  const row = verification[0];
  const metadata = row.metadata ? JSON.parse(row.metadata) : {};
  const level = row.verification_level as VerificationLevel;
  const score = row.quality_score || 0;
  const categories = metadata.categories || {};

  // Verificar endereço
  let addressValidated = false;
  try {
    const addressValidation = await validatePropertyAddress(propertyId);
    addressValidated = addressValidation.isValid;
  } catch (error) {
    console.error('Erro ao validar endereço:', error);
  }

  // Determinar badges elegíveis
  const eligibleBadges: string[] = [];

  // Badge de nível
  eligibleBadges.push(level);

  // Verificar badges por categoria
  for (const badge of AVAILABLE_BADGES) {
    if (badge.id === level) continue; // Já adicionado

    const req = badge.requirements;

    // Verificar requisitos de nível
    if (req.level && level !== req.level) {
      continue;
    }

    // Verificar requisitos de score
    if (req.score && score < req.score) {
      continue;
    }

    // Verificar requisitos de categoria
    if (req.category && req.minValue !== undefined) {
      const categoryValue = categories[req.category as keyof typeof categories];
      if (!categoryValue || categoryValue < req.minValue) {
        continue;
      }
    }

    // Verificar requisitos de endereço
    if (req.category === 'address' && !addressValidated) {
      continue;
    }

    eligibleBadges.push(badge.id);
  }

  // Atualizar no banco
  await queryDatabase(
    `UPDATE property_verifications 
     SET badges = $1, updated_at = CURRENT_TIMESTAMP
     WHERE property_id = $2`,
    [JSON.stringify(eligibleBadges), propertyId]
  );

  return eligibleBadges;
}

/**
 * Obter badge por ID
 */
export function getBadgeById(badgeId: string): VerificationBadge | undefined {
  return AVAILABLE_BADGES.find(b => b.id === badgeId);
}

/**
 * Obter todos os badges de uma propriedade com detalhes
 */
export async function getPropertyBadgesWithDetails(
  propertyId: number
): Promise<VerificationBadge[]> {
  const status = await getVerificationStatus(propertyId);
  
  return status.badges
    .map(badgeId => getBadgeById(badgeId))
    .filter((badge): badge is VerificationBadge => badge !== undefined);
}

