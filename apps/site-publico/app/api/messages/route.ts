import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import * as jwt from 'jsonwebtoken';

// GET /api/messages - Listar conversas
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const searchParams = request.nextUrl.searchParams;
    const with_user_id = searchParams.get('with_user_id');

    if (with_user_id) {
      // Buscar mensagens de uma conversa específica
      const messages = await queryDatabase(
        `SELECT m.*, 
         u1.name as from_user_name, u1.email as from_user_email,
         u2.name as to_user_name, u2.email as to_user_email
         FROM messages m
         LEFT JOIN users u1 ON m.from_user_id = u1.id
         LEFT JOIN users u2 ON m.to_user_id = u2.id
         WHERE (m.from_user_id = $1 AND m.to_user_id = $2) 
            OR (m.from_user_id = $2 AND m.to_user_id = $1)
         ORDER BY m.created_at ASC`,
        [userId, with_user_id]
      );

      // Marcar como lidas
      await queryDatabase(
        'UPDATE messages SET read = true, read_at = CURRENT_TIMESTAMP WHERE to_user_id = $1 AND from_user_id = $2 AND read = false',
        [userId, with_user_id]
      );

      return NextResponse.json({ success: true, data: messages });
    } else {
      // Listar todas as conversas
      const conversations = await queryDatabase(
        `SELECT DISTINCT ON (CASE WHEN m.from_user_id = $1 THEN m.to_user_id ELSE m.from_user_id END)
         CASE WHEN m.from_user_id = $1 THEN m.to_user_id ELSE m.from_user_id END as other_user_id,
         CASE WHEN m.from_user_id = $1 THEN u2.name ELSE u1.name END as other_user_name,
         m.message, m.created_at, m.read,
         (SELECT COUNT(*) FROM messages WHERE to_user_id = $1 AND from_user_id = (CASE WHEN m.from_user_id = $1 THEN m.to_user_id ELSE m.from_user_id END) AND read = false) as unread_count
         FROM messages m
         LEFT JOIN users u1 ON m.from_user_id = u1.id
         LEFT JOIN users u2 ON m.to_user_id = u2.id
         WHERE m.from_user_id = $1 OR m.to_user_id = $1
         ORDER BY (CASE WHEN m.from_user_id = $1 THEN m.to_user_id ELSE m.from_user_id END), m.created_at DESC`,
        [userId]
      );

      return NextResponse.json({ success: true, data: conversations });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/messages - Enviar mensagem
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const fromUserId = decoded.userId || decoded.id;

    const body = await request.json();
    const { to_user_id, message, booking_id } = body;

    if (!to_user_id || !message) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 });
    }

    const newMessage = await queryDatabase(
      `INSERT INTO messages (from_user_id, to_user_id, booking_id, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fromUserId, to_user_id, booking_id || null, message]
    );

    // Criar notificação
    try {
      await queryDatabase(
        `INSERT INTO notifications (user_id, type, title, message, link, icon)
         VALUES ($1, 'message', 'Nova mensagem', $2, $3, 'message')`,
        [to_user_id, `Você recebeu uma nova mensagem`, `/mensagens?user=${fromUserId}`]
      );
    } catch (error) {
      // Ignorar erro de notificação
    }

    return NextResponse.json({ success: true, data: newMessage[0] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

