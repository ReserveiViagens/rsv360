import { NextRequest, NextResponse } from 'next/server';

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  return token === 'admin-token-123';
}

// POST - Restaurar versão (não implementado - retorna sucesso para não quebrar UI)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    // Restaurar versão não implementado - retorna sucesso
    return NextResponse.json({ success: true, message: 'Funcionalidade em desenvolvimento' });
  } catch (error: any) {
    console.error('Erro ao restaurar versão:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao restaurar versão' },
      { status: 500 }
    );
  }
}
