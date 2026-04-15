// Communication Service — Campaigns

import { eq, and, desc, asc, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commCampaigns, commMessages, commTemplates } from '../db/schema';
import { MessagesService } from './messages.service';
import { TemplatesService } from './templates.service';

export interface CampaignFilters {
  enterpriseId: string;
  status?: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';
  type?: 'marketing' | 'transactional' | 'notification';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CampaignStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  openRate?: number;
  clickRate?: number;
}

export class CampaignsService {
  // Criar campanha
  static async createCampaign(campaign: {
    enterpriseId: string;
    name: string;
    description?: string;
    type: 'marketing' | 'transactional' | 'notification';
    channel: string;
    templateId?: string;
    targetAudience: any; // TODO: definir estrutura de audience
    scheduledAt?: Date;
    content?: any;
  }) {
    try {
      const [newCampaign] = await db
        .insert(commCampaigns)
        .values({
          ...campaign,
          status: 'draft',
        })
        .returning();

      return { success: true, campaign: newCampaign };
    } catch (error: any) {
      console.error('CampaignsService.createCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar campanhas
  static async listCampaigns(filters: CampaignFilters) {
    try {
      const { enterpriseId, status, type, search, page = 1, limit = 20 } = filters;

      let whereConditions = [eq(commCampaigns.enterpriseId, enterpriseId)];

      if (status) whereConditions.push(eq(commCampaigns.status, status as any));
      if (type) whereConditions.push(eq(commCampaigns.type, type as any));
      if (search) whereConditions.push(ilike(commCampaigns.name, `%${search}%`));

      const campaigns = await db
        .select()
        .from(commCampaigns)
        .where(and(...whereConditions))
        .orderBy(desc(commCampaigns.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ count }] = await db
        .select({ count: count() })
        .from(commCampaigns)
        .where(and(...whereConditions));

      return {
        campaigns,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (error: any) {
      console.error('CampaignsService.listCampaigns error:', error);
      throw error;
    }
  }

  // Buscar campanha por ID
  static async getCampaignById(id: string, enterpriseId: string) {
    try {
      const [campaign] = await db
        .select()
        .from(commCampaigns)
        .where(
          and(
            eq(commCampaigns.id, id),
            eq(commCampaigns.enterpriseId, enterpriseId)
          )
        )
        .limit(1);

      return campaign || null;
    } catch (error: any) {
      console.error('CampaignsService.getCampaignById error:', error);
      throw error;
    }
  }

  // Atualizar campanha
  static async updateCampaign(id: string, enterpriseId: string, updates: Partial<typeof commCampaigns.$inferInsert>) {
    try {
      const [campaign] = await db
        .update(commCampaigns)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(commCampaigns.id, id),
            eq(commCampaigns.enterpriseId, enterpriseId)
          )
        )
        .returning();

      return { success: true, campaign };
    } catch (error: any) {
      console.error('CampaignsService.updateCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar campanha
  static async deleteCampaign(id: string, enterpriseId: string) {
    try {
      // Verificar se campanha pode ser deletada (não está em andamento)
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      if (campaign.status === 'running' || campaign.status === 'scheduled') {
        return { success: false, error: 'Cannot delete running or scheduled campaign' };
      }

      await db
        .delete(commCampaigns)
        .where(eq(commCampaigns.id, id));

      return { success: true };
    } catch (error: any) {
      console.error('CampaignsService.deleteCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Iniciar campanha
  static async startCampaign(id: string, enterpriseId: string) {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
        return { success: false, error: 'Campaign cannot be started' };
      }

      // Atualizar status
      await this.updateCampaign(id, enterpriseId, {
        status: 'running',
        startedAt: new Date(),
      });

      // TODO: implementar lógica de envio em background
      // Por enquanto, simular envio imediato
      await this.executeCampaign(campaign);

      return { success: true };
    } catch (error: any) {
      console.error('CampaignsService.startCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Executar campanha (enviar mensagens)
  private static async executeCampaign(campaign: any) {
    try {
      // TODO: implementar lógica real de audience
      // Por enquanto, simular com leads hardcoded
      const leads = ['lead1', 'lead2', 'lead3']; // TODO: buscar da tabela leads

      let sent = 0;
      let failed = 0;

      for (const leadId of leads) {
        try {
          let content = campaign.content;

          // Se usar template, renderizar
          if (campaign.templateId) {
            const template = await TemplatesService.getTemplateById(campaign.templateId, campaign.enterpriseId);
            if (template) {
              content = await TemplatesService.renderTemplate(template, {
                leadId,
                campaignId: campaign.id,
                // TODO: adicionar mais variáveis do lead
              });
            }
          }

          // Enviar mensagem
          const result = await MessagesService.sendMessage({
            enterpriseId: campaign.enterpriseId,
            leadId,
            channel: campaign.channel,
            content,
            campaignId: campaign.id,
            direction: 'outbound',
          });

          if (result.success) {
            sent++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to send message to lead ${leadId}:`, error);
          failed++;
        }
      }

      // Atualizar estatísticas da campanha
      await this.updateCampaign(campaign.id, campaign.enterpriseId, {
        status: 'completed',
        completedAt: new Date(),
        stats: {
          totalSent: sent + failed,
          sent,
          failed,
        },
      });

      console.log(`Campaign ${campaign.id} completed: ${sent} sent, ${failed} failed`);
    } catch (error: any) {
      console.error('CampaignsService.executeCampaign error:', error);

      // Marcar como falha
      await this.updateCampaign(campaign.id, campaign.enterpriseId, {
        status: 'failed',
      });
    }
  }

  // Pausar campanha
  static async pauseCampaign(id: string, enterpriseId: string) {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign || campaign.status !== 'running') {
        return { success: false, error: 'Campaign not running' };
      }

      await this.updateCampaign(id, enterpriseId, { status: 'paused' });
      return { success: true };
    } catch (error: any) {
      console.error('CampaignsService.pauseCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Cancelar campanha
  static async cancelCampaign(id: string, enterpriseId: string) {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign || (campaign.status !== 'running' && campaign.status !== 'paused')) {
        return { success: false, error: 'Campaign not running or paused' };
      }

      await this.updateCampaign(id, enterpriseId, {
        status: 'cancelled',
        cancelledAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error('CampaignsService.cancelCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Obter estatísticas da campanha
  static async getCampaignStats(id: string, enterpriseId: string): Promise<CampaignStats | null> {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign) return null;

      // Contar mensagens da campanha
      const messageStats = await db
        .select({
          status: commMessages.status,
          count: count(),
        })
        .from(commMessages)
        .where(
          and(
            eq(commMessages.campaignId, id),
            eq(commMessages.enterpriseId, enterpriseId)
          )
        )
        .groupBy(commMessages.status);

      const stats: CampaignStats = {
        totalSent: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
      };

      messageStats.forEach(stat => {
        stats.totalSent += stat.count;
        switch (stat.status) {
          case 'delivered':
            stats.delivered += stat.count;
            break;
          case 'failed':
          case 'bounce':
            stats.failed += stat.count;
            break;
          case 'sent':
          case 'queued':
            stats.pending += stat.count;
            break;
        }
      });

      // TODO: calcular openRate e clickRate para emails

      return stats;
    } catch (error: any) {
      console.error('CampaignsService.getCampaignStats error:', error);
      return null;
    }
  }

  // Agendar campanha
  static async scheduleCampaign(id: string, enterpriseId: string, scheduledAt: Date) {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign || campaign.status !== 'draft') {
        return { success: false, error: 'Campaign not in draft status' };
      }

      await this.updateCampaign(id, enterpriseId, {
        status: 'scheduled',
        scheduledAt,
      });

      // TODO: implementar job scheduling (ex: Bull queue)

      return { success: true };
    } catch (error: any) {
      console.error('CampaignsService.scheduleCampaign error:', error);
      return { success: false, error: error.message };
    }
  }

  // Duplicar campanha
  static async duplicateCampaign(id: string, enterpriseId: string, newName: string) {
    try {
      const campaign = await this.getCampaignById(id, enterpriseId);
      if (!campaign) {
        return { success: false, error: 'Campaign not found' };
      }

      const { id: _, createdAt, updatedAt, startedAt, completedAt, cancelledAt, ...campaignData } = campaign;

      const newCampaign = await this.createCampaign({
        ...campaignData,
        name: newName,
        status: 'draft',
      });

      return newCampaign;
    } catch (error: any) {
      console.error('CampaignsService.duplicateCampaign error:', error);
      return { success: false, error: error.message };
    }
  }
}