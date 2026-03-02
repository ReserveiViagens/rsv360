import { NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';

export async function GET() {
  try {
    const hotels = await getWebsiteContent('hotels');
    
    // Transform data to match expected format
    const formattedHotels = hotels.map((hotel: any) => {
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
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedHotels
    });
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

