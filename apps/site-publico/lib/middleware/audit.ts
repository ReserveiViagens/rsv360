/**
 * Middleware de Auditoria
 * Captura automaticamente ações para logs de auditoria
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditService } from '../audit-service';

export interface AuditContext {
  userId?: number;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Middleware de auditoria para Next.js API routes
 */
export async function auditMiddleware(
  request: NextRequest,
  response: NextResponse,
  context: AuditContext,
  action: string,
  resource: string,
  resourceId?: string | number
): Promise<void> {
  try {
    const startTime = Date.now();
    const duration = Date.now() - startTime;

    // Extrair informações da requisição
    const method = request.method;
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const statusCode = response.status;

    // Determinar severidade baseado no status code
    let severity: 'info' | 'warning' | 'error' | 'critical' = 'info';
    if (statusCode >= 500) {
      severity = 'critical';
    } else if (statusCode >= 400) {
      severity = 'error';
    } else if (statusCode >= 300) {
      severity = 'warning';
    }

    // Registrar log (assíncrono, não bloqueia a resposta)
    auditService.log({
      userId: context.userId,
      userEmail: context.userEmail,
      action,
      resource,
      resourceId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      method,
      endpoint,
      statusCode,
      severity,
      timestamp: new Date(),
      duration,
    }).catch(error => {
      console.error('Erro ao registrar log de auditoria:', error);
    });
  } catch (error) {
    // Não falhar a requisição se houver erro no log
    console.error('Erro no middleware de auditoria:', error);
  }
}

/**
 * Helper para extrair contexto de auditoria de uma requisição
 */
export function extractAuditContext(request: NextRequest, user?: { id?: number; email?: string }): AuditContext {
  const ipAddress = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   request.ip || 
                   'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  return {
    userId: user?.id,
    userEmail: user?.email,
    ipAddress,
    userAgent,
  };
}

/**
 * Helper para determinar ação baseado no método HTTP
 */
export function getActionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'read';
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'unknown';
  }
}

/**
 * Helper para determinar recurso baseado no endpoint
 */
export function getResourceFromEndpoint(endpoint: string): string {
  // Extrair recurso do endpoint (ex: /api/bookings/123 -> bookings)
  const parts = endpoint.split('/').filter(p => p && p !== 'api');
  return parts[0] || 'unknown';
}

