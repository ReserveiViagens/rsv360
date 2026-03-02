/**
 * ✅ SISTEMA DE AUTENTICAÇÃO DE DOIS FATORES (2FA)
 * 
 * Implementação de 2FA com:
 * - TOTP (Google Authenticator, Authy)
 * - SMS 2FA
 * - Email 2FA
 * - Backup codes
 * - Recovery flow
 */

import { queryDatabase } from './db';
import * as crypto from 'crypto';
import { sendSMSNotification, sendEmailNotification } from './notification-service';

// TOTP usando speakeasy (requer: npm install speakeasy qrcode)
let speakeasy: any = null;
let qrcode: any = null;

async function loadTOTPLibraries() {
  if (!speakeasy) {
    try {
      speakeasy = (await import('speakeasy')).default;
      qrcode = (await import('qrcode')).default;
    } catch (error) {
      console.warn('Bibliotecas TOTP não instaladas. Execute: npm install speakeasy qrcode');
    }
  }
}

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  success: boolean;
  backupCodeUsed?: boolean;
}

/**
 * Configurar 2FA para usuário (TOTP)
 */
export async function setupTOTP(userId: number, userEmail: string): Promise<TwoFactorSetup> {
  await loadTOTPLibraries();

  if (!speakeasy) {
    throw new Error('Biblioteca TOTP não disponível');
  }

  // Gerar secret
  const secret = speakeasy.generateSecret({
    name: `RSV360 (${userEmail})`,
    issuer: 'RSV360',
    length: 32,
  });

  // Gerar QR Code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

  // Gerar backup codes
  const backupCodes = generateBackupCodes();

  // Salvar no banco (sem o secret ainda - só após verificação)
  await queryDatabase(
    `INSERT INTO user_2fa (user_id, method, secret, backup_codes, enabled, created_at)
     VALUES ($1, 'totp', $2, $3, false, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id, method) DO UPDATE SET
       secret = EXCLUDED.secret,
       backup_codes = EXCLUDED.backup_codes,
       enabled = false`,
    [userId, secret.base32, JSON.stringify(backupCodes)]
  );

  return {
    secret: secret.base32!,
    qrCodeUrl,
    backupCodes,
  };
}

/**
 * Verificar código TOTP e habilitar 2FA
 */
export async function verifyAndEnableTOTP(userId: number, token: string): Promise<boolean> {
  await loadTOTPLibraries();

  if (!speakeasy) {
    throw new Error('Biblioteca TOTP não disponível');
  }

  // Buscar secret
  const result = await queryDatabase(
    `SELECT secret FROM user_2fa WHERE user_id = $1 AND method = 'totp'`,
    [userId]
  );

  if (result.length === 0) {
    throw new Error('2FA não configurado');
  }

  const secret = result[0].secret;

  // Verificar token
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Permitir ±2 períodos de tempo
  });

  if (verified) {
    // Habilitar 2FA
    await queryDatabase(
      `UPDATE user_2fa SET enabled = true WHERE user_id = $1 AND method = 'totp'`,
      [userId]
    );
    return true;
  }

  return false;
}

/**
 * Verificar código 2FA no login
 */
export async function verify2FA(userId: number, code: string, method: 'totp' | 'sms' | 'email' = 'totp'): Promise<TwoFactorVerification> {
  // Verificar se 2FA está habilitado
  const result = await queryDatabase(
    `SELECT * FROM user_2fa WHERE user_id = $1 AND method = $2 AND enabled = true`,
    [userId, method]
  );

  if (result.length === 0) {
    return { success: true }; // 2FA não habilitado, permitir login
  }

  const twoFactor = result[0];

  if (method === 'totp') {
    await loadTOTPLibraries();
    if (!speakeasy) {
      throw new Error('Biblioteca TOTP não disponível');
    }

    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (verified) {
      return { success: true };
    }

    // Tentar backup code
    const backupCodes = typeof twoFactor.backup_codes === 'string' 
      ? JSON.parse(twoFactor.backup_codes) 
      : twoFactor.backup_codes;
    
    if (backupCodes.includes(code)) {
      // Remover backup code usado
      const updatedCodes = backupCodes.filter((c: string) => c !== code);
      await queryDatabase(
        `UPDATE user_2fa SET backup_codes = $1 WHERE user_id = $2 AND method = 'totp'`,
        [JSON.stringify(updatedCodes), userId]
      );
      return { success: true, backupCodeUsed: true };
    }
  } else if (method === 'sms' || method === 'email') {
    // Verificar código SMS/Email (comparar com código enviado)
    const storedCode = await queryDatabase(
      `SELECT code, expires_at FROM user_2fa_codes 
       WHERE user_id = $1 AND method = $2 AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [userId, method]
    );

    if (storedCode.length > 0 && storedCode[0].code === code) {
      const expiresAt = new Date(storedCode[0].expires_at);
      if (expiresAt > new Date()) {
        // Marcar como usado
        await queryDatabase(
          `UPDATE user_2fa_codes SET used = true WHERE user_id = $1 AND method = $2 AND code = $3`,
          [userId, method, code]
        );
        return { success: true };
      }
    }
  }

  return { success: false };
}

/**
 * Enviar código 2FA por SMS
 */
export async function sendSMS2FACode(userId: number, phoneNumber: string): Promise<string> {
  const code = generate6DigitCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Válido por 10 minutos

  // Salvar código
  await queryDatabase(
    `INSERT INTO user_2fa_codes (user_id, method, code, expires_at, created_at)
     VALUES ($1, 'sms', $2, $3, CURRENT_TIMESTAMP)`,
    [userId, code, expiresAt]
  );

  // Enviar SMS
  await sendSMSNotification(
    userId,
    phoneNumber,
    `Seu código de verificação RSV360 é: ${code}. Válido por 10 minutos.`
  );

  return code; // Em produção, não retornar o código
}

/**
 * Enviar código 2FA por Email
 */
export async function sendEmail2FACode(userId: number, email: string): Promise<string> {
  const code = generate6DigitCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Salvar código
  await queryDatabase(
    `INSERT INTO user_2fa_codes (user_id, method, code, expires_at, created_at)
     VALUES ($1, 'email', $2, $3, CURRENT_TIMESTAMP)`,
    [userId, code, expiresAt]
  );

  // Enviar email
  await sendEmailNotification(
    userId,
    email,
    'Código de Verificação RSV360',
    `
      <h1>Código de Verificação</h1>
      <p>Seu código de verificação é: <strong>${code}</strong></p>
      <p>Este código é válido por 10 minutos.</p>
      <p>Se você não solicitou este código, ignore este email.</p>
    `
  );

  return code; // Em produção, não retornar o código
}

/**
 * Gerar backup codes
 */
function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
}

/**
 * Gerar código de 6 dígitos
 */
function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Desabilitar 2FA
 */
export async function disable2FA(userId: number, method: 'totp' | 'sms' | 'email'): Promise<boolean> {
  await queryDatabase(
    `UPDATE user_2fa SET enabled = false WHERE user_id = $1 AND method = $2`,
    [userId, method]
  );
  return true;
}

/**
 * Verificar se 2FA está habilitado
 */
export async function is2FAEnabled(userId: number): Promise<boolean> {
  const result = await queryDatabase(
    `SELECT COUNT(*) as count FROM user_2fa WHERE user_id = $1 AND enabled = true`,
    [userId]
  );
  return parseInt(result[0]?.count || '0') > 0;
}

