import { NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';

export async function GET() {
  try {
    const attractions = await getWebsiteContent('attractions');
    
    const formattedAttractions = attractions.map((attraction: any) => {
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

    return NextResponse.json({
      success: true,
      data: formattedAttractions
    });
  } catch (error: any) {
    console.error('Error fetching attractions:', error);
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

