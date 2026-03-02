/**
 * Serviço de Gerenciamento de Chaves de Criptografia
 * Gerencia chaves de criptografia, rotação e uso
 */

import * as crypto from 'crypto';
import { queryDatabase } from './db';

export interface EncryptionKey {
  id: string;
  key: Buffer;
  type: 'encryption' | 'signing' | 'hashing';
  algorithm: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  usageCount: number;
  lastUsed?: Date;
}

export interface KeyUsage {
  keyId: string;
  operation: 'encrypt' | 'decrypt' | 'sign' | 'verify';
  timestamp: Date;
  userId?: number;
}

/**
 * Serviço de gerenciamento de chaves
 */
export class KeyManagementService {
  private keyCache: Map<string, EncryptionKey> = new Map();
  private readonly defaultKeyId = 'default';
  private readonly keyRotationDays = 90; // Rotacionar chaves a cada 90 dias

  /**
   * Obter chave de criptografia
   */
  async getEncryptionKey(keyId?: string): Promise<EncryptionKey | null> {
    const id = keyId || this.defaultKeyId;

    // Verificar cache
    if (this.keyCache.has(id)) {
      const cached = this.keyCache.get(id)!;
      if (cached.isActive) {
        return cached;
      }
    }

    // Buscar do banco
    const result = await queryDatabase(
      `SELECT * FROM encryption_keys 
       WHERE id = $1 AND type = 'encryption' AND is_active = true
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (result.length === 0) {
      // Criar nova chave se não existir
      return await this.createEncryptionKey(id);
    }

    const key = this.mapDbToKey(result[0]);
    
    // Decodificar chave do base64
    key.key = Buffer.from(result[0].key_base64, 'base64');

    // Adicionar ao cache
    this.keyCache.set(id, key);

    return key;
  }

  /**
   * Obter chave de assinatura
   */
  async getSigningKey(keyId?: string): Promise<EncryptionKey | null> {
    const id = keyId || `${this.defaultKeyId}_signing`;

    if (this.keyCache.has(id)) {
      const cached = this.keyCache.get(id)!;
      if (cached.isActive) {
        return cached;
      }
    }

    const result = await queryDatabase(
      `SELECT * FROM encryption_keys 
       WHERE id = $1 AND type = 'signing' AND is_active = true
       ORDER BY created_at DESC LIMIT 1`,
      [id]
    );

    if (result.length === 0) {
      return await this.createSigningKey(id);
    }

    const key = this.mapDbToKey(result[0]);
    key.key = Buffer.from(result[0].key_base64, 'base64');
    this.keyCache.set(id, key);

    return key;
  }

  /**
   * Criar chave de criptografia
   */
  async createEncryptionKey(keyId?: string): Promise<EncryptionKey> {
    const id = keyId || this.defaultKeyId;
    const key = crypto.randomBytes(32); // 256 bits
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.keyRotationDays);

    await queryDatabase(
      `INSERT INTO encryption_keys 
       (id, key_base64, type, algorithm, created_at, expires_at, is_active, usage_count)
       VALUES ($1, $2, 'encryption', 'aes-256-gcm', CURRENT_TIMESTAMP, $3, true, 0)`,
      [id, key.toString('base64'), expiresAt]
    );

    const encryptionKey: EncryptionKey = {
      id,
      key,
      type: 'encryption',
      algorithm: 'aes-256-gcm',
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      usageCount: 0,
    };

    this.keyCache.set(id, encryptionKey);
    return encryptionKey;
  }

  /**
   * Criar chave de assinatura
   */
  async createSigningKey(keyId?: string): Promise<EncryptionKey> {
    const id = keyId || `${this.defaultKeyId}_signing`;
    const key = crypto.randomBytes(32); // 256 bits
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.keyRotationDays);

    await queryDatabase(
      `INSERT INTO encryption_keys 
       (id, key_base64, type, algorithm, created_at, expires_at, is_active, usage_count)
       VALUES ($1, $2, 'signing', 'sha256', CURRENT_TIMESTAMP, $3, true, 0)`,
      [id, key.toString('base64'), expiresAt]
    );

    const encryptionKey: EncryptionKey = {
      id,
      key,
      type: 'signing',
      algorithm: 'sha256',
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      usageCount: 0,
    };

    this.keyCache.set(id, encryptionKey);
    return encryptionKey;
  }

  /**
   * Registrar uso de chave
   */
  async recordKeyUsage(
    keyId: string,
    operation: 'encrypt' | 'decrypt' | 'sign' | 'verify',
    userId?: number
  ): Promise<void> {
    // Atualizar contador de uso
    await queryDatabase(
      `UPDATE encryption_keys 
       SET usage_count = usage_count + 1, last_used = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [keyId]
    );

    // Registrar uso detalhado
    await queryDatabase(
      `INSERT INTO key_usage_logs 
       (key_id, operation, user_id, timestamp)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
      [keyId, operation, userId || null]
    );

    // Atualizar cache
    if (this.keyCache.has(keyId)) {
      const key = this.keyCache.get(keyId)!;
      key.usageCount += 1;
      key.lastUsed = new Date();
    }
  }

  /**
   * Rotacionar chave
   */
  async rotateKey(keyId: string): Promise<EncryptionKey> {
    // Desativar chave antiga
    await queryDatabase(
      `UPDATE encryption_keys SET is_active = false WHERE id = $1`,
      [keyId]
    );

    // Criar nova chave
    const result = await queryDatabase(
      `SELECT type FROM encryption_keys WHERE id = $1 LIMIT 1`,
      [keyId]
    );

    const type = result.length > 0 ? result[0].type : 'encryption';

    if (type === 'encryption') {
      return await this.createEncryptionKey(keyId);
    } else {
      return await this.createSigningKey(keyId);
    }
  }

  /**
   * Obter chave para campo específico
   */
  async getFieldKeyId(tableName: string, fieldName: string): Promise<string> {
    // Buscar chave específica para o campo
    const result = await queryDatabase(
      `SELECT key_id FROM field_encryption_config 
       WHERE table_name = $1 AND field_name = $2 AND is_active = true
       LIMIT 1`,
      [tableName, fieldName]
    );

    if (result.length > 0) {
      return result[0].key_id;
    }

    // Retornar chave padrão
    return this.defaultKeyId;
  }

  /**
   * Listar todas as chaves
   */
  async listKeys(includeInactive: boolean = false): Promise<EncryptionKey[]> {
    let query = `SELECT * FROM encryption_keys`;
    const params: any[] = [];

    if (!includeInactive) {
      query += ` WHERE is_active = true`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await queryDatabase(query, params);

    return result.map((row: any) => {
      const key = this.mapDbToKey(row);
      key.key = Buffer.from(row.key_base64, 'base64');
      return key;
    });
  }

  /**
   * Verificar se chave precisa ser rotacionada
   */
  async checkKeyRotation(): Promise<string[]> {
    const result = await queryDatabase(
      `SELECT id FROM encryption_keys 
       WHERE is_active = true 
       AND (expires_at IS NULL OR expires_at <= CURRENT_TIMESTAMP + INTERVAL '7 days')`
    );

    return result.map((row: any) => row.id);
  }

  /**
   * Mapear dados do banco para EncryptionKey
   */
  private mapDbToKey(row: any): EncryptionKey {
    return {
      id: row.id,
      key: Buffer.alloc(0), // Será preenchido depois
      type: row.type,
      algorithm: row.algorithm,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
      isActive: row.is_active,
      usageCount: row.usage_count || 0,
      lastUsed: row.last_used ? new Date(row.last_used) : undefined,
    };
  }
}

// Instância singleton
export const keyManagementService = new KeyManagementService();

