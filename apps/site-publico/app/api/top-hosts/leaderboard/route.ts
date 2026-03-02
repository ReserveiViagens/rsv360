/**
 * ✅ TAREFA HIGH-4: API para Leaderboard com Cache e Paginação
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopHosts } from '@/lib/top-host-service';
import { getCachedLeaderboard, type LeaderboardFilters } from '@/lib/leaderboard-cache-service';

/**
 * GET /api/top-hosts/leaderboard
 * Obter leaderboard com cache e paginação
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minScore = searchParams.get('min_score');
    const minBookings = searchParams.get('min_bookings');
    const tier = searchParams.get('tier');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '50');

    const filters: LeaderboardFilters = {
      minScore: minScore ? parseFloat(minScore) : undefined,
      minBookings: minBookings ? parseInt(minBookings) : undefined,
      tier: tier || undefined,
    };

    const leaderboard = await getCachedLeaderboard(filters, page, pageSize);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error: any) {
    console.error('Erro ao obter leaderboard:', error);
    // Fallback para método antigo
    try {
      const minScore = request.nextUrl.searchParams.get('min_score');
      const minBookings = request.nextUrl.searchParams.get('min_bookings');
      const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

      const hosts = await getTopHosts(
        limit,
        minBookings ? parseInt(minBookings) : 5,
        minScore ? parseFloat(minScore) : undefined
      );

      return NextResponse.json({
        success: true,
        data: {
          entries: hosts,
          total: hosts.length,
          page: 1,
          pageSize: limit,
          totalPages: 1,
        },
      });
    } catch (fallbackError: any) {
      return NextResponse.json(
        {
          success: false,
          error: fallbackError.message || 'Erro ao obter leaderboard',
        },
        { status: 500 }
      );
    }
  }
}

