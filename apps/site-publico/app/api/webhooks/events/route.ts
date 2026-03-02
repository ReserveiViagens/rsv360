/**
 * ✅ API ROUTE: Listar Eventos Disponíveis
 */

import { NextRequest, NextResponse } from 'next/server';
import { WEBHOOK_EVENTS } from '@/lib/webhook-service';

/**
 * GET /api/webhooks/events
 * Listar todos os eventos disponíveis para webhooks
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      events: Object.values(WEBHOOK_EVENTS),
      categories: {
        bookings: [
          WEBHOOK_EVENTS.BOOKING_CREATED,
          WEBHOOK_EVENTS.BOOKING_CONFIRMED,
          WEBHOOK_EVENTS.BOOKING_CANCELLED,
          WEBHOOK_EVENTS.BOOKING_COMPLETED
        ],
        payments: [
          WEBHOOK_EVENTS.PAYMENT_PENDING,
          WEBHOOK_EVENTS.PAYMENT_COMPLETED,
          WEBHOOK_EVENTS.PAYMENT_FAILED,
          WEBHOOK_EVENTS.PAYMENT_REFUNDED
        ],
        insurance: [
          WEBHOOK_EVENTS.INSURANCE_POLICY_CREATED,
          WEBHOOK_EVENTS.INSURANCE_CLAIM_SUBMITTED,
          WEBHOOK_EVENTS.INSURANCE_CLAIM_APPROVED,
          WEBHOOK_EVENTS.INSURANCE_CLAIM_REJECTED
        ],
        verification: [
          WEBHOOK_EVENTS.VERIFICATION_SUBMITTED,
          WEBHOOK_EVENTS.VERIFICATION_APPROVED,
          WEBHOOK_EVENTS.VERIFICATION_REJECTED
        ],
        klarna: [
          WEBHOOK_EVENTS.KLARNA_SESSION_CREATED,
          WEBHOOK_EVENTS.KLARNA_PAYMENT_AUTHORIZED,
          WEBHOOK_EVENTS.KLARNA_PAYMENT_CAPTURED
        ],
        kakau: [
          WEBHOOK_EVENTS.KAKAU_POLICY_CREATED,
          WEBHOOK_EVENTS.KAKAU_CLAIM_SUBMITTED,
          WEBHOOK_EVENTS.KAKAU_CLAIM_APPROVED
        ]
      }
    }
  });
}

