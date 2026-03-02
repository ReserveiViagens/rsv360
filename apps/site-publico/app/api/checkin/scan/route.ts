/**
 * API Route: Escanear QR Code
 * POST /api/checkin/scan
 * Usado por staff/proprietários para escanear QR codes de check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { ScanQRCodeSchema } from '@/lib/schemas/checkin-schemas';
import { scanQRCode } from '@/lib/checkin-service';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Autenticação (apenas staff/admin podem escanear)
    const authResult = await advancedAuthMiddleware(request);
    if (!authResult.user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é staff ou admin
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'staff') {
      return NextResponse.json(
        { error: 'Apenas staff e administradores podem escanear QR codes' },
        { status: 403 }
      );
    }

    // Validar body
    const body = await request.json();
    const validationResult = ScanQRCodeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { code } = validationResult.data;

    // Escanear QR code
    const scanResult = await scanQRCode(code);

    // Buscar informações adicionais
    const booking = await queryDatabase(
      `SELECT * FROM bookings WHERE id = $1`,
      [scanResult.checkin.booking_id]
    );

    const property = await queryDatabase(
      `SELECT * FROM properties WHERE id = $1`,
      [scanResult.checkin.property_id]
    );

    const user = await queryDatabase(
      `SELECT id, name, email, phone FROM users WHERE id = $1`,
      [scanResult.checkin.user_id]
    );

    // Buscar documentos
    const documents = await queryDatabase(
      `SELECT * FROM checkin_documents WHERE checkin_id = $1 ORDER BY created_at DESC`,
      [scanResult.checkin.id]
    );

    // Buscar códigos de acesso
    const accessCodes = await queryDatabase(
      `SELECT * FROM checkin_access_codes WHERE checkin_id = $1 AND used = false ORDER BY created_at DESC`,
      [scanResult.checkin.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        checkin: scanResult.checkin,
        type: scanResult.type,
        booking: booking[0] || null,
        property: property[0] || null,
        user: user[0] || null,
        documents,
        access_codes: accessCodes
      }
    });

  } catch (error) {
    console.error('Erro ao escanear QR code:', error);
    
    if (error instanceof Error) {
      if (error.message === 'QR code inválido') {
        return NextResponse.json(
          { error: 'QR code inválido ou não reconhecido' },
          { status: 400 }
        );
      }
      
      if (error.message === 'Check-in não encontrado') {
        return NextResponse.json(
          { error: 'Check-in não encontrado' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Erro ao escanear QR code',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

