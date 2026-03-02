/**
 * ✅ API DE DOWNLOAD DE ARQUIVOS
 * GET /api/storage/download?path=xxx - Download de arquivo do storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile, fileExists } from '@/lib/storage-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'Parâmetro path é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se arquivo existe
    const exists = await fileExists(filePath);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Arquivo não encontrado' },
        { status: 404 }
      );
    }

    // Ler arquivo
    const fileBuffer = await readFile(filePath);

    // Determinar content-type baseado na extensão
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      json: 'application/json',
      txt: 'text/plain',
      html: 'text/html',
    };
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';

    // Retornar arquivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filePath.split('/').pop()}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('Erro ao baixar arquivo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao baixar arquivo' },
      { status: 500 }
    );
  }
}

