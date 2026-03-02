/**
 * ✅ ITENS 75-78: SERVIÇO DE REVIEWS MELHORADO
 * Fotos, Moderação, Respostas, Verificação
 */

import { queryDatabase } from './db';
import { sendNotification } from './notification-service';

export interface ReviewPhoto {
  id?: number;
  review_id: number;
  photo_url: string;
  thumbnail_url?: string;
  photo_order?: number;
  moderation_status?: 'pending' | 'approved' | 'rejected' | 'flagged';
}

export interface ReviewModeration {
  id?: number;
  review_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'edited';
  action_taken?: string;
  action_reason?: string;
  moderated_by?: number;
  moderation_notes?: string;
  auto_moderated?: boolean;
}

export interface ReviewResponse {
  id?: number;
  review_id: number;
  responder_id: number;
  responder_type?: 'host' | 'owner' | 'manager' | 'admin';
  response_text: string;
  is_public?: boolean;
  is_approved?: boolean;
}

export interface ReviewVerification {
  id?: number;
  review_id: number;
  is_verified: boolean;
  verification_type?: 'booking' | 'stay' | 'manual' | 'automated';
  verified_booking_id?: number;
  verification_score?: number;
  badges?: string[];
}

/**
 * ✅ ITEM 75: REVIEWS MELHORADO - FOTOS
 */

/**
 * Adicionar foto a review
 */
export async function addReviewPhoto(photo: ReviewPhoto): Promise<ReviewPhoto> {
  const result = await queryDatabase(
    `INSERT INTO review_photos 
     (review_id, photo_url, thumbnail_url, photo_order, moderation_status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      photo.review_id,
      photo.photo_url,
      photo.thumbnail_url || null,
      photo.photo_order || 0,
      photo.moderation_status || 'pending',
    ]
  );

  return result[0];
}

/**
 * Listar fotos de review
 */
export async function listReviewPhotos(
  reviewId: number,
  includePending: boolean = false
): Promise<ReviewPhoto[]> {
  let query = `SELECT * FROM review_photos WHERE review_id = $1`;
  const params: any[] = [reviewId];

  if (!includePending) {
    query += ` AND moderation_status = 'approved'`;
  }

  query += ` ORDER BY photo_order ASC, created_at ASC`;

  return await queryDatabase(query, params);
}

/**
 * Moderar foto
 */
export async function moderateReviewPhoto(
  photoId: number,
  status: 'approved' | 'rejected' | 'flagged',
  moderatorId: number,
  notes?: string
): Promise<void> {
  await queryDatabase(
    `UPDATE review_photos 
     SET moderation_status = $1,
         moderated_by = $2,
         moderated_at = CURRENT_TIMESTAMP,
         moderation_notes = $3
     WHERE id = $4`,
    [status, moderatorId, notes || null, photoId]
  );
}

/**
 * ✅ ITEM 76: REVIEWS MELHORADO - MODERAÇÃO
 */

/**
 * Criar registro de moderação
 */
export async function createReviewModeration(
  moderation: ReviewModeration
): Promise<ReviewModeration> {
  const result = await queryDatabase(
    `INSERT INTO review_moderation 
     (review_id, status, action_taken, action_reason, moderated_by, 
      moderation_notes, auto_moderated, previous_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      moderation.review_id,
      moderation.status,
      moderation.action_taken || null,
      moderation.action_reason || null,
      moderation.moderated_by || null,
      moderation.moderation_notes || null,
      moderation.auto_moderated || false,
      null, // previous_status será preenchido se houver update
    ]
  );

  return result[0];
}

/**
 * Moderar review
 */
export async function moderateReview(
  reviewId: number,
  status: 'approved' | 'rejected' | 'flagged' | 'edited',
  moderatorId: number,
  action: {
    action_taken?: string;
    action_reason?: string;
    notes?: string;
    previous_content?: string;
  }
): Promise<void> {
  // Buscar status anterior
  const current = await queryDatabase(
    `SELECT status FROM review_moderation WHERE review_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [reviewId]
  );
  const previousStatus = current.length > 0 ? current[0].status : 'pending';

  // Criar novo registro de moderação
  await createReviewModeration({
    review_id: reviewId,
    status,
    action_taken: action.action_taken,
    action_reason: action.action_reason,
    moderated_by: moderatorId,
    moderation_notes: action.notes,
    auto_moderated: false,
    previous_status: previousStatus,
  });

  // Se editado, salvar conteúdo anterior
  if (status === 'edited' && action.previous_content) {
    await queryDatabase(
      `UPDATE review_moderation 
       SET previous_content = $1
       WHERE review_id = $2 AND status = 'edited'
       ORDER BY created_at DESC LIMIT 1`,
      [action.previous_content, reviewId]
    );
  }
}

/**
 * Listar reviews pendentes de moderação
 */
export async function listPendingModerations(
  limit: number = 20,
  offset: number = 0
): Promise<any[]> {
  return await queryDatabase(
    `SELECT rm.*, r.rating, r.comment, r.user_id, u.name as user_name
     FROM review_moderation rm
     JOIN reviews r ON rm.review_id = r.id
     JOIN users u ON r.user_id = u.id
     WHERE rm.status = 'pending'
     ORDER BY rm.created_at ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
}

/**
 * ✅ ITEM 77: REVIEWS MELHORADO - RESPOSTAS DE HOSTS
 */

/**
 * Criar resposta a review
 */
export async function createReviewResponse(
  response: ReviewResponse
): Promise<ReviewResponse> {
  // Verificar se já existe resposta
  const existing = await queryDatabase(
    `SELECT id FROM review_responses WHERE review_id = $1`,
    [response.review_id]
  );

  if (existing.length > 0) {
    // Atualizar resposta existente
    const result = await queryDatabase(
      `UPDATE review_responses 
       SET response_text = $1,
           responder_type = $2,
           is_public = $3,
           is_approved = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE review_id = $5
       RETURNING *`,
      [
        response.response_text,
        response.responder_type || 'host',
        response.is_public !== false,
        response.is_approved !== false,
        response.review_id,
      ]
    );
    return result[0];
  }

  // Criar nova resposta
  const result = await queryDatabase(
    `INSERT INTO review_responses 
     (review_id, responder_id, responder_type, response_text, is_public, is_approved)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      response.review_id,
      response.responder_id,
      response.responder_type || 'host',
      response.response_text,
      response.is_public !== false,
      response.is_approved !== false,
    ]
  );

  const newResponse = result[0];

  // Enviar notificação ao autor do review
  const review = await queryDatabase(
    `SELECT user_id FROM reviews WHERE id = $1`,
    [response.review_id]
  );

  if (review.length > 0 && !newResponse.notification_sent) {
    try {
      await sendNotification({
        userId: review[0].user_id,
        type: 'review',
        title: 'Nova resposta ao seu review',
        message: 'O host respondeu ao seu review.',
        metadata: { review_id: response.review_id, response_id: newResponse.id },
      });

      await queryDatabase(
        `UPDATE review_responses 
         SET notification_sent = true, notification_sent_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [newResponse.id]
      );
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    }
  }

  return newResponse;
}

/**
 * Obter resposta de review
 */
export async function getReviewResponse(reviewId: number): Promise<ReviewResponse | null> {
  const responses = await queryDatabase(
    `SELECT * FROM review_responses 
     WHERE review_id = $1 AND is_public = true AND is_approved = true`,
    [reviewId]
  );

  return responses.length > 0 ? responses[0] : null;
}

/**
 * ✅ ITEM 78: REVIEWS MELHORADO - VERIFICAÇÃO
 */

/**
 * Verificar review automaticamente baseado em reserva
 */
export async function verifyReviewFromBooking(
  reviewId: number,
  bookingId: number
): Promise<ReviewVerification> {
  // Verificar se booking existe e está relacionado ao review
  const booking = await queryDatabase(
    `SELECT b.*, r.user_id as reviewer_id, r.property_id
     FROM bookings b
     JOIN reviews r ON r.id = $1
     WHERE b.id = $2 AND b.user_id = r.user_id AND b.item_id = r.property_id`,
    [reviewId, bookingId]
  );

  if (booking.length === 0) {
    throw new Error('Reserva não encontrada ou não relacionada ao review');
  }

  const b = booking[0];

  // Calcular score de verificação
  let verificationScore = 0.8; // Base
  if (b.status === 'confirmed') verificationScore += 0.1;
  if (b.check_out && new Date(b.check_out) <= new Date()) verificationScore += 0.1;

  const badges: string[] = ['verified_booking'];
  if (b.status === 'confirmed') badges.push('verified_stay');

  // Criar ou atualizar verificação
  const existing = await queryDatabase(
    `SELECT id FROM review_verification WHERE review_id = $1`,
    [reviewId]
  );

  let result;
  if (existing.length > 0) {
    result = await queryDatabase(
      `UPDATE review_verification 
       SET is_verified = true,
           verification_type = 'booking',
           verified_booking_id = $1,
           verified_stay_date = $2,
           verification_score = $3,
           badges = $4,
           verified_at = CURRENT_TIMESTAMP
       WHERE review_id = $5
       RETURNING *`,
      [
        bookingId,
        b.check_out || null,
        verificationScore,
        JSON.stringify(badges),
        reviewId,
      ]
    );
  } else {
    result = await queryDatabase(
      `INSERT INTO review_verification 
       (review_id, is_verified, verification_type, verified_booking_id, 
        verified_stay_date, verification_score, badges, verified_at)
       VALUES ($1, true, 'booking', $2, $3, $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        reviewId,
        bookingId,
        b.check_out || null,
        verificationScore,
        JSON.stringify(badges),
      ]
    );
  }

  return result[0];
}

/**
 * Verificar review manualmente
 */
export async function verifyReviewManually(
  reviewId: number,
  verifierId: number,
  badges?: string[]
): Promise<ReviewVerification> {
  const existing = await queryDatabase(
    `SELECT id FROM review_verification WHERE review_id = $1`,
    [reviewId]
  );

  let result;
  if (existing.length > 0) {
    result = await queryDatabase(
      `UPDATE review_verification 
       SET is_verified = true,
           verification_type = 'manual',
           verified_by = $1,
           verification_score = 1.0,
           badges = $2,
           verified_at = CURRENT_TIMESTAMP
       WHERE review_id = $3
       RETURNING *`,
      [verifierId, badges ? JSON.stringify(badges) : null, reviewId]
    );
  } else {
    result = await queryDatabase(
      `INSERT INTO review_verification 
       (review_id, is_verified, verification_type, verified_by, 
        verification_score, badges, verified_at)
       VALUES ($1, true, 'manual', $2, 1.0, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [reviewId, verifierId, badges ? JSON.stringify(badges) : null]
    );
  }

  return result[0];
}

/**
 * Obter verificação de review
 */
export async function getReviewVerification(reviewId: number): Promise<ReviewVerification | null> {
  const verifications = await queryDatabase(
    `SELECT * FROM review_verification WHERE review_id = $1`,
    [reviewId]
  );

  if (verifications.length === 0) {
    return null;
  }

  const v = verifications[0];
  return {
    ...v,
    badges: v.badges ? JSON.parse(v.badges) : [],
  };
}

/**
 * Sinalizar review
 */
export async function flagReview(
  reviewId: number,
  flaggedBy: number,
  reason: 'spam' | 'inappropriate' | 'fake' | 'offensive' | 'irrelevant' | 'other',
  description?: string
): Promise<void> {
  await queryDatabase(
    `INSERT INTO review_flags 
     (review_id, flagged_by, flag_reason, flag_description, status)
     VALUES ($1, $2, $3, $4, 'pending')`,
    [reviewId, flaggedBy, reason, description || null]
  );
}

