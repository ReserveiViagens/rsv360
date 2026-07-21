/**
 * GET /api/analytics/properties/[id] — resumo e reservas da propriedade
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketingLabAuth } from '@/lib/marketing-lab-auth';
import {
import { jsonInternalError } from '@/lib/api-error';
  fetchBookingBreakdown,
  fetchPropertySummary,
} from '@/lib/analytics-booking-breakdown';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await marketingLabAuth(request);

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: error || 'Não autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const propertyId = parseInt(id, 10);

    if (Number.isNaN(propertyId) || propertyId <= 0) {
      return NextResponse.json(
        { success: false, error: 'ID de propriedade inválido' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || undefined;
    const endDate = searchParams.get('end_date') || undefined;

    const [summary, bookings] = await Promise.all([
      fetchPropertySummary(propertyId, startDate, endDate),
      fetchBookingBreakdown({
        propertyId,
        startDate,
        endDate,
        limit: 100,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        property_id: propertyId,
        property_name: summary?.property_name || bookings[0]?.item_name || `Propriedade #${propertyId}`,
        summary: summary
          ? {
              bookings: parseInt(String(summary.bookings || '0'), 10),
              revenue: parseFloat(String(summary.revenue || '0')),
              avg_booking_value: parseFloat(String(summary.avg_booking_value || '0')),
            }
          : {
              bookings: bookings.length,
              revenue: bookings.reduce((s, b) => s + b.total_amount, 0),
              avg_booking_value:
                bookings.length > 0
                  ? bookings.reduce((s, b) => s + b.total_amount, 0) / bookings.length
                  : 0,
            },
        bookings,
      },
    });
  } catch (err: unknown) {
    return jsonInternalError(err);
  }
}
