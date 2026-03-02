import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateHospedin,
  fetchHospedinBookings,
  createHospedinBooking,
  fetchHospedinAvailability,
  syncHospedinBidirectional,
} from '@/lib/hospedin-service';
import { getCredential } from '@/lib/credentials-service';

// POST: Autenticar
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, propertyId, ...data } = body;

    if (action === 'authenticate') {
      const config = {
        api_key: data.api_key || await getCredential('hospedin', `api_key_${propertyId}`),
        api_secret: data.api_secret || await getCredential('hospedin', `api_secret_${propertyId}`),
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        property_id: propertyId?.toString(),
      };

      const result = await authenticateHospedin(config);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'sync') {
      if (!propertyId || !data.startDate || !data.endDate) {
        return NextResponse.json(
          { error: 'propertyId, startDate e endDate são obrigatórios' },
          { status: 400 }
        );
      }

      const result = await syncHospedinBidirectional(
        propertyId,
        new Date(data.startDate),
        new Date(data.endDate)
      );
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro na integração Hospedin:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na integração Hospedin' },
      { status: 500 }
    );
  }
}

// GET: Buscar reservas ou disponibilidade
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const action = searchParams.get('action'); // 'bookings', 'availability'

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId é obrigatório' },
        { status: 400 }
      );
    }

    const config = {
      api_key: await getCredential('hospedin', `api_key_${propertyId}`),
      api_secret: await getCredential('hospedin', `api_secret_${propertyId}`),
      access_token: await getCredential('hospedin', `access_token_${propertyId}`),
      property_id: propertyId,
    };

    if (action === 'bookings') {
      const bookings = await fetchHospedinBookings(config, {
        startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
        endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
        status: searchParams.get('status') || undefined,
      });
      return NextResponse.json({ success: true, data: bookings });
    }

    if (action === 'availability') {
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'startDate e endDate são obrigatórios' },
          { status: 400 }
        );
      }

      const availability = await fetchHospedinAvailability(
        config,
        propertyId,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json({ success: true, data: availability });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao buscar dados Hospedin:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados Hospedin' },
      { status: 500 }
    );
  }
}

