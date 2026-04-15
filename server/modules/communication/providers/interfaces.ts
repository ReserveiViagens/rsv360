// Communication Providers — Abstract Interfaces

export interface EmailProviderInterface {
  name: string;
  sendEmail(to: string, subject: string, content: string, options?: {
    from?: string;
    cc?: string[];
    bcc?: string[];
    attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
    templateId?: string;
    variables?: Record<string, any>;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
  verifyConnection?(): Promise<boolean>;
}

export interface WhatsAppProviderInterface {
  name: string;
  sendMessage(to: string, content: string, options?: {
    templateId?: string;
    variables?: Record<string, any>;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'document' | 'audio';
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendTemplateMessage?(
    to: string,
    templateName: string,
    languageCode?: string,
    components?: any[]
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
  sendTextMessage?(
    to: string,
    text: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }>;
  verifyWebhook?(mode: string, token: string, challenge: string): string | null;
  processWebhook?(body: any): Array<{ externalId?: string; status?: string; [key: string]: any }>;
}

export interface SMSProviderInterface {
  name: string;
  sendSMS(to: string, content: string, options?: {
    from?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
  processWebhook?(body: any): { externalId?: string; status?: string; to?: string; errorCode?: string };
}

export interface PushProviderInterface {
  name: string;
  sendPush(subscription: any, payload: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: any;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

export interface CommunicationProvider {
  email?: EmailProviderInterface;
  whatsapp?: WhatsAppProviderInterface;
  sms?: SMSProviderInterface;
  push?: PushProviderInterface;
}