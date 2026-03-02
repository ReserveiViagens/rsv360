import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// GET /api/auth/google/callback - Callback do OAuth Google
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    let redirectTo = '/minhas-reservas';
    if (state) {
      try {
        const stateData = JSON.parse(decodeURIComponent(state));
        redirectTo = stateData.redirect || redirectTo;
      } catch (e) {
        // Ignorar erro de parsing
      }
    }

    if (!code) {
      return NextResponse.redirect(`${redirectTo}?error=oauth_cancelled`);
    }

    // Trocar código por token de acesso
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      // Modo de desenvolvimento - criar usuário mock
      const mockEmail = `google_${Date.now()}@example.com`;
      const mockName = 'Usuário Google';
      
      // Verificar se usuário existe ou criar
      let userId = null;
      try {
        const tableExists = await queryDatabase(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          ) as exists`
        );

        if (tableExists[0]?.exists) {
          const existingUser = await queryDatabase(
            'SELECT id FROM users WHERE email = $1',
            [mockEmail]
          );

          if (existingUser.length > 0) {
            userId = existingUser[0].id;
          } else {
            const newUser = await queryDatabase(
              `INSERT INTO users (name, email, role, status)
               VALUES ($1, $2, 'customer', 'active')
               RETURNING id`,
              [mockName, mockEmail]
            );
            userId = newUser[0]?.id;
          }
        }
      } catch (error) {
        console.log('Tabela users não encontrada, continuando sem criar usuário');
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          userId: userId || 0,
          email: mockEmail,
          name: mockName,
          role: 'customer',
          provider: 'google',
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      // Redirecionar com token
      const redirectUrl = new URL(redirectTo, request.url);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('provider', 'google');
      
      return NextResponse.redirect(redirectUrl.toString());
    }

    // 1. Trocar código por token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Erro ao trocar código por token:', error);
      return NextResponse.redirect(`${redirectTo}?error=oauth_token_error`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Buscar informações do usuário no Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Erro ao buscar dados do usuário');
      return NextResponse.redirect(`${redirectTo}?error=oauth_user_error`);
    }

    const googleUser = await userResponse.json();

    // 3. Criar ou atualizar usuário no banco
    let userId = null;
    let user = null;

    try {
      const tableExists = await queryDatabase(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        ) as exists`
      );

      if (tableExists[0]?.exists) {
        // Verificar se usuário existe
        const existingUser = await queryDatabase(
          'SELECT id, name, email, oauth_provider, oauth_id FROM users WHERE email = $1 OR (oauth_provider = $2 AND oauth_id = $3)',
          [googleUser.email, 'google', googleUser.id]
        );

        if (existingUser.length > 0) {
          // Atualizar usuário existente
          user = existingUser[0];
          userId = user.id;

          // Atualizar campos OAuth se necessário
          await queryDatabase(
            `UPDATE users 
             SET oauth_provider = $1, oauth_id = $2, oauth_email = $3, updated_at = CURRENT_TIMESTAMP
             WHERE id = $4`,
            ['google', googleUser.id, googleUser.email, userId]
          );
        } else {
          // Criar novo usuário
          const newUser = await queryDatabase(
            `INSERT INTO users (name, email, oauth_provider, oauth_id, oauth_email, role, status)
             VALUES ($1, $2, $3, $4, $5, 'customer', 'active')
             RETURNING id, name, email, role`,
            [
              googleUser.name || googleUser.given_name || 'Usuário Google',
              googleUser.email,
              'google',
              googleUser.id,
              googleUser.email,
            ]
          );
          user = newUser[0];
          userId = user.id;
        }
      }
    } catch (error: any) {
      console.error('Erro ao criar/atualizar usuário:', error);
      // Continuar mesmo se não conseguir salvar no banco
    }

    // 4. Gerar token JWT
    const token = jwt.sign(
      {
        userId: userId || 0,
        email: googleUser.email,
        name: googleUser.name || googleUser.given_name,
        role: user?.role || 'customer',
        provider: 'google',
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // 5. Redirecionar com token
    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('provider', 'google');
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('Erro no callback OAuth Google:', error);
    return NextResponse.redirect(`/login?error=oauth_error`);
  }
}

