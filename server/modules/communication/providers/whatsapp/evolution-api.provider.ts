// WhatsApp Provider — Evolution API Implementation (Open Source)

import { WhatsAppProviderInterface } from '../interfaces';

export class EvolutionAPIWhatsAppProvider implements WhatsAppProviderInterface {
  name = 'evolution_api';
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    this.apiKey = process.env.EVOLUTION_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('EVOLUTION_API_KEY is required for Evolution API provider');
    }
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
    try {
      const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'rsv360';
      const url = `${this.baseUrl}/message/sendText/${instanceName}`;

      let messageContent = content;

      // Substituir variáveis no template
      if (options?.variables) {
        Object.entries(options.variables).forEach(([key, value]) => {
          messageContent = messageContent.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
        });
      }

      const payload: any = {
        number: to.replace(/\D/g, ''), // Remove non-digits
        text: messageContent,
      };

      // Se for mídia, usar endpoint diferente
      if (options?.mediaUrl) {
        const mediaUrl = `${this.baseUrl}/message/sendMedia/${instanceName}`;
        payload.mediaUrl = options.mediaUrl;
        payload.mediaType = options.mediaType || 'image';
        payload.caption = messageContent;

        const response = await fetch(mediaUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.apiKey,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to send media message');
        }

        return {
          success: true,
          messageId: result.messageId || `evolution-${Date.now()}`,
        };
      }

      // Mensagem de texto
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send text message');
      }

      return {
        success: true,
        messageId: result.messageId || `evolution-${Date.now()}`,
      };
    } catch (error: any) {
      console.error('Evolution API send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send WhatsApp message via Evolution API',
      };
    }
  }
}