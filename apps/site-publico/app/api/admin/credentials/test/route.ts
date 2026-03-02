import { NextRequest, NextResponse } from 'next/server';
import { testCredential } from '@/lib/credentials-service';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const service = searchParams.get('service');

    if (!service) {
      return NextResponse.json(
        { success: false, message: 'Serviço não especificado' },
        { status: 400 }
      );
    }

    const result = await testCredential(service);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro ao testar credencial:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Erro ao testar credencial' },
      { status: 500 }
    );
  }
}

