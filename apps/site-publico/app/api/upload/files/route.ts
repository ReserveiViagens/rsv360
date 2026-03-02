/**
 * ✅ API DE UPLOAD DE ARQUIVOS (REFATORADA)
 * POST /api/upload/files - Upload de arquivos genéricos usando serviço consolidado
 */

import { NextRequest, NextResponse } from 'next/server';
import { processUpload, validateUploadRequest, UploadConfig } from '@/lib/upload-service';
import { handleError } from '@/lib/error-handler';

export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const user = await validateUploadRequest(request);

    // Obter dados do formulário
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'uploads';
    const type = (formData.get('type') as 'photo' | 'document' | 'avatar' | 'other') || 'other';
    const maxFiles = parseInt(formData.get('maxFiles') as string || '10');
    const maxSizeMB = parseInt(formData.get('maxSizeMB') as string || '10');
    const compressImages = formData.get('compressImages') === 'true';
    const generateThumbnails = formData.get('generateThumbnails') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo foi enviado' },
        { status: 400 }
      );
    }

    // Configuração de upload
    const config: UploadConfig = {
      maxFiles,
      maxSizeMB,
      folder,
      type,
      compressImages,
      generateThumbnails,
    };

    // Processar uploads
    const uploadedFiles = await processUpload(files, user.id, config);

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} arquivo(s) carregado(s) com sucesso`,
      files: uploadedFiles,
    });
  } catch (error: any) {
    const errorResponse = handleError(error);
    return NextResponse.json(
      {
        success: false,
        error: errorResponse.error,
        userMessage: errorResponse.userMessage,
      },
      { status: errorResponse.statusCode }
    );
  }
}

