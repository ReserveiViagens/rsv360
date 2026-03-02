import { NextRequest, NextResponse } from 'next/server';
import {
  authenticateDecolar,
  fetchDecolarProperties,
  fetchDecolarBookings,
  syncDecolarBidirectional,
} from '@/lib/decolar-service';
import { getCredential } from '@/lib/credentials-service';

// POST: Autenticar ou sincronizar
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, propertyId, ...data } = body;

    if (action === 'authenticate') {
      const config = {
        api_key: data.api_key || await getCredential('decolar', `api_key_${propertyId}`),
        api_secret: data.api_secret || await getCredential('decolar', `api_secret_${propertyId}`),
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        property_id: propertyId?.toString(),
      };

      const result = await authenticateDecolar(config);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === 'sync') {
      if (!propertyId || !data.startDate || !data.endDate) {
        return NextResponse.json(
          { error: 'propertyId, startDate e endDate são obrigatórios' },
          { status: 400 }
        );
      }

      const result = await syncDecolarBidirectional(
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
    console.error('Erro na integração Decolar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro na integração Decolar' },
      { status: 500 }
    );
  }
}

// GET: Buscar propriedades ou reservas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get('propertyId');
    const action = searchParams.get('action'); // 'properties', 'bookings'

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId é obrigatório' },
        { status: 400 }
      );
    }

    const config = {
      api_key: await getCredential('decolar', `api_key_${propertyId}`),
      api_secret: await getCredential('decolar', `api_secret_${propertyId}`),
      access_token: await getCredential('decolar', `access_token_${propertyId}`),
      property_id: propertyId,
    };

    if (action === 'properties') {
      const properties = await fetchDecolarProperties(config);
      return NextResponse.json({ success: true, data: properties });
    }

    if (action === 'bookings') {
      const bookings = await fetchDecolarBookings(config, {
        startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
        endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
        propertyId: searchParams.get('propertyId') || undefined,
      });
      return NextResponse.json({ success: true, data: bookings });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao buscar dados Decolar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados Decolar' },
      { status: 500 }
    );
  }
}

