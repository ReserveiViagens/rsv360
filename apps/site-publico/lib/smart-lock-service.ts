/**
 * ✅ FASE 7: SMART LOCKS SERVICE
 * Integração com fechaduras inteligentes para acesso automático
 */

import { queryDatabase } from './db';

export interface SmartLock {
  id: string;
  property_id: number;
  provider: 'intelbras' | 'garen' | 'yale' | 'august' | 'generic';
  model: string;
  name: string;
  status: 'online' | 'offline';
  api_key?: string;
  api_secret?: string;
}

export interface AccessCode {
  code: string;
  booking_id: number;
  valid_from: Date;
  valid_until: Date;
  lock_id: string;
  qr_code?: string;
}

/**
 * ✅ Gerar código de acesso para fechadura
 */
export async function generateAccessCode(
  bookingId: number,
  lockId: string,
  validFrom: Date,
  validUntil: Date
): Promise<AccessCode> {
  // Buscar dados da fechadura
  const lock = await queryDatabase(
    `SELECT * FROM smart_locks WHERE id = $1`,
    [lockId]
  );

  if (lock.length === 0) {
    throw new Error('Fechadura não encontrada');
  }

  const lockData = lock[0];

  // Gerar código único (6 dígitos)
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Criar código de acesso no banco
  const result = await queryDatabase(
    `INSERT INTO smart_lock_codes (
      lock_id, booking_id, code, valid_from, valid_until, status
    ) VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING *`,
    [lockId, bookingId, code, validFrom.toISOString(), validUntil.toISOString()]
  );

  // Enviar código para a fechadura (via API do provider)
  await sendCodeToLock(lockData, code, validFrom, validUntil);

  // Gerar QR code
  const qrCode = await generateQRCode(code, bookingId);

  return {
    code,
    booking_id: bookingId,
    valid_from: validFrom,
    valid_until: validUntil,
    lock_id: lockId,
    qr_code: qrCode,
  };
}

/**
 * ✅ Enviar código para fechadura (mock - implementar com APIs reais)
 */
async function sendCodeToLock(
  lock: SmartLock,
  code: string,
  validFrom: Date,
  validUntil: Date
): Promise<void> {
  // Mock implementation - em produção, integrar com APIs reais
  switch (lock.provider) {
    case 'intelbras':
      // await intelbrasAPI.addCode(lock.api_key, code, validFrom, validUntil);
      console.log(`[Intelbras] Código ${code} adicionado à fechadura ${lock.id}`);
      break;
    case 'garen':
      // await garenAPI.addCode(lock.api_key, code, validFrom, validUntil);
      console.log(`[Garen] Código ${code} adicionado à fechadura ${lock.id}`);
      break;
    case 'yale':
      // await yaleAPI.addCode(lock.api_key, code, validFrom, validUntil);
      console.log(`[Yale] Código ${code} adicionado à fechadura ${lock.id}`);
      break;
    case 'august':
      // await augustAPI.addCode(lock.api_key, code, validFrom, validUntil);
      console.log(`[August] Código ${code} adicionado à fechadura ${lock.id}`);
      break;
    default:
      console.log(`[Generic] Código ${code} configurado para fechadura ${lock.id}`);
  }
}

/**
 * ✅ Gerar QR code para acesso
 */
async function generateQRCode(code: string, bookingId: number): Promise<string> {
  // Em produção, usar biblioteca como qrcode
  const qrData = JSON.stringify({
    code,
    booking_id: bookingId,
    type: 'smart_lock_access',
  });

  // Mock - retornar URL de QR code gerado
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
}

/**
 * ✅ Revogar código de acesso
 */
export async function revokeAccessCode(codeId: number): Promise<void> {
  // Buscar código
  const code = await queryDatabase(
    `SELECT slc.*, sl.provider, sl.api_key
     FROM smart_lock_codes slc
     JOIN smart_locks sl ON slc.lock_id = sl.id
     WHERE slc.id = $1`,
    [codeId]
  );

  if (code.length === 0) {
    throw new Error('Código não encontrado');
  }

  const codeData = code[0];

  // Revogar código na fechadura
  switch (codeData.provider) {
    case 'intelbras':
      // await intelbrasAPI.removeCode(codeData.api_key, codeData.code);
      break;
    case 'garen':
      // await garenAPI.removeCode(codeData.api_key, codeData.code);
      break;
    // ... outros providers
  }

  // Atualizar status no banco
  await queryDatabase(
    `UPDATE smart_lock_codes 
     SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [codeId]
  );
}

/**
 * ✅ Listar códigos de acesso de uma reserva
 */
export async function getBookingAccessCodes(bookingId: number): Promise<AccessCode[]> {
  const codes = await queryDatabase(
    `SELECT 
      slc.*,
      sl.name as lock_name,
      sl.provider
     FROM smart_lock_codes slc
     JOIN smart_locks sl ON slc.lock_id = sl.id
     WHERE slc.booking_id = $1 AND slc.status = 'active'
     ORDER BY slc.valid_from DESC`,
    [bookingId]
  );

  return codes.map((c: any) => ({
    code: c.code,
    booking_id: c.booking_id,
    valid_from: new Date(c.valid_from),
    valid_until: new Date(c.valid_until),
    lock_id: c.lock_id,
    qr_code: c.qr_code,
  }));
}

