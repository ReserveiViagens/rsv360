import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/lib/whatsapp';
import { sendMessengerMessage, sendInstagramMessage } from '@/lib/meta-senders';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'rsv360_verify_token_2025';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// Verificação do webhook (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}

// Processar webhook (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Webhook Meta recebido:', JSON.stringify(body, null, 2));

    // WhatsApp Business
    if (body.object === 'whatsapp_business_account' && body.entry?.[0]?.changes?.[0]) {
      const change = body.entry[0].changes[0];
      if (change.field === 'messages' && change.value?.messages?.[0]) {
        const message = change.value.messages[0];
        const from = message.from; // Número do usuário
        const text = message.text?.body || '';

        // Salvar mensagem no DB
        try {
          // Buscar usuário por telefone
          const userQuery = `
            SELECT id FROM users WHERE phone = $1 OR phone LIKE $2 LIMIT 1
          `;
          const userResult = await pool.query(userQuery, [
            from,
            `%${from.slice(-8)}%`, // Últimos 8 dígitos
          ]);
          const userId = userResult.rows[0]?.id || null;

          // Salvar mensagem
          await pool.query(
            `INSERT INTO messages (from_user_id, to_user_id, message, platform, created_at)
             VALUES ($1, 1, $2, 'whatsapp', CURRENT_TIMESTAMP)
             ON CONFLICT DO NOTHING`,
            [userId || 1, text]
          );
        } catch (dbError) {
          console.error('Erro ao salvar mensagem no DB:', dbError);
        }

        // Resposta automática baseada em template
        if (text.toLowerCase().includes('reserva') || text.toLowerCase().includes('booking')) {
          await sendWhatsAppTemplate(from, 'inquiry_auto_response', [
            'Propriedade',
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/buscar`,
          ]);
        } else {
          await sendWhatsAppMessage(
            from,
            'Olá! Recebemos sua mensagem. Nossa equipe responderá em até 5 minutos. 😊'
          );
        }
      }
    }

    // Messenger + Instagram (unificado)
    if (body.object === 'page' && body.entry?.[0]?.messaging?.[0]) {
      const event = body.entry[0].messaging[0];
      const senderId = event.sender.id;
      const text = event.message?.text || '';
      const platform = event.platform || 'messenger';

      // Salvar no DB
      try {
        const userQuery = `
          SELECT id FROM users WHERE facebook_id = $1 OR instagram_id = $1 LIMIT 1
        `;
        const userResult = await pool.query(userQuery, [senderId]);
        const userId = userResult.rows[0]?.id || null;

        await pool.query(
          `INSERT INTO messages (from_user_id, to_user_id, message, platform, created_at)
           VALUES ($1, 1, $2, $3, CURRENT_TIMESTAMP)
           ON CONFLICT DO NOTHING`,
          [userId || 1, text, platform]
        );
      } catch (dbError) {
        console.error('Erro ao salvar mensagem no DB:', dbError);
      }

      // Resposta automática
      if (text.toLowerCase().includes('reserva') || text.toLowerCase().includes('booking')) {
        if (platform === 'instagram') {
          await sendInstagramMessage(
            senderId,
            'Sua reserva está confirmada! Veja detalhes em nosso site.'
          );
        } else {
          await sendMessengerMessage(
            senderId,
            'Sua reserva está confirmada! Veja detalhes em nosso site.'
          );
        }
      } else {
        if (platform === 'instagram') {
          await sendInstagramMessage(senderId, 'Olá! Estamos analisando sua mensagem.');
        } else {
          await sendMessengerMessage(senderId, 'Olá! Estamos analisando sua mensagem.');
        }
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (error) {
    console.error('Erro no Webhook Meta:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

