/**
 * ✅ TAREFA MEDIUM-6: API para gerenciar privacidade de localização
 * GET/POST /api/location/privacy
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const groupId = searchParams.get('group_id');

    if (!userId || !groupId) {
      return NextResponse.json(
        { success: false, error: 'user_id e group_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar configurações de privacidade
    const result = await queryDatabase(
      `SELECT 
        privacy_level,
        visible_to,
        auto_stop_after,
        min_accuracy,
        updated_at
      FROM location_privacy_settings
      WHERE user_id = $1 AND group_id = $2`,
      [userId, groupId]
    );

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          privacy_level: 'friends',
          visible_to: [],
          auto_stop_after: null,
          min_accuracy: 50,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error: any) {
    console.error('Erro ao buscar configurações de privacidade:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao buscar configurações' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, group_id, privacy_level, visible_to, auto_stop_after, min_accuracy } = body;

    if (!user_id || !group_id) {
      return NextResponse.json(
        { success: false, error: 'user_id e group_id são obrigatórios' },
        { status: 400 }
      );
    }

    // Salvar ou atualizar configurações
    await queryDatabase(
      `INSERT INTO location_privacy_settings 
       (user_id, group_id, privacy_level, visible_to, auto_stop_after, min_accuracy, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, group_id)
       DO UPDATE SET
         privacy_level = $3,
         visible_to = $4,
         auto_stop_after = $5,
         min_accuracy = $6,
         updated_at = CURRENT_TIMESTAMP`,
      [
        user_id,
        group_id,
        privacy_level || 'friends',
        JSON.stringify(visible_to || []),
        auto_stop_after || null,
        min_accuracy || 50,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Configurações de privacidade atualizadas',
    });
  } catch (error: any) {
    console.error('Erro ao salvar configurações de privacidade:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao salvar configurações' },
      { status: 500 }
    );
  }
}

