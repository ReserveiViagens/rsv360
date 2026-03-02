/**
 * ✅ API DE PERFORMANCE ANALYTICS
 * 
 * Endpoint para receber métricas de performance do cliente
 */

import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics, apiStats, timestamp, userAgent, url } = body;

    // Validar dados
    if (!metrics || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Salvar métricas no banco (se tiver tabela)
    try {
      await queryDatabase(
        `INSERT INTO performance_metrics (
          page_load, fcp, lcp, tti, tbt, cls, fid,
          memory_used, memory_total, memory_limit,
          api_stats, user_agent, url, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          metrics.pageLoad || 0,
          metrics.firstContentfulPaint || 0,
          metrics.largestContentfulPaint || 0,
          metrics.timeToInteractive || 0,
          metrics.totalBlockingTime || 0,
          metrics.cumulativeLayoutShift || 0,
          metrics.firstInputDelay || 0,
          metrics.memoryUsage?.usedJSHeapSize || 0,
          metrics.memoryUsage?.totalJSHeapSize || 0,
          metrics.memoryUsage?.jsHeapSizeLimit || 0,
          JSON.stringify(apiStats || {}),
          userAgent || '',
          url || '',
          timestamp || new Date().toISOString(),
        ]
      );
    } catch (error) {
      // Tabela pode não existir, apenas logar
      console.warn('Performance metrics table not found, skipping database save');
    }

    // Log para análise
    console.log('Performance metrics received:', {
      pageLoad: metrics.pageLoad,
      lcp: metrics.largestContentfulPaint,
      fid: metrics.firstInputDelay,
      cls: metrics.cumulativeLayoutShift,
    });

    return NextResponse.json({
      success: true,
      message: 'Métricas recebidas com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao processar métricas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar métricas' },
      { status: 500 }
    );
  }
}

// GET: Obter estatísticas de performance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    try {
      const stats = await queryDatabase(
        `SELECT 
          AVG(page_load) as avg_page_load,
          AVG(fcp) as avg_fcp,
          AVG(lcp) as avg_lcp,
          AVG(tti) as avg_tti,
          AVG(tbt) as avg_tbt,
          AVG(cls) as avg_cls,
          AVG(fid) as avg_fid,
          COUNT(*) as total_samples
        FROM performance_metrics
        WHERE created_at >= NOW() - INTERVAL '${days} days'`
      );

      return NextResponse.json({
        success: true,
        data: stats[0] || {},
      });
    } catch (error) {
      // Tabela pode não existir
      return NextResponse.json({
        success: true,
        data: {},
        message: 'Performance metrics table not found',
      });
    }
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao obter estatísticas' },
      { status: 500 }
    );
  }
}

