/**
 * Serviço Principal de Check-in/Check-out Digital
 * Gerencia todo o fluxo de check-in digital com QR codes e validação de documentos
 */

import { queryDatabase } from './db';
import { generateCheckinQRCode, generateAccessQRCode, decodeQRCodeData } from './qr-code-generator';
import { verifyDocument, verifyMultipleDocuments } from './document-verification-service';
import { generateAccessCode } from './smart-lock-service';
import {
  checkinsCreatedTotal,
  checkinsCompletedTotal,
  checkinDuration
} from './metrics';
import type { 
  CheckinRequest, 
  CheckinUpdate, 
  CheckinDocument, 
  ProcessCheckin, 
  ProcessCheckout,
  CheckinFilter,
  CheckinStatus
} from './schemas/checkin-schemas';

export interface DigitalCheckin {
  id: number;
  booking_id: number;
  user_id: number;
  property_id: number;
  check_in_code: string;
  qr_code: string | null;
  qr_code_url: string | null;
  status: CheckinStatus;
  check_in_at: Date | null;
  check_out_at: Date | null;
  documents_verified: boolean;
  documents_verified_at: Date | null;
  documents_verified_by: number | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

/**
 * Gera código único para check-in
 */
function generateCheckInCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CHK-${timestamp}-${random}`;
}

/**
 * Cria uma solicitação de check-in
 */
export async function createCheckinRequest(
  data: CheckinRequest
): Promise<DigitalCheckin> {
  // Verificar se já existe check-in para esta reserva
  const existing = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins WHERE booking_id = $1`,
    [data.booking_id]
  );

  if (existing.length > 0) {
    throw new Error('Check-in já existe para esta reserva');
  }

  // Gerar código único
  const checkInCode = generateCheckInCode();

  // Criar registro
  const result = await queryDatabase<DigitalCheckin>(
    `INSERT INTO digital_checkins (
      booking_id, user_id, property_id, check_in_code, status, metadata
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.booking_id,
      data.user_id,
      data.property_id,
      checkInCode,
      'pending',
      JSON.stringify(data.metadata || {})
    ]
  );

  if (result.length === 0) {
    throw new Error('Erro ao criar check-in');
  }

  // Registrar métrica de check-in criado
  checkinsCreatedTotal.inc();

  return result[0];
}

/**
 * Gera QR code para check-in
 */
export async function generateQRCodeForCheckin(
  checkinId: number
): Promise<{ qrCode: string; qrCodeUrl: string }> {
  // Buscar check-in
  const checkins = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins WHERE id = $1`,
    [checkinId]
  );

  if (checkins.length === 0) {
    throw new Error('Check-in não encontrado');
  }

  const checkin = checkins[0];

  // Gerar QR code
  const qrResult = await generateCheckinQRCode(checkinId, checkin.check_in_code);

  // Atualizar check-in com QR code
  await queryDatabase(
    `UPDATE digital_checkins 
     SET qr_code = $1, qr_code_url = $2, updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [qrResult.dataUrl, qrResult.dataUrl, checkinId]
  );

  return {
    qrCode: qrResult.dataUrl,
    qrCodeUrl: qrResult.dataUrl
  };
}

/**
 * Adiciona documento ao check-in
 */
export async function addDocumentToCheckin(
  data: CheckinDocument
): Promise<{ id: number }> {
  const result = await queryDatabase<{ id: number }>(
    `INSERT INTO checkin_documents (
      checkin_id, document_type, document_url, document_name, 
      document_size, mime_type, extracted_data
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id`,
    [
      data.checkin_id,
      data.document_type,
      data.document_url,
      data.document_name || null,
      data.document_size || null,
      data.mime_type || null,
      data.extracted_data ? JSON.stringify(data.extracted_data) : null
    ]
  );

  if (result.length === 0) {
    throw new Error('Erro ao adicionar documento');
  }

  return result[0];
}

/**
 * Verifica documentos do check-in
 */
export async function verifyCheckinDocuments(
  checkinId: number,
  verifiedBy?: number
): Promise<{ verified: boolean; confidence: number }> {
  // Buscar documentos
  const documents = await queryDatabase<{
    id: number;
    document_type: string;
    document_url: string;
    is_verified: boolean;
  }>(
    `SELECT id, document_type, document_url, is_verified 
     FROM checkin_documents 
     WHERE checkin_id = $1`,
    [checkinId]
  );

  if (documents.length === 0) {
    throw new Error('Nenhum documento encontrado para este check-in');
  }

  // Verificar documentos não verificados
  const unverifiedDocs = documents.filter(doc => !doc.is_verified);
  
  if (unverifiedDocs.length === 0) {
    // Todos já verificados
    const checkin = await getCheckinById(checkinId);
    return {
      verified: checkin.documents_verified,
      confidence: 100
    };
  }

  // Verificar cada documento
  const verificationResults = await verifyMultipleDocuments(
    unverifiedDocs.map(doc => ({
      url: doc.document_url,
      type: doc.document_type as any
    }))
  );

  // Atualizar status de verificação
  let allVerified = true;
  let totalConfidence = 0;

  for (let i = 0; i < unverifiedDocs.length; i++) {
    const doc = unverifiedDocs[i];
    const result = verificationResults[i];

    await queryDatabase(
      `UPDATE checkin_documents 
       SET is_verified = $1, verified_at = CURRENT_TIMESTAMP, verified_by = $2
       WHERE id = $3`,
      [result.verified, verifiedBy || null, doc.id]
    );

    if (!result.verified) {
      allVerified = false;
    }
    totalConfidence += result.confidence;
  }

  const avgConfidence = Math.round(totalConfidence / verificationResults.length);

  // Atualizar check-in
  await queryDatabase(
    `UPDATE digital_checkins 
     SET documents_verified = $1, 
         documents_verified_at = CURRENT_TIMESTAMP,
         documents_verified_by = $2,
         status = CASE WHEN $1 THEN 'verified' ELSE 'documents_pending' END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3`,
    [allVerified, verifiedBy || null, checkinId]
  );

  return {
    verified: allVerified,
    confidence: avgConfidence
  };
}

/**
 * Processa check-in (após verificação de documentos)
 */
export async function processCheckIn(
  data: ProcessCheckin
): Promise<DigitalCheckin> {
  const checkin = await getCheckinById(data.checkin_id);

  if (checkin.status === 'checked_in') {
    throw new Error('Check-in já foi realizado');
  }

  if (checkin.status === 'cancelled') {
    throw new Error('Check-in foi cancelado');
  }

  // Verificar documentos se necessário
  if (data.verify_documents && !checkin.documents_verified) {
    await verifyCheckinDocuments(data.checkin_id);
    
    // Verificar novamente após verificação
    const updated = await getCheckinById(data.checkin_id);
    if (!updated.documents_verified) {
      throw new Error('Documentos não foram verificados com sucesso');
    }
  }

  // Gerar códigos de acesso se necessário
  if (data.generate_access_codes) {
    // Buscar smart locks da propriedade
    const locks = await queryDatabase<{ id: string }>(
      `SELECT id FROM smart_locks WHERE property_id = $1`,
      [checkin.property_id]
    );

    // Gerar código de acesso para cada fechadura
    for (const lock of locks) {
      try {
        const accessCode = await generateAccessCode(
          checkin.booking_id,
          lock.id,
          new Date(),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        );

        // Salvar código de acesso
        await queryDatabase(
          `INSERT INTO checkin_access_codes (
            checkin_id, code_type, code, expires_at, metadata
          ) VALUES ($1, $2, $3, $4, $5)`,
          [
            data.checkin_id,
            'smart_lock',
            accessCode.code,
            accessCode.valid_until,
            JSON.stringify({ lock_id: lock.id })
          ]
        );
      } catch (error) {
        console.error(`Erro ao gerar código para fechadura ${lock.id}:`, error);
      }
    }
  }

  // Atualizar status para checked_in
  const result = await queryDatabase<DigitalCheckin>(
    `UPDATE digital_checkins 
     SET status = 'checked_in',
         check_in_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [data.checkin_id]
  );

  if (result.length === 0) {
    throw new Error('Erro ao processar check-in');
  }

  // Registrar métrica de check-in completado
  if (checkin.status !== 'checked_in') {
    checkinsCompletedTotal.inc();

    // Calcular duração do processo de check-in
    const durationSeconds = result[0].check_in_at
      ? (new Date(result[0].check_in_at).getTime() - new Date(checkin.created_at).getTime()) / 1000
      : 0;
    
    checkinDuration.observe(durationSeconds);
  }

  return result[0];
}

/**
 * Processa check-out
 */
export async function processCheckOut(
  data: ProcessCheckout
): Promise<DigitalCheckin> {
  const checkin = await getCheckinById(data.checkin_id);

  if (checkin.status !== 'checked_in') {
    throw new Error('Check-in não foi realizado ainda');
  }

  // Criar vistoria pós-checkout se houver fotos
  if (data.inspection_photos && data.inspection_photos.length > 0) {
    await queryDatabase(
      `INSERT INTO checkin_inspections (
        checkin_id, inspection_type, photos, notes, damages
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        data.checkin_id,
        'after_checkout',
        data.inspection_photos,
        data.inspection_notes || null,
        data.damages || null
      ]
    );
  }

  // Revogar códigos de acesso
  await queryDatabase(
    `UPDATE checkin_access_codes 
     SET used = true, used_at = CURRENT_TIMESTAMP
     WHERE checkin_id = $1 AND used = false`,
    [data.checkin_id]
  );

  // Atualizar status para checked_out
  const result = await queryDatabase<DigitalCheckin>(
    `UPDATE digital_checkins 
     SET status = 'checked_out',
         check_out_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING *`,
    [data.checkin_id]
  );

  if (result.length === 0) {
    throw new Error('Erro ao processar check-out');
  }

  return result[0];
}

/**
 * Obtém check-in por ID
 */
export async function getCheckinById(checkinId: number): Promise<DigitalCheckin> {
  const result = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins WHERE id = $1`,
    [checkinId]
  );

  if (result.length === 0) {
    throw new Error('Check-in não encontrado');
  }

  return result[0];
}

/**
 * Obtém check-in por código
 */
export async function getCheckinByCode(checkInCode: string): Promise<DigitalCheckin> {
  const result = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins WHERE check_in_code = $1`,
    [checkInCode]
  );

  if (result.length === 0) {
    throw new Error('Check-in não encontrado');
  }

  return result[0];
}

/**
 * Lista check-ins com filtros
 */
export async function listCheckins(
  filters: CheckinFilter
): Promise<{ checkins: DigitalCheckin[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.booking_id) {
    conditions.push(`booking_id = $${paramIndex++}`);
    params.push(filters.booking_id);
  }

  if (filters.user_id) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(filters.user_id);
  }

  if (filters.property_id) {
    conditions.push(`property_id = $${paramIndex++}`);
    params.push(filters.property_id);
  }

  if (filters.status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(filters.status);
  }

  if (filters.check_in_code) {
    conditions.push(`check_in_code = $${paramIndex++}`);
    params.push(filters.check_in_code);
  }

  const whereClause = conditions.length > 0 
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // Contar total
  const countResult = await queryDatabase<{ count: string }>(
    `SELECT COUNT(*) as count FROM digital_checkins ${whereClause}`,
    params
  );
  const total = parseInt(countResult[0].count, 10);

  // Buscar check-ins
  params.push(filters.limit || 20);
  params.push(filters.offset || 0);

  const checkins = await queryDatabase<DigitalCheckin>(
    `SELECT * FROM digital_checkins 
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  return { checkins, total };
}

/**
 * Atualiza check-in
 */
export async function updateCheckin(
  checkinId: number,
  data: CheckinUpdate
): Promise<DigitalCheckin> {
  const updates: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.status) {
    updates.push(`status = $${paramIndex++}`);
    params.push(data.status);
  }

  if (data.check_in_at) {
    updates.push(`check_in_at = $${paramIndex++}`);
    params.push(data.check_in_at);
  }

  if (data.check_out_at) {
    updates.push(`check_out_at = $${paramIndex++}`);
    params.push(data.check_out_at);
  }

  if (data.documents_verified !== undefined) {
    updates.push(`documents_verified = $${paramIndex++}`);
    params.push(data.documents_verified);
  }

  if (data.metadata) {
    updates.push(`metadata = $${paramIndex++}`);
    params.push(JSON.stringify(data.metadata));
  }

  if (updates.length === 0) {
    return getCheckinById(checkinId);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(checkinId);

  const result = await queryDatabase<DigitalCheckin>(
    `UPDATE digital_checkins 
     SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING *`,
    params
  );

  if (result.length === 0) {
    throw new Error('Erro ao atualizar check-in');
  }

  return result[0];
}

/**
 * Escaneia QR code e retorna informações do check-in
 */
export async function scanQRCode(qrData: string): Promise<{
  checkin: DigitalCheckin;
  type: 'checkin' | 'access';
}> {
  const decoded = decodeQRCodeData(qrData);

  if (decoded.type === 'unknown') {
    throw new Error('QR code inválido');
  }

  const checkin = await getCheckinById(decoded.checkinId!);

  return {
    checkin,
    type: decoded.type
  };
}

