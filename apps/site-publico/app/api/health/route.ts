/**
 * ✅ HEALTH CHECK ENDPOINT
 * Endpoint para verificar saúde da aplicação
 */

import { NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';

export async function GET() {
  try {
    // Verificar conexão com banco de dados
    await queryDatabase('SELECT 1');
    
    // Verificar Redis (se configurado)
    let redisStatus = 'unknown';
    try {
      const { createClient } = await import('redis');
      const redis = createClient({ url: process.env.REDIS_URL });
      await redis.connect();
      await redis.ping();
      await redis.disconnect();
      redisStatus = 'connected';
    } catch (error) {
      redisStatus = 'disconnected';
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisStatus,
      },
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}
