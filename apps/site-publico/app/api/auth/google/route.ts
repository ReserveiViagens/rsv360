import { NextRequest, NextResponse } from 'next/server';

// GET /api/auth/google - Iniciar OAuth do Google
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const redirect = searchParams.get('redirect') || '/minhas-reservas';
    
    // Em produção, você usaria as credenciais reais do Google OAuth
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    
    if (!GOOGLE_CLIENT_ID) {
      // Modo de desenvolvimento - simular OAuth
      return NextResponse.json({
        success: false,
        error: 'Google OAuth não configurado. Configure GOOGLE_CLIENT_ID no .env.local',
        demo: true,
        message: 'Em desenvolvimento, use o login normal ou configure as credenciais do Google OAuth'
      });
    }

    // URL de autorização do Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=openid email profile&` +
      `state=${encodeURIComponent(JSON.stringify({ redirect }))}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Erro ao iniciar OAuth Google:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao iniciar autenticação Google' },
      { status: 500 }
    );
  }
}

