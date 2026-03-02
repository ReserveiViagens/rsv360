/**
 * ✅ BUSCA AVANÇADA DE PROPRIEDADES
 * 
 * Sistema de busca com:
 * - Filtros múltiplos
 * - Busca por localização (mapa)
 * - Busca por preço
 * - Busca por disponibilidade
 * - Busca por amenities
 * - Salvar buscas
 */

import { queryDatabase } from './db';
import { queryWithCache } from './query-optimizer';

export interface SearchFilters {
  location?: string;
  city?: string;
  state?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  propertyType?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number; // em km
}

export interface SearchResult {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price_per_night: number;
  images: string[];
  rating: number;
  amenities: string[];
  latitude?: number;
  longitude?: number;
  distance?: number; // em km
  available: boolean;
}

/**
 * Buscar propriedades com filtros avançados
 */
export async function searchProperties(filters: SearchFilters, page: number = 1, pageSize: number = 20): Promise<{
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por localização (texto)
    if (filters.location) {
      conditions.push(`(p.address ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex} OR p.state ILIKE $${paramIndex})`);
      params.push(`%${filters.location}%`);
      paramIndex++;
    }

    // Filtro por cidade
    if (filters.city) {
      conditions.push(`p.city ILIKE $${paramIndex}`);
      params.push(`%${filters.city}%`);
      paramIndex++;
    }

    // Filtro por estado
    if (filters.state) {
      conditions.push(`p.state = $${paramIndex}`);
      params.push(filters.state);
      paramIndex++;
    }

    // Filtro por preço
    if (filters.minPrice) {
      conditions.push(`p.price_per_night >= $${paramIndex}`);
      params.push(filters.minPrice);
      paramIndex++;
    }

    if (filters.maxPrice) {
      conditions.push(`p.price_per_night <= $${paramIndex}`);
      params.push(filters.maxPrice);
      paramIndex++;
    }

    // Filtro por tipo de propriedade
    if (filters.propertyType) {
      conditions.push(`p.property_type = $${paramIndex}`);
      params.push(filters.propertyType);
      paramIndex++;
    }

    // Filtro por rating
    if (filters.rating) {
      conditions.push(`p.rating >= $${paramIndex}`);
      params.push(filters.rating);
      paramIndex++;
    }

    // Filtro por amenities
    if (filters.amenities && filters.amenities.length > 0) {
      conditions.push(`p.amenities @> $${paramIndex}::jsonb`);
      params.push(JSON.stringify(filters.amenities));
      paramIndex++;
    }

    // Filtro por disponibilidade
    if (filters.checkIn && filters.checkOut) {
      conditions.push(`NOT EXISTS (
        SELECT 1 FROM availability a
        WHERE a.property_id = p.id
        AND a.date BETWEEN $${paramIndex}::date AND $${paramIndex + 1}::date
        AND a.is_available = false
      )`);
      params.push(filters.checkIn);
      params.push(filters.checkOut);
      paramIndex += 2;
    }

    // Filtro por capacidade (guests)
    if (filters.guests) {
      conditions.push(`p.max_guests >= $${paramIndex}`);
      params.push(filters.guests);
      paramIndex++;
    }

    // Filtro por localização (raio)
    if (filters.latitude && filters.longitude && filters.radius) {
      // Usar fórmula de Haversine para calcular distância
      conditions.push(`(
        6371 * acos(
          cos(radians($${paramIndex})) *
          cos(radians(p.latitude)) *
          cos(radians(p.longitude) - radians($${paramIndex + 1})) +
          sin(radians($${paramIndex})) *
          sin(radians(p.latitude))
        )
      ) <= $${paramIndex + 2}`);
      params.push(filters.latitude);
      params.push(filters.longitude);
      params.push(filters.radius);
      paramIndex += 3;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Query de contagem
    const countQuery = `SELECT COUNT(*) as total FROM properties p ${whereClause}`;
    const countResult = await queryWithCache(countQuery, params, 60000);
    const total = parseInt(countResult[0]?.total || '0');

    // Query de dados com paginação
    const offset = (page - 1) * pageSize;
    const dataQuery = `
      SELECT 
        p.*,
        CASE 
          WHEN $${paramIndex} IS NOT NULL AND $${paramIndex + 1} IS NOT NULL AND $${paramIndex + 2} IS NOT NULL
          THEN (
            6371 * acos(
              cos(radians($${paramIndex})) *
              cos(radians(p.latitude)) *
              cos(radians(p.longitude) - radians($${paramIndex + 1})) +
              sin(radians($${paramIndex})) *
              sin(radians(p.latitude))
            )
          )
          ELSE NULL
        END as distance
      FROM properties p
      ${whereClause}
      ORDER BY 
        CASE WHEN $${paramIndex} IS NOT NULL THEN distance END ASC,
        p.rating DESC,
        p.created_at DESC
      LIMIT $${paramIndex + 3} OFFSET $${paramIndex + 4}
    `;

    const dataParams = [
      ...params,
      filters.latitude || null,
      filters.longitude || null,
      filters.radius || null,
      pageSize,
      offset,
    ];

    const results = await queryWithCache(dataQuery, dataParams, 60000);

    const formattedResults: SearchResult[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description || '',
      address: row.address,
      city: row.city,
      state: row.state,
      price_per_night: parseFloat(row.price_per_night || 0),
      images: typeof row.images === 'string' ? JSON.parse(row.images || '[]') : (row.images || []),
      rating: parseFloat(row.rating || 0),
      amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : (row.amenities || []),
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      distance: row.distance ? parseFloat(row.distance) : undefined,
      available: true, // Já filtrado pela disponibilidade
    }));

    return {
      results: formattedResults,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  } catch (error: any) {
    console.error('Erro na busca avançada:', error);
    throw error;
  }
}

/**
 * Salvar busca do usuário
 */
export async function saveSearch(userId: number, filters: SearchFilters, name?: string): Promise<number> {
  try {
    const result = await queryDatabase(
      `INSERT INTO saved_searches (user_id, name, filters, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING id`,
      [userId, name || 'Busca salva', JSON.stringify(filters)]
    );

    return result[0]?.id;
  } catch (error: any) {
    console.error('Erro ao salvar busca:', error);
    throw error;
  }
}

/**
 * Listar buscas salvas do usuário
 */
export async function getSavedSearches(userId: number): Promise<Array<{ id: number; name: string; filters: SearchFilters; created_at: string }>> {
  try {
    const results = await queryDatabase(
      `SELECT id, name, filters, created_at
       FROM saved_searches
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return results.map((row: any) => ({
      id: row.id,
      name: row.name,
      filters: typeof row.filters === 'string' ? JSON.parse(row.filters) : row.filters,
      created_at: row.created_at,
    }));
  } catch (error: any) {
    console.error('Erro ao buscar buscas salvas:', error);
    return [];
  }
}

