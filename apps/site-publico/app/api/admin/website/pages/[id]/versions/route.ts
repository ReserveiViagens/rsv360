import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiRequest } from '@/lib/admin-api-auth';
import { jsonInternalError } from '@/lib/api-error';


// GET - Listar versões (retorna vazio por enquanto - histórico pode ser implementado depois)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminApiRequest(request))) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    // Histórico de versões não implementado - retorna array vazio
    return NextResponse.json({ success: true, data: [] });
  } catch (error: any) {
    console.error('Erro ao listar versões:', error);
    return jsonInternalError(error);
  }
}
