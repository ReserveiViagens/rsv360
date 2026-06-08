/**
 * ✅ API: DOCUMENTAÇÃO SWAGGER
 * GET /api/docs - Retorna documentação OpenAPI/Swagger
 */

import { NextResponse } from 'next/server';
import swaggerDefinition from '../../../swagger.config.js';

export async function GET() {
  try {
    const swaggerDoc = {
      ...(swaggerDefinition as Record<string, unknown>),
    };

    return NextResponse.json(swaggerDoc, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('Erro ao gerar documentação Swagger:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar documentação' },
      { status: 500 }
    );
  }
}
