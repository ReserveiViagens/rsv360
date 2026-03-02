import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { sendEmail } from '@/lib/email';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// GET: Buscar contratos
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM contracts WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (bookingId) {
      query += ` AND booking_id = $${paramCount++}`;
      params.push(parseInt(bookingId));
    }
    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return NextResponse.json({ contracts: result.rows });
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST: Criar contrato
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      booking_id,
      property_id,
      host_id,
      guest_id,
      contract_type = 'rental',
      contract_content,
    } = body;

    // Gerar conteúdo HTML do contrato
    const contractHtml = generateContractHTML(contract_content, {
      booking_id,
      property_id,
      host_id,
      guest_id,
    });

    // Calcular validade (30 dias a partir de hoje)
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30);

    const insertQuery = `
      INSERT INTO contracts (
        booking_id, property_id, host_id, guest_id,
        contract_type, contract_content, contract_html,
        valid_from, valid_until, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
      RETURNING id
    `;

    const result = await pool.query(insertQuery, [
      booking_id,
      property_id,
      host_id,
      guest_id,
      contract_type,
      contract_content,
      contractHtml,
      validFrom,
      validUntil,
    ]);

    const contractId = result.rows[0].id;

    // Enviar email para host e guest
    try {
      const { sendNotification } = await import('@/lib/enhanced-notification-service');
      
      // Buscar informações do host e guest
      const hostQuery = await pool.query('SELECT email, name FROM users WHERE id = $1', [host_id]);
      const guestQuery = await pool.query('SELECT email, name FROM users WHERE id = $1', [guest_id]);
      
      const hostEmail = hostQuery.rows[0]?.email;
      const guestEmail = guestQuery.rows[0]?.email;
      const hostName = hostQuery.rows[0]?.name || 'Host';
      const guestName = guestQuery.rows[0]?.name || 'Guest';

      // Enviar para host
      if (hostEmail) {
        await sendNotification({
          userId: host_id,
          type: ['email'],
          templateId: 'contract_created_host',
          variables: {
            contractId: contractId.toString(),
            guestName,
            contractType: contract_type,
            validUntil: validUntil.toLocaleDateString('pt-BR'),
            contractUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contracts/${contractId}`,
          },
        });
      }

      // Enviar para guest
      if (guestEmail) {
        await sendNotification({
          userId: guest_id,
          type: ['email'],
          templateId: 'contract_created_guest',
          variables: {
            contractId: contractId.toString(),
            hostName,
            contractType: contract_type,
            validUntil: validUntil.toLocaleDateString('pt-BR'),
            contractUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contracts/${contractId}`,
          },
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar emails de contrato:', error);
      // Não falhar o processo se houver erro ao enviar email
    }

    return NextResponse.json({
      contract_id: contractId,
      status: 'created',
    });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Função para gerar HTML do contrato
function generateContractHTML(content: string, metadata: any): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Locação - RSV 360°</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; }
    .signature-section { margin-top: 40px; border-top: 2px solid #e5e7eb; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Contrato de Locação Temporária</h1>
  <p><strong>RSV 360° - Sistema de Reservas</strong></p>
  <hr>
  ${content}
  <div class="signature-section">
    <h3>Assinaturas</h3>
    <p>Este contrato foi gerado eletronicamente pelo sistema RSV 360°.</p>
    <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
</body>
</html>
  `.trim();
}

