import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

// POST /api/auth/forgot-password - Solicitar recuperação de senha
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se usuário existe
    const users = await queryDatabase(
      'SELECT id, name, email FROM users WHERE email = $1',
      [email]
    );

    // Por segurança, sempre retornar sucesso mesmo se o email não existir
    // Isso previne enumeração de emails
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Se o email existir, você receberá instruções para redefinir sua senha',
      });
    }

    const user = users[0];

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Verificar se tabela password_resets existe, se não, criar
    try {
      await queryDatabase(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          token_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
    } catch (error: any) {
      // Tabela pode já existir ou erro de foreign key
      console.log('Tabela password_resets:', error.message);
    }

    // Invalidar tokens anteriores do usuário
    await queryDatabase(
      `UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [user.id]
    );

    // Criar novo token
    await queryDatabase(
      `INSERT INTO password_resets (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetTokenHash, expiresAt]
    );

    // Enviar email de recuperação
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Erro ao enviar email de recuperação:', emailError);
      // Continuar mesmo se o email falhar
    }

    return NextResponse.json({
      success: true,
      message: 'Se o email existir, você receberá instruções para redefinir sua senha',
    });
  } catch (error: any) {
    console.error('Erro ao processar recuperação de senha:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao processar solicitação',
      },
      { status: 500 }
    );
  }
}

