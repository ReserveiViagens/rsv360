/**
 * API de Consentimento LGPD/GDPR
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';
import { gdprService } from '@/lib/gdpr-service';

/**
 * POST /api/gdpr/consent
 * Registrar consentimento
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { consent_type, granted } = body;

    if (!consent_type || typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'consent_type e granted são obrigatórios' },
        { status: 400 }
      );
    }

    // Obter política ativa
    const activePolicy = await gdprService.getActivePrivacyPolicy();
    if (!activePolicy) {
      return NextResponse.json(
        { error: 'Política de privacidade não encontrada' },
        { status: 500 }
      );
    }

    // Obter IP e User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Registrar consentimento
    const consent = await gdprService.recordConsent({
      userId: auth.user.id,
      consentType: consent_type,
      granted,
      ipAddress,
      userAgent,
      version: activePolicy.version,
    });

    // Registrar acesso
    await gdprService.logDataAccess(
      auth.user.id,
      'consent',
      'update',
      auth.user.id,
      { consentType: consent_type, granted },
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      data: consent,
    });
  } catch (error: any) {
    console.error('Erro ao registrar consentimento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao registrar consentimento' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/gdpr/consent
 * Obter consentimentos do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const consents = await gdprService.getUserConsents(auth.user.id);

    return NextResponse.json({
      success: true,
      data: consents,
    });
  } catch (error: any) {
    console.error('Erro ao obter consentimentos:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao obter consentimentos' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/gdpr/consent
 * Revogar consentimento
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await advancedAuthMiddleware(request);
    if (!auth.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const consentType = searchParams.get('consent_type');

    if (!consentType) {
      return NextResponse.json(
        { error: 'consent_type é obrigatório' },
        { status: 400 }
      );
    }

    // Obter IP e User-Agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Revogar consentimento
    await gdprService.revokeConsent(
      auth.user.id,
      consentType as any,
      ipAddress,
      userAgent
    );

    return NextResponse.json({
      success: true,
      message: 'Consentimento revogado com sucesso',
    });
  } catch (error: any) {
    console.error('Erro ao revogar consentimento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao revogar consentimento' },
      { status: 500 }
    );
  }
}

