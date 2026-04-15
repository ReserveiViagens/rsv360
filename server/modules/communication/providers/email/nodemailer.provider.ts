import nodemailer, { type Transporter } from 'nodemailer';
import { EmailProviderInterface } from '../interfaces';

export class SMTPProvider implements EmailProviderInterface {
  name = 'smtp';
  private transporter: Transporter | null = null;

  async initialize(): Promise<void> {
    if (this.transporter) return;

    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
      console.info(`[COMM] Ethereal email: ${testAccount.user}`);
      console.info('[COMM] Preview URL: https://ethereal.email');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    options: {
      from?: string;
      cc?: string[];
      bcc?: string[];
      attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
      templateId?: string;
      variables?: Record<string, any>;
    } = {}
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.transporter) await this.initialize();
      if (!this.transporter) throw new Error('SMTP transporter indisponível');

      const info = await this.transporter.sendMail({
        from: options.from || process.env.SMTP_FROM || '"RSV360" <noreply@rsv360.dev>',
        to,
        subject,
        html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments || [],
      });

      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.info(`[COMM] Email preview: ${previewUrl}`);
      }

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error('[COMM] SMTP send error:', error);
      return { success: false, error: error?.message || 'Falha ao enviar email' };
    }
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) await this.initialize();
    if (!this.transporter) return false;
    return this.transporter.verify();
  }
}

// Compatibilidade com código antigo.
export class NodeMailerEmailProvider extends SMTPProvider {}