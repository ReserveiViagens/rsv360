/**
 * GET /api/crm/customers/[id]/interactions — interações do cliente (profile id)
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import { getCustomerProfileById } from '@/lib/crm-customer-resolve';
import { listInteractions } from '@/lib/crm-service';
import { jsonInternalError } from '@/lib/api-error';

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

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const interactions = profile.customer_id
      ? await listInteractions({ customer_id: profile.customer_id, limit })
      : [];

    return NextResponse.json({
      success: true,
      data: interactions,
      count: interactions.length,
    });
  } catch (err: unknown) {
    return jsonInternalError(err);
  }
}
