import { WhatsAppProviderInterface } from '../interfaces';

export class WhatsAppBusinessProvider implements WhatsAppProviderInterface {
  name = 'whatsapp_business';
  private phoneId: string | undefined;
  private token: string | undefined;
  private apiUrl: string | undefined;

  constructor() {
    this.phoneId = process.env.WHATSAPP_PHONE_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.token = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    if (this.phoneId) {
      this.apiUrl = `https://graph.facebook.com/v18.0/${this.phoneId}`;
    }
  }

  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode = 'pt_BR',
    components: any[] = []
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.token || !this.apiUrl) {
        console.warn('[COMM] WhatsApp não configurado — mensagem simulada');
        return { success: true, messageId: `WA_SIM_${Date.now()}` };
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: this.normalizePhone(to),
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode || 'pt_BR' },
          components: components || [],
        },
      };

      const response = await fetch(`${this.apiUrl}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      return {
        success: response.ok,
        messageId: result.messages?.[0]?.id,
        error: result.error?.message,
      };
    } catch (error: any) {
      console.error('[COMM] WhatsApp template send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp template',
      };
    }
  }

  async sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.token || !this.apiUrl) {
      return { success: true, messageId: `WA_SIM_${Date.now()}` };
    }

    const response = await fetch(`${this.apiUrl}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: this.normalizePhone(to),
        type: 'text',
        text: { body: text },
      }),
    });

    const data = await response.json();
    return {
      success: response.ok,
      messageId: data.messages?.[0]?.id,
      error: data.error?.message,
    };
  }

  async sendMessage(
    to: string,
    content: string,
    options?: {
      templateId?: string;
      variables?: Record<string, any>;
      mediaUrl?: string;
      mediaType?: 'image' | 'video' | 'document' | 'audio';
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (options?.templateId) {
      const components = options.variables
        ? [{ type: 'body', parameters: Object.values(options.variables).map((v) => ({ type: 'text', text: String(v) })) }]
        : [];
      return this.sendTemplateMessage(to, options.templateId, 'pt_BR', components);
    }
    return this.sendTextMessage(to, content);
  }

  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  }

  processWebhook(body: any): Array<{ externalId?: string; status?: string; recipientId?: string; timestamp?: Date }> {
    const entries = body?.entry || [];
    const results: Array<{ externalId?: string; status?: string; recipientId?: string; timestamp?: Date }> = [];
    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        const statuses = change?.value?.statuses || [];
        for (const status of statuses) {
          results.push({
            externalId: status.id,
            status: status.status,
            recipientId: status.recipient_id,
            timestamp: status.timestamp ? new Date(parseInt(status.timestamp, 10) * 1000) : undefined,
          });
        }
      }
    }
    return results;
  }

  private normalizePhone(phone: string): string {
    return `${phone}`.replace(/\D/g, '');
  }
}