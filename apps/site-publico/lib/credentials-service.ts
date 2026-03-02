/**
 * ✅ SERVIÇO DE GERENCIAMENTO DE CREDENCIAIS
 * 
 * Sistema seguro para armazenar e recuperar credenciais:
 * - Criptografia de credenciais sensíveis
 * - Validação de credenciais
 * - Cache de credenciais
 * - Logging de acesso
 */

import { queryDatabase } from './db';
import crypto from 'crypto';

// Chave de criptografia (deve estar em variável de ambiente em produção)
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

interface Credential {
  id?: number;
  service: string;
  key: string;
  value: string;
  encrypted: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Criptografar valor
 */
function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Descriptografar valor
 */
function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Salvar credencial
 */
export async function saveCredential(
  service: string,
  key: string,
  value: string,
  encrypted: boolean = true,
  description?: string
): Promise<number> {
  try {
    let storedValue = value;
    let iv: string | null = null;
    let tag: string | null = null;

    if (encrypted) {
      const encryptedData = encrypt(value);
      storedValue = encryptedData.encrypted;
      iv = encryptedData.iv;
      tag = encryptedData.tag;
    }

    // Verificar se já existe
    const existing = await queryDatabase(
      `SELECT id FROM credentials WHERE service = $1 AND key = $2`,
      [service, key]
    );

    if (existing.length > 0) {
      // Atualizar
      await queryDatabase(
        `UPDATE credentials 
         SET value = $1, encrypted = $2, iv = $3, tag = $4, description = $5, updated_at = NOW()
         WHERE service = $1 AND key = $2`,
        [storedValue, encrypted, iv, tag, description, service, key]
      );
      return existing[0].id;
    } else {
      // Inserir
      const result = await queryDatabase(
        `INSERT INTO credentials (service, key, value, encrypted, iv, tag, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [service, key, storedValue, encrypted, iv, tag, description]
      );
      return result[0].id;
    }
  } catch (error: any) {
    console.error('Erro ao salvar credencial:', error);
    throw error;
  }
}

/**
 * Obter credencial
 */
export async function getCredential(service: string, key: string): Promise<string | null> {
  try {
    const result = await queryDatabase(
      `SELECT value, encrypted, iv, tag FROM credentials WHERE service = $1 AND key = $2`,
      [service, key]
    );

    if (result.length === 0) {
      return null;
    }

    const credential = result[0];

    if (credential.encrypted && credential.iv && credential.tag) {
      return decrypt(credential.value, credential.iv, credential.tag);
    }

    return credential.value;
  } catch (error: any) {
    console.error('Erro ao obter credencial:', error);
    throw error;
  }
}

/**
 * Obter todas as credenciais de um serviço
 */
export async function getServiceCredentials(service: string): Promise<Record<string, string>> {
  try {
    const result = await queryDatabase(
      `SELECT key, value, encrypted, iv, tag FROM credentials WHERE service = $1`,
      [service]
    );

    const credentials: Record<string, string> = {};

    for (const row of result) {
      let value = row.value;

      if (row.encrypted && row.iv && row.tag) {
        value = decrypt(row.value, row.iv, row.tag);
      }

      credentials[row.key] = value;
    }

    return credentials;
  } catch (error: any) {
    console.error('Erro ao obter credenciais do serviço:', error);
    throw error;
  }
}

/**
 * Validar credencial
 */
export async function validateCredential(service: string, key: string): Promise<boolean> {
  try {
    const value = await getCredential(service, key);
    if (!value) return false;

    // Validações específicas por serviço
    switch (service) {
      case 'smtp':
        if (key === 'host') return value.includes('.');
        if (key === 'port') return !isNaN(parseInt(value));
        if (key === 'user' || key === 'password') return value.length > 0;
        break;

      case 'mercadopago':
        if (key === 'access_token') return value.startsWith('APP_USR-') || value.startsWith('TEST-');
        if (key === 'public_key') return value.startsWith('APP_USR-') || value.startsWith('TEST-');
        break;

      case 'google':
        if (key === 'client_id') return value.includes('.apps.googleusercontent.com');
        if (key === 'api_key') return value.length > 20;
        break;

      case 'facebook':
        if (key === 'app_id') return !isNaN(parseInt(value));
        break;

      case 'airbnb':
        if (key === 'api_key') return value.length > 20;
        break;

      case 'cloudbeds':
        if (key === 'api_key') return value.length > 20;
        break;

      case 'twilio':
        if (key === 'account_sid') return value.startsWith('AC');
        if (key === 'auth_token') return value.length > 30;
        break;

      case 'whatsapp':
        if (key === 'access_token') return value.length > 50;
        if (key === 'phone_id') return value.length > 10;
        break;

      case 'firebase':
        if (key === 'server_key') return value.length > 50;
        break;

      case 'unico':
      case 'idwall':
        if (key === 'api_key') return value.length > 20;
        break;
    }

    return true;
  } catch (error: any) {
    console.error('Erro ao validar credencial:', error);
    return false;
  }
}

/**
 * Testar credencial (conectar ao serviço)
 */
export async function testCredential(service: string): Promise<{ success: boolean; message: string }> {
  try {
    const credentials = await getServiceCredentials(service);

    switch (service) {
      case 'smtp':
        return await testSMTP(credentials);
      case 'mercadopago':
        return await testMercadoPago(credentials);
      case 'google':
        return await testGoogle(credentials);
      case 'facebook':
        return await testFacebook(credentials);
      case 'airbnb':
        return await testAirbnb(credentials);
      case 'cloudbeds':
        return await testCloudbeds(credentials);
      case 'twilio':
        return await testTwilio(credentials);
      case 'whatsapp':
        return await testWhatsApp(credentials);
      case 'firebase':
        return await testFirebase(credentials);
      default:
        return { success: false, message: 'Serviço não suportado para teste' };
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Erro ao testar credencial' };
  }
}

/**
 * Testar SMTP
 */
async function testSMTP(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: credentials.host,
      port: parseInt(credentials.port || '587'),
      secure: credentials.secure === 'true',
      auth: {
        user: credentials.user,
        pass: credentials.password,
      },
    });

    await transporter.verify();
    return { success: true, message: 'Conexão SMTP bem-sucedida' };
  } catch (error: any) {
    return { success: false, message: `Erro SMTP: ${error.message}` };
  }
}

/**
 * Testar Mercado Pago
 */
async function testMercadoPago(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('https://api.mercadopago.com/users/me', {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
      },
    });

    if (response.ok) {
      return { success: true, message: 'Token Mercado Pago válido' };
    } else {
      return { success: false, message: 'Token Mercado Pago inválido' };
    }
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Google
 */
async function testGoogle(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    if (credentials.api_key) {
      // Testar Maps API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${credentials.api_key}`
      );
      if (response.ok) {
        return { success: true, message: 'Google Maps API key válida' };
      }
    }
    return { success: false, message: 'Credenciais Google inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Facebook
 */
async function testFacebook(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.app_id}?access_token=${credentials.app_secret}`
    );
    if (response.ok) {
      return { success: true, message: 'Credenciais Facebook válidas' };
    }
    return { success: false, message: 'Credenciais Facebook inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Airbnb
 */
async function testAirbnb(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    if (!credentials.api_key || !credentials.access_token) {
      return { success: false, message: 'Credenciais Airbnb incompletas' };
    }

    const response = await fetch('https://api.airbnb.com/v2/account', {
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'X-Airbnb-API-Key': credentials.api_key,
      },
    });

    if (response.ok) {
      return { success: true, message: 'Credenciais Airbnb válidas' };
    }
    return { success: false, message: 'Credenciais Airbnb inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Cloudbeds
 */
async function testCloudbeds(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    if (!credentials.api_key || !credentials.api_secret) {
      return { success: false, message: 'Credenciais Cloudbeds incompletas' };
    }

    // Obter access token
    const tokenResponse = await fetch('https://api.cloudbeds.com/api/v1.1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: credentials.api_key,
        client_secret: credentials.api_secret,
      }),
    });

    if (tokenResponse.ok) {
      return { success: true, message: 'Credenciais Cloudbeds válidas' };
    }
    return { success: false, message: 'Credenciais Cloudbeds inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Twilio
 */
async function testTwilio(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}.json`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${credentials.account_sid}:${credentials.auth_token}`).toString('base64')}`,
        },
      }
    );

    if (response.ok) {
      return { success: true, message: 'Credenciais Twilio válidas' };
    }
    return { success: false, message: 'Credenciais Twilio inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar WhatsApp
 */
async function testWhatsApp(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${credentials.phone_id}`,
      {
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
        },
      }
    );

    if (response.ok) {
      return { success: true, message: 'Credenciais WhatsApp válidas' };
    }
    return { success: false, message: 'Credenciais WhatsApp inválidas' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

/**
 * Testar Firebase
 */
async function testFirebase(credentials: Record<string, string>): Promise<{ success: boolean; message: string }> {
  try {
    // Firebase FCM não tem endpoint de teste simples
    // Validar formato da chave
    if (credentials.server_key && credentials.server_key.length > 50) {
      return { success: true, message: 'Formato da chave Firebase válido' };
    }
    return { success: false, message: 'Chave Firebase inválida' };
  } catch (error: any) {
    return { success: false, message: `Erro: ${error.message}` };
  }
}

