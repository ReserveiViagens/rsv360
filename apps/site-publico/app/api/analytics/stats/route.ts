import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

// GET /api/analytics/stats - Obter estatísticas
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const searchParams = request.nextUrl.searchParams;
    const period = parseInt(searchParams.get('period') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Verificar se a tabela bookings existe
    const bookingsTableExists = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
      ) as exists`
    );

    if (!bookingsTableExists[0]?.exists) {
      // Retornar dados vazios se a tabela não existir
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            total_bookings: 0,
            total_revenue: 0,
            average_rating: 0,
            total_reviews: 0,
            bookings_change: 0,
            revenue_change: 0,
            rating_change: 0
          },
          bookings_over_time: [],
          bookings_by_category: [],
          revenue_by_month: []
        }
      });
    }

    // Resumo - buscar reservas do usuário (como host) ou todas se for admin
    const isAdmin = decoded.role === 'admin';
    const summaryQuery = isAdmin
      ? `SELECT 
          COUNT(*) as total_bookings,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(rating), 0) as average_rating,
          COUNT(DISTINCT review_id) as total_reviews
         FROM bookings
         WHERE created_at >= $1`
      : `SELECT 
          COUNT(*) as total_bookings,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(rating), 0) as average_rating,
          COUNT(DISTINCT review_id) as total_reviews
         FROM bookings
         WHERE user_id = $1 AND created_at >= $2`;

    const summary = await queryDatabase(
      summaryQuery,
      isAdmin ? [startDateStr] : [userId, startDateStr]
    );

    // Comparação com período anterior
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - period);
    const previousStartDateStr = previousStartDate.toISOString().split('T')[0];

    const previousSummaryQuery = isAdmin
      ? `SELECT 
          COUNT(*) as total_bookings,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(rating), 0) as average_rating
         FROM bookings
         WHERE created_at >= $1 AND created_at < $2`
      : `SELECT 
          COUNT(*) as total_bookings,
          COALESCE(SUM(total), 0) as total_revenue,
          COALESCE(AVG(rating), 0) as average_rating
         FROM bookings
         WHERE user_id = $1 AND created_at >= $2 AND created_at < $3`;

    const previousSummary = await queryDatabase(
      previousSummaryQuery,
      isAdmin ? [previousStartDateStr, startDateStr] : [userId, previousStartDateStr, startDateStr]
    );

    const current = summary[0] || { total_bookings: 0, total_revenue: 0, average_rating: 0, total_reviews: 0 };
    const previous = previousSummary[0] || { total_bookings: 0, total_revenue: 0, average_rating: 0 };

    const bookingsChange = previous.total_bookings > 0
      ? ((current.total_bookings - previous.total_bookings) / previous.total_bookings) * 100
      : 0;
    const revenueChange = previous.total_revenue > 0
      ? ((current.total_revenue - previous.total_revenue) / previous.total_revenue) * 100
      : 0;
    const ratingChange = current.average_rating - previous.average_rating;

    // Reservas ao longo do tempo
    const bookingsOverTimeQuery = isAdmin
      ? `SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as bookings,
          COALESCE(SUM(total), 0) as revenue
         FROM bookings
         WHERE created_at >= $1
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date ASC`
      : `SELECT 
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as bookings,
          COALESCE(SUM(total), 0) as revenue
         FROM bookings
         WHERE user_id = $1 AND created_at >= $2
         GROUP BY DATE_TRUNC('day', created_at)
         ORDER BY date ASC`;

    const bookingsOverTime = await queryDatabase(
      bookingsOverTimeQuery,
      isAdmin ? [startDateStr] : [userId, startDateStr]
    );

    // Reservas por categoria (se houver campo category)
    // Tentar buscar por item_name ou category
    const bookingsByCategoryQuery = isAdmin
      ? `SELECT 
          COALESCE(item_name, 'Outros') as name,
          COUNT(*) as value
         FROM bookings
         WHERE created_at >= $1
         GROUP BY item_name`
      : `SELECT 
          COALESCE(item_name, 'Outros') as name,
          COUNT(*) as value
         FROM bookings
         WHERE user_id = $1 AND created_at >= $2
         GROUP BY item_name`;

    const bookingsByCategory = await queryDatabase(
      bookingsByCategoryQuery,
      isAdmin ? [startDateStr] : [userId, startDateStr]
    );

    // Receita mensal
    const revenueByMonthQuery = isAdmin
      ? `SELECT 
          DATE_TRUNC('month', created_at) as month,
          COALESCE(SUM(total), 0) as revenue
         FROM bookings
         WHERE created_at >= $1
         GROUP BY DATE_TRUNC('month', created_at)
         ORDER BY month ASC`
      : `SELECT 
          DATE_TRUNC('month', created_at) as month,
          COALESCE(SUM(total), 0) as revenue
         FROM bookings
         WHERE user_id = $1 AND created_at >= $2
         GROUP BY DATE_TRUNC('month', created_at)
         ORDER BY month ASC`;

    const revenueByMonth = await queryDatabase(
      revenueByMonthQuery,
      isAdmin ? [startDateStr] : [userId, startDateStr]
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_bookings: parseInt(current.total_bookings || 0),
          total_revenue: parseFloat(current.total_revenue || 0),
          average_rating: parseFloat(current.average_rating || 0),
          total_reviews: parseInt(current.total_reviews || 0),
          bookings_change: bookingsChange,
          revenue_change: revenueChange,
          rating_change: ratingChange
        },
        bookings_over_time: bookingsOverTime.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
          bookings: parseInt(item.bookings || 0),
          revenue: parseFloat(item.revenue || 0)
        })),
        bookings_by_category: bookingsByCategory.map((item: any) => ({
          name: item.name,
          value: parseInt(item.value || 0)
        })),
        revenue_by_month: revenueByMonth.map((item: any, index: number) => ({
          month: new Date(item.month).toLocaleDateString('pt-BR', { month: 'short' }),
          revenue: parseFloat(item.revenue || 0),
          previous: index > 0 ? parseFloat(revenueByMonth[index - 1]?.revenue || 0) : 0
        }))
      }
    });
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

