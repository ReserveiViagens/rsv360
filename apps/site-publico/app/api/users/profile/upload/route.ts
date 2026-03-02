import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/users/profile/upload - Upload de imagens
export async function POST(request: NextRequest) {
  try {
    // Obter token do header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decoded.userId || decoded.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar', 'logo', 'gallery'

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de arquivo não permitido. Use: JPEG, PNG, WEBP ou GIF' },
        { status: 400 }
      );
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Arquivo muito grande. Máximo: 5MB' },
        { status: 400 }
      );
    }

    // Criar diretório de uploads se não existir
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Gerar nome único
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    const filename = `${userId}_${type}_${timestamp}_${randomStr}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // URL pública
    const fileUrl = `/uploads/profiles/${filename}`;

    // Salvar registro no banco (tabela files)
    try {
      await queryDatabase(
        `INSERT INTO files (user_id, file_type, file_name, original_name, file_path, file_url, mime_type, file_size)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          type,
          filename,
          file.name,
          filepath,
          fileUrl,
          file.type,
          file.size
        ]
      );
    } catch (error) {
      // Se tabela files não existir, continuar sem salvar registro
      console.log('Tabela files não encontrada, continuando sem registro');
    }

    // Atualizar perfil com URL da imagem
    const fieldMap: { [key: string]: string } = {
      avatar: 'avatar_url',
      logo: 'company_logo',
      profile: 'profile_picture'
    };

    const fieldName = fieldMap[type] || 'avatar_url';
    
    // Verificar se perfil existe
    const existingProfile = await queryDatabase(
      'SELECT user_id FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (existingProfile.length > 0) {
      await queryDatabase(
        `UPDATE user_profiles SET ${fieldName} = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2`,
        [fileUrl, userId]
      );
    } else {
      await queryDatabase(
        `INSERT INTO user_profiles (user_id, ${fieldName}) VALUES ($1, $2)`,
        [userId, fileUrl]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Arquivo enviado com sucesso',
      data: {
        url: fileUrl,
        filename: filename,
        size: file.size,
        type: file.type
      }
    });
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer upload do arquivo' },
      { status: 500 }
    );
  }
}

