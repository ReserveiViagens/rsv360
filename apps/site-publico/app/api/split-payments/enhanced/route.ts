import { NextRequest, NextResponse } from 'next/server';
import { createEnhancedSplitPayment, processParticipantPayment, sendPaymentReminders } from '@/lib/enhanced-split-payment';

// POST: Criar split payment avançado
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      bookingId,
      totalAmount,
      splitType,
      participants,
      options,
      createdBy,
    } = body;

    if (!bookingId || !totalAmount || !participants || !splitType) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: bookingId, totalAmount, splitType, participants' },
        { status: 400 }
      );
    }

    const splitPayment = await createEnhancedSplitPayment(
      bookingId,
      totalAmount,
      splitType,
      participants,
      options || {},
      createdBy
    );

    return NextResponse.json({ success: true, data: splitPayment });
  } catch (error: any) {
    console.error('Erro ao criar split payment:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar split payment' },
      { status: 500 }
    );
  }
}

// PUT: Processar pagamento de participante
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { splitPaymentId, participantId, paymentMethod, paymentData } = body;

    if (!splitPaymentId || !participantId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: splitPaymentId, participantId, paymentMethod' },
        { status: 400 }
      );
    }

    const success = await processParticipantPayment(
      splitPaymentId,
      participantId,
      paymentMethod,
      paymentData
    );

    return NextResponse.json({ success, message: success ? 'Pagamento processado' : 'Erro ao processar pagamento' });
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
}

// POST: Enviar lembretes
export async function PATCH(req: NextRequest) {
  try {
    await sendPaymentReminders();
    return NextResponse.json({ success: true, message: 'Lembretes enviados' });
  } catch (error: any) {
    console.error('Erro ao enviar lembretes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar lembretes' },
      { status: 500 }
    );
  }
}

