/**
 * ✅ ITEM 19: API DE CONVITES DIGITAIS
 * GET /api/trip-invitations - Listar convites
 * POST /api/trip-invitations - Criar convite
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createTripInvitation,
  listSentInvitations,
  listReceivedInvitations,
} from '@/lib/trip-invitation-service';
import { createTripInvitationSchema, getInvitationQuerySchema } from '@/lib/schemas/trip-invitation-schemas';
import { requireAuth, optionalAuth } from '@/lib/api-auth';

// GET /api/trip-invitations - Listar convites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') ? parseInt(searchParams.get('user_id')!) : undefined;
    const email = searchParams.get('email') || undefined;
    const type = searchParams.get('type'); // 'sent' | 'received'
    const status = searchParams.get('status') || undefined;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: 'user_id ou email é obrigatório' },
        { status: 400 }
      );
    }

    let invitations;

    if (type === 'sent' && userId) {
      invitations = await listSentInvitations(userId, status);
    } else if (type === 'received' && email) {
      invitations = await listReceivedInvitations(email, status);
    } else {
      // Listar ambos
      const sent = userId ? await listSentInvitations(userId, status) : [];
      const received = email ? await listReceivedInvitations(email, status) : [];
      invitations = [...sent, ...received];
    }

    return NextResponse.json({
      success: true,
      data: invitations,
    });
  } catch (error: any) {
    console.error('Erro ao listar convites:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao listar convites' },
      { status: 500 }
    );
  }
}

// POST /api/trip-invitations - Criar convite
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    const body = await request.json();
    
    // Validar body com Zod
    const validationResult = createTripInvitationSchema.safeParse({
      ...body,
      invited_by: body.invited_by || user.id,
      expires_at: body.expires_in_days 
        ? new Date(Date.now() + body.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
        : body.expires_at,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      invited_email,
      invited_by,
      invitation_type,
      booking_id,
      wishlist_id,
      trip_name,
      invited_name,
      message,
    } = validationResult.data;

    const invitation = await createTripInvitation(
      invited_email,
      invited_by,
      invitation_type,
      {
        bookingId: booking_id || undefined,
        wishlistId: wishlist_id || undefined,
        tripName: trip_name || undefined,
        invitedName: invited_name || undefined,
        message: message || undefined,
        expiresInDays: validationResult.data.expires_at
          ? Math.ceil((new Date(validationResult.data.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          : 7,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Convite criado com sucesso',
      data: invitation,
    });
  } catch (error: any) {
    console.error('Erro ao criar convite:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao criar convite' },
      { status: 500 }
    );
  }
}

