import { and, eq } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commCampaigns } from '../db/schema';
import { QueueService } from './queue.service';

type BookingData = {
  booking_id?: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  room_type?: string;
  total_amount?: number;
  source?: string;
  [key: string]: any;
};

export class AutomationService {
  static async triggerEvent(enterpriseId: string, eventName: 'booking_created' | 'booking_cancelled', bookingData: BookingData) {
    // Reaproveita campanhas "scheduled" como automações por evento, sem criar migration nova.
    const automations = await db
      .select()
      .from(commCampaigns)
      .where(
        and(
          eq(commCampaigns.enterpriseId, enterpriseId),
          eq(commCampaigns.status, 'scheduled' as any)
        )
      );

    for (const auto of automations) {
      const meta: any = auto.segment || {};
      if (meta.triggerEvent !== eventName) continue;
      if (meta.conditions && !this.matchConditions(meta.conditions, bookingData)) continue;

      const scheduledAt = meta.delayMinutes
        ? new Date(Date.now() + Number(meta.delayMinutes) * 60000)
        : null;

      const recipient = auto.channel === 'email'
        ? bookingData.guest_email
        : bookingData.guest_phone;

      if (!recipient || !auto.templateId) continue;

      await QueueService.enqueueMessage(enterpriseId, {
        channel: auto.channel as any,
        recipient,
        recipientName: bookingData.guest_name,
        templateId: auto.templateId,
        variables: bookingData,
        bookingId: bookingData.booking_id,
        scheduledAt,
      });
    }
  }

  static matchConditions(conditions: any, data: BookingData): boolean {
    if (conditions.room_type && data.room_type !== conditions.room_type) return false;
    if (conditions.amount_min && Number(data.total_amount || 0) < Number(conditions.amount_min)) return false;
    if (conditions.channel_source && data.source !== conditions.channel_source) return false;
    return true;
  }
}
