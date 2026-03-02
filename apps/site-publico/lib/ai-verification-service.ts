/**
 * Serviço de Verificação Automática com AI
 * Detecta qualidade de propriedades usando análise de imagens e dados
 */

import { queryDatabase } from './db';

export interface QualityScore {
  overall: number; // 0-100
  categories: {
    photoQuality: number; // 0-100
    descriptionQuality: number; // 0-100
    completeness: number; // 0-100
    accuracy: number; // 0-100
    amenities: number; // 0-100
  };
  confidence: number; // 0-1
  issues: QualityIssue[];
  recommendations: string[];
}

export interface QualityIssue {
  type: 'photo' | 'description' | 'completeness' | 'accuracy' | 'amenities' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestion: string;
}

export interface VerificationResult {
  propertyId: number;
  score: QualityScore;
  level: VerificationLevel;
  badges: string[];
  verifiedAt: Date;
  verifiedBy: 'ai' | 'human';
  metadata: Record<string, unknown>;
}

export type VerificationLevel = 'basic' | 'verified' | 'premium' | 'superhost';

/**
 * Verificar qualidade de propriedade usando AI
 */
export async function verifyPropertyWithAI(
  propertyId: number
): Promise<VerificationResult> {
  // Buscar dados da propriedade
  const property = await queryDatabase(
    `SELECT * FROM properties WHERE id = $1`,
    [propertyId]
  );

  if (property.length === 0) {
    throw new Error('Propriedade não encontrada');
  }

  const prop = property[0];

  // Analisar fotos
  const photoAnalysis = await analyzePhotos(propertyId, prop.photos || []);

  // Analisar descrição
  const descriptionAnalysis = await analyzeDescription(prop.description || '');

  // Verificar completude
  const completenessAnalysis = await analyzeCompleteness(prop);

  // Verificar precisão (endereço, coordenadas, etc)
  const accuracyAnalysis = await analyzeAccuracy(prop);

  // Verificar amenidades
  const amenitiesAnalysis = await analyzeAmenities(prop.amenities || []);

  // Calcular score geral
  const qualityScore: QualityScore = {
    overall: calculateOverallScore({
      photoQuality: photoAnalysis.score,
      descriptionQuality: descriptionAnalysis.score,
      completeness: completenessAnalysis.score,
      accuracy: accuracyAnalysis.score,
      amenities: amenitiesAnalysis.score,
    }),
    categories: {
      photoQuality: photoAnalysis.score,
      descriptionQuality: descriptionAnalysis.score,
      completeness: completenessAnalysis.score,
      accuracy: accuracyAnalysis.score,
      amenities: amenitiesAnalysis.score,
    },
    confidence: calculateConfidence(photoAnalysis, descriptionAnalysis, completenessAnalysis),
    issues: [
      ...photoAnalysis.issues,
      ...descriptionAnalysis.issues,
      ...completenessAnalysis.issues,
      ...accuracyAnalysis.issues,
      ...amenitiesAnalysis.issues,
    ],
    recommendations: generateRecommendations(photoAnalysis, descriptionAnalysis, completenessAnalysis, accuracyAnalysis, amenitiesAnalysis),
  };

  // Determinar nível de verificação
  const level = determineVerificationLevel(qualityScore);

  // Atribuir badges
  const badges = determineBadges(qualityScore, level);

  // Salvar resultado
  await saveVerificationResult(propertyId, qualityScore, level, badges, 'ai');

  return {
    propertyId,
    score: qualityScore,
    level,
    badges,
    verifiedAt: new Date(),
    verifiedBy: 'ai',
    metadata: {
      photoCount: prop.photos?.length || 0,
      hasVideo: !!prop.video_url,
      hasDescription: !!prop.description,
      hasAmenities: (prop.amenities || []).length > 0,
    },
  };
}

/**
 * Analisar qualidade das fotos
 */
async function analyzePhotos(
  propertyId: number,
  photos: any[]
): Promise<{ score: number; issues: QualityIssue[] }> {
  let score = 0;
  const issues: QualityIssue[] = [];

  // Verificar quantidade de fotos
  if (photos.length === 0) {
    score = 0;
    issues.push({
      type: 'photo',
      severity: 'critical',
      message: 'Nenhuma foto encontrada',
      suggestion: 'Adicione pelo menos 5 fotos de alta qualidade da propriedade',
    });
    return { score, issues };
  }

  if (photos.length < 5) {
    score += 20;
    issues.push({
      type: 'photo',
      severity: 'high',
      message: `Apenas ${photos.length} foto(s) encontrada(s)`,
      suggestion: 'Adicione mais fotos para melhorar a confiança dos hóspedes',
    });
  } else if (photos.length < 10) {
    score += 40;
    issues.push({
      type: 'photo',
      severity: 'medium',
      message: `${photos.length} fotos encontradas`,
      suggestion: 'Considere adicionar mais fotos para mostrar todos os espaços',
    });
  } else {
    score += 60;
  }

  // Verificar qualidade das fotos (simulado - em produção usar API de análise de imagem)
  // Por enquanto, assumir que fotos existentes são de qualidade razoável
  const hasHighQualityPhotos = photos.length >= 5;
  if (hasHighQualityPhotos) {
    score += 20;
  } else {
    issues.push({
      type: 'photo',
      severity: 'medium',
      message: 'Algumas fotos podem ter baixa qualidade',
      suggestion: 'Use fotos em alta resolução e boa iluminação',
    });
  }

  // Verificar diversidade (simulado)
  const hasDiversePhotos = photos.length >= 8;
  if (hasDiversePhotos) {
    score += 20;
  } else {
    issues.push({
      type: 'photo',
      severity: 'low',
      message: 'Fotos podem não mostrar todos os espaços',
      suggestion: 'Inclua fotos da sala, quartos, banheiro, cozinha e área externa',
    });
  }

  return { score: Math.min(100, score), issues };
}

/**
 * Analisar qualidade da descrição
 */
async function analyzeDescription(description: string): Promise<{ score: number; issues: QualityIssue[] }> {
  let score = 0;
  const issues: QualityIssue[] = [];

  if (!description || description.length === 0) {
    issues.push({
      type: 'description',
      severity: 'critical',
      message: 'Nenhuma descrição encontrada',
      suggestion: 'Adicione uma descrição detalhada da propriedade',
    });
    return { score: 0, issues };
  }

  // Verificar comprimento
  if (description.length < 100) {
    score += 20;
    issues.push({
      type: 'description',
      severity: 'high',
      message: 'Descrição muito curta',
      suggestion: 'Adicione mais detalhes sobre a propriedade, localização e comodidades',
    });
  } else if (description.length < 300) {
    score += 40;
    issues.push({
      type: 'description',
      severity: 'medium',
      message: 'Descrição pode ser mais detalhada',
      suggestion: 'Inclua informações sobre a vizinhança, transporte e pontos de interesse',
    });
  } else {
    score += 60;
  }

  // Verificar palavras-chave importantes (simulado)
  const importantKeywords = ['localização', 'comodidades', 'acessível', 'seguro', 'próximo'];
  const foundKeywords = importantKeywords.filter(keyword =>
    description.toLowerCase().includes(keyword.toLowerCase())
  );

  if (foundKeywords.length >= 3) {
    score += 20;
  } else {
    issues.push({
      type: 'description',
      severity: 'low',
      message: 'Descrição pode incluir mais informações relevantes',
      suggestion: 'Mencione localização, comodidades e pontos de interesse próximos',
    });
  }

  // Verificar estrutura (parágrafos)
  const paragraphs = description.split('\n\n').filter(p => p.trim().length > 0);
  if (paragraphs.length >= 2) {
    score += 20;
  }

  return { score: Math.min(100, score), issues };
}

/**
 * Analisar completude dos dados
 */
async function analyzeCompleteness(property: any): Promise<{ score: number; issues: QualityIssue[] }> {
  let score = 0;
  const issues: QualityIssue[] = [];

  const requiredFields = [
    { field: 'title', name: 'Título' },
    { field: 'description', name: 'Descrição' },
    { field: 'address', name: 'Endereço' },
    { field: 'city', name: 'Cidade' },
    { field: 'state', name: 'Estado' },
    { field: 'zip_code', name: 'CEP' },
    { field: 'latitude', name: 'Latitude' },
    { field: 'longitude', name: 'Longitude' },
    { field: 'base_price', name: 'Preço base' },
    { field: 'max_guests', name: 'Máximo de hóspedes' },
  ];

  const filledFields = requiredFields.filter(field => {
    const value = property[field.field];
    return value !== null && value !== undefined && value !== '';
  });

  score = (filledFields.length / requiredFields.length) * 100;

  const missingFields = requiredFields.filter(field => {
    const value = property[field.field];
    return value === null || value === undefined || value === '';
  });

  if (missingFields.length > 0) {
    issues.push({
      type: 'completeness',
      severity: missingFields.length > 3 ? 'high' : 'medium',
      message: `${missingFields.length} campo(s) obrigatório(s) não preenchido(s)`,
      suggestion: `Preencha: ${missingFields.map(f => f.name).join(', ')}`,
    });
  }

  // Verificar fotos
  if (!property.photos || property.photos.length === 0) {
    issues.push({
      type: 'completeness',
      severity: 'critical',
      message: 'Nenhuma foto adicionada',
      suggestion: 'Adicione fotos da propriedade',
    });
  }

  // Verificar amenidades
  if (!property.amenities || property.amenities.length === 0) {
    issues.push({
      type: 'completeness',
      severity: 'medium',
      message: 'Nenhuma amenidade listada',
      suggestion: 'Adicione as amenidades disponíveis',
    });
  }

  return { score, issues };
}

/**
 * Analisar precisão dos dados
 */
async function analyzeAccuracy(property: any): Promise<{ score: number; issues: QualityIssue[] }> {
  let score = 100;
  const issues: QualityIssue[] = [];

  // Verificar coordenadas
  if (property.latitude && property.longitude) {
    // Verificar se coordenadas são válidas
    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      score -= 30;
      issues.push({
        type: 'accuracy',
        severity: 'high',
        message: 'Coordenadas inválidas',
        suggestion: 'Verifique e corrija as coordenadas da propriedade',
      });
    }
  } else {
    score -= 20;
    issues.push({
      type: 'accuracy',
      severity: 'medium',
      message: 'Coordenadas não fornecidas',
      suggestion: 'Adicione coordenadas para melhor localização no mapa',
    });
  }

  // Verificar endereço completo
  if (!property.address || !property.city || !property.state) {
    score -= 20;
    issues.push({
      type: 'accuracy',
      severity: 'medium',
      message: 'Endereço incompleto',
      suggestion: 'Complete o endereço com rua, cidade e estado',
    });
  }

  // Verificar preço
  if (!property.base_price || parseFloat(property.base_price) <= 0) {
    score -= 30;
    issues.push({
      type: 'accuracy',
      severity: 'high',
      message: 'Preço inválido ou não definido',
      suggestion: 'Defina um preço base válido',
    });
  }

  return { score: Math.max(0, score), issues };
}

/**
 * Analisar amenidades
 */
async function analyzeAmenities(amenities: any[]): Promise<{ score: number; issues: QualityIssue[] }> {
  let score = 0;
  const issues: QualityIssue[] = [];

  if (!amenities || amenities.length === 0) {
    issues.push({
      type: 'amenities',
      severity: 'medium',
      message: 'Nenhuma amenidade listada',
      suggestion: 'Adicione as amenidades disponíveis na propriedade',
    });
    return { score: 0, issues };
  }

  // Score baseado na quantidade
  if (amenities.length < 5) {
    score = 40;
    issues.push({
      type: 'amenities',
      severity: 'low',
      message: 'Poucas amenidades listadas',
      suggestion: 'Adicione mais amenidades para atrair hóspedes',
    });
  } else if (amenities.length < 10) {
    score = 70;
  } else {
    score = 100;
  }

  return { score, issues };
}

/**
 * Calcular score geral
 */
function calculateOverallScore(categories: QualityScore['categories']): number {
  // Pesos para cada categoria
  const weights = {
    photoQuality: 0.25,
    descriptionQuality: 0.20,
    completeness: 0.25,
    accuracy: 0.15,
    amenities: 0.15,
  };

  return Math.round(
    categories.photoQuality * weights.photoQuality +
    categories.descriptionQuality * weights.descriptionQuality +
    categories.completeness * weights.completeness +
    categories.accuracy * weights.accuracy +
    categories.amenities * weights.amenities
  );
}

/**
 * Calcular confiança
 */
function calculateConfidence(
  photoAnalysis: { score: number },
  descriptionAnalysis: { score: number },
  completenessAnalysis: { score: number }
): number {
  // Confiança baseada na quantidade de dados disponíveis
  const dataCompleteness = (
    (photoAnalysis.score > 0 ? 1 : 0) +
    (descriptionAnalysis.score > 0 ? 1 : 0) +
    (completenessAnalysis.score > 50 ? 1 : 0)
  ) / 3;

  return Math.min(1, dataCompleteness);
}

/**
 * Gerar recomendações
 */
function generateRecommendations(
  photoAnalysis: { issues: QualityIssue[] },
  descriptionAnalysis: { issues: QualityIssue[] },
  completenessAnalysis: { issues: QualityIssue[] },
  accuracyAnalysis: { issues: QualityIssue[] },
  amenitiesAnalysis: { issues: QualityIssue[] }
): string[] {
  const recommendations: string[] = [];

  // Priorizar issues críticas e de alta severidade
  const criticalIssues = [
    ...photoAnalysis.issues,
    ...descriptionAnalysis.issues,
    ...completenessAnalysis.issues,
    ...accuracyAnalysis.issues,
    ...amenitiesAnalysis.issues,
  ].filter(issue => issue.severity === 'critical' || issue.severity === 'high');

  criticalIssues.forEach(issue => {
    if (!recommendations.includes(issue.suggestion)) {
      recommendations.push(issue.suggestion);
    }
  });

  return recommendations.slice(0, 5); // Limitar a 5 recomendações principais
}

/**
 * Determinar nível de verificação
 */
function determineVerificationLevel(score: QualityScore): VerificationLevel {
  if (score.overall >= 90 && score.confidence >= 0.8) {
    return 'superhost';
  } else if (score.overall >= 75 && score.confidence >= 0.7) {
    return 'premium';
  } else if (score.overall >= 60 && score.confidence >= 0.6) {
    return 'verified';
  }
  return 'basic';
}

/**
 * Determinar badges
 */
function determineBadges(score: QualityScore, level: VerificationLevel): string[] {
  const badges: string[] = [];

  // Badge de nível
  badges.push(level);

  // Badge de qualidade de fotos
  if (score.categories.photoQuality >= 80) {
    badges.push('high-quality-photos');
  }

  // Badge de descrição completa
  if (score.categories.descriptionQuality >= 80) {
    badges.push('detailed-description');
  }

  // Badge de completude
  if (score.categories.completeness >= 90) {
    badges.push('complete-profile');
  }

  // Badge de precisão
  if (score.categories.accuracy >= 90) {
    badges.push('accurate-location');
  }

  // Badge de amenidades
  if (score.categories.amenities >= 80) {
    badges.push('well-equipped');
  }

  return badges;
}

/**
 * Salvar resultado da verificação
 */
async function saveVerificationResult(
  propertyId: number,
  score: QualityScore,
  level: VerificationLevel,
  badges: string[],
  verifiedBy: 'ai' | 'human'
): Promise<void> {
  await queryDatabase(
    `INSERT INTO property_verifications 
     (property_id, status, quality_score, verification_level, badges, verified_by, verified_at, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
     ON CONFLICT (property_id)
     DO UPDATE SET
       status = $2,
       quality_score = $3,
       verification_level = $4,
       badges = $5,
       verified_by = $6,
       verified_at = CURRENT_TIMESTAMP,
       metadata = $7`,
    [
      propertyId,
      level === 'basic' ? 'pending' : 'approved',
      score.overall,
      level,
      JSON.stringify(badges),
      verifiedBy,
      JSON.stringify({
        categories: score.categories,
        confidence: score.confidence,
        issues: score.issues,
        recommendations: score.recommendations,
      }),
    ]
  );
}

/**
 * Obter resultado de verificação
 */
export async function getVerificationResult(
  propertyId: number
): Promise<VerificationResult | null> {
  const result = await queryDatabase(
    `SELECT * FROM property_verifications WHERE property_id = $1`,
    [propertyId]
  );

  if (result.length === 0) {
    return null;
  }

  const row = result[0];
  const metadata = row.metadata ? JSON.parse(row.metadata) : {};

  return {
    propertyId,
    score: {
      overall: row.quality_score,
      categories: metadata.categories || {},
      confidence: metadata.confidence || 0,
      issues: metadata.issues || [],
      recommendations: metadata.recommendations || [],
    },
    level: row.verification_level,
    badges: row.badges ? JSON.parse(row.badges) : [],
    verifiedAt: new Date(row.verified_at),
    verifiedBy: row.verified_by,
    metadata: metadata,
  };
}

