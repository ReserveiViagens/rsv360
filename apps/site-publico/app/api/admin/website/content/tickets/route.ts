import { NextResponse } from 'next/server';
import { getWebsiteContent } from '@/lib/db';

export async function GET() {
  try {
    const tickets = await getWebsiteContent('tickets');
    
    const formattedTickets = tickets.map((ticket: any) => {
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

    return NextResponse.json({
      success: true,
      data: formattedTickets
    });
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

