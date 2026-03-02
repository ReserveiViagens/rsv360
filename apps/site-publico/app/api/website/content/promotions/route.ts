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

    const cacheKey = generateCacheKey('promotions:public', { page, limit, status });
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const promotions = await logDatabaseAccess(
      'GET',
      '/api/website/content/promotions',
      () => getWebsiteContent('promotions'),
      { page, limit, status }
    );
    
    const activePromotions = promotions
      .filter((promo: any) => promo.status === status)
      .map((promo: any) => {
        const metadata = promo.metadata || {};
        return {
          id: promo.id,
          content_id: promo.content_id,
          title: promo.title,
          description: promo.description,
          discount: metadata.discount || 0,
          validUntil: metadata.validUntil || '',
          status: promo.status,
          images: promo.images || [],
          metadata: metadata,
          seo_data: promo.seo_data || {},
        };
      });

    const total = activePromotions.length;
    const paginatedPromotions = activePromotions.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      data: paginatedPromotions,
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
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar promoções',
        data: [] 
      },
      { status: 500 }
    );
  }
}

