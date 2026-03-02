/**
 * ✅ FASE 6: SERVIÇO DE VERIFICAÇÃO DE PROPRIEDADES
 * Sistema completo de verificação de propriedades com upload de fotos/vídeos
 */

import { queryDatabase } from './db';
import { uploadFile, deleteFile } from './upload-service';

export interface VerificationRequest {
  id?: number;
  property_id: number;
  host_id: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  photos?: string[];
  video_url?: string;
  submitted_at?: string;
  verified_at?: string;
  verified_by?: number;
  rejection_reason?: string;
  notes?: string;
  metadata?: any;
}

export interface VerificationPhoto {
  url: string;
  thumbnail_url?: string;
  description?: string;
  order?: number;
}

/**
 * ✅ Criar solicitação de verificação
 */
export async function createVerificationRequest(
  propertyId: number,
  hostId: number,
  photos?: File[],
  video?: File
): Promise<VerificationRequest> {
  // Verificar se já existe solicitação pendente
  const existing = await queryDatabase(
    `SELECT id, status FROM property_verifications 
     WHERE property_id = $1 AND status IN ('pending', 'under_review')`,
    [propertyId]
  );

  if (existing.length > 0) {
    throw new Error('Já existe uma solicitação de verificação pendente para esta propriedade');
  }

  // Upload de fotos
  const photoUrls: string[] = [];
  if (photos && photos.length > 0) {
    for (const photo of photos) {
      const url = await uploadFile(photo, `verifications/${propertyId}/photos`);
      photoUrls.push(url);
    }
  }

  // Upload de vídeo (se fornecido)
  let videoUrl: string | undefined;
  if (video) {
    videoUrl = await uploadFile(video, `verifications/${propertyId}/videos`);
  }

  // Criar solicitação
  const result = await queryDatabase(
    `INSERT INTO property_verifications (
      property_id, requested_by, status, property_photos, metadata
    ) VALUES ($1, $2, 'pending', $3, $4)
    RETURNING *`,
    [
      propertyId,
      hostId,
      photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
      JSON.stringify({ video_url: videoUrl || null }),
    ]
  );

  return result[0];
}

/**
 * ✅ Upload de fotos adicionais
 */
export async function uploadVerificationPhotos(
  verificationId: number,
  photos: File[]
): Promise<string[]> {
  // Buscar verificação
  const verification = await queryDatabase(
    `SELECT property_id, property_photos FROM property_verifications WHERE id = $1`,
    [verificationId]
  );

  if (verification.length === 0) {
    throw new Error('Solicitação de verificação não encontrada');
  }

  const propertyId = verification[0].property_id;
  const existingPhotos = verification[0].property_photos ? JSON.parse(verification[0].property_photos) : [];

  // Upload de novas fotos
  const newPhotoUrls: string[] = [];
  for (const photo of photos) {
    const url = await uploadFile(photo, `verifications/${propertyId}/photos`);
    newPhotoUrls.push(url);
  }

  // Atualizar lista de fotos
  const allPhotos = [...existingPhotos, ...newPhotoUrls];
  await queryDatabase(
    `UPDATE property_verifications 
     SET property_photos = $1
     WHERE id = $2`,
    [JSON.stringify(allPhotos), verificationId]
  );

  return allPhotos;
}

/**
 * ✅ Upload de vídeo
 */
export async function uploadVerificationVideo(
  verificationId: number,
  video: File
): Promise<string> {
  // Buscar verificação
  const verification = await queryDatabase(
    `SELECT property_id, metadata FROM property_verifications WHERE id = $1`,
    [verificationId]
  );

  if (verification.length === 0) {
    throw new Error('Solicitação de verificação não encontrada');
  }

  const propertyId = verification[0].property_id;
  const metadata = verification[0].metadata ? JSON.parse(verification[0].metadata) : {};
  const oldVideoUrl = metadata.video_url;

  // Upload de novo vídeo
  const videoUrl = await uploadFile(video, `verifications/${propertyId}/videos`);

  // Deletar vídeo antigo se existir
  if (oldVideoUrl) {
    try {
      await deleteFile(oldVideoUrl);
    } catch (error) {
      console.warn('Erro ao deletar vídeo antigo:', error);
    }
  }

  // Atualizar verificação
  metadata.video_url = videoUrl;
  await queryDatabase(
    `UPDATE property_verifications 
     SET metadata = $1
     WHERE id = $2`,
    [JSON.stringify(metadata), verificationId]
  );

  return videoUrl;
}

/**
 * ✅ Aprovar verificação
 */
export async function approveVerification(
  verificationId: number,
  verifiedBy: number,
  notes?: string
): Promise<void> {
  // Buscar verificação
  const verification = await queryDatabase(
    `SELECT property_id, status FROM property_verifications WHERE id = $1`,
    [verificationId]
  );

  if (verification.length === 0) {
    throw new Error('Solicitação de verificação não encontrada');
  }

  if (verification[0].status !== 'pending' && verification[0].status !== 'under_review') {
    throw new Error('Apenas solicitações pendentes podem ser aprovadas');
  }

  // Atualizar status
  await queryDatabase(
    `UPDATE property_verifications 
     SET status = 'approved',
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $1,
         review_notes = $2
     WHERE id = $3`,
    [verifiedBy, notes || null, verificationId]
  );

  // Atualizar propriedade com badge de verificado
  await queryDatabase(
    `UPDATE properties 
     SET is_verified = true,
         verified_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [verification[0].property_id]
  );
}

/**
 * ✅ Rejeitar verificação
 */
export async function rejectVerification(
  verificationId: number,
  verifiedBy: number,
  rejectionReason: string
): Promise<void> {
  // Buscar verificação
  const verification = await queryDatabase(
    `SELECT property_id, status FROM property_verifications WHERE id = $1`,
    [verificationId]
  );

  if (verification.length === 0) {
    throw new Error('Solicitação de verificação não encontrada');
  }

  if (verification[0].status !== 'pending' && verification[0].status !== 'under_review') {
    throw new Error('Apenas solicitações pendentes podem ser rejeitadas');
  }

  // Atualizar status
  await queryDatabase(
    `UPDATE property_verifications 
     SET status = 'rejected',
         reviewed_at = CURRENT_TIMESTAMP,
         reviewed_by = $1,
         rejection_reason = $2
     WHERE id = $3`,
    [verifiedBy, rejectionReason, verificationId]
  );
}

/**
 * ✅ Obter status da verificação
 */
export async function getVerificationStatus(
  propertyId: number
): Promise<VerificationRequest | null> {
  const result = await queryDatabase(
    `SELECT 
      pv.*,
      u.name as reviewed_by_name,
      p.name as property_name
     FROM property_verifications pv
     LEFT JOIN users u ON pv.reviewed_by = u.id
     LEFT JOIN properties p ON pv.property_id = p.id
     WHERE pv.property_id = $1
     ORDER BY pv.created_at DESC
     LIMIT 1`,
    [propertyId]
  );

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    photos: result[0].property_photos ? JSON.parse(result[0].property_photos) : [],
    video_url: result[0].metadata ? JSON.parse(result[0].metadata)?.video_url : null,
  };
}

/**
 * ✅ Listar solicitações de verificação (Admin)
 */
export async function listVerificationRequests(filters: {
  status?: string;
  host_id?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<VerificationRequest[]> {
  let query = `
    SELECT 
      pv.*,
      u.name as reviewed_by_name,
      p.name as property_name,
      h.name as host_name
    FROM property_verifications pv
    LEFT JOIN users u ON pv.reviewed_by = u.id
    LEFT JOIN properties p ON pv.property_id = p.id
    LEFT JOIN users h ON pv.requested_by = h.id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.status) {
    query += ` AND pv.status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.host_id) {
    query += ` AND pv.requested_by = $${paramIndex}`;
    params.push(filters.host_id);
    paramIndex++;
  }

  query += ` ORDER BY pv.created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
    paramIndex++;
  }

  const result = await queryDatabase(query, params);

  return result.map((row: any) => ({
    ...row,
    photos: row.property_photos ? JSON.parse(row.property_photos) : [],
    video_url: row.metadata ? JSON.parse(row.metadata)?.video_url : null,
  }));
}

/**
 * Alias: Listar verificações pendentes (para API)
 */
export async function getPendingVerifications(limit = 50, offset = 0) {
  return listVerificationRequests({ status: 'pending', limit, offset });
}

/**
 * Alias: Obter verificação por propriedade
 */
export const getVerificationByProperty = getVerificationStatus;

/**
 * Submeter solicitação de verificação (API - recebe dados já com URLs)
 */
export async function submitVerificationRequest(data: {
  property_id: number;
  requested_by: number;
  photos?: string[];
  video_url?: string;
}): Promise<VerificationRequest> {
  const existing = await queryDatabase(
    `SELECT id, status FROM property_verifications 
     WHERE property_id = $1 AND status IN ('pending', 'under_review')`,
    [data.property_id]
  );

  if (existing.length > 0) {
    throw new Error('Já existe uma solicitação de verificação pendente para esta propriedade');
  }

  const result = await queryDatabase(
    `INSERT INTO property_verifications (
      property_id, requested_by, status, property_photos, metadata
    ) VALUES ($1, $2, 'pending', $3, $4)
    RETURNING *`,
    [
      data.property_id,
      data.requested_by,
      data.photos && data.photos.length > 0 ? JSON.stringify(data.photos) : null,
      JSON.stringify({ video_url: data.video_url || null }),
    ]
  );

  return {
    ...result[0],
    photos: data.photos || [],
    video_url: data.video_url,
  };
}
