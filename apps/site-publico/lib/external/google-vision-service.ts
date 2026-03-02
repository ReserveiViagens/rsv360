/**
 * ✅ FASE 3.5 - FASE 5.3: Google Vision Service
 * 
 * @description Serviço para análise de imagens usando Google Vision API
 * - Detecção de objetos
 * - Análise de propriedades
 * - Verificação de qualidade
 * - Detecção de conteúdo inapropriado
 * 
 * @module external
 * @author RSV 360 Team
 * @created 2025-12-13
 */

import { redisCache } from '../redis-cache';

// ================================
// TYPES
// ================================

interface ImageAnalysisResult {
  isPropertyImage: boolean;
  confidence: number; // 0-100
  detectedObjects: string[];
  labels: Array<{
    description: string;
    score: number;
  }>;
  safeSearch?: {
    adult: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
    violence: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
    racy: 'VERY_UNLIKELY' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'VERY_LIKELY';
  };
  issues?: string[];
}

interface VisionAPIResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string;
      score: number;
      mid?: string;
    }>;
    safeSearchAnnotation?: {
      adult: string;
      violence: string;
      racy: string;
    };
    error?: {
      code: number;
      message: string;
    };
  }>;
}

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 86400 * 30; // 30 dias
const CACHE_PREFIX = 'google-vision:';
const GOOGLE_VISION_API_BASE = 'https://vision.googleapis.com/v1/images:annotate';

// Objetos relevantes para propriedades
const PROPERTY_RELEVANT_LABELS = [
  'room', 'bedroom', 'bathroom', 'kitchen', 'living room',
  'furniture', 'bed', 'sofa', 'table', 'chair',
  'apartment', 'house', 'building', 'interior design',
  'swimming pool', 'balcony', 'window', 'door',
  'hotel', 'accommodation', 'resort'
];

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Analisar imagem de propriedade
 */
export async function analyzePropertyImage(
  imageUrl: string
): Promise<ImageAnalysisResult> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${Buffer.from(imageUrl).toString('base64').substring(0, 50)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      console.warn('GOOGLE_VISION_API_KEY não configurada');
      return {
        isPropertyImage: false,
        confidence: 0,
        detectedObjects: [],
        labels: [],
        issues: ['API Key não configurada'],
      };
    }

    // Buscar imagem
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Erro ao buscar imagem: ${imageResponse.status}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Chamar API do Google Vision
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'SAFE_SEARCH_DETECTION' },
          ],
        },
      ],
    };

    const response = await fetch(`${GOOGLE_VISION_API_BASE}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Google Vision API retornou erro: ${response.status}`);
    }

    const data: VisionAPIResponse = await response.json();

    if (!data.responses || data.responses.length === 0) {
      return {
        isPropertyImage: false,
        confidence: 0,
        detectedObjects: [],
        labels: [],
        issues: ['Resposta vazia da API'],
      };
    }

    const result = data.responses[0];

    if (result.error) {
      return {
        isPropertyImage: false,
        confidence: 0,
        detectedObjects: [],
        labels: [],
        issues: [result.error.message],
      };
    }

    // Processar labels
    const labels = (result.labelAnnotations || []).map((label) => ({
      description: label.description,
      score: label.score,
    }));

    // Verificar se é imagem de propriedade
    const relevantLabels = labels.filter((label) =>
      PROPERTY_RELEVANT_LABELS.some((relevant) =>
        label.description.toLowerCase().includes(relevant.toLowerCase())
      )
    );

    const isPropertyImage = relevantLabels.length >= 2;
    let confidence = relevantLabels.length * 15; // 15% por label relevante
    confidence = Math.min(100, confidence);

    // Verificar Safe Search
    const safeSearch = result.safeSearchAnnotation
      ? {
          adult: result.safeSearchAnnotation.adult as ImageAnalysisResult['safeSearch']['adult'],
          violence: result.safeSearchAnnotation.violence as ImageAnalysisResult['safeSearch']['violence'],
          racy: result.safeSearchAnnotation.racy as ImageAnalysisResult['safeSearch']['racy'],
        }
      : undefined;

    const issues: string[] = [];

    if (safeSearch) {
      if (safeSearch.adult !== 'VERY_UNLIKELY' && safeSearch.adult !== 'UNLIKELY') {
        issues.push('Conteúdo adulto detectado');
        confidence -= 50;
      }
      if (safeSearch.violence !== 'VERY_UNLIKELY' && safeSearch.violence !== 'UNLIKELY') {
        issues.push('Violência detectada');
        confidence -= 50;
      }
      if (safeSearch.racy !== 'VERY_UNLIKELY' && safeSearch.racy !== 'UNLIKELY') {
        issues.push('Conteúdo sugestivo detectado');
        confidence -= 30;
      }
    }

    const detectedObjects = relevantLabels.map((l) => l.description);

    const analysisResult: ImageAnalysisResult = {
      isPropertyImage,
      confidence: Math.max(0, Math.min(100, confidence)),
      detectedObjects,
      labels,
      safeSearch,
      issues: issues.length > 0 ? issues : undefined,
    };

    // Salvar em cache
    await redisCache.set(cacheKey, JSON.stringify(analysisResult), CACHE_TTL);

    return analysisResult;
  } catch (error: any) {
    console.error('Erro ao analisar imagem:', error);
    return {
      isPropertyImage: false,
      confidence: 0,
      detectedObjects: [],
      labels: [],
      issues: [error.message || 'Erro ao analisar imagem'],
    };
  }
}

/**
 * Analisar múltiplas imagens
 */
export async function analyzePropertyImages(
  imageUrls: string[]
): Promise<{
  totalImages: number;
  validImages: number;
  averageConfidence: number;
  allDetectedObjects: string[];
  issues: string[];
}> {
  try {
    const results = await Promise.all(
      imageUrls.map((url) => analyzePropertyImage(url))
    );

    const validImages = results.filter((r) => r.isPropertyImage).length;
    const averageConfidence =
      results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    const allDetectedObjects = Array.from(
      new Set(
        results.flatMap((r) => r.detectedObjects)
      )
    );

    const issues = Array.from(
      new Set(
        results.flatMap((r) => r.issues || [])
      )
    );

    return {
      totalImages: imageUrls.length,
      validImages,
      averageConfidence,
      allDetectedObjects,
      issues,
    };
  } catch (error: any) {
    console.error('Erro ao analisar múltiplas imagens:', error);
    return {
      totalImages: imageUrls.length,
      validImages: 0,
      averageConfidence: 0,
      allDetectedObjects: [],
      issues: [error.message || 'Erro ao analisar imagens'],
    };
  }
}

export default {
  analyzePropertyImage,
  analyzePropertyImages,
};

