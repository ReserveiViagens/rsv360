/**
 * ✅ FASE 4: API DE RANKING DE QUALIDADE
 * GET /api/quality/leaderboard - Ranking de hosts por qualidade
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, optionalAuth } from '@/lib/api-auth';
import { getTopHosts } from '@/lib/top-host-service';
import { getLeaderboardQuerySchema } from '@/lib/schemas/top-host-schemas';
import { cacheService } from '@/lib/cache-service';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Leaderboard pode ser público ou autenticado
  const authResult = await optionalAuth(request);

  try {
    const { searchParams } = new URL(request.url);
    
    // Validar query params
    const queryResult = getLeaderboardQuerySchema.safeParse({
      limit: searchParams.get('limit'),
      min_bookings: searchParams.get('min_bookings'),
      min_score: searchParams.get('min_score'),
      category: searchParams.get('category'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parâmetros inválidos',
          details: queryResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { limit, min_bookings, min_score, category } = queryResult.data;

    // Verificar cache
    const cacheKey = cacheService.generateKey('quality:leaderboard', {
      limit: limit || 50,
      min_bookings: min_bookings || 5,
      min_score: min_score || 0,
      category: category || 'all',
    });

    const cached = cacheService.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

    // Buscar top hosts usando o service
    const leaderboard = await getTopHosts(
      limit || 50,
      min_bookings || 5,
      min_score
    );

    // Melhorar agregações com dados adicionais
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (host) => {
        // Buscar estatísticas adicionais
        const statsResult = await queryDatabase(
          `SELECT 
            COUNT(DISTINCT b.id) as total_bookings,
            AVG(r.rating) as avg_rating,
            COUNT(DISTINCT r.id) as total_reviews,
            SUM(b.total) as total_revenue
          FROM users u
          LEFT JOIN bookings b ON b.customer_id IN (
            SELECT id FROM customers WHERE user_id = u.id
          )
          LEFT JOIN reviews r ON r.user_id = u.id
          WHERE u.id = $1
          GROUP BY u.id`,
          [host.host_id]
        );

        const stats = statsResult[0] || {};
        
        return {
          ...host,
          stats: {
            total_bookings: parseInt(stats.total_bookings || 0),
            avg_rating: parseFloat(stats.avg_rating || 0),
            total_reviews: parseInt(stats.total_reviews || 0),
            total_revenue: parseFloat(stats.total_revenue || 0),
          },
        };
      })
    );

    const response = {
      leaderboard: enrichedLeaderboard,
      total_hosts: enrichedLeaderboard.length,
      min_bookings_required: min_bookings || 5,
      min_score_required: min_score || 0,
      generated_at: new Date().toISOString(),
    };

    // Cachear resultado (10 minutos)
    cacheService.set(cacheKey, response, 10 * 60 * 1000);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error('Erro ao buscar ranking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar ranking' },
      { status: 500 }
    );
  }
}

