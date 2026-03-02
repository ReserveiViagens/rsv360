import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// POST /api/auth/reset-password - Redefinir senha com token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Hash do token para buscar no banco
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar token válido
    const resetTokens = await queryDatabase(
      `SELECT pr.*, u.id as user_id, u.email
       FROM password_resets pr
       JOIN users u ON pr.user_id = u.id
       WHERE pr.token_hash = $1 
         AND pr.used = FALSE 
         AND pr.expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (resetTokens.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    const resetToken = resetTokens[0];

    // Hash da nova senha
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Atualizar senha do usuário
    await queryDatabase(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, resetToken.user_id]
    );

    // Marcar token como usado
    await queryDatabase(
      `UPDATE password_resets SET used = TRUE WHERE id = $1`,
      [resetToken.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao redefinir senha',
      },
      { status: 500 }
    );
  }
}

