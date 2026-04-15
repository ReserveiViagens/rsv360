import twilio from 'twilio';
import { SMSProviderInterface } from '../interfaces';

export class TwilioSMSProvider implements SMSProviderInterface {
  name = 'twilio';
  private client: twilio.Twilio | null = null;
  private fromNumber: string | undefined;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendSMS(
    to: string,
    content: string,
    options?: {
      from?: string;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.client) {
        console.warn('[COMM] Twilio não configurado — SMS simulado');
        return { success: true, messageId: `SIM_${Date.now()}` };
      }

      const from = options?.from || this.fromNumber;
      const normalizedTo = this.normalizePhone(to);

      const message = await this.client.messages.create({
        body: content,
        from,
        to: normalizedTo,
      });

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error: any) {
      console.error('[COMM] Twilio SMS send error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS via Twilio',
      };
    }
  }

  normalizePhone(phone: string): string {
    let clean = `${phone}`.replace(/\D/g, '');
    if (clean.length === 11 || clean.length === 10) clean = `55${clean}`;
    return clean.startsWith('+') ? clean : `+${clean}`;
  }

  processWebhook(body: any): { externalId?: string; status?: string; to?: string; errorCode?: string } {
    return {
      externalId: body?.MessageSid,
      status: body?.MessageStatus,
      to: body?.To,
      errorCode: body?.ErrorCode,
    };
  }
}