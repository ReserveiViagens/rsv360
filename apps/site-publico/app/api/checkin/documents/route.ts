import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// POST: Upload de documentos do check-in
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const checkinId = formData.get('checkin_id') as string;
    const bookingId = formData.get('booking_id') as string;
    const documentType = formData.get('document_type') as string;
    const file = formData.get('file') as File;

    if (!file || !checkinId || !bookingId) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'checkin-documents');
    await mkdir(uploadDir, { recursive: true });

    // Gerar nome único
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${checkinId}-${documentType}-${timestamp}.${extension}`;
    const filePath = join(uploadDir, fileName);

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Salvar no banco
    const insertQuery = `
      INSERT INTO checkin_documents (
        checkin_id, booking_id, document_type,
        file_name, file_path, file_size, mime_type
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      parseInt(checkinId),
      parseInt(bookingId),
      documentType,
      file.name,
      `/uploads/checkin-documents/${fileName}`,
      file.size,
      file.type,
    ]);

    return NextResponse.json({
      document_id: result.rows[0].id,
      file_path: `/uploads/checkin-documents/${fileName}`,
    });
  } catch (error) {
    console.error('Erro ao fazer upload de documento:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

