import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { checkRateLimit, resetRateLimit, recordLoginAttempt, getClientIP, getUserAgent } from '@/lib/advanced-auth';
import { createRefreshToken } from '@/lib/refresh-token-service';

// POST /api/auth/login - Login do usuário
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'E-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ ITEM 22: RATE LIMITING
    const ipAddress = getClientIP(request);
    const rateLimitCheck = await checkRateLimit(ipAddress, 'ip', 'login');
    const emailRateLimitCheck = await checkRateLimit(email.toLowerCase(), 'email', 'login');

    if (!rateLimitCheck.allowed || !emailRateLimitCheck.allowed) {
      const blockedUntil = rateLimitCheck.blockedUntil || emailRateLimitCheck.blockedUntil;
      await recordLoginAttempt(email, ipAddress, getUserAgent(request), false, 'Rate limit excedido');
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas. Tente novamente mais tarde.',
          blocked_until: blockedUntil?.toISOString(),
        },
        { status: 429 }
      );
    }

    // Buscar usuário
    const users = await queryDatabase(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou senha inválidos' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 403 }
      );
    }

    // Verificar senha
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        await recordLoginAttempt(email, ipAddress, getUserAgent(request), false, 'Senha inválida');
        return NextResponse.json(
          { success: false, error: 'E-mail ou senha inválidos' },
          { status: 401 }
        );
      }
    } else {
      // Se não tem senha, criar uma (primeiro acesso)
      const hashedPassword = await bcrypt.hash(password, 10);
      await queryDatabase(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
    }

    // Atualizar último login
    await queryDatabase(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // ✅ ITEM 23: GERAR ACCESS TOKEN E REFRESH TOKEN
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    // Gerar access token (15 minutos)
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Gerar refresh token
    const { refreshToken } = await createRefreshToken(
      user.id,
      { ip: ipAddress, userAgent: getUserAgent(request) },
      ipAddress,
      getUserAgent(request)
    );

    // Resetar rate limit após sucesso
    await resetRateLimit(ipAddress, 'ip', 'login');
    await resetRateLimit(email.toLowerCase(), 'email', 'login');

    // Registrar tentativa bem-sucedida
    await recordLoginAttempt(email, ipAddress, getUserAgent(request), true);

    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 900, // 15 minutos em segundos
      },
    });
  } catch (error: any) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao realizar login',
      },
      { status: 500 }
    );
  }
}

