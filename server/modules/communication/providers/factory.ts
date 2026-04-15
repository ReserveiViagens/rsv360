// Communication Providers — Factory Pattern

import { CommunicationProvider } from './interfaces';
import { SendGridProvider } from './email/sendgrid.provider';
import { SMTPProvider } from './email/nodemailer.provider';
import { TwilioSMSProvider } from './sms/twilio.provider';
import { FirebasePushProvider } from './push/firebase.provider';
import { WhatsAppBusinessProvider } from './whatsapp/whatsapp-business.provider';
import { EvolutionAPIWhatsAppProvider } from './whatsapp/evolution-api.provider';
import { eq, and, desc } from 'drizzle-orm';
import { commProviderConfigs } from '../db/schema';

export class CommunicationProviderFactory {
  private static providers: Map<string, CommunicationProvider> = new Map();

  static getProvider(enterpriseId: string, channel: 'email' | 'whatsapp' | 'sms' | 'push'): CommunicationProvider | null {
    const cacheKey = `${enterpriseId}-${channel}`;

    if (this.providers.has(cacheKey)) {
      return this.providers.get(cacheKey)!;
    }

    const provider = this.createProvider(enterpriseId, channel);
    if (provider) {
      this.providers.set(cacheKey, provider);
    }

    return provider;
  }

  private static createProvider(enterpriseId: string, channel: 'email' | 'whatsapp' | 'sms' | 'push'): CommunicationProvider | null {
    const providerEnv = process.env[`${channel.toUpperCase()}_PROVIDER`] || this.getDefaultProvider(channel);
    return this.createProviderByName(channel, providerEnv);
  }

  static createProviderByName(
    channel: 'email' | 'whatsapp' | 'sms' | 'push',
    providerName: string
  ): CommunicationProvider | null {
    const providerEnv = providerName || this.getDefaultProvider(channel);

    switch (channel) {
      case 'email':
        return this.createEmailProvider(providerEnv);
      case 'whatsapp':
        return this.createWhatsAppProvider(providerEnv);
      case 'sms':
        return this.createSMSProvider(providerEnv);
      case 'push':
        return this.createPushProvider(providerEnv);
      default:
        return null;
    }
  }

  private static getDefaultProvider(channel: string): string {
    const defaults = {
      email: 'smtp',
      whatsapp: 'whatsapp_business',
      sms: 'twilio', // mais confiável
      push: 'firebase' // mais comum
    };
    return defaults[channel as keyof typeof defaults] || '';
  }

  private static createEmailProvider(provider: string): CommunicationProvider {
    switch (provider) {
      case 'sendgrid':
        return { email: new SendGridProvider() };
      case 'smtp':
      case 'nodemailer':
        return { email: new SMTPProvider() };
      default:
        return { email: new SMTPProvider() };
    }
  }

  private static createWhatsAppProvider(provider: string): CommunicationProvider {
    switch (provider) {
      case 'whatsapp_business':
        return { whatsapp: new WhatsAppBusinessProvider() };
      case 'evolution_api':
        return { whatsapp: new EvolutionAPIWhatsAppProvider() };
      default:
        return { whatsapp: new WhatsAppBusinessProvider() };
    }
  }

  private static createSMSProvider(provider: string): CommunicationProvider {
    switch (provider) {
      case 'twilio':
        return { sms: new TwilioSMSProvider() };
      default:
        // Fallback para Twilio
        return { sms: new TwilioSMSProvider() };
    }
  }

  private static createPushProvider(provider: string): CommunicationProvider {
    switch (provider) {
      case 'firebase':
        return { push: new FirebasePushProvider() };
      default:
        // Fallback para Firebase
        return { push: new FirebasePushProvider() };
    }
  }

  // Método para limpar cache (útil para testes ou mudanças de config)
  static clearCache(): void {
    this.providers.clear();
  }
}

export async function getActiveProvider(
  db: any,
  enterpriseId: string,
  channel: 'email' | 'whatsapp' | 'sms' | 'push'
): Promise<CommunicationProvider> {
  const config = await db
    .select()
    .from(commProviderConfigs)
    .where(
      and(
        eq(commProviderConfigs.enterpriseId, enterpriseId),
        eq(commProviderConfigs.channel, channel as any),
        eq(commProviderConfigs.isActive, true)
      )
    )
    .orderBy(desc(commProviderConfigs.priority))
    .limit(1);

  if (!config.length) {
    const providerName =
      channel === 'email'
        ? 'smtp'
        : channel === 'sms'
          ? 'twilio'
          : channel === 'whatsapp'
            ? 'whatsapp_business'
            : 'firebase';
    return CommunicationProviderFactory.createProviderByName(channel, providerName) || {};
  }

  return CommunicationProviderFactory.createProviderByName(channel, config[0].provider) || {};
}