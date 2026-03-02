/**
 * ✅ ITEM 11: API de Relatórios de Pagamento
 * GET /api/payments/reports
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generatePaymentReport,
  exportPaymentReportToCSV,
  getPaymentAnalytics,
  type PaymentReportFilters,
} from '@/lib/mercadopago-boleto-refund-reports';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // 'json' | 'csv' | 'analytics'
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    const filters: PaymentReportFilters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      paymentMethod: searchParams.get('payment_method') as any,
      paymentStatus: searchParams.get('payment_status') as any,
      bookingId: searchParams.get('booking_id') ? parseInt(searchParams.get('booking_id')!) : undefined,
      customerEmail: searchParams.get('customer_email') || undefined,
    };

    if (format === 'csv') {
      // Exportar para CSV
      const csv = await exportPaymentReportToCSV(filters);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payment-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else if (format === 'analytics') {
      // Analytics detalhado
      if (!startDate || !endDate) {
        return NextResponse.json(
          { success: false, error: 'start_date e end_date são obrigatórios para analytics' },
          { status: 400 }
        );
      }

      const analytics = await getPaymentAnalytics(startDate, endDate);

      return NextResponse.json({
        success: true,
        data: analytics,
      });
    } else {
      // Relatório padrão (JSON)
      const report = await generatePaymentReport(filters);

      return NextResponse.json({
        success: true,
        data: report,
      });
    }
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao gerar relatório' },
      { status: 500 }
    );
  }
}

