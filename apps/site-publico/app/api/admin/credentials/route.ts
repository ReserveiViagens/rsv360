/**
 * ✅ API DE CREDENCIAIS
 * GET /api/admin/credentials - Buscar credenciais
 * POST /api/admin/credentials - Salvar credenciais
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';
import * as crypto from 'crypto';

// Chave para criptografar credenciais (em produção, usar variável de ambiente)
const ENCRYPTION_KEY = process.env.CREDENTIALS_ENCRYPTION_KEY || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas admin pode acessar credenciais
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Verificar se tabela existe
    const tableCheck = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_credentials'
      )`
    );

    if (!tableCheck[0]?.exists) {
      // Criar tabela se não existir
      await queryDatabase(`
        CREATE TABLE IF NOT EXISTS system_credentials (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value_encrypted TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return NextResponse.json({
        success: true,
        data: {},
      });
    }

    // Buscar credenciais
    const credentials = await queryDatabase(
      'SELECT key, value_encrypted FROM system_credentials'
    );

    const decrypted: Record<string, string> = {};
    credentials.forEach((row: any) => {
      try {
        decrypted[row.key] = decrypt(row.value_encrypted);
      } catch (e) {
        console.error(`Erro ao descriptografar ${row.key}:`, e);
      }
    });

    return NextResponse.json({
      success: true,
      data: decrypted,
    });
  } catch (error: any) {
    console.error('Erro ao buscar credenciais:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar credenciais' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    // Apenas admin pode salvar credenciais
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const credentials = body.credentials || body;

    // Verificar se tabela existe
    const tableCheck = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_credentials'
      )`
    );

    if (!tableCheck[0]?.exists) {
      await queryDatabase(`
        CREATE TABLE IF NOT EXISTS system_credentials (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value_encrypted TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Salvar cada credencial
    for (const [key, value] of Object.entries(credentials)) {
      if (value && typeof value === 'string' && value.length > 0) {
        const encrypted = encrypt(value);
        await queryDatabase(
          `INSERT INTO system_credentials (key, value_encrypted, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET
             value_encrypted = EXCLUDED.value_encrypted,
             updated_at = CURRENT_TIMESTAMP`,
          [key, encrypted]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciais salvas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao salvar credenciais:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar credenciais' },
      { status: 500 }
    );
  }
}

