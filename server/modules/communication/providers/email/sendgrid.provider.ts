import sgMail from '@sendgrid/mail';
import { EmailProviderInterface } from '../interfaces';

export class SendGridProvider implements EmailProviderInterface {
  name = 'sendgrid';

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    options?: {
      from?: string;
      cc?: string[];
      bcc?: string[];
      attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
      templateId?: string;
      variables?: Record<string, any>;
    }
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const msg: any = {
        to,
        from: options?.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@rsv360.dev',
        subject,
        html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
      };

      if (options?.cc) msg.cc = options.cc;
      if (options?.bcc) msg.bcc = options.bcc;

      if (options?.attachments) {
        msg.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: att.content.toString('base64'),
          type: att.contentType || 'application/octet-stream',
          disposition: 'attachment',
        }));
      }

      if (options?.templateId) {
        msg.templateId = options.templateId;
        if (options?.variables) {
          msg.dynamicTemplateData = options.variables;
        }
      }

      const [response] = await sgMail.send(msg);

      return {
        success: true,
        messageId: response.headers['x-message-id'] || `sendgrid_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('[COMM] SendGrid send error:', error);
      return {
        success: false,
        error: error.message || 'Falha ao enviar email via SendGrid',
      };
    }
  }

  async sendBulk(messages: any[]): Promise<any> {
    return sgMail.send(messages);
  }

  processWebhook(events: any[]): Array<{
    externalId?: string;
    event: string;
    timestamp: Date;
    email?: string;
  }> {
    return events.map((e) => ({
      externalId: e.sg_message_id?.split('.')[0],
      event: e.event,
      timestamp: new Date((e.timestamp || 0) * 1000),
      email: e.email,
    }));
  }
}

// Compatibilidade com import antigo.
export class SendGridEmailProvider extends SendGridProvider {}