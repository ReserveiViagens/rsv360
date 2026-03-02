/**
 * API de Compartilhamento de Localização
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { realtimeLocationService } from '@/lib/realtime-location-service';

/**
 * POST /api/location/share
 * Iniciar ou atualizar compartilhamento de localização
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { latitude, longitude, accuracy, heading, speed, trip_id, wishlist_id } = body;

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude e longitude são obrigatórios' }, { status: 400 });
    }

    // Criar atualização de localização
    const locationUpdate = {
      userId: auth.user.id,
      userName: auth.user.name,
      tripId: trip_id,
      wishlistId: wishlist_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : undefined,
      heading: heading ? parseFloat(heading) : undefined,
      speed: speed ? parseFloat(speed) : undefined,
      timestamp: new Date(),
    };

    // Determinar groupId
    const groupId = trip_id ? `trip_${trip_id}` : wishlist_id ? `wishlist_${wishlist_id}` : `user_${auth.user.id}`;

    // Enviar atualização
    await realtimeLocationService.sendLocationUpdate(groupId, locationUpdate);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Localização compartilhada com sucesso',
        location: locationUpdate,
      },
    });
  } catch (error: any) {
    console.error('Erro ao compartilhar localização:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao compartilhar localização' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/location/share
 * Obter localizações compartilhadas de um grupo
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('trip_id') ? parseInt(searchParams.get('trip_id')!) : undefined;
    const wishlistId = searchParams.get('wishlist_id') ? parseInt(searchParams.get('wishlist_id')!) : undefined;

    if (!tripId && !wishlistId) {
      return NextResponse.json({ error: 'trip_id ou wishlist_id é obrigatório' }, { status: 400 });
    }

    const groupId = tripId ? `trip_${tripId}` : `wishlist_${wishlistId}`;
    const locations = await realtimeLocationService.loadGroupLocations(groupId, tripId, wishlistId);

    return NextResponse.json({
      success: true,
      data: locations,
    });
  } catch (error: any) {
    console.error('Erro ao obter localizações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter localizações' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/location/share
 * Parar compartilhamento de localização
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('trip_id') ? parseInt(searchParams.get('trip_id')!) : undefined;
    const wishlistId = searchParams.get('wishlist_id') ? parseInt(searchParams.get('wishlist_id')!) : undefined;

    await realtimeLocationService.stopUserSharing(auth.user.id, tripId, wishlistId);

    return NextResponse.json({
      success: true,
      message: 'Compartilhamento de localização parado',
    });
  } catch (error: any) {
    console.error('Erro ao parar compartilhamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao parar compartilhamento' },
      { status: 500 }
    );
  }
}

