import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, html, text } = body;

    // Validação básica
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: to, subject, html' },
        { status: 400 }
      );
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Enviar email
    const success = await sendEmail(to, subject, html, text);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Email enviado com sucesso',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email. Verifique a configuração SMTP.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erro na API de email:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

