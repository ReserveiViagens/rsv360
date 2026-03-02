/**
 * 📊 MIDDLEWARE DE MÉTRICAS HTTP
 * 
 * Helper para registrar métricas HTTP automaticamente
 * Pode ser usado em rotas de API ou integrado ao middleware do Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { recordHttpRequest } from '@/lib/metrics';

/**
 * Rotas que devem ser excluídas da coleta de métricas
 */
const EXCLUDED_ROUTES = [
  '/api/health',
  '/api/metrics',
  '/_next',
  '/favicon.ico',
  '/api/webhook', // Webhooks podem ser muito frequentes
];

/**
 * Verifica se uma rota deve ser excluída da coleta de métricas
 */
function shouldExcludeRoute(pathname: string): boolean {
  return EXCLUDED_ROUTES.some(route => pathname.startsWith(route));
}

/**
 * Normaliza o pathname para agrupar rotas dinâmicas
 * Ex: /api/bookings/123 -> /api/bookings/:id
 */
function normalizeRoute(pathname: string): string {
  // Normalizar rotas de API com IDs
  const apiRoutes = [
    { pattern: /^\/api\/bookings\/\d+/, replacement: '/api/bookings/:id' },
    { pattern: /^\/api\/tickets\/\d+/, replacement: '/api/tickets/:id' },
    { pattern: /^\/api\/checkin\/\d+/, replacement: '/api/checkin/:id' },
    { pattern: /^\/api\/properties\/\d+/, replacement: '/api/properties/:id' },
    { pattern: /^\/api\/users\/\d+/, replacement: '/api/users/:id' },
  ];

  for (const { pattern, replacement } of apiRoutes) {
    if (pattern.test(pathname)) {
      return replacement;
    }
  }

  return pathname;
}

/**
 * Wrapper para rotas de API que registra métricas automaticamente
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withMetrics(request, async () => {
 *     // Sua lógica aqui
 *     return NextResponse.json({ data: '...' });
 *   });
 * }
 * ```
 */
export async function withMetrics(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const method = request.method;
  const pathname = request.nextUrl.pathname;

  // Excluir rotas específicas
  if (shouldExcludeRoute(pathname)) {
    return handler();
  }

  try {
    // Executar handler
    const response = await handler();

    // Calcular duração
    const durationSeconds = (Date.now() - startTime) / 1000;
    const statusCode = response.status;
    const normalizedRoute = normalizeRoute(pathname);

    // Registrar métricas
    recordHttpRequest(method, normalizedRoute, statusCode, durationSeconds);

    return response;
  } catch (error) {
    // Em caso de erro, registrar com status 500
    const durationSeconds = (Date.now() - startTime) / 1000;
    const normalizedRoute = normalizeRoute(pathname);

    recordHttpRequest(method, normalizedRoute, 500, durationSeconds);

    throw error;
  }
}

/**
 * Middleware para Next.js que registra métricas HTTP
 * Integre isso ao middleware.ts existente
 */
export function metricsMiddleware(
  request: NextRequest,
  response: NextResponse
): NextResponse {
  const pathname = request.nextUrl.pathname;

  // Excluir rotas específicas
  if (shouldExcludeRoute(pathname)) {
    return response;
  }

  // Adicionar header com tempo de resposta (se disponível)
  const responseTime = response.headers.get('X-Response-Time');
  if (!responseTime) {
    // Se não houver header, tentar calcular (limitado no middleware)
    // Nota: No middleware do Next.js, não temos acesso ao tempo de processamento
    // As métricas serão registradas nas rotas usando withMetrics
  }

  return response;
}

/**
 * Helper para registrar métricas manualmente
 * Use quando não puder usar withMetrics
 */
export function recordMetrics(
  method: string,
  route: string,
  statusCode: number,
  durationSeconds: number
): void {
  if (shouldExcludeRoute(route)) {
    return;
  }

  const normalizedRoute = normalizeRoute(route);
  recordHttpRequest(method, normalizedRoute, statusCode, durationSeconds);
}

