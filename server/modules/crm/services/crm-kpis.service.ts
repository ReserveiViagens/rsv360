import { crmRepository } from '../db/crm.repository';

export class CrmKpisService {
  async getDashboard(userId: number) {
    const kpis = await crmRepository.getDashboardKPIs(userId);
    return {
      total_guests: kpis.total_guests || 0,
      active_guests: kpis.active_guests || 0,
      new_guests_this_month: kpis.new_guests_month || 0,
      vip_count: kpis.vip_count || 0,
      average_lifetime_value: kpis.avg_ltv || 0,
      loyalty_members: kpis.loyalty_members || 0,
      points_in_circulation: kpis.points_circulation || 0,
      retention_rate: kpis.retention_rate || 0,
      lifecycle_distribution: {
        prospect: kpis.lc_prospect || 0,
        first_stay: kpis.lc_first_stay || 0,
        repeat: kpis.lc_repeat || 0,
        loyal: kpis.lc_loyal || 0,
        advocate: kpis.lc_advocate || 0,
        at_risk: kpis.lc_at_risk || 0,
        lost: kpis.lc_lost || 0,
      },
      tier_distribution: {
        Bronze: kpis.tier_bronze || 0,
        Prata: kpis.tier_prata || 0,
        Ouro: kpis.tier_ouro || 0,
        Diamante: kpis.tier_diamante || 0,
      },
      top_guests: kpis.top_guests || [],
      campaigns_active: kpis.campaigns_active || 0,
      campaigns_sent_this_month: kpis.campaigns_month || 0,
    };
  }
}

export const crmKpisService = new CrmKpisService();
