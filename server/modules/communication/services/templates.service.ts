// Communication Service — Templates (real rendering with Handlebars)

import Handlebars from 'handlebars';
import { eq, and, desc, count } from 'drizzle-orm';
import { db } from '../../../../backend/src/db/drizzle';
import { commTemplates } from '../db/schema';

export interface TemplateFilters {
  enterpriseId: string;
  type?: string;
  channel?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

Handlebars.registerHelper('formatDate', (date: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('pt-BR');
});

Handlebars.registerHelper('formatCurrency', (value: string | number) => {
  if (!value) return 'R$ 0,00';
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
});

export class TemplatesService {
  // Criar template
  static async createTemplate(data: {
    enterpriseId: string;
    name: string;
    type: 'email' | 'whatsapp' | 'sms' | 'push';
    channel: 'email' | 'whatsapp' | 'sms' | 'push';
    subject?: string;
    content: string;
    variables?: Record<string, string>;
  }) {
    try {
      const [template] = await db.insert(commTemplates).values({
        ...data,
        variables: data.variables || {},
      }).returning();
      return { success: true, template };
    } catch (error: any) {
      console.error('TemplateService.createTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  // Listar templates
  static async listTemplates(filters: TemplateFilters) {
    try {
      const { enterpriseId, type, channel, isActive, page = 1, limit = 20 } = filters;

      let whereConditions = [eq(commTemplates.enterpriseId, enterpriseId)];

      if (type) whereConditions.push(eq(commTemplates.type, type as any));
      if (channel) whereConditions.push(eq(commTemplates.channel, channel as any));
      if (isActive !== undefined) whereConditions.push(eq(commTemplates.isActive, isActive));

      const templates = await db
        .select()
        .from(commTemplates)
        .where(and(...whereConditions))
        .orderBy(desc(commTemplates.createdAt))
        .limit(limit)
        .offset((page - 1) * limit);

      const [{ totalCount }] = await db
        .select({ totalCount: count() })
        .from(commTemplates)
        .where(and(...whereConditions));

      return {
        templates,
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error: any) {
      console.error('TemplateService.listTemplates error:', error);
      throw error;
    }
  }

  // Buscar template por ID
  static async getTemplateById(id: string, enterpriseId: string) {
    try {
      const [template] = await db
        .select()
        .from(commTemplates)
        .where(
          and(
            eq(commTemplates.id, id),
            eq(commTemplates.enterpriseId, enterpriseId)
          )
        )
        .limit(1);

      return template || null;
    } catch (error: any) {
      console.error('TemplateService.getTemplateById error:', error);
      throw error;
    }
  }

  // Atualizar template
  static async updateTemplate(id: string, enterpriseId: string, data: Partial<typeof commTemplates.$inferInsert>) {
    try {
      const [template] = await db
        .update(commTemplates)
        .set({ ...data, updatedAt: new Date() })
        .where(
          and(
            eq(commTemplates.id, id),
            eq(commTemplates.enterpriseId, enterpriseId)
          )
        )
        .returning();

      return { success: true, template };
    } catch (error: any) {
      console.error('TemplateService.updateTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  // Deletar template (soft delete)
  static async deleteTemplate(id: string, enterpriseId: string) {
    try {
      await db
        .update(commTemplates)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(commTemplates.id, id),
            eq(commTemplates.enterpriseId, enterpriseId)
          )
        );

      return { success: true };
    } catch (error: any) {
      console.error('TemplateService.deleteTemplate error:', error);
      return { success: false, error: error.message };
    }
  }

  static async duplicateTemplate(id: string, enterpriseId: string, newName: string) {
    const original = await this.getTemplateById(id, enterpriseId);
    if (!original) return { success: false, error: 'Template not found' };

    const [duplicated] = await db
      .insert(commTemplates)
      .values({
        enterpriseId,
        name: newName,
        type: original.type,
        channel: original.channel,
        subject: original.subject || undefined,
        content: original.content,
        variables: original.variables,
        isActive: true,
      })
      .returning();

    return { success: true, template: duplicated };
  }

  // Renderizar template com variáveis
  static async renderTemplate(
    templateOrId: typeof commTemplates.$inferSelect | string,
    variables: Record<string, any> = {}
  ): Promise<{ subject: string | null; body: string; channel: string }> {
    const template = typeof templateOrId === 'string'
      ? await db.select().from(commTemplates).where(eq(commTemplates.id, templateOrId)).limit(1).then((rows) => rows[0])
      : templateOrId;

    if (!template) {
      throw new Error('Template não encontrado');
    }

    const compiledBody = Handlebars.compile(template.content || '');
    const compiledSubject = template.subject ? Handlebars.compile(template.subject) : null;

    return {
      subject: compiledSubject ? compiledSubject(variables) : null,
      body: compiledBody(variables),
      channel: template.channel,
    };
  }

  static async previewTemplate(templateId: string, sampleData: Record<string, any> = {}) {
    const defaultSample = {
      guest_name: 'João Silva',
      guest_email: 'joao@exemplo.com',
      booking_id: '12345',
      check_in: '2026-04-15',
      check_out: '2026-04-18',
      room_type: 'Suite Premium',
      total_amount: 1500,
      property_name: 'Hotel RSV360',
      property_address: 'Rua das Flores, 123 — São Paulo/SP',
    };
    return this.renderTemplate(templateId, { ...defaultSample, ...sampleData });
  }

  // Validar template (estrutura básica)
  static validateTemplate(template: typeof commTemplates.$inferInsert): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.name?.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!template.content?.trim()) {
      errors.push('Conteúdo é obrigatório');
    }

    if (!template.type) {
      errors.push('Tipo é obrigatório');
    }

    if (!template.channel) {
      errors.push('Canal é obrigatório');
    }

    // Validações específicas por canal
    if (template.channel === 'email' && !template.subject?.trim()) {
      errors.push('Assunto é obrigatório para emails');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static async seedDefaultTemplates(enterpriseId: string): Promise<{ inserted: number }> {
    const defaults: Array<Partial<typeof commTemplates.$inferInsert> & { name: string; type: any; channel: any; content: string }> = [
      {
        name: 'Confirmação de Reserva',
        type: 'email',
        channel: 'email',
        subject: 'Reserva Confirmada #{{booking_id}} — {{property_name}}',
        content:
          '<h2>Olá, {{guest_name}}!</h2><p>Sua reserva foi confirmada.</p><p><strong>Check-in:</strong> {{formatDate check_in}}</p><p><strong>Check-out:</strong> {{formatDate check_out}}</p><p><strong>Quarto:</strong> {{room_type}}</p><p><strong>Total:</strong> {{formatCurrency total_amount}}</p><p>Aguardamos você no {{property_name}}!</p>',
        variables: {
          guest_name: 'string',
          booking_id: 'string',
          check_in: 'date',
          check_out: 'date',
          room_type: 'string',
          total_amount: 'number',
          property_name: 'string',
        },
        isActive: true,
      },
      {
        name: 'Confirmação WhatsApp',
        type: 'whatsapp',
        channel: 'whatsapp',
        content:
          '✅ Reserva confirmada!\n\nOlá {{guest_name}}, sua reserva #{{booking_id}} está confirmada.\n\n📅 Check-in: {{check_in}}\n📅 Check-out: {{check_out}}\n🏨 {{room_type}}\n💰 {{total_amount}}\n\nAguardamos você!',
        variables: { guest_name: 'string', booking_id: 'string' },
        isActive: true,
      },
      {
        name: 'Lembrete Check-in SMS',
        type: 'sms',
        channel: 'sms',
        content:
          'RSV360: Olá {{guest_name}}, lembrete de check-in amanhã no {{property_name}}. Horário: a partir das 14h.',
        variables: { guest_name: 'string', property_name: 'string' },
        isActive: true,
      },
    ];

    let inserted = 0;
    for (const tpl of defaults) {
      const exists = await db
        .select()
        .from(commTemplates)
        .where(
          and(
            eq(commTemplates.enterpriseId, enterpriseId),
            eq(commTemplates.name, tpl.name)
          )
        )
        .limit(1);

      if (!exists.length) {
        await db.insert(commTemplates).values({
          enterpriseId,
          ...tpl,
        } as any);
        inserted += 1;
      }
    }

    console.info(`[COMM] ${inserted} templates padrão seedados para ${enterpriseId}`);
    return { inserted };
  }
}

// Compatibilidade com nome antigo.
export class TemplateService extends TemplatesService {}