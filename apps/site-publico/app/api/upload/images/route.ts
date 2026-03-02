import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Configurações
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma imagem foi enviada' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const uploadedImages = [];

    for (const file of files) {
      // Validar tipo
      if (!ALLOWED_TYPES.includes(file.type)) {
        continue; // Pular arquivos inválidos
      }

      // Validar tamanho
      if (file.size > MAX_FILE_SIZE) {
        continue; // Pular arquivos muito grandes
      }

      // Gerar nome único
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = file.name.split('.').pop();
      const filename = `${timestamp}-${randomStr}.${extension}`;
      const filepath = join(UPLOAD_DIR, filename);

      // Salvar arquivo
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // URL pública
      const url = `/uploads/${filename}`;

      uploadedImages.push({
        id: `${timestamp}-${randomStr}`,
        filename: filename,
        originalName: file.name,
        size: file.size,
        mimetype: file.type,
        url: url,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhuma imagem válida foi enviada' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedImages.length} imagem(ns) carregada(s) com sucesso`,
      images: uploadedImages,
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro interno do servidor durante o upload',
      },
      { status: 500 }
    );
  }
}

