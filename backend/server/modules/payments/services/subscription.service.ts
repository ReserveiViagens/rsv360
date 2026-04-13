import { eq } from 'drizzle-orm';
const { db } = require('../../../../src/db/drizzle');
const { subscriptions, subscriptionPlans } = require('../../../../src/db/schema');
import { getSubscriptionProvider } from '../factory';
import { CreatePlanDTO, PlanResult, CreateSubscriptionDTO, SubscriptionResult } from '../interfaces';

export class SubscriptionService {
  private provider = getSubscriptionProvider();

  async createPlan(enterpriseId: string, data: CreatePlanDTO): Promise<PlanResult> {
    const result = await this.provider.createPlan(data);

    await db.insert(subscriptionPlans).values({
      enterpriseId,
      name: data.name,
      description: data.description,
      amount: data.amount.toString(),
      currency: data.currency,
      interval: data.interval as any,
      intervalCount: data.intervalCount,
      trialDays: data.trialDays,
      features: data.features,
      stripeProductId: result.externalId, // Adjust based on provider
      metadata: data.metadata,
    });

    return result;
  }

  async updatePlan(id: string, data: any): Promise<PlanResult> {
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id)).limit(1);

    if (!plan.length) throw new Error('Plan not found');

    const result = await this.provider.updatePlan(plan[0].stripeProductId || plan[0].mpPlanId!, data);

    await db.update(subscriptionPlans)
      .set(data)
      .where(eq(subscriptionPlans.id, id));

    return result;
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, id)).limit(1);

    if (!plan.length) throw new Error('Plan not found');

    await this.provider.deletePlan(plan[0].stripeProductId || plan[0].mpPlanId!);
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id));
  }

  async listPlans(enterpriseId: string): Promise<PlanResult[]> {
    const results = await db.select().from(subscriptionPlans)
      .where(eq(subscriptionPlans.enterpriseId, enterpriseId));

    return results.map(p => ({
      id: p.id,
      externalId: p.stripeProductId || p.mpPlanId || p.id,
      name: p.name,
      amount: parseFloat(p.amount),
      currency: p.currency,
      interval: p.interval,
      metadata: p.metadata as any,
    }));
  }

  async createSubscription(enterpriseId: string, data: CreateSubscriptionDTO): Promise<SubscriptionResult> {
    const result = await this.provider.createSubscription(data);

    await db.insert(subscriptions).values({
      enterpriseId,
      customerId: data.customerId,
      planId: data.planId,
      provider: this.provider.name as any,
      externalId: result.externalId,
      status: result.status as any,
      currentPeriodStart: result.currentPeriodStart,
      currentPeriodEnd: result.currentPeriodEnd,
      cancelAtPeriodEnd: result.cancelAtPeriodEnd,
      trialEnd: result.trialEnd,
      metadata: data.metadata,
    });

    return result;
  }

  async cancelSubscription(id: string, atPeriodEnd = false): Promise<SubscriptionResult> {
    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, id)).limit(1);

    if (!subscription.length) throw new Error('Subscription not found');

    const result = await this.provider.cancelSubscription(subscription[0].externalId!, atPeriodEnd);

    await db.update(subscriptions)
      .set({
        status: result.status as any,
        cancelAtPeriodEnd: result.cancelAtPeriodEnd,
        updatedAt: new Date()
      })
      .where(eq(subscriptions.id, id));

    return result;
  }

  async pauseSubscription(id: string): Promise<SubscriptionResult> {
    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, id)).limit(1);

    if (!subscription.length) throw new Error('Subscription not found');

    const result = await this.provider.pauseSubscription(subscription[0].externalId!);

    await db.update(subscriptions)
      .set({ status: 'paused' as any, updatedAt: new Date() })
      .where(eq(subscriptions.id, id));

    return result;
  }

  async resumeSubscription(id: string): Promise<SubscriptionResult> {
    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, id)).limit(1);

    if (!subscription.length) throw new Error('Subscription not found');

    const result = await this.provider.resumeSubscription(subscription[0].externalId!);

    await db.update(subscriptions)
      .set({ status: result.status as any, updatedAt: new Date() })
      .where(eq(subscriptions.id, id));

    return result;
  }

  async getSubscription(id: string): Promise<SubscriptionResult | null> {
    const result = await db.select().from(subscriptions)
      .where(eq(subscriptions.id, id)).limit(1);

    if (!result.length) return null;

    return {
      id: result[0].id,
      externalId: result[0].externalId!,
      status: result[0].status,
      currentPeriodStart: result[0].currentPeriodStart!,
      currentPeriodEnd: result[0].currentPeriodEnd!,
      cancelAtPeriodEnd: result[0].cancelAtPeriodEnd!,
      trialEnd: result[0].trialEnd || undefined,
      metadata: result[0].metadata as any,
    };
  }

  async listSubscriptions(enterpriseId: string): Promise<SubscriptionResult[]> {
    const results = await db.select().from(subscriptions)
      .where(eq(subscriptions.enterpriseId, enterpriseId));

    return results.map(s => ({
      id: s.id,
      externalId: s.externalId!,
      status: s.status,
      currentPeriodStart: s.currentPeriodStart!,
      currentPeriodEnd: s.currentPeriodEnd!,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd!,
      trialEnd: s.trialEnd || undefined,
      metadata: s.metadata as any,
    }));
  }

  async changePlan(id: string, newPlanId: string): Promise<SubscriptionResult> {
    // Implementation for changing plan
    const subscription = await this.getSubscription(id);
    if (!subscription) throw new Error('Subscription not found');

    // Cancel current and create new
    await this.cancelSubscription(id);
    const newSubscription = await this.createSubscription('', {
      customerId: '', // Get from subscription
      planId: newPlanId,
    });

    return newSubscription;
  }

  async getSubscriptionStats(enterpriseId: string): Promise<any> {
    const stats = await db.select({
      totalSubscriptions: db.$count(subscriptions.id),
      activeSubscriptions: db.$count(subscriptions.id).where(eq(subscriptions.status, 'active')),
    }).from(subscriptions).where(eq(subscriptions.enterpriseId, enterpriseId));

    return stats[0];
  }
}