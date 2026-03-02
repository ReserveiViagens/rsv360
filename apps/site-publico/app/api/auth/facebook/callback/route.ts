import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

// GET /api/auth/facebook/callback - Callback do OAuth Facebook
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
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
    const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
    const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      // Modo de desenvolvimento - criar usuário mock
      const mockEmail = `facebook_${Date.now()}@example.com`;
      const mockName = 'Usuário Facebook';
      
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
          provider: 'facebook',
        },
        process.env.JWT_SECRET || 'your-secret-key-change-in-production',
        { expiresIn: '7d' }
      );

      // Redirecionar com token
      const redirectUrl = new URL(redirectTo, request.url);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('provider', 'facebook');
      
      return NextResponse.redirect(redirectUrl.toString());
    }

    // 1. Trocar código por token de acesso
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `client_secret=${FACEBOOK_APP_SECRET}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `code=${code}`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Erro ao trocar código por token:', error);
      return NextResponse.redirect(`${redirectTo}?error=oauth_token_error`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Buscar informações do usuário no Facebook
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!userResponse.ok) {
      console.error('Erro ao buscar dados do usuário');
      return NextResponse.redirect(`${redirectTo}?error=oauth_user_error`);
    }

    const facebookUser = await userResponse.json();

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
          [facebookUser.email || `facebook_${facebookUser.id}@facebook.com`, 'facebook', facebookUser.id]
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
            ['facebook', facebookUser.id, facebookUser.email || `facebook_${facebookUser.id}@facebook.com`, userId]
          );
        } else {
          // Criar novo usuário
          const newUser = await queryDatabase(
            `INSERT INTO users (name, email, oauth_provider, oauth_id, oauth_email, role, status)
             VALUES ($1, $2, $3, $4, $5, 'customer', 'active')
             RETURNING id, name, email, role`,
            [
              facebookUser.name || 'Usuário Facebook',
              facebookUser.email || `facebook_${facebookUser.id}@facebook.com`,
              'facebook',
              facebookUser.id,
              facebookUser.email || `facebook_${facebookUser.id}@facebook.com`,
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
        email: facebookUser.email || `facebook_${facebookUser.id}@facebook.com`,
        name: facebookUser.name || 'Usuário Facebook',
        role: user?.role || 'customer',
        provider: 'facebook',
      },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    // 5. Redirecionar com token
    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('provider', 'facebook');
    
    return NextResponse.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('Erro no callback OAuth Facebook:', error);
    return NextResponse.redirect(`/login?error=oauth_error`);
  }
}

