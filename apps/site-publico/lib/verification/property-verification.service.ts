/**
 * ✅ DIA 2 - ARQUIVO 7: Property Verification Service
 * 
 * @description Sistema completo de verificação de propriedades:
 * - Verificação de documentos
 * - Verificação de localização (Google Maps)
 * - Verificação de imagens (AI)
 * - Verificação de amenities
 * - Níveis de verificação
 * 
 * @module verification
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';

// ================================
// TYPES & SCHEMAS
// ================================

const VerificationRequestSchema = z.object({
  propertyId: z.number().int().positive(),
  verificationType: z.enum(['basic', 'standard', 'premium', 'complete']),
  documents: z.array(z.object({
    type: z.enum(['ownership', 'license', 'tax', 'insurance', 'other']),
    url: z.string().url(),
  })).optional(),
});

const VerificationResultSchema = z.object({
  propertyId: z.number(),
  verificationLevel: z.enum(['unverified', 'basic', 'standard', 'premium', 'verified']),
  status: z.enum(['pending', 'in_progress', 'approved', 'rejected']),
  score: z.number().min(0).max(100),
  checks: z.object({
    documents: z.object({
      verified: z.boolean(),
      score: z.number(),
      issues: z.array(z.string()),
    }),
    location: z.object({
      verified: z.boolean(),
      score: z.number(),
      address: z.string().optional(),
      coordinates: z.object({
        lat: z.number(),
        lng: z.number(),
      }).optional(),
    }),
    images: z.object({
      verified: z.boolean(),
      score: z.number(),
      aiAnalysis: z.any().optional(),
    }),
    amenities: z.object({
      verified: z.boolean(),
      score: z.number(),
      verifiedAmenities: z.array(z.string()),
    }),
  }),
  verifiedAt: z.date().nullable(),
  verifiedBy: z.number().nullable(),
  notes: z.string().optional(),
});

type VerificationRequest = z.infer<typeof VerificationRequestSchema>;
type VerificationResult = z.infer<typeof VerificationResultSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 86400; // 24 hours
const CACHE_PREFIX = 'property-verification:';

// Níveis mínimos de score para cada nível de verificação
const VERIFICATION_THRESHOLDS = {
  basic: 60,
  standard: 75,
  premium: 85,
  verified: 95,
};

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Iniciar processo de verificação de propriedade
 * @param verifiedByUserId - ID do usuário que está realizando a verificação (opcional, para verificações manuais)
 */
export async function startVerification(
  data: VerificationRequest,
  verifiedByUserId?: number
): Promise<VerificationResult> {
  try {
    const validated = VerificationRequestSchema.parse(data);

    // Verificar se propriedade existe
    // Otimizado: SELECT apenas campos necessários para verificação
    const property = await queryDatabase(
      `SELECT id, name, address, city, state, country, 
              latitude, longitude, amenities, property_type
       FROM properties WHERE id = $1`,
      [validated.propertyId]
    ) || [];

    if (property.length === 0) {
      throw new Error('Propriedade não encontrada');
    }

    const prop = property[0];

    // Executar verificações em paralelo
    const [documentsCheck, locationCheck, imagesCheck, amenitiesCheck] = await Promise.all([
      verifyDocuments(validated.propertyId, validated.documents || []),
      verifyLocation(validated.propertyId, prop),
      verifyImages(validated.propertyId),
      verifyAmenities(validated.propertyId, prop),
    ]);

    // Calcular score geral
    const totalScore = (
      documentsCheck.score * 0.3 +
      locationCheck.score * 0.3 +
      imagesCheck.score * 0.2 +
      amenitiesCheck.score * 0.2
    );

    // Determinar nível de verificação
    let verificationLevel: VerificationResult['verificationLevel'] = 'unverified';
    if (totalScore >= VERIFICATION_THRESHOLDS.verified) {
      verificationLevel = 'verified';
    } else if (totalScore >= VERIFICATION_THRESHOLDS.premium) {
      verificationLevel = 'premium';
    } else if (totalScore >= VERIFICATION_THRESHOLDS.standard) {
      verificationLevel = 'standard';
    } else if (totalScore >= VERIFICATION_THRESHOLDS.basic) {
      verificationLevel = 'basic';
    }

    // Determinar status
    let status: VerificationResult['status'] = 'approved';
    if (totalScore < VERIFICATION_THRESHOLDS.basic) {
      status = 'rejected';
    } else if (documentsCheck.issues.length > 0 || locationCheck.verified === false) {
      status = 'pending'; // Requer revisão manual
    }

    const result: VerificationResult = {
      propertyId: validated.propertyId,
      verificationLevel,
      status,
      score: totalScore,
      checks: {
        documents: documentsCheck,
        location: locationCheck,
        images: imagesCheck,
        amenities: amenitiesCheck,
      },
      verifiedAt: status === 'approved' ? new Date() : null,
      verifiedBy: status === 'approved' ? (verifiedByUserId || null) : null, // ID do verificador (se fornecido)
      notes: status === 'rejected' ? 'Score abaixo do mínimo necessário' : undefined,
    };

    // Salvar resultado no banco (se tabela existir)
    await saveVerificationResult(result);

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}${validated.propertyId}`);

    return result;
  } catch (error: any) {
    console.error('Erro ao iniciar verificação:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Obter status de verificação de uma propriedade
 */
export async function getVerificationStatus(
  propertyId: number
): Promise<VerificationResult | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${propertyId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco (se tabela existir)
    const result = await queryDatabase(
      `SELECT * FROM property_verifications WHERE property_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [propertyId]
    ) || [];

    if (result.length === 0) {
      return null;
    }

    const verification = mapVerificationFromDB(result[0]);

    // Cache
    await redisCache.set(cacheKey, JSON.stringify(verification), CACHE_TTL);

    return verification;
  } catch (error: any) {
    console.error('Erro ao buscar status de verificação:', error);
    throw error;
  }
}

/**
 * Aprovar verificação manualmente
 */
export async function approveVerification(
  propertyId: number,
  reviewerId: number,
  notes?: string
): Promise<VerificationResult> {
  try {
    // Buscar verificação atual
    const current = await getVerificationStatus(propertyId);
    if (!current) {
      throw new Error('Verificação não encontrada');
    }

    // Atualizar status
    const result = await queryDatabase(
      `UPDATE property_verifications
       SET status = 'approved',
           verification_level = CASE
             WHEN score >= 95 THEN 'verified'
             WHEN score >= 85 THEN 'premium'
             WHEN score >= 75 THEN 'standard'
             WHEN score >= 60 THEN 'basic'
             ELSE 'unverified'
           END,
           verified_at = CURRENT_TIMESTAMP,
           verified_by = $1,
           notes = $2
       WHERE property_id = $3
       RETURNING *`,
      [reviewerId, notes || null, propertyId]
    ) || [];

    if (result.length === 0) {
      throw new Error('Erro ao aprovar verificação');
    }

    const updated = mapVerificationFromDB(result[0]);

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}${propertyId}`);

    // Atualizar nível de verificação da propriedade
    await queryDatabase(
      `UPDATE properties SET verification_level = $1 WHERE id = $2`,
      [updated.verificationLevel, propertyId]
    );

    return updated;
  } catch (error: any) {
    console.error('Erro ao aprovar verificação:', error);
    throw error;
  }
}

// ================================
// PRIVATE FUNCTIONS - VERIFICATIONS
// ================================

/**
 * Verificar documentos
 */
async function verifyDocuments(
  propertyId: number,
  documents: Array<{ type: string; url: string }>
): Promise<{
  verified: boolean;
  score: number;
  issues: string[];
}> {
  try {
    const issues: string[] = [];
    let score = 0;

    // Verificar se há documentos
    if (documents.length === 0) {
      issues.push('Nenhum documento fornecido');
      return { verified: false, score: 0, issues };
    }

    // Verificar tipos obrigatórios
    const requiredTypes = ['ownership', 'license'];
    const providedTypes = documents.map(d => d.type);
    const missingTypes = requiredTypes.filter(type => !providedTypes.includes(type));

    if (missingTypes.length > 0) {
      issues.push(`Documentos obrigatórios faltando: ${missingTypes.join(', ')}`);
      score -= 20 * missingTypes.length;
    }

    // Verificar URLs válidas
    const invalidUrls = documents.filter(d => !d.url || !d.url.startsWith('http'));
    if (invalidUrls.length > 0) {
      issues.push(`${invalidUrls.length} documento(s) com URL inválida`);
      score -= 10 * invalidUrls.length;
    }

    // Score baseado em quantidade e tipos
    score += Math.min(100, documents.length * 15);
    score = Math.max(0, score);

    return {
      verified: score >= 60 && issues.length === 0,
      score,
      issues,
    };
  } catch (error: any) {
    console.error('Erro ao verificar documentos:', error);
    return { verified: false, score: 0, issues: ['Erro ao processar documentos'] };
  }
}

/**
 * Verificar localização
 */
async function verifyLocation(
  propertyId: number,
  property: any
): Promise<{
  verified: boolean;
  score: number;
  address?: string;
  coordinates?: { lat: number; lng: number };
}> {
  try {
    let score = 0;

    // Verificar se há endereço
    if (!property.address && !property.location) {
      return { verified: false, score: 0 };
    }

    const address = property.address || property.location;
    score += 30;

    // Verificar se há coordenadas
    let coordinates: { lat: number; lng: number } | undefined;
    if (property.latitude && property.longitude) {
      coordinates = {
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude),
      };
      score += 40;
    } else {
      // Tentar geocodificar endereço usando Google Maps API
      const { geocodeAddress } = await import('../external/google-maps-service');
      const geocodeResult = await geocodeAddress(address);
      if (geocodeResult) {
        coordinates = geocodeResult.coordinates;
        score += 35; // Um pouco menos por não ter coordenadas originais
      }
    }

    // Verificar se endereço é válido usando Google Maps API
    if (coordinates) {
      const { verifyAddress } = await import('../external/google-maps-service');
      const verification = await verifyAddress(address, coordinates);
      if (verification.isValid) {
        score += Math.min(30, verification.confidence * 0.3);
      } else {
        score -= 20; // Penalizar se endereço não é válido
      }
    } else {
      score += 20; // Score parcial se não há coordenadas
    }

    return {
      verified: score >= 70,
      score,
      address,
      coordinates: property.latitude && property.longitude
        ? { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) }
        : undefined,
    };
  } catch (error: any) {
    console.error('Erro ao verificar localização:', error);
    return { verified: false, score: 0 };
  }
}

/**
 * Verificar imagens
 */
async function verifyImages(
  propertyId: number
): Promise<{
  verified: boolean;
  score: number;
  aiAnalysis?: any;
}> {
  try {
    // Buscar imagens da propriedade
    const images = await queryDatabase(
      `SELECT images FROM properties WHERE id = $1`,
      [propertyId]
    ) || [];

    const imageArray = typeof images[0]?.images === 'string'
      ? JSON.parse(images[0]?.images || '[]')
      : (images[0]?.images || []);

    if (imageArray.length === 0) {
      return { verified: false, score: 0 };
    }

    let score = 0;

    // Score baseado em quantidade de imagens
    score += Math.min(50, imageArray.length * 10);

    // Verificar qualidade mínima (pelo menos 3 imagens)
    if (imageArray.length >= 3) {
      score += 30;
    } else {
      score -= 20;
    }

    // Verificar se há imagem principal
    if (imageArray.length > 0) {
      score += 20;
    }

    // Análise AI de imagens usando Google Vision API
    try {
      const { analyzePropertyImages } = await import('../external/google-vision-service');
      const aiAnalysis = await analyzePropertyImages(imageArray);
      
      if (aiAnalysis.validImages >= 3) {
        score += 20; // Bônus por ter imagens válidas
      }
      
      // Penalizar se há muitas imagens inválidas
      if (aiAnalysis.validImages < imageArray.length * 0.7) {
        score -= 15;
      }
      
      // Adicionar score baseado na confiança média
      score += Math.min(20, aiAnalysis.averageConfidence * 0.2);
    } catch (error: any) {
      console.error('Erro ao analisar imagens com AI:', error);
      // Continuar sem penalizar muito se API não estiver disponível
    }

    return {
      verified: score >= 60,
      score,
      // aiAnalysis,
    };
  } catch (error: any) {
    console.error('Erro ao verificar imagens:', error);
    return { verified: false, score: 0 };
  }
}

/**
 * Verificar amenities
 */
async function verifyAmenities(
  propertyId: number,
  property: any
): Promise<{
  verified: boolean;
  score: number;
  verifiedAmenities: string[];
}> {
  try {
    const amenities = typeof property.amenities === 'string'
      ? JSON.parse(property.amenities || '[]')
      : (property.amenities || []);

    if (amenities.length === 0) {
      return { verified: false, score: 0, verifiedAmenities: [] };
    }

    // Score baseado em quantidade de amenities
    const score = Math.min(100, amenities.length * 10);

    return {
      verified: score >= 50,
      score,
      verifiedAmenities: amenities,
    };
  } catch (error: any) {
    console.error('Erro ao verificar amenities:', error);
    return { verified: false, score: 0, verifiedAmenities: [] };
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

async function saveVerificationResult(result: VerificationResult): Promise<void> {
  try {
    // Preparar coordenadas para tipo POINT
    const coordinates = result.verifiedCoordinates 
      ? `POINT(${result.verifiedCoordinates.lng} ${result.verifiedCoordinates.lat})`
      : null;

    // Preparar arrays JSONB
    const propertyPhotos = result.images ? JSON.stringify(result.images) : null;
    const additionalDocs = result.documents?.additional 
      ? JSON.stringify(result.documents.additional) 
      : null;

    await queryDatabase(
      `INSERT INTO property_verifications 
       (property_id, requested_by, status, verification_type, 
        identity_document_url, address_proof_url, ownership_proof_url,
        property_photos, additional_documents,
        verified_address, verified_coordinates,
        verified_owner_name, review_notes, verification_badge)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::point, $12, $13, $14)
       ON CONFLICT (property_id) DO UPDATE SET
         status = EXCLUDED.status,
         verification_type = EXCLUDED.verification_type,
         identity_document_url = EXCLUDED.identity_document_url,
         address_proof_url = EXCLUDED.address_proof_url,
         ownership_proof_url = EXCLUDED.ownership_proof_url,
         property_photos = EXCLUDED.property_photos,
         additional_documents = EXCLUDED.additional_documents,
         verified_address = EXCLUDED.verified_address,
         verified_coordinates = EXCLUDED.verified_coordinates,
         verified_owner_name = EXCLUDED.verified_owner_name,
         review_notes = EXCLUDED.review_notes,
         verification_badge = EXCLUDED.verification_badge,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [
        result.propertyId,
        result.requestedBy || result.propertyId, // Fallback se não fornecido
        result.status,
        result.verificationType || 'comprehensive',
        result.documents?.identityDocument || null,
        result.documents?.addressProof || null,
        result.documents?.ownershipProof || null,
        propertyPhotos,
        additionalDocs,
        result.verifiedAddress || null,
        coordinates,
        result.verifiedOwnerName || null,
        result.notes || null,
        result.badge || null
      ]
    );
  } catch (error: any) {
    console.error('Erro ao salvar resultado de verificação:', error);
    throw new Error(`Falha ao salvar verificação: ${error.message}`);
  }
}

function mapVerificationFromDB(row: any): VerificationResult {
  return {
    propertyId: row.property_id,
    verificationLevel: row.verification_level || 'unverified',
    status: row.status || 'pending',
    score: parseFloat(row.score || '0'),
    checks: typeof row.checks === 'string' ? JSON.parse(row.checks) : (row.checks || {}),
    verifiedAt: row.verified_at ? new Date(row.verified_at) : null,
    verifiedBy: row.verified_by ? parseInt(row.verified_by) : null,
    notes: row.notes,
  };
}

