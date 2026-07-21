import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { queryDatabase } from '@/lib/db';
import { optionalAuth } from '@/lib/api-auth';
import { isCheckinStaff } from '@/lib/checkin-access';
import { jsonInternalError } from '@/lib/api-error';

// POST: Upload de documentos do check-in (PR-03b: auth + posse)
export async function POST(req: NextRequest) {
  try {
    const user = await optionalAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const checkinId = formData.get('checkin_id') as string;
    const bookingId = formData.get('booking_id') as string;
    const documentType = (formData.get('document_type') as string) || 'other';

    if (!file || !checkinId || !bookingId) {
      return NextResponse.json(
        { error: 'file, checkin_id e booking_id são obrigatórios' },
        { status: 400 },
      );
    }

    if (!/^\d+$/.test(checkinId) || !/^\d+$/.test(bookingId)) {
      return NextResponse.json({ error: 'ids inválidos' }, { status: 400 });
    }

    if (!isCheckinStaff(user)) {
      const rows = await queryDatabase(
        `SELECT c.id, b.customer_email, b.user_id
         FROM checkins c
         JOIN bookings b ON b.id = c.booking_id
         WHERE c.id = $1 AND c.booking_id = $2
         LIMIT 1`,
        [parseInt(checkinId, 10), parseInt(bookingId, 10)],
      );
      const row = rows[0] as
        | { customer_email?: string; user_id?: number }
        | undefined;
      if (!row) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
      }
      const owns =
        Number(row.user_id) === user.id ||
        String(row.customer_email || '').toLowerCase() === user.email.toLowerCase();
      if (!owns) {
        return NextResponse.json({ error: 'Nenhum check-in encontrado' }, { status: 404 });
      }
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'checkin-documents');
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = (file.name.split('.').pop() || 'bin').replace(/[^a-zA-Z0-9]/g, '');
    const timestamp = Date.now();
    const fileName = `${checkinId}-${documentType}-${timestamp}.${extension}`;
    await writeFile(join(uploadDir, fileName), buffer);

    await queryDatabase(
      `INSERT INTO checkin_documents (
        checkin_id, booking_id, document_type, file_path, created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [
        parseInt(checkinId, 10),
        parseInt(bookingId, 10),
        documentType,
        `/uploads/checkin-documents/${fileName}`,
      ],
    );

    return NextResponse.json({
      success: true,
      file_path: `/uploads/checkin-documents/${fileName}`,
    });
  } catch (error) {
    console.error('Erro upload check-in docs:', error);
    return jsonInternalError(error);
  }
}
