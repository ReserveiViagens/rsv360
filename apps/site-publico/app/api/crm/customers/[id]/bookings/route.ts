/**
 * GET /api/crm/customers/[id]/bookings — reservas do cliente (profile id)
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import {
  getCustomerProfileById,
  profileDisplayEmail,
  profileDisplayName,
} from '@/lib/crm-customer-resolve';
import { fetchBookingBreakdown } from '@/lib/analytics-booking-breakdown';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await marketingLabAuth(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const profileId = parseInt(id, 10);

    if (Number.isNaN(profileId) || profileId <= 0) {
      return NextResponse.json(
        { success: false, error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    const profile = await getCustomerProfileById(profileId);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const email = profileDisplayEmail(profile);
    const name = profileDisplayName(profile);

    const bookings = await fetchBookingBreakdown({
      customerEmail: email || undefined,
      customerName: email ? undefined : name,
      limit: 100,
    });

    const data = bookings.map((b) => ({
      id: b.id,
      booking_number: b.booking_code,
      property_name: b.item_name,
      check_in: b.start_date,
      check_out: b.end_date,
      total_amount: b.total_amount,
      status: b.status,
      created_at: b.created_at,
    }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar reservas';
    console.error('Erro ao listar reservas do cliente:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
