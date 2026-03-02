/**
 * ✅ API: DOCUMENTAÇÃO SWAGGER
 * GET /api/docs - Retorna documentação OpenAPI/Swagger
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carregar swagger config
let swaggerDefinition: any = {
  openapi: '3.0.0',
  info: {
    title: 'RSV Gen 2 API',
    version: '2.0.0',
  },
};

try {
  const swaggerPath = join(process.cwd(), 'swagger.config.js');
  const swaggerModule = require(swaggerPath);
  swaggerDefinition = swaggerModule.default || swaggerModule || swaggerDefinition;
} catch (error) {
  // Fallback se o arquivo não existir
  console.warn('Swagger config não encontrado, usando configuração padrão');
}

export async function GET() {
  try {
    // Em produção, carregar de arquivo JSON ou gerar dinamicamente
    const swaggerDoc = {
      ...swaggerDefinition,
      // Adicionar paths dinamicamente se necessário
    };

    return NextResponse.json(swaggerDoc, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar documentação Swagger:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar documentação' },
      { status: 500 }
    );
  }
}
