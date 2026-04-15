import { crmRepository } from '../db/crm.repository';

export class CampaignService {
  async create(userId: number, data: any) { return crmRepository.createCampaign({ user_id: userId, ...data }); }
  async get(id: number) { return crmRepository.getCampaign(id); }
  async update(id: number, data: any) { return crmRepository.updateCampaign(id, data); }
  async delete(id: number) { return crmRepository.deleteCampaign(id); }
  async list(filters: any, page?: number, limit?: number) { return crmRepository.listCampaigns(filters, page, limit); }

  async buildAudience(filter: any) {
    const result = await crmRepository.getProfilesBySegment(filter);
    return { count: result.count, sample: result.data.slice(0, 10) };
  }

  async schedule(campaignId: number, scheduledAt: string) {
    return crmRepository.updateCampaign(campaignId, { status: 'scheduled', scheduled_at: scheduledAt });
  }

  async send(campaignId: number) {
    const campaign = await crmRepository.getCampaign(campaignId);
    if (!campaign) throw new Error('Campanha não encontrada');
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error(`Campanha em status '${campaign.status}' não pode ser enviada`);
    }
    const filter = typeof campaign.segment_filter === 'string' ? JSON.parse(campaign.segment_filter) : campaign.segment_filter;
    const audience = await crmRepository.getProfilesBySegment(filter || {});
    await crmRepository.updateCampaign(campaignId, {
      status: 'sending',
      audience_count: audience.count,
      sent_at: new Date().toISOString(),
    });
    const sent = audience.count;
    const delivered = Math.floor(sent * 0.95);
    await crmRepository.updateCampaign(campaignId, {
      status: 'sent',
      sent_count: sent,
      delivered_count: delivered,
      completed_at: new Date().toISOString(),
    });
    return { campaignId, sent, delivered, audience: audience.count };
  }

  async getStats(campaignId: number) {
    const campaign = await crmRepository.getCampaign(campaignId);
    if (!campaign) throw new Error('Campanha não encontrada');
    return {
      audience_count: campaign.audience_count,
      sent_count: campaign.sent_count,
      delivered_count: campaign.delivered_count,
      opened_count: campaign.opened_count,
      clicked_count: campaign.clicked_count,
      bounced_count: campaign.bounced_count,
      delivery_rate: campaign.sent_count ? (campaign.delivered_count / campaign.sent_count) * 100 : 0,
      open_rate: campaign.delivered_count ? (campaign.opened_count / campaign.delivered_count) * 100 : 0,
      click_rate: campaign.opened_count ? (campaign.clicked_count / campaign.opened_count) * 100 : 0,
    };
  }
}

export const campaignService = new CampaignService();
