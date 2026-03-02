import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';
import { cache, generateCacheKey } from '@/lib/cache';
import { logDatabaseAccess } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;

    const cacheKey = generateCacheKey('tickets:public', { page, limit, status });
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const tickets = await logDatabaseAccess(
      'GET',
      '/api/website/content/tickets',
      () => getWebsiteContent('tickets'),
      { page, limit, status }
    );
    
    const activeTickets = tickets
      .filter((ticket: any) => ticket.status === status)
      .map((ticket: any) => {
        const metadata = ticket.metadata || {};
        return {
          id: ticket.id,
          content_id: ticket.content_id,
          title: ticket.title,
          description: ticket.description,
          price: metadata.price || 0,
          originalPrice: metadata.originalPrice || metadata.price || 0,
          discount: metadata.discount || 0,
          location: metadata.location || '',
          duration: metadata.duration || '',
          ageGroup: metadata.ageGroup || '',
          capacity: metadata.capacity || 0,
          category: metadata.category || '',
          rating: metadata.rating || 0,
          is_featured: metadata.popular || metadata.featured || false,
          is_active: ticket.status === 'active',
          features: metadata.features || [],
          images: ticket.images || [],
          status: ticket.status,
          metadata: metadata,
          seo_data: ticket.seo_data || {},
        };
      });

    const total = activeTickets.length;
    const paginatedTickets = activeTickets.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      data: paginatedTickets,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    cache.set(cacheKey, response, 5 * 60 * 1000);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar ingressos',
        data: [] 
      },
      { status: 500 }
    );
  }
}

