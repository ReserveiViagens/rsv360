import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminApiRequest } from '@/lib/admin-api-auth';
import { getWebsiteContent } from '@/lib/db';
import { jsonInternalError } from '@/lib/api-error';


// GET - Listar itens de um tipo (hotels, promotions, attractions, tickets) para importação
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    if (!(await verifyAdminApiRequest(request))) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }
    const { type } = await params;
    const validTypes = ['hotels', 'promotions', 'attractions', 'tickets'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Tipo inválido. Use: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    const items = await getWebsiteContent(type);
    const formatted = items.map((item: any) => ({
      id: item.id,
      content_id: item.content_id,
      title: item.title,
      description: item.description,
      images: item.images || [],
      metadata: item.metadata || {},
      seo_data: item.seo_data || {},
    }));
    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Erro ao listar itens:', error);
    return jsonInternalError(error);
  }
}
