import { NextRequest, NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';
import { cache, generateCacheKey } from '@/lib/cache';
import { logDatabaseAccess } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;

    // Generate cache key
    const cacheKey = generateCacheKey('hotels:public', { page, limit, status });
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Fetch data with logging
    const hotels = await logDatabaseAccess(
      'GET',
      '/api/website/content/hotels',
      () => getWebsiteContent('hotels'),
      { page, limit, status }
    );
    
    // ✅ CORREÇÃO ERRO 2: Garantir que sempre temos um array
    const hotelsArray = Array.isArray(hotels) ? hotels : [];
    
    // Filter and format
    const activeHotels = hotelsArray
      .filter((hotel: any) => hotel.status === status)
      .map((hotel: any) => {
        const metadata = hotel.metadata || {};
        return {
          id: hotel.id,
          content_id: hotel.content_id,
          title: hotel.title,
          description: hotel.description,
          price: metadata.price || 0,
          originalPrice: metadata.originalPrice || metadata.price || 0,
          stars: metadata.stars || metadata.rating || 0,
          rating: metadata.rating || metadata.stars || 0,
          location: metadata.location || '',
          status: hotel.status,
          images: hotel.images || [],
          features: metadata.features || metadata.amenities || [],
          metadata: metadata,
          seo_data: hotel.seo_data || {},
          // Coordenadas geográficas (prioridade: metadata.coordinates > metadata.latitude/longitude)
          latitude: metadata.coordinates?.lat || metadata.latitude || undefined,
          longitude: metadata.coordinates?.lng || metadata.longitude || undefined,
          coordinates: metadata.coordinates || (metadata.latitude && metadata.longitude ? {
            lat: metadata.latitude,
            lng: metadata.longitude,
          } : undefined),
        };
      });

    // Apply pagination
    const total = activeHotels.length;
    const paginatedHotels = activeHotels.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    const response = {
      success: true,
      data: paginatedHotels,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    // Cache for 5 minutes
    cache.set(cacheKey, response, 5 * 60 * 1000);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Erro ao buscar hotéis',
        data: [] 
      },
      { status: 500 }
    );
  }
}

