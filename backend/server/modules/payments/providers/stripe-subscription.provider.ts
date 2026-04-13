import * as Stripe from 'stripe';
import { SubscriptionProviderInterface, CreatePlanDTO, PlanResult, UpdatePlanDTO, CreateSubscriptionDTO, SubscriptionResult } from '../interfaces';

export class StripeSubscriptionProvider implements SubscriptionProviderInterface {
  name = 'stripe';
  private client: any;

  constructor() {
    this.client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createPlan(data: CreatePlanDTO): Promise<PlanResult> {
    // Create product
    const product = await this.client.products.create({
      name: data.name,
      description: data.description,
      metadata: data.metadata,
    });

    // Create price
    const price = await this.client.prices.create({
      product: product.id,
      unit_amount: Math.round(data.amount * 100),
      currency: data.currency.toLowerCase(),
      recurring: {
        interval: this.mapInterval(data.interval),
        interval_count: data.intervalCount || 1,
      },
      metadata: data.metadata,
    });

    return {
      id: price.id,
      externalId: price.id,
      name: product.name,
      amount: price.unit_amount! / 100,
      currency: price.currency.toUpperCase(),
      interval: this.reverseMapInterval(price.recurring!.interval),
      metadata: price.metadata,
    };
  }

  async updatePlan(externalId: string, data: UpdatePlanDTO): Promise<PlanResult> {
    const price = await this.client.prices.retrieve(externalId);
    const product = await this.client.products.retrieve(price.product as string);

    if (data.name || data.description) {
      await this.client.products.update(product.id, {
        name: data.name || product.name,
        description: data.description || product.description,
        metadata: data.metadata,
      });
    }

    // For price updates, create new price and archive old one
    if (data.amount) {
      const newPrice = await this.client.prices.create({
        product: product.id,
        unit_amount: Math.round(data.amount * 100),
        currency: price.currency,
        recurring: price.recurring,
        metadata: data.metadata,
      });

      await this.client.prices.update(externalId, { active: false });

      return {
        id: newPrice.id,
        externalId: newPrice.id,
        name: product.name!,
        amount: newPrice.unit_amount! / 100,
        currency: newPrice.currency.toUpperCase(),
        interval: this.reverseMapInterval(newPrice.recurring!.interval),
        metadata: newPrice.metadata,
      };
    }

    return {
      id: price.id,
      externalId: price.id,
      name: product.name!,
      amount: price.unit_amount! / 100,
      currency: price.currency.toUpperCase(),
      interval: this.reverseMapInterval(price.recurring!.interval),
      metadata: price.metadata,
    };
  }

  async deletePlan(externalId: string): Promise<void> {
    const price = await this.client.prices.retrieve(externalId);
    await this.client.prices.update(externalId, { active: false });
    await this.client.products.update(price.product as string, { active: false });
  }

  async createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResult> {
    const subscription = await this.client.subscriptions.create({
      customer: data.customerId,
      items: [{ price: data.planId }],
      trial_end: data.trialEnd ? Math.floor(data.trialEnd.getTime() / 1000) : undefined,
      metadata: data.metadata,
    });

    return {
      id: subscription.id,
      externalId: subscription.id,
      status: this.mapSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      metadata: subscription.metadata,
    };
  }

  async cancelSubscription(externalId: string, atPeriodEnd?: boolean): Promise<SubscriptionResult> {
    const subscription = await this.client.subscriptions.update(externalId, {
      cancel_at_period_end: atPeriodEnd,
    });

    if (!atPeriodEnd) {
      await this.client.subscriptions.cancel(externalId);
    }

    return {
      id: subscription.id,
      externalId: subscription.id,
      status: this.mapSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
    };
  }

  async pauseSubscription(externalId: string): Promise<SubscriptionResult> {
    const subscription = await this.client.subscriptions.update(externalId, {
      pause_collection: { behavior: 'mark_uncollectible' },
    });

    return {
      id: subscription.id,
      externalId: subscription.id,
      status: 'paused',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
    };
  }

  async resumeSubscription(externalId: string): Promise<SubscriptionResult> {
    const subscription = await this.client.subscriptions.update(externalId, {
      pause_collection: '',
    });

    return {
      id: subscription.id,
      externalId: subscription.id,
      status: this.mapSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      metadata: subscription.metadata,
    };
  }

  async getSubscription(externalId: string): Promise<SubscriptionResult> {
    const subscription = await this.client.subscriptions.retrieve(externalId);

    return {
      id: subscription.id,
      externalId: subscription.id,
      status: this.mapSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
      metadata: subscription.metadata,
    };
  }

  private mapInterval(interval: string): any {
    switch (interval) {
      case 'daily': return 'day';
      case 'weekly': return 'week';
      case 'monthly': return 'month';
      case 'quarterly': return 'month'; // Stripe doesn't have quarterly, use month with count 3
      case 'semi_annual': return 'month'; // Use month with count 6
      case 'annual': return 'year';
      default: return 'month';
    }
  }

  private reverseMapInterval(interval: string): string {
    switch (interval) {
      case 'day': return 'daily';
      case 'week': return 'weekly';
      case 'month': return 'monthly';
      case 'year': return 'annual';
      default: return 'monthly';
    }
  }

  private mapSubscriptionStatus(status: string): string {
    switch (status) {
      case 'active': return 'active';
      case 'canceled': return 'cancelled';
      case 'incomplete': return 'pending';
      case 'incomplete_expired': return 'expired';
      case 'past_due': return 'past_due';
      case 'trialing': return 'trialing';
      case 'unpaid': return 'unpaid';
      default: return 'pending';
    }
  }
}