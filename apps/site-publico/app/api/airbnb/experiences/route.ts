/**
 * ✅ TAREFA LOW-1: API para buscar experiências do Airbnb
 * GET /api/airbnb/experiences
 */

import { NextRequest, NextResponse } from 'next/server';
import { airbnbExperiencesService } from '@/lib/airbnb-experiences-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      location: searchParams.get('location') || undefined,
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      maxPrice: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      minRating: searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : undefined,
      maxGuests: searchParams.get('max_guests') ? parseInt(searchParams.get('max_guests')!) : undefined,
      language: searchParams.get('language') || undefined,
      instantBook: searchParams.get('instant_book') === 'true' ? true : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    };

    const experiences = await airbnbExperiencesService.searchExperiences(params);

    return NextResponse.json({
      success: true,
      data: experiences,
      count: experiences.length,
    });
  } catch (error: any) {
    console.error('Erro ao buscar experiências:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar experiências' },
      { status: 500 }
    );
  }
}

