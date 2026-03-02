/**
 * API de exportação contábil
 * POST /api/accounting/export
 * Exporta dados financeiros (pagamentos, reservas, reembolsos) em CSV, XML, JSON ou XLSX
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportAccountingData } from '@/lib/accounting-integration';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await advancedAuthMiddleware(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      format = 'csv',
      startDate,
      endDate,
      includePayments = true,
      includeBookings = true,
      includeRefunds = true,
      includeSplitCommissions = false,
      includeDeductions = false,
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Período obrigatório: startDate e endDate' },
        { status: 400 }
      );
    }

    const validFormats = ['csv', 'xml', 'json', 'xlsx'];
    if (!validFormats.includes(format)) {
      return NextResponse.json(
        { success: false, error: `Formato inválido. Use: ${validFormats.join(', ')}` },
        { status: 400 }
      );
    }

    const options = {
      format: format as 'csv' | 'xml' | 'json' | 'xlsx',
      startDate: String(startDate),
      endDate: String(endDate),
      includePayments: Boolean(includePayments),
      includeBookings: Boolean(includeBookings),
      includeRefunds: Boolean(includeRefunds),
      includeSplitCommissions: Boolean(includeSplitCommissions),
      includeDeductions: Boolean(includeDeductions),
    };

    const file = await exportAccountingData(options);

    const extensions: Record<string, string> = {
      csv: 'csv',
      xml: 'xml',
      json: 'json',
      xlsx: 'xlsx',
    };
    const contentTypes: Record<string, string> = {
      csv: 'text/csv',
      xml: 'application/xml',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
    const filename = `exportacao-contabil-${new Date().toISOString().split('T')[0]}.${extensions[format]}`;

    return new NextResponse(file instanceof Buffer ? file : Buffer.from(String(file)), {
      headers: {
        'Content-Type': contentTypes[format],
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar dados contábeis:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao exportar dados contábeis' },
      { status: 500 }
    );
  }
}
