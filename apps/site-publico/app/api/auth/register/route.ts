import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '@/lib/email';

// POST /api/auth/register - Cadastro de novo usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone, document } = body;

    // Validação
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se e-mail já existe
    const existing = await queryDatabase(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'E-mail já cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10);

    // Criar usuário
    const newUser = await queryDatabase(
      `INSERT INTO users (name, email, phone, document, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5, 'customer', 'active')
       RETURNING id, name, email, phone, role, status, created_at`,
      [
        name,
        email.toLowerCase(),
        phone || null,
        document || null,
        passwordHash,
      ]
    );

    const user = newUser[0];

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // Enviar email de boas-vindas
    try {
      await sendWelcomeEmail({
        name: user.name,
        email: user.email,
      });
    } catch (emailError) {
      // Não falhar a requisição se o email falhar
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Cadastro realizado com sucesso',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
          },
          token,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao realizar cadastro',
      },
      { status: 500 }
    );
  }
}

