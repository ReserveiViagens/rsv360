/**
 * ✅ ITENS 25-30: SERVIÇO DE NOTIFICAÇÕES
 * Sistema completo de notificações (Email, SMS, WhatsApp, Push, In-App)
 */

import { queryDatabase } from './db';
import * as nodemailer from 'nodemailer';

export interface Notification {
  id: number;
  user_id: number;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app';
  category: 'booking' | 'payment' | 'message' | 'system' | 'promotion';
  title: string;
  message: string;
  data?: any;
  read_at?: string;
  read_by_user: boolean;
  sent_at?: string;
  sent_successfully: boolean;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: number;
  email_enabled: boolean;
  email_booking: boolean;
  email_payment: boolean;
  email_message: boolean;
  email_system: boolean;
  email_promotion: boolean;
  sms_enabled: boolean;
  sms_booking: boolean;
  sms_payment: boolean;
  sms_message: boolean;
  sms_system: boolean;
  whatsapp_enabled: boolean;
  whatsapp_booking: boolean;
  whatsapp_payment: boolean;
  whatsapp_message: boolean;
  push_enabled: boolean;
  push_booking: boolean;
  push_payment: boolean;
  push_message: boolean;
  push_system: boolean;
  in_app_enabled: boolean;
  in_app_booking: boolean;
  in_app_payment: boolean;
  in_app_message: boolean;
  in_app_system: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

/**
 * ✅ ITEM 25: NOTIFICATION SERVICE - EMAIL
 */
export async function sendEmailNotification(
  userId: number,
  to: string,
  subject: string,
  htmlBody: string,
  textBody?: string,
  options?: { attachments?: Array<{ filename: string; content: Buffer }> }
): Promise<boolean> {
  try {
    // Verificar preferências
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs || !prefs.email_enabled) {
      return false;
    }

    // Configurar transporter (usar variáveis de ambiente)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions: any = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text: textBody || htmlBody.replace(/<[^>]*>/g, ''),
      html: htmlBody,
    };

    // Adicionar anexos se fornecidos
    if (options?.attachments && options.attachments.length > 0) {
      mailOptions.attachments = options.attachments.map(att => ({
        filename: att.filename,
        content: att.content,
      }));
    }

    await transporter.sendMail(mailOptions);

    // Registrar notificação
    await createNotification(userId, 'email', 'system', subject, htmlBody, {
      to,
      sent: true,
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    
    // Registrar erro
    await createNotification(userId, 'email', 'system', subject, htmlBody, {
      to,
      sent: false,
      error: error.message,
    });

    return false;
  }
}

/**
 * ✅ ITEM 26: NOTIFICATION SERVICE - SMS
 */
export async function sendSMSNotification(
  userId: number,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    // Verificar preferências
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs || !prefs.sms_enabled) {
      return false;
    }

    // Integrar com provedor SMS (Twilio, AWS SNS, etc.)
    const smsProvider = process.env.SMS_PROVIDER || 'twilio';
    const smsApiKey = process.env.SMS_API_KEY;
    const smsApiSecret = process.env.SMS_API_SECRET;

    if (!smsApiKey || !smsApiSecret) {
      console.warn('SMS não configurado - apenas registrando notificação');
      await createNotification(userId, 'sms', 'system', 'SMS', message, {
        phone: phoneNumber,
        sent: false,
        error: 'SMS não configurado',
      });
      return false;
    }

    try {
      if (smsProvider === 'twilio') {
        // Twilio (requer: npm install twilio)
        try {
          const twilio = require('twilio');
          const client = twilio(smsApiKey, smsApiSecret);
          await client.messages.create({
            body: message,
            to: phoneNumber,
            from: process.env.SMS_FROM_NUMBER || '',
          });
        } catch (twilioError: any) {
          // Se twilio não estiver instalado, tentar AWS SNS
          if (twilioError.code === 'MODULE_NOT_FOUND') {
            throw new Error('Twilio não instalado. Execute: npm install twilio');
          }
          throw twilioError;
        }
      } else if (smsProvider === 'aws-sns') {
        // AWS SNS (requer: npm install @aws-sdk/client-sns)
        try {
          const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
          const snsClient = new SNSClient({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
              accessKeyId: smsApiKey,
              secretAccessKey: smsApiSecret,
            },
          });
          await snsClient.send(new PublishCommand({
            PhoneNumber: phoneNumber,
            Message: message,
          }));
        } catch (snsError: any) {
          if (snsError.code === 'MODULE_NOT_FOUND') {
            throw new Error('AWS SDK não instalado. Execute: npm install @aws-sdk/client-sns');
          }
          throw snsError;
        }
      }
    } catch (smsError: any) {
      console.error('Erro ao enviar SMS:', smsError);
      await createNotification(userId, 'sms', 'system', 'SMS', message, {
        phone: phoneNumber,
        sent: false,
        error: smsError.message,
      });
      return false;
    }

    // Registrar notificação
    await createNotification(userId, 'sms', 'system', 'SMS', message, {
      phone: phoneNumber,
      sent: true,
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao enviar SMS:', error);
    await createNotification(userId, 'sms', 'system', 'SMS', message, {
      phone: phoneNumber,
      sent: false,
      error: error.message,
    });
    return false;
  }
}

/**
 * ✅ ITEM 27: NOTIFICATION SERVICE - WHATSAPP
 */
export async function sendWhatsAppNotification(
  userId: number,
  phoneNumber: string,
  message: string,
  templateName?: string
): Promise<boolean> {
  try {
    // Verificar preferências
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs || !prefs.whatsapp_enabled) {
      return false;
    }

    // Integrar com WhatsApp Business API (Meta)
    const whatsappApiKey = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;

    if (!whatsappApiKey || !whatsappPhoneId) {
      console.warn('WhatsApp não configurado - apenas registrando notificação');
      await createNotification(userId, 'whatsapp', 'system', 'WhatsApp', message, {
        phone: phoneNumber,
        sent: false,
        error: 'WhatsApp não configurado',
      });
      return false;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: { body: message },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao enviar WhatsApp');
      }
    } catch (whatsappError: any) {
      console.error('Erro ao enviar WhatsApp:', whatsappError);
      await createNotification(userId, 'whatsapp', 'system', 'WhatsApp', message, {
        phone: phoneNumber,
        sent: false,
        error: whatsappError.message,
      });
      return false;
    }

    // Registrar notificação
    await createNotification(userId, 'whatsapp', 'system', 'WhatsApp', message, {
      phone: phoneNumber,
      sent: true,
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao enviar WhatsApp:', error);
    await createNotification(userId, 'whatsapp', 'system', 'WhatsApp', message, {
      phone: phoneNumber,
      sent: false,
      error: error.message,
    });
    return false;
  }
}

/**
 * ✅ ITEM 28: NOTIFICATION SERVICE - PUSH NOTIFICATIONS
 */
export async function sendPushNotification(
  userId: number,
  title: string,
  body: string,
  data?: any
): Promise<boolean> {
  try {
    // Verificar preferências
    const prefs = await getUserNotificationPreferences(userId);
    if (!prefs || !prefs.push_enabled) {
      return false;
    }

    // Buscar tokens FCM do usuário
    const tokens = await queryDatabase(
      `SELECT token FROM fcm_tokens WHERE user_id = $1`,
      [userId]
    );

    if (tokens.length === 0) {
      return false; // Usuário não tem tokens registrados
    }

    const fcmTokens = tokens.map((t: any) => t.token);

    // Integrar com Firebase Cloud Messaging
    const fcmServerKey = process.env.FCM_SERVER_KEY;

    if (!fcmServerKey) {
      console.warn('FCM não configurado - apenas registrando notificação');
      await createNotification(userId, 'push', 'system', title, body, {
        tokens: fcmTokens,
        sent: false,
        error: 'FCM não configurado',
      });
      return false;
    }

    try {
      // Enviar para cada token
      const sendPromises = fcmTokens.map(async (token: string) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Authorization': `key=${fcmServerKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title,
              body,
            },
            data: data || {},
          }),
        });

        if (!response.ok) {
          throw new Error(`FCM error: ${response.statusText}`);
        }

        return await response.json();
      });

      await Promise.all(sendPromises);
    } catch (fcmError: any) {
      console.error('Erro ao enviar push notification:', fcmError);
      await createNotification(userId, 'push', 'system', title, body, {
        tokens: fcmTokens,
        sent: false,
        error: fcmError.message,
      });
      return false;
    }

    // Exemplo com FCM
    // const admin = require('firebase-admin');
    // const messaging = admin.messaging();
    // await messaging.sendMulticast({
    //   tokens: fcmTokens,
    //   notification: { title, body },
    //   data: data || {},
    // });

    // Registrar notificação
    await createNotification(userId, 'push', 'system', title, body, {
      tokens: fcmTokens,
      sent: true,
    });

    return true;
  } catch (error: any) {
    console.error('Erro ao enviar push:', error);
    await createNotification(userId, 'push', 'system', title, body, {
      sent: false,
      error: error.message,
    });
    return false;
  }
}

/**
 * ✅ ITEM 29: NOTIFICATION SERVICE - IN-APP
 */
export async function createInAppNotification(
  userId: number,
  category: 'booking' | 'payment' | 'message' | 'system' | 'promotion',
  title: string,
  message: string,
  data?: any
): Promise<Notification> {
  // Verificar preferências
  const prefs = await getUserNotificationPreferences(userId);
  if (!prefs || !prefs.in_app_enabled) {
    // Criar mas não enviar
    return await createNotification(userId, 'in_app', category, title, message, data, false);
  }

  // Verificar categoria específica
  const categoryKey = `in_app_${category}` as keyof NotificationPreferences;
  if (prefs[categoryKey] === false) {
    return await createNotification(userId, 'in_app', category, title, message, data, false);
  }

  return await createNotification(userId, 'in_app', category, title, message, data, true);
}

/**
 * Criar notificação no banco
 */
async function createNotification(
  userId: number,
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app',
  category: 'booking' | 'payment' | 'message' | 'system' | 'promotion',
  title: string,
  message: string,
  data?: any,
  sentSuccessfully: boolean = false
): Promise<Notification> {
  const result = await queryDatabase(
    `INSERT INTO notifications 
     (user_id, type, category, title, message, data, sent_successfully, sent_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      userId,
      type,
      category,
      title,
      message,
      data ? JSON.stringify(data) : null,
      sentSuccessfully,
    ]
  );

  return result[0] as Notification;
}

/**
 * ✅ ITEM 30: OBTER PREFERÊNCIAS DE NOTIFICAÇÃO
 */
export async function getUserNotificationPreferences(
  userId: number
): Promise<NotificationPreferences | null> {
  const prefs = await queryDatabase(
    `SELECT * FROM notification_preferences WHERE user_id = $1`,
    [userId]
  );

  if (prefs.length === 0) {
    // Criar preferências padrão
    return await createDefaultNotificationPreferences(userId);
  }

  return prefs[0] as NotificationPreferences;
}

/**
 * Criar preferências padrão
 */
async function createDefaultNotificationPreferences(
  userId: number
): Promise<NotificationPreferences> {
  const result = await queryDatabase(
    `INSERT INTO notification_preferences (user_id)
     VALUES ($1)
     RETURNING *`,
    [userId]
  );

  return result[0] as NotificationPreferences;
}

/**
 * Atualizar preferências de notificação
 */
export async function updateNotificationPreferences(
  userId: number,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  Object.keys(preferences).forEach((key) => {
    if (key !== 'user_id' && key !== 'created_at' && key !== 'updated_at') {
      updates.push(`${key} = $${paramIndex}`);
      values.push(preferences[key as keyof NotificationPreferences]);
      paramIndex++;
    }
  });

  if (updates.length === 0) {
    return await getUserNotificationPreferences(userId) as NotificationPreferences;
  }

  values.push(userId);

  const query = `
    INSERT INTO notification_preferences (user_id, ${Object.keys(preferences).filter(k => k !== 'user_id').join(', ')})
    VALUES ($${paramIndex}, ${updates.map((_, i) => `$${i + 1}`).join(', ')})
    ON CONFLICT (user_id) DO UPDATE SET
      ${updates.map((u, i) => u.replace(`$${i + 1}`, `$${i + 1}`)).join(', ')},
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const result = await queryDatabase(query, values);

  return result[0] as NotificationPreferences;
}

/**
 * Listar notificações in-app do usuário
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = `
    SELECT * FROM notifications 
    WHERE user_id = $1
  `;
  const params: any[] = [userId];

  if (unreadOnly) {
    query += ` AND read_by_user = false`;
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  return await queryDatabase(query, params) as Notification[];
}

/**
 * Marcar notificação como lida
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<boolean> {
  await queryDatabase(
    `UPDATE notifications 
     SET read_by_user = true, read_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId]
  );
  return true;
}

/**
 * Contar notificações não lidas
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const result = await queryDatabase(
    `SELECT COUNT(*) as count FROM notifications 
     WHERE user_id = $1 AND read_by_user = false`,
    [userId]
  );

  return parseInt(result[0].count) || 0;
}

/**
 * Enviar notificação genérica (API unificada)
 */
export async function sendNotification(params: {
  userId: number;
  type: 'email' | 'sms' | 'whatsapp' | 'push' | 'in_app' | string;
  title?: string;
  message: string;
  data?: any;
  metadata?: any;
  [key: string]: any;
}): Promise<boolean> {
  const { userId, type, title, message, data } = params;

  // Tipos customizados (pricing_alert, review) -> in-app
  if (type === 'pricing_alert' || type === 'review' || type === 'in_app') {
    await createInAppNotification(userId, 'system', title || 'Notificação', message, data || params.metadata);
    return true;
  }

  // Canal específico
  if (type === 'email') {
    const user = await queryDatabase('SELECT email FROM users WHERE id = $1', [userId]);
    const email = user[0]?.email;
    if (!email) return false;
    return sendEmailNotification(userId, email, title || 'Notificação', message);
  }

  if (type === 'sms') {
    const user = await queryDatabase('SELECT phone FROM users WHERE id = $1', [userId]);
    const phone = user[0]?.phone;
    if (!phone) return false;
    return sendSMSNotification(userId, phone, message);
  }

  if (type === 'push') {
    return sendPushNotification(userId, title || 'Notificação', message, data);
  }

  if (type === 'whatsapp') {
    const user = await queryDatabase('SELECT phone FROM users WHERE id = $1', [userId]);
    const phone = user[0]?.phone;
    if (!phone) return false;
    return sendWhatsAppNotification(userId, phone, message);
  }

  // Fallback: in-app
  await createInAppNotification(userId, 'system', title || 'Notificação', message, data);
  return true;
}

