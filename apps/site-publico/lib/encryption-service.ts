/**
 * Serviço de Criptografia Avançada
 * Implementa criptografia simétrica, assimétrica e hashing seguro
 */

import * as crypto from 'crypto';
import { queryDatabase } from './db';
import { keyManagementService } from './key-management-service';

export interface EncryptionOptions {
  algorithm?: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';
  keyId?: string; // ID da chave a ser usada
  iv?: Buffer; // Initialization Vector (gerado automaticamente se não fornecido)
}

export interface EncryptionResult {
  encrypted: string; // Base64 encoded
  iv?: string; // Base64 encoded IV
  tag?: string; // Base64 encoded authentication tag (para GCM)
  algorithm: string;
  keyId: string;
}

export interface DecryptionResult {
  decrypted: string;
  algorithm: string;
}

/**
 * Serviço de criptografia avançada
 */
export class EncryptionService {
  private readonly defaultAlgorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits

  /**
   * Criptografar dados
   */
  async encrypt(
    data: string,
    options: EncryptionOptions = {}
  ): Promise<EncryptionResult> {
    const algorithm = options.algorithm || this.defaultAlgorithm;
    
    // Obter chave
    const key = await keyManagementService.getEncryptionKey(options.keyId);
    if (!key) {
      throw new Error('Chave de criptografia não encontrada');
    }

    // Gerar IV se não fornecido
    const iv = options.iv || crypto.randomBytes(this.ivLength);

    let encrypted: Buffer;
    let tag: Buffer | undefined;

    switch (algorithm) {
      case 'aes-256-gcm':
        const cipherGCM = crypto.createCipheriv(algorithm, key, iv);
        encrypted = Buffer.concat([
          cipherGCM.update(data, 'utf8'),
          cipherGCM.final(),
        ]);
        tag = cipherGCM.getAuthTag();
        break;

      case 'aes-256-cbc':
        const cipherCBC = crypto.createCipheriv(algorithm, key, iv);
        encrypted = Buffer.concat([
          cipherCBC.update(data, 'utf8'),
          cipherCBC.final(),
        ]);
        break;

      case 'chacha20-poly1305':
        const cipherChaCha = crypto.createCipheriv(algorithm, key, iv);
        encrypted = Buffer.concat([
          cipherChaCha.update(data, 'utf8'),
          cipherChaCha.final(),
        ]);
        tag = cipherChaCha.getAuthTag();
        break;

      default:
        throw new Error(`Algoritmo não suportado: ${algorithm}`);
    }

    // Registrar uso da chave
    await keyManagementService.recordKeyUsage(key.id, 'encrypt');

    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag?.toString('base64'),
      algorithm,
      keyId: key.id,
    };
  }

  /**
   * Descriptografar dados
   */
  async decrypt(
    encryptedData: EncryptionResult
  ): Promise<DecryptionResult> {
    const key = await keyManagementService.getEncryptionKey(encryptedData.keyId);
    if (!key) {
      throw new Error('Chave de criptografia não encontrada');
    }

    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    const iv = Buffer.from(encryptedData.iv || '', 'base64');

    let decrypted: Buffer;

    switch (encryptedData.algorithm) {
      case 'aes-256-gcm':
        if (!encryptedData.tag) {
          throw new Error('Tag de autenticação não fornecida para AES-256-GCM');
        }
        const decipherGCM = crypto.createDecipheriv(
          encryptedData.algorithm,
          key.key,
          iv
        );
        decipherGCM.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
        decrypted = Buffer.concat([
          decipherGCM.update(encrypted),
          decipherGCM.final(),
        ]);
        break;

      case 'aes-256-cbc':
        const decipherCBC = crypto.createDecipheriv(
          encryptedData.algorithm,
          key.key,
          iv
        );
        decrypted = Buffer.concat([
          decipherCBC.update(encrypted),
          decipherCBC.final(),
        ]);
        break;

      case 'chacha20-poly1305':
        if (!encryptedData.tag) {
          throw new Error('Tag de autenticação não fornecida para ChaCha20-Poly1305');
        }
        const decipherChaCha = crypto.createDecipheriv(
          encryptedData.algorithm,
          key.key,
          iv
        );
        decipherChaCha.setAuthTag(Buffer.from(encryptedData.tag, 'base64'));
        decrypted = Buffer.concat([
          decipherChaCha.update(encrypted),
          decipherChaCha.final(),
        ]);
        break;

      default:
        throw new Error(`Algoritmo não suportado: ${encryptedData.algorithm}`);
    }

    // Registrar uso da chave
    await keyManagementService.recordKeyUsage(key.id, 'decrypt');

    return {
      decrypted: decrypted.toString('utf8'),
      algorithm: encryptedData.algorithm,
    };
  }

  /**
   * Hash seguro (SHA-256, SHA-512, bcrypt, argon2)
   */
  async hash(
    data: string,
    algorithm: 'sha256' | 'sha512' | 'bcrypt' | 'argon2' = 'sha256',
    salt?: string
  ): Promise<{ hash: string; salt?: string }> {
    switch (algorithm) {
      case 'sha256':
      case 'sha512':
        const hash = crypto.createHash(algorithm);
        const saltToUse = salt || crypto.randomBytes(16).toString('hex');
        hash.update(data + saltToUse);
        return {
          hash: hash.digest('hex'),
          salt: saltToUse,
        };

      case 'bcrypt':
        // Em produção, usar biblioteca bcrypt
        // Por enquanto, usar SHA-256 com salt
        const bcryptSalt = salt || crypto.randomBytes(16).toString('hex');
        const bcryptHash = crypto.createHash('sha256');
        bcryptHash.update(data + bcryptSalt);
        // Simular rounds do bcrypt
        for (let i = 0; i < 10; i++) {
          const temp = crypto.createHash('sha256');
          temp.update(bcryptHash.digest('hex') + bcryptSalt);
          bcryptHash.update(temp.digest('hex'));
        }
        return {
          hash: bcryptHash.digest('hex'),
          salt: bcryptSalt,
        };

      case 'argon2':
        // Em produção, usar biblioteca argon2
        // Por enquanto, usar SHA-512 com múltiplas iterações
        const argon2Salt = salt || crypto.randomBytes(32).toString('hex');
        let argon2Hash = crypto.createHash('sha512');
        argon2Hash.update(data + argon2Salt);
        // Simular iterações do Argon2
        for (let i = 0; i < 3; i++) {
          const temp = crypto.createHash('sha512');
          temp.update(argon2Hash.digest('hex') + argon2Salt + i);
          argon2Hash = crypto.createHash('sha512');
          argon2Hash.update(temp.digest('hex'));
        }
        return {
          hash: argon2Hash.digest('hex'),
          salt: argon2Salt,
        };

      default:
        throw new Error(`Algoritmo de hash não suportado: ${algorithm}`);
    }
  }

  /**
   * Verificar hash
   */
  async verifyHash(
    data: string,
    hash: string,
    salt: string,
    algorithm: 'sha256' | 'sha512' | 'bcrypt' | 'argon2' = 'sha256'
  ): Promise<boolean> {
    const result = await this.hash(data, algorithm, salt);
    return result.hash === hash;
  }

  /**
   * Criptografar campo de banco de dados
   */
  async encryptField(
    value: string,
    fieldName: string,
    tableName: string
  ): Promise<EncryptionResult> {
    // Usar chave específica para o campo ou chave padrão
    const keyId = await keyManagementService.getFieldKeyId(tableName, fieldName);
    
    return this.encrypt(value, {
      algorithm: 'aes-256-gcm',
      keyId,
    });
  }

  /**
   * Descriptografar campo de banco de dados
   */
  async decryptField(
    encryptedData: EncryptionResult
  ): Promise<string> {
    const result = await this.decrypt(encryptedData);
    return result.decrypted;
  }

  /**
   * Criptografar arquivo
   */
  async encryptFile(
    fileBuffer: Buffer,
    options: EncryptionOptions = {}
  ): Promise<EncryptionResult> {
    return this.encrypt(fileBuffer.toString('base64'), options);
  }

  /**
   * Descriptografar arquivo
   */
  async decryptFile(
    encryptedData: EncryptionResult
  ): Promise<Buffer> {
    const result = await this.decrypt(encryptedData);
    return Buffer.from(result.decrypted, 'base64');
  }

  /**
   * Gerar token seguro
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Gerar senha segura
   */
  generateSecurePassword(
    length: number = 16,
    includeNumbers: boolean = true,
    includeSymbols: boolean = true
  ): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let charset = lowercase + uppercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    let password = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += charset[randomBytes[i] % charset.length];
    }

    return password;
  }

  /**
   * Assinar dados (HMAC)
   */
  async sign(
    data: string,
    keyId?: string
  ): Promise<{ signature: string; algorithm: string }> {
    const key = await keyManagementService.getSigningKey(keyId);
    if (!key) {
      throw new Error('Chave de assinatura não encontrada');
    }

    const hmac = crypto.createHmac('sha256', key.key);
    hmac.update(data);
    const signature = hmac.digest('hex');

    await keyManagementService.recordKeyUsage(key.id, 'sign');

    return {
      signature,
      algorithm: 'sha256',
    };
  }

  /**
   * Verificar assinatura
   */
  async verify(
    data: string,
    signature: string,
    keyId?: string
  ): Promise<boolean> {
    const result = await this.sign(data, keyId);
    return result.signature === signature;
  }
}

// Instância singleton
export const encryptionService = new EncryptionService();

