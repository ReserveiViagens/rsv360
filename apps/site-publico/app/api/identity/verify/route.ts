import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import axios from 'axios';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'onboarding_rsv_db',
  user: process.env.DB_USER || 'onboarding_rsv',
  password: process.env.DB_PASSWORD || 'senha_segura_123',
});

// POST: Verificar identidade
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, booking_id, selfie_path, document_front_path, document_back_path, provider = 'unico' } = body;

    // Criar registro de verificação
    const insertQuery = `
      INSERT INTO identity_verifications (
        user_id, booking_id, provider, status,
        selfie_path, document_front_path, document_back_path,
        verification_data
      )
      VALUES ($1, $2, $3, 'processing', $4, $5, $6, $7)
      RETURNING id
    `;

    const verificationData = {
      selfie_path,
      document_front_path,
      document_back_path,
      provider,
      submitted_at: new Date().toISOString(),
    };

    const result = await pool.query(insertQuery, [
      user_id,
      booking_id || null,
      provider,
      selfie_path,
      document_front_path,
      document_back_path,
      JSON.stringify(verificationData),
    ]);

    const verificationId = result.rows[0].id;

    // Processar verificação (mock - integre API real)
    let verificationResult: any = null;
    let confidenceScore = 0;

    if (provider === 'unico' && process.env.UNICO_API_KEY) {
      // Integrar API real do Unico
      try {
        const unicoResponse = await axios.post(
          'https://api.unico.io/v1/verify',
          {
            selfie: selfie_path,
            document_front: document_front_path,
            document_back: document_back_path,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.UNICO_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        verificationResult = unicoResponse.data;
        confidenceScore = verificationResult.confidence || verificationResult.score || 0;
      } catch (unicoError: any) {
        console.error('Erro ao verificar com Unico:', unicoError);
        // Fallback para verificação manual
        confidenceScore = 70;
        verificationResult = { status: 'pending_manual_review', confidence: 70, error: unicoError.message };
      }
    } else if (provider === 'idwall' && process.env.IDWALL_API_KEY) {
      // Integrar API real do IDwall
      try {
        const idwallResponse = await axios.post(
          'https://api.idwall.co/v2/face-match',
          {
            selfie: selfie_path,
            document: document_front_path,
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.IDWALL_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        verificationResult = idwallResponse.data;
        confidenceScore = verificationResult.confidence || verificationResult.score || 0;
      } catch (idwallError: any) {
        console.error('Erro ao verificar com IDwall:', idwallError);
        // Fallback para verificação manual
        confidenceScore = 70;
        verificationResult = { status: 'pending_manual_review', confidence: 70, error: idwallError.message };
      }
    } else {
      // Verificação manual (mock)
      confidenceScore = 70;
      verificationResult = { status: 'pending_manual_review', confidence: 70 };
    }

    // Atualizar resultado
    const updateQuery = `
      UPDATE identity_verifications
      SET
        status = $1,
        verification_result = $2,
        confidence_score = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;

    const finalStatus = confidenceScore >= 80 ? 'approved' : 'pending';
    const updateResult = await pool.query(updateQuery, [
      finalStatus,
      JSON.stringify(verificationResult),
      confidenceScore,
      verificationId,
    ]);

    return NextResponse.json({
      verification_id: verificationId,
      status: finalStatus,
      confidence_score: confidenceScore,
      verification: updateResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao verificar identidade:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET: Buscar verificações
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const bookingId = searchParams.get('booking_id');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM identity_verifications WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(parseInt(userId));
    }
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
    return NextResponse.json({ verifications: result.rows });
  } catch (error) {
    console.error('Erro ao buscar verificações:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

