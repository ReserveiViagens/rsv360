import { db } from '../../../../backend/src/db/drizzle';
import { pricingAlerts, pricingCompetitors, pricingOtaRates } from '../db/schema';
import { Alert, AlertTrigger } from '../types';
import { eq, and, gte, lte, desc } from 'drizzle-orm';

export class AlertsService {
  async createAlert(alertData: {
    competitorId: string;
    alertType: 'price_drop' | 'price_increase' | 'availability_change' | 'rate_parity_threshold';
    threshold: number;
    condition: 'above' | 'below' | 'equals' | 'percentage_change';
    isActive: boolean;
    notificationChannels: string[];
    metadata?: Record<string, any>;
  }): Promise<Alert> {
    const result = await db
      .insert(pricingAlerts)
      .values({
        ...alertData,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    return result[0];
  }

  async getAlertById(alertId: string): Promise<Alert | null> {
    const result = await db
      .select()
      .from(pricingAlerts)
      .where(eq(pricingAlerts.id, alertId))
      .limit(1);

    return result[0] || null;
  }

  async listAlerts(competitorId?: string, activeOnly: boolean = false): Promise<Alert[]> {
    let query = db.select().from(pricingAlerts);

    if (competitorId) {
      query = query.where(eq(pricingAlerts.competitorId, competitorId));
    }

    if (activeOnly) {
      query = query.where(eq(pricingAlerts.isActive, true));
    }

    return await query.orderBy(desc(pricingAlerts.createdAt));
  }

  async updateAlert(alertId: string, updates: Partial<{
    threshold: number;
    condition: 'above' | 'below' | 'equals' | 'percentage_change';
    isActive: boolean;
    notificationChannels: string[];
    metadata: Record<string, any>;
  }>): Promise<Alert | null> {
    const result = await db
      .update(pricingAlerts)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(pricingAlerts.id, alertId))
      .returning();

    return result[0] || null;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const result = await db
      .delete(pricingAlerts)
      .where(eq(pricingAlerts.id, alertId));

    return result.rowCount > 0;
  }

  async checkPriceDropAlerts(competitorId: string, currentPrice: number, previousPrice: number): Promise<AlertTrigger[]> {
    const alerts = await db
      .select()
      .from(pricingAlerts)
      .where(
        and(
          eq(pricingAlerts.competitorId, competitorId),
          eq(pricingAlerts.alertType, 'price_drop'),
          eq(pricingAlerts.isActive, true)
        )
      );

    const triggers: AlertTrigger[] = [];

    for (const alert of alerts) {
      let shouldTrigger = false;
      const priceDrop = ((previousPrice - currentPrice) / previousPrice) * 100;

      switch (alert.condition) {
        case 'below':
          shouldTrigger = currentPrice < alert.threshold;
          break;
        case 'percentage_change':
          shouldTrigger = priceDrop >= alert.threshold;
          break;
        case 'equals':
          shouldTrigger = currentPrice === alert.threshold;
          break;
      }

      if (shouldTrigger) {
        triggers.push({
          alertId: alert.id,
          competitorId,
          alertType: 'price_drop',
          triggerValue: currentPrice,
          previousValue: previousPrice,
          threshold: alert.threshold,
          condition: alert.condition,
          triggeredAt: new Date(),
          metadata: {
            priceDropPercentage: priceDrop,
            ...alert.metadata
          }
        });
      }
    }

    return triggers;
  }

  async checkPriceIncreaseAlerts(competitorId: string, currentPrice: number, previousPrice: number): Promise<AlertTrigger[]> {
    const alerts = await db
      .select()
      .from(pricingAlerts)
      .where(
        and(
          eq(pricingAlerts.competitorId, competitorId),
          eq(pricingAlerts.alertType, 'price_increase'),
          eq(pricingAlerts.isActive, true)
        )
      );

    const triggers: AlertTrigger[] = [];

    for (const alert of alerts) {
      let shouldTrigger = false;
      const priceIncrease = ((currentPrice - previousPrice) / previousPrice) * 100;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = currentPrice > alert.threshold;
          break;
        case 'percentage_change':
          shouldTrigger = priceIncrease >= alert.threshold;
          break;
        case 'equals':
          shouldTrigger = currentPrice === alert.threshold;
          break;
      }

      if (shouldTrigger) {
        triggers.push({
          alertId: alert.id,
          competitorId,
          alertType: 'price_increase',
          triggerValue: currentPrice,
          previousValue: previousPrice,
          threshold: alert.threshold,
          condition: alert.condition,
          triggeredAt: new Date(),
          metadata: {
            priceIncreasePercentage: priceIncrease,
            ...alert.metadata
          }
        });
      }
    }

    return triggers;
  }

  async checkAvailabilityAlerts(competitorId: string, currentAvailability: boolean, previousAvailability: boolean): Promise<AlertTrigger[]> {
    if (currentAvailability === previousAvailability) {
      return [];
    }

    const alerts = await db
      .select()
      .from(pricingAlerts)
      .where(
        and(
          eq(pricingAlerts.competitorId, competitorId),
          eq(pricingAlerts.alertType, 'availability_change'),
          eq(pricingAlerts.isActive, true)
        )
      );

    const triggers: AlertTrigger[] = [];

    for (const alert of alerts) {
      let shouldTrigger = false;

      switch (alert.condition) {
        case 'equals':
          shouldTrigger = currentAvailability === (alert.threshold === 1);
          break;
        case 'below':
          shouldTrigger = !currentAvailability && alert.threshold === 0;
          break;
        case 'above':
          shouldTrigger = currentAvailability && alert.threshold === 1;
          break;
      }

      if (shouldTrigger) {
        triggers.push({
          alertId: alert.id,
          competitorId,
          alertType: 'availability_change',
          triggerValue: currentAvailability ? 1 : 0,
          previousValue: previousAvailability ? 1 : 0,
          threshold: alert.threshold,
          condition: alert.condition,
          triggeredAt: new Date(),
          metadata: {
            availabilityChanged: true,
            fromAvailable: previousAvailability,
            toAvailable: currentAvailability,
            ...alert.metadata
          }
        });
      }
    }

    return triggers;
  }

  async checkRateParityAlerts(competitorId: string, competitorPrice: number, ourPrice: number): Promise<AlertTrigger[]> {
    const alerts = await db
      .select()
      .from(pricingAlerts)
      .where(
        and(
          eq(pricingAlerts.competitorId, competitorId),
          eq(pricingAlerts.alertType, 'rate_parity_threshold'),
          eq(pricingAlerts.isActive, true)
        )
      );

    const triggers: AlertTrigger[] = [];
    const priceDifference = ((competitorPrice - ourPrice) / ourPrice) * 100;

    for (const alert of alerts) {
      let shouldTrigger = false;

      switch (alert.condition) {
        case 'above':
          shouldTrigger = priceDifference > alert.threshold;
          break;
        case 'below':
          shouldTrigger = priceDifference < -alert.threshold;
          break;
        case 'percentage_change':
          shouldTrigger = Math.abs(priceDifference) >= alert.threshold;
          break;
      }

      if (shouldTrigger) {
        triggers.push({
          alertId: alert.id,
          competitorId,
          alertType: 'rate_parity_threshold',
          triggerValue: competitorPrice,
          previousValue: ourPrice,
          threshold: alert.threshold,
          condition: alert.condition,
          triggeredAt: new Date(),
          metadata: {
            priceDifference,
            competitorPrice,
            ourPrice,
            parityStatus: priceDifference > 0 ? 'competitor_higher' : 'we_higher',
            ...alert.metadata
          }
        });
      }
    }

    return triggers;
  }

  async processAllAlertsForCompetitor(
    competitorId: string,
    currentData: {
      price: number;
      availability: boolean;
      ourPrice?: number;
    },
    previousData?: {
      price: number;
      availability: boolean;
    }
  ): Promise<{
    priceDropTriggers: AlertTrigger[];
    priceIncreaseTriggers: AlertTrigger[];
    availabilityTriggers: AlertTrigger[];
    rateParityTriggers: AlertTrigger[];
  }> {
    const results = {
      priceDropTriggers: [] as AlertTrigger[],
      priceIncreaseTriggers: [] as AlertTrigger[],
      availabilityTriggers: [] as AlertTrigger[],
      rateParityTriggers: [] as AlertTrigger[]
    };

    if (previousData) {
      // Check price change alerts
      if (currentData.price < previousData.price) {
        results.priceDropTriggers = await this.checkPriceDropAlerts(
          competitorId,
          currentData.price,
          previousData.price
        );
      } else if (currentData.price > previousData.price) {
        results.priceIncreaseTriggers = await this.checkPriceIncreaseAlerts(
          competitorId,
          currentData.price,
          previousData.price
        );
      }

      // Check availability change alerts
      if (currentData.availability !== previousData.availability) {
        results.availabilityTriggers = await this.checkAvailabilityAlerts(
          competitorId,
          currentData.availability,
          previousData.availability
        );
      }
    }

    // Check rate parity alerts if we have our price
    if (currentData.ourPrice) {
      results.rateParityTriggers = await this.checkRateParityAlerts(
        competitorId,
        currentData.price,
        currentData.ourPrice
      );
    }

    return results;
  }

  async getAlertHistory(alertId: string, limit: number = 50): Promise<any[]> {
    // This would typically query an alert_triggers table
    // For now, return empty array as we don't have the triggers table implemented
    return [];
  }

  async bulkUpdateAlertStatus(alertIds: string[], isActive: boolean): Promise<number> {
    const result = await db
      .update(pricingAlerts)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(
        and(
          ...alertIds.map(id => eq(pricingAlerts.id, id))
        )
      );

    return result.rowCount;
  }
}

export const alertsService = new AlertsService();