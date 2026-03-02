import { NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';

export async function GET() {
  try {
    const promotions = await getWebsiteContent('promotions');
    
    const formattedPromotions = promotions.map((promo: any) => {
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

    return NextResponse.json({
      success: true,
      data: formattedPromotions
    });
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

