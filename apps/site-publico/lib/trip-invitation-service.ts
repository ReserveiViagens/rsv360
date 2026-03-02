/**
 * ✅ ITEM 19: SERVIÇO DE CONVITES DIGITAIS
 * Backend completo para convites de viagem
 */

import { queryDatabase } from './db';
import crypto from 'crypto';

export interface TripInvitation {
  id: number;
  booking_id?: number;
  wishlist_id?: number;
  trip_name?: string;
  invited_by: number;
  invited_email: string;
  invited_name?: string;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  invitation_type: 'booking' | 'wishlist' | 'trip' | 'split_payment';
  message?: string;
  expires_at: string;
  accepted_at?: string;
  declined_at?: string;
  created_at: string;
  updated_at: string;
  inviter_name?: string;
  inviter_email?: string;
}

export interface TripInvitationHistory {
  id: number;
  invitation_id: number;
  action: 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  performed_by?: number;
  performed_by_email?: string;
  notes?: string;
  created_at: string;
}

/**
 * Gerar token único para convite
 */
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Criar convite
 */
export async function createTripInvitation(
  invitedEmail: string,
  invitedBy: number,
  invitationType: 'booking' | 'wishlist' | 'trip' | 'split_payment',
  options: {
    bookingId?: number;
    wishlistId?: number;
    tripName?: string;
    invitedName?: string;
    message?: string;
    expiresInDays?: number;
  } = {}
): Promise<TripInvitation> {
  const token = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 7)); // 7 dias por padrão

  const result = await queryDatabase(
    `INSERT INTO trip_invitations 
     (invited_email, invited_by, invited_name, token, invitation_type, booking_id, wishlist_id, trip_name, message, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      invitedEmail,
      invitedBy,
      options.invitedName || null,
      token,
      invitationType,
      options.bookingId || null,
      options.wishlistId || null,
      options.tripName || null,
      options.message || null,
      expiresAt.toISOString(),
    ]
  );

  const invitation = result[0] as TripInvitation;

  // Registrar no histórico
  await queryDatabase(
    `INSERT INTO trip_invitation_history (invitation_id, action, performed_by, notes)
     VALUES ($1, 'sent', $2, 'Convite enviado')`,
    [invitation.id, invitedBy]
  );

  return invitation;
}

/**
 * Buscar convite por token
 */
export async function getInvitationByToken(
  token: string
): Promise<TripInvitation | null> {
  const invitations = await queryDatabase(
    `SELECT i.*, u.name as inviter_name, u.email as inviter_email
     FROM trip_invitations i
     LEFT JOIN users u ON i.invited_by = u.id
     WHERE i.token = $1`,
    [token]
  );

  if (invitations.length === 0) {
    return null;
  }

  const invitation = invitations[0] as TripInvitation;

  // Verificar se expirou
  if (invitation.status === 'pending' && new Date(invitation.expires_at) < new Date()) {
    await queryDatabase(
      `UPDATE trip_invitations 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [invitation.id]
    );
    invitation.status = 'expired';
  }

  return invitation;
}

/**
 * Listar convites enviados por um usuário
 */
export async function listSentInvitations(
  userId: number,
  status?: string
): Promise<TripInvitation[]> {
  let query = `
    SELECT * FROM trip_invitations 
    WHERE invited_by = $1
  `;
  const params: any[] = [userId];

  if (status) {
    query += ` AND status = $2`;
    params.push(status);
  }

  query += ` ORDER BY created_at DESC`;

  return await queryDatabase(query, params) as TripInvitation[];
}

/**
 * Listar convites recebidos por email
 */
export async function listReceivedInvitations(
  email: string,
  status?: string
): Promise<TripInvitation[]> {
  let query = `
    SELECT i.*, u.name as inviter_name, u.email as inviter_email
     FROM trip_invitations i
     LEFT JOIN users u ON i.invited_by = u.id
     WHERE i.invited_email = $1
  `;
  const params: any[] = [email];

  if (status) {
    query += ` AND i.status = $2`;
    params.push(status);
  }

  query += ` ORDER BY i.created_at DESC`;

  return await queryDatabase(query, params) as TripInvitation[];
}

/**
 * Aceitar convite
 */
export async function acceptInvitation(
  token: string,
  acceptedByUserId?: number,
  acceptedByEmail?: string
): Promise<TripInvitation | null> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return null;
  }

  if (invitation.status !== 'pending') {
    return null; // Já foi processado
  }

  if (new Date(invitation.expires_at) < new Date()) {
    await queryDatabase(
      `UPDATE trip_invitations 
       SET status = 'expired', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [invitation.id]
    );
    return null; // Expirado
  }

  // Atualizar status
  const result = await queryDatabase(
    `UPDATE trip_invitations 
     SET 
       status = 'accepted',
       accepted_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [invitation.id]
  );

  const updatedInvitation = result[0] as TripInvitation;

  // Registrar no histórico
  await queryDatabase(
    `INSERT INTO trip_invitation_history (invitation_id, action, performed_by, performed_by_email, notes)
     VALUES ($1, 'accepted', $2, $3, 'Convite aceito')`,
    [invitation.id, acceptedByUserId || null, acceptedByEmail || null]
  );

  // Ações específicas por tipo de convite
  if (invitation.invitation_type === 'wishlist' && invitation.wishlist_id) {
    // Adicionar como membro da wishlist
    const { addWishlistMember } = await import('./wishlist-service');
    await addWishlistMember(
      invitation.wishlist_id,
      acceptedByUserId,
      acceptedByEmail,
      'member',
      true,
      true,
      false,
      invitation.invited_by
    );
  }

  if (invitation.invitation_type === 'booking' && invitation.booking_id && acceptedByUserId) {
    // Adicionar como participante da reserva
    try {
      // Verificar se já existe participante
      const existingParticipant = await queryDatabase(
        `SELECT id FROM booking_participants 
         WHERE booking_id = $1 AND user_id = $2`,
        [invitation.booking_id, acceptedByUserId]
      );

      if (existingParticipant.length === 0) {
        // Adicionar participante
        await queryDatabase(
          `INSERT INTO booking_participants (booking_id, user_id, role, status, created_at)
           VALUES ($1, $2, 'guest', 'confirmed', NOW())`,
          [invitation.booking_id, acceptedByUserId]
        );

        // Atualizar contagem de participantes na reserva
        await queryDatabase(
          `UPDATE bookings 
           SET guests_count = (
             SELECT COUNT(*) FROM booking_participants WHERE booking_id = $1
           )
           WHERE id = $1`,
          [invitation.booking_id]
        );

        // Notificar outros participantes
        const { sendNotification } = await import('./enhanced-notification-service');
        await sendNotification({
          userId: acceptedByUserId,
          type: ['email', 'in_app'],
          templateId: 'booking_participant_added',
          variables: {
            bookingId: invitation.booking_id.toString(),
            participantName: invitation.invited_name || invitation.invited_email,
          },
        });
      }
    } catch (error: any) {
      console.error('Erro ao adicionar participante à reserva:', error);
      // Não falhar o processo se houver erro ao adicionar participante
    }
  }

  return updatedInvitation;
}

/**
 * Recusar convite
 */
export async function declineInvitation(
  token: string,
  declinedByUserId?: number,
  declinedByEmail?: string,
  reason?: string
): Promise<TripInvitation | null> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return null;
  }

  if (invitation.status !== 'pending') {
    return null; // Já foi processado
  }

  // Atualizar status
  const result = await queryDatabase(
    `UPDATE trip_invitations 
     SET 
       status = 'declined',
       declined_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [invitation.id]
  );

  const updatedInvitation = result[0] as TripInvitation;

  // Registrar no histórico
  await queryDatabase(
    `INSERT INTO trip_invitation_history (invitation_id, action, performed_by, performed_by_email, notes)
     VALUES ($1, 'declined', $2, $3, $4)`,
    [invitation.id, declinedByUserId || null, declinedByEmail || null, reason || 'Convite recusado']
  );

  return updatedInvitation;
}

/**
 * Cancelar convite (pelo remetente)
 */
export async function cancelInvitation(
  invitationId: number,
  cancelledByUserId: number
): Promise<boolean> {
  const invitations = await queryDatabase(
    `SELECT * FROM trip_invitations WHERE id = $1 AND invited_by = $2`,
    [invitationId, cancelledByUserId]
  );

  if (invitations.length === 0) {
    return false;
  }

  const invitation = invitations[0] as TripInvitation;

  if (invitation.status !== 'pending') {
    return false; // Já foi processado
  }

  await queryDatabase(
    `UPDATE trip_invitations 
     SET 
       status = 'cancelled',
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [invitationId]
  );

  // Registrar no histórico
  await queryDatabase(
    `INSERT INTO trip_invitation_history (invitation_id, action, performed_by, notes)
     VALUES ($1, 'cancelled', $2, 'Convite cancelado pelo remetente')`,
    [invitationId, cancelledByUserId]
  );

  return true;
}

/**
 * Registrar visualização do convite
 */
export async function recordInvitationView(
  token: string,
  viewedByUserId?: number,
  viewedByEmail?: string
): Promise<boolean> {
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return false;
  }

  // Verificar se já foi visualizado
  const existing = await queryDatabase(
    `SELECT * FROM trip_invitation_history 
     WHERE invitation_id = $1 AND action = 'viewed'`,
    [invitation.id]
  );

  if (existing.length === 0) {
    await queryDatabase(
      `INSERT INTO trip_invitation_history (invitation_id, action, performed_by, performed_by_email, notes)
       VALUES ($1, 'viewed', $2, $3, 'Convite visualizado')`,
      [invitation.id, viewedByUserId || null, viewedByEmail || null]
    );
  }

  return true;
}

/**
 * Buscar histórico de convite
 */
export async function getInvitationHistory(
  invitationId: number
): Promise<TripInvitationHistory[]> {
  const history = await queryDatabase(
    `SELECT * FROM trip_invitation_history 
     WHERE invitation_id = $1
     ORDER BY created_at ASC`,
    [invitationId]
  );

  return history as TripInvitationHistory[];
}

