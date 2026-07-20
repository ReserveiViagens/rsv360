import { PreApprovalPlan, PreApproval } from 'mercadopago';
import { SubscriptionProviderInterface, CreatePlanDTO, PlanResult, UpdatePlanDTO, CreateSubscriptionDTO, SubscriptionResult } from '../interfaces';

export class MercadoPagoSubscriptionProvider implements SubscriptionProviderInterface {
  name = 'mercadopago';
  private client: any; // MercadoPagoConfig

  constructor() {
    // Similar to payment provider
    this.client = new (require('mercadopago').MercadoPagoConfig)({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });
  }

  async createPlan(data: CreatePlanDTO): Promise<PlanResult> {
    const plan = new PreApprovalPlan(this.client);
    
    const planData = {
      reason: data.name,
      auto_recurring: {
        frequency: this.mapInterval(data.interval),
        frequency_type: 'months',
        transaction_amount: data.amount,
        currency_id: data.currency,
      },
      back_url: process.env.MP_BACK_URL,
      init_point: process.env.MP_INIT_POINT,
    };

    const result = await plan.create({ body: planData });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      name: result.reason!,
      amount: result.auto_recurring!.transaction_amount!,
      currency: result.auto_recurring!.currency_id!,
      interval: this.reverseMapInterval(result.auto_recurring!.frequency!),
      metadata: {},
    };
  }

  async updatePlan(externalId: string, data: UpdatePlanDTO): Promise<PlanResult> {
    // TODO: Implement proper update logic for Mercado Pago plans
    throw new Error('Plan update not implemented for Mercado Pago provider');
  }

  async deletePlan(externalId: string): Promise<void> {
    // MP doesn't support deleting plans directly
    // Mark as inactive or handle accordingly
  }

  async createSubscription(data: CreateSubscriptionDTO): Promise<SubscriptionResult> {
    const subscription = new PreApproval(this.client);
    
    const subscriptionData = {
      preapproval_plan_id: data.planId,
      payer_email: 'customer@example.com', // Get from customer
      back_url: process.env.MP_BACK_URL,
      reason: 'Subscription',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 0, // Will be set by plan
        currency_id: 'BRL',
      },
    };

    const result = await subscription.create({ body: subscriptionData });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapSubscriptionStatus(result.status),
      currentPeriodStart: new Date(result.date_created!),
      currentPeriodEnd: new Date(result.next_payment_date!),
      cancelAtPeriodEnd: false,
      trialEnd: data.trialEnd,
      metadata: {},
    };
  }

  async cancelSubscription(externalId: string, atPeriodEnd?: boolean): Promise<SubscriptionResult> {
    const subscription = new PreApproval(this.client);
    const result = await subscription.update({
      id: externalId,
      body: { status: atPeriodEnd ? 'paused' : 'cancelled' }
    });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapSubscriptionStatus(result.status),
      currentPeriodStart: new Date(result.date_created!),
      currentPeriodEnd: new Date(result.next_payment_date!),
      cancelAtPeriodEnd: atPeriodEnd || false,
      metadata: {},
    };
  }

  async pauseSubscription(externalId: string): Promise<SubscriptionResult> {
    return this.cancelSubscription(externalId, true);
  }

  async resumeSubscription(externalId: string): Promise<SubscriptionResult> {
    const subscription = new PreApproval(this.client);
    const result = await subscription.update({
      id: externalId,
      body: { status: 'authorized' }
    });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapSubscriptionStatus(result.status),
      currentPeriodStart: new Date(result.date_created!),
      currentPeriodEnd: new Date(result.next_payment_date!),
      cancelAtPeriodEnd: false,
      metadata: {},
    };
  }

  async getSubscription(externalId: string): Promise<SubscriptionResult> {
    const subscription = new PreApproval(this.client);
    const result = await subscription.get({ id: externalId });

    return {
      id: result.id!.toString(),
      externalId: result.id!.toString(),
      status: this.mapSubscriptionStatus(result.status),
      currentPeriodStart: new Date(result.date_created!),
      currentPeriodEnd: new Date(result.next_payment_date!),
      cancelAtPeriodEnd: result.status === 'paused',
      metadata: {},
    };
  }

  private mapInterval(interval: string): number {
    switch (interval) {
      case 'monthly': return 1;
      case 'quarterly': return 3;
      case 'semi_annual': return 6;
      case 'annual': return 12;
      default: return 1;
    }
  }

  private reverseMapInterval(frequency: number): string {
    switch (frequency) {
      case 1: return 'monthly';
      case 3: return 'quarterly';
      case 6: return 'semi_annual';
      case 12: return 'annual';
      default: return 'monthly';
    }
  }

  private mapSubscriptionStatus(status: string | undefined): string {
    switch (status) {
      case 'authorized': return 'active';
      case 'paused': return 'paused';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }
}