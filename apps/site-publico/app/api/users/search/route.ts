import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

// GET /api/users/search - Buscar perfis
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const minRating = searchParams.get('min_rating');
    const verified = searchParams.get('verified');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status,
        up.username, up.avatar_url, up.bio, up.short_description, up.tagline,
        up.location, up.city, up.state, up.business_name, up.verified,
        up.rating, up.review_count, up.total_bookings,
        up.categories, up.services, up.amenities
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.status = 'active' AND u.role = 'customer'
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (q) {
      query += ` AND (
        u.name ILIKE $${paramIndex} OR 
        u.email ILIKE $${paramIndex} OR 
        up.bio ILIKE $${paramIndex} OR
        up.business_name ILIKE $${paramIndex}
      )`;
      params.push(`%${q}%`);
      paramIndex++;
    }

    if (category) {
      query += ` AND up.categories::text ILIKE $${paramIndex}`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (location) {
      query += ` AND (
        up.location ILIKE $${paramIndex} OR 
        up.city ILIKE $${paramIndex} OR 
        up.state ILIKE $${paramIndex}
      )`;
      params.push(`%${location}%`);
      paramIndex++;
    }

    if (minRating) {
      query += ` AND up.rating >= $${paramIndex}`;
      params.push(parseFloat(minRating));
      paramIndex++;
    }

    if (verified === 'true') {
      query += ` AND up.verified = true`;
    }

    query += ` ORDER BY up.rating DESC NULLS LAST, up.review_count DESC NULLS LAST LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const users = await queryDatabase(query, params);

    // Contar total
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM').replace(/ORDER BY[\s\S]*$/, '');
    const countResult = await queryDatabase(countQuery, params.slice(0, -2));
    const total = parseInt(countResult[0]?.total || '0');

    // Processar dados
    const processedUsers = users.map((user: any) => ({
      ...user,
      categories: typeof user.categories === 'string' ? JSON.parse(user.categories || '[]') : (user.categories || []),
      services: typeof user.services === 'string' ? JSON.parse(user.services || '[]') : (user.services || []),
      amenities: typeof user.amenities === 'string' ? JSON.parse(user.amenities || '[]') : (user.amenities || []),
      rating: parseFloat(user.rating || 0),
      review_count: parseInt(user.review_count || 0),
      total_bookings: parseInt(user.total_bookings || 0),
    }));

    return NextResponse.json({
      success: true,
      data: processedUsers,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Erro na busca:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

