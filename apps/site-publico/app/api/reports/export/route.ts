/**
 * ✅ API DE EXPORTAÇÃO DE RELATÓRIOS
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportBookingsReport, exportFinancialReport } from '@/lib/export-reports';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'bookings'; // 'bookings' | 'financial'
    const format = searchParams.get('format') || 'pdf'; // 'pdf' | 'excel' | 'csv'
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;
    const propertyId = searchParams.get('property_id') ? parseInt(searchParams.get('property_id')!) : undefined;

    const options = {
      format: format as 'pdf' | 'excel' | 'csv',
      startDate,
      endDate,
      propertyId,
    };

    let file: Buffer | string;
    let filename: string;
    let contentType: string;

    if (type === 'bookings') {
      file = await exportBookingsReport(options);
      filename = `relatorio-reservas-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf'}`;
    } else if (type === 'financial') {
      file = await exportFinancialReport(options);
      filename = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
    } else {
      return NextResponse.json(
        { success: false, error: 'Tipo de relatório inválido' },
        { status: 400 }
      );
    }

    contentType = format === 'excel' || format === 'csv'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : format === 'csv'
      ? 'text/csv'
      : 'application/pdf';

    return new NextResponse(file instanceof Buffer ? file : Buffer.from(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao exportar relatório:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
