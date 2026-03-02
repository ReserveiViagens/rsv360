import axios from 'axios';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// Interface para diferentes tipos de fechaduras
interface SmartLockAdapter {
  generatePin(lockId: string, bookingId: number, expiresAt: Date): Promise<string>;
  revokePin(lockId: string, pinCode: string): Promise<boolean>;
  logAccess(lockId: string, pinCode: string, action: string): Promise<boolean>;
}

// Adapter para Yale Assure Lock
class YaleAdapter implements SmartLockAdapter {
  private apiKey: string;
  private baseURL = 'https://api.yalehome.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePin(lockId: string, bookingId: number, expiresAt: Date): Promise<string> {
    try {
      // Gerar PIN de 6-8 dígitos
      const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await axios.post(
        `${this.baseURL}/locks/${lockId}/pins`,
        {
          pin: pinCode,
          expires_at: expiresAt.toISOString(),
          booking_id: bookingId,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return pinCode;
    } catch (error) {
      console.error('Erro ao gerar PIN Yale:', error);
      throw error;
    }
  }

  async revokePin(lockId: string, pinCode: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/locks/${lockId}/pins/${pinCode}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao revogar PIN Yale:', error);
      return false;
    }
  }

  async logAccess(lockId: string, pinCode: string, action: string): Promise<boolean> {
    // Yale API não tem endpoint de log, então apenas registramos no nosso banco
    return true;
  }
}

// Adapter para August Smart Lock
class AugustAdapter implements SmartLockAdapter {
  private apiKey: string;
  private baseURL = 'https://api-production.august.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePin(lockId: string, bookingId: number, expiresAt: Date): Promise<string> {
    try {
      const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await axios.post(
        `${this.baseURL}/locks/${lockId}/keypads/pins`,
        {
          pin: pinCode,
          valid_until: expiresAt.toISOString(),
        },
        {
          headers: {
            'x-august-api-key': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return pinCode;
    } catch (error) {
      console.error('Erro ao gerar PIN August:', error);
      throw error;
    }
  }

  async revokePin(lockId: string, pinCode: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/locks/${lockId}/keypads/pins/${pinCode}`, {
        headers: {
          'x-august-api-key': this.apiKey,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao revogar PIN August:', error);
      return false;
    }
  }

  async logAccess(lockId: string, pinCode: string, action: string): Promise<boolean> {
    return true;
  }
}

// Adapter para Igloohome
class IgloohomeAdapter implements SmartLockAdapter {
  private apiKey: string;
  private baseURL = 'https://api.igloohome.co/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generatePin(lockId: string, bookingId: number, expiresAt: Date): Promise<string> {
    try {
      const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const response = await axios.post(
        `${this.baseURL}/locks/${lockId}/pin_codes`,
        {
          pin_code: pinCode,
          valid_from: new Date().toISOString(),
          valid_until: expiresAt.toISOString(),
          name: `Booking #${bookingId}`,
        },
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return pinCode;
    } catch (error) {
      console.error('Erro ao gerar PIN Igloohome:', error);
      throw error;
    }
  }

  async revokePin(lockId: string, pinCode: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseURL}/locks/${lockId}/pin_codes/${pinCode}`, {
        headers: {
          'X-API-KEY': this.apiKey,
        },
      });
      return true;
    } catch (error) {
      console.error('Erro ao revogar PIN Igloohome:', error);
      return false;
    }
  }

  async logAccess(lockId: string, pinCode: string, action: string): Promise<boolean> {
    return true;
  }
}

// Factory para criar adapters
function createLockAdapter(lockType: string, apiKey: string): SmartLockAdapter {
  switch (lockType.toLowerCase()) {
    case 'yale':
      return new YaleAdapter(apiKey);
    case 'august':
      return new AugustAdapter(apiKey);
    case 'igloohome':
      return new IgloohomeAdapter(apiKey);
    default:
      throw new Error(`Tipo de fechadura não suportado: ${lockType}`);
  }
}

// Função principal para gerar PIN
export async function generatePin(
  propertyId: number,
  bookingId: number,
  checkIn: Date,
  checkOut: Date
): Promise<{ pinCode: string; expiresAt: Date }> {
  try {
    // Buscar configuração da fechadura
    const lockQuery = `
      SELECT id, lock_type, api_key_encrypted, device_id, pin_length, pin_duration_hours
      FROM smart_locks
      WHERE property_id = $1 AND is_active = true
      LIMIT 1
    `;
    const lockResult = await pool.query(lockQuery, [propertyId]);
    
    if (lockResult.rows.length === 0) {
      throw new Error('Nenhuma fechadura inteligente configurada para esta propriedade');
    }
    
    const lock = lockResult.rows[0];
    
    // Descriptografar API key usando credentials-service
    const { getCredential } = await import('./credentials-service');
    const apiKey = await getCredential('smartlock', `api_key_${lock.id}`) || lock.api_key_encrypted;
    
    if (!apiKey) {
      throw new Error('API key não encontrada ou não descriptografada');
    }
    
    // Criar adapter
    const adapter = createLockAdapter(lock.lock_type, apiKey);
    
    // Calcular expiração (check-out + buffer)
    const expiresAt = new Date(checkOut);
    expiresAt.setHours(expiresAt.getHours() + (lock.pin_duration_hours || 48));
    
    // Gerar PIN
    const pinCode = await adapter.generatePin(lock.device_id, bookingId, expiresAt);
    
    // Salvar no banco
    const insertQuery = `
      INSERT INTO access_logs (
        property_id, booking_id, lock_id, lock_type, access_type, pin_code, action, expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `;
    await pool.query(insertQuery, [
      propertyId,
      bookingId,
      lock.device_id,
      lock.lock_type,
      'pin',
      pinCode,
      'granted',
      expiresAt,
    ]);
    
    return { pinCode, expiresAt };
  } catch (error) {
    console.error('Erro ao gerar PIN:', error);
    throw error;
  }
}

// Função para revogar PIN
export async function revokePin(propertyId: number, bookingId: number): Promise<boolean> {
  try {
    // Buscar PIN ativo
    const pinQuery = `
      SELECT lock_id, lock_type, pin_code, api_key_encrypted
      FROM access_logs al
      JOIN smart_locks sl ON al.lock_id = sl.device_id
      WHERE al.property_id = $1
        AND al.booking_id = $2
        AND al.action = 'granted'
        AND al.expires_at > CURRENT_TIMESTAMP
      ORDER BY al.created_at DESC
      LIMIT 1
    `;
    const pinResult = await pool.query(pinQuery, [propertyId, bookingId]);
    
    if (pinResult.rows.length === 0) {
      return false; // PIN não encontrado ou já expirado
    }
    
    const pin = pinResult.rows[0];
    
    // Descriptografar API key usando credentials-service
    const { getCredential } = await import('./credentials-service');
    const apiKey = await getCredential('smartlock', `api_key_${pin.lock_id}`) || pin.api_key_encrypted;
    
    if (!apiKey) {
      throw new Error('API key não encontrada ou não descriptografada');
    }
    
    // Criar adapter e revogar
    const adapter = createLockAdapter(pin.lock_type, apiKey);
    const revoked = await adapter.revokePin(pin.lock_id, pin.pin_code);
    
    if (revoked) {
      // Atualizar log
      await pool.query(
        `UPDATE access_logs
         SET action = 'revoked', updated_at = CURRENT_TIMESTAMP
         WHERE property_id = $1 AND booking_id = $2 AND pin_code = $3`,
        [propertyId, bookingId, pin.pin_code]
      );
    }
    
    return revoked;
  } catch (error) {
    console.error('Erro ao revogar PIN:', error);
    return false;
  }
}

// Função para registrar acesso
export async function logAccess(
  propertyId: number,
  bookingId: number,
  pinCode: string,
  action: 'used' | 'failed' | 'expired',
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO access_logs (
        property_id, booking_id, lock_id, access_type, pin_code, action, accessed_at, ip_address, user_agent
      )
      SELECT 
        $1, $2, lock_id, 'pin', $3, $4, CURRENT_TIMESTAMP, $5, $6
      FROM access_logs
      WHERE property_id = $1 AND booking_id = $2 AND pin_code = $3
      ORDER BY created_at DESC
      LIMIT 1`,
      [propertyId, bookingId, pinCode, action, ipAddress || null, userAgent || null]
    );
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
  }
}

// Função para obter PINs ativos de uma reserva
export async function getActivePins(bookingId: number): Promise<Array<{
  pinCode: string;
  expiresAt: Date;
  lockType: string;
}>> {
  try {
    const query = `
      SELECT pin_code, expires_at, lock_type
      FROM access_logs
      WHERE booking_id = $1
        AND action = 'granted'
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [bookingId]);
    
    return result.rows.map((row: any) => ({
      pinCode: row.pin_code,
      expiresAt: new Date(row.expires_at),
      lockType: row.lock_type,
    }));
  } catch (error) {
    console.error('Erro ao buscar PINs ativos:', error);
    return [];
  }
}

