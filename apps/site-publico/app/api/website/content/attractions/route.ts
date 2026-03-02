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

    const cacheKey = generateCacheKey('attractions:public', { page, limit, status });
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const attractions = await logDatabaseAccess(
      'GET',
      '/api/website/content/attractions',
      () => getWebsiteContent('attractions'),
      { page, limit, status }
    );

    const attractionsArray = Array.isArray(attractions) ? attractions : [];

    const activeAttractions = attractionsArray
      .filter((attraction: any) => attraction.status === status)
      .map((attraction: any) => {
        const metadata = attraction.metadata || {};
        return {
          id: attraction.id,
          content_id: attraction.content_id,
          title: attraction.title,
          description: attraction.description,
          price: metadata.price || 0,
          location: metadata.location || '',
          status: attraction.status,
          images: attraction.images || [],
          metadata: metadata,
          seo_data: attraction.seo_data || {},
        };
      });

    const total = activeAttractions.length;
    const paginatedAttractions = activeAttractions.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      data: paginatedAttractions,
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
    console.error('Erro ao buscar atrações:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar atrações',
        data: [] 
      },
      { status: 500 }
    );
  }
}

