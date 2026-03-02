import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/facebook - Iniciar OAuth do Facebook
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirect = searchParams.get('redirect') || '/minhas-reservas';
    
    // Em produção, você usaria as credenciais reais do Facebook OAuth
    const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/facebook/callback`;
    
    if (!FACEBOOK_APP_ID) {
      // Modo de desenvolvimento - simular OAuth
      return NextResponse.json({
        success: false,
        error: 'Facebook OAuth não configurado. Configure FACEBOOK_APP_ID no .env.local',
        demo: true,
        message: 'Em desenvolvimento, use o login normal ou configure as credenciais do Facebook OAuth'
      });
    }

    // URL de autorização do Facebook
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${FACEBOOK_APP_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=email public_profile&` +
      `state=${encodeURIComponent(JSON.stringify({ redirect }))}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Erro ao iniciar OAuth Facebook:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao iniciar autenticação Facebook' },
      { status: 500 }
    );
  }
}

