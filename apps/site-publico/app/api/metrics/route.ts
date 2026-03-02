/**
 * 📊 ENDPOINT DE MÉTRICAS PROMETHEUS
 * 
 * Expõe métricas no formato Prometheus para coleta
 * Endpoint: GET /api/metrics
 * 
 * Nota: Em produção, considere adicionar autenticação básica
 * ou restringir acesso apenas para o Prometheus
 */

import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/lib/metrics';

/**
 * GET /api/metrics
 * Retorna métricas no formato Prometheus
 */
export async function GET(request: NextRequest) {
  try {
    // Coletar todas as métricas
    const metrics = await getMetrics();

    // Retornar no formato Prometheus
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ Erro ao coletar métricas:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao coletar métricas',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Configurar para não cachear
export const dynamic = 'force-dynamic';
export const revalidate = 0;

