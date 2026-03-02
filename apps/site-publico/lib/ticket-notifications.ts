/**
 * Serviço de Notificações para Sistema de Tickets
 * Envia notificações por email e WebSocket para eventos de tickets
 */

import nodemailer from 'nodemailer';
import { queryDatabase } from './db';
import { sendNotificationToUser, sendNotificationToRole } from './websocket-server';

/**
 * Criar transporter de email
 */
function createEmailTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

/**
 * Carregar template de email
 */
function loadTemplate(templateName: string, variables: Record<string, any>): string {
  // Templates básicos - em produção, usar sistema de templates
  const templates: Record<string, string> = {
    ticket_created: `
      <h2>Ticket de Suporte Criado</h2>
      <p>Olá {{guestName}},</p>
      <p>Seu ticket de suporte foi criado com sucesso!</p>
      <h3>Detalhes do Ticket:</h3>
      <ul>
        <li><strong>Número:</strong> {{ticketNumber}}</li>
        <li><strong>Assunto:</strong> {{subject}}</li>
        <li><strong>Categoria:</strong> {{category}}</li>
        <li><strong>Prioridade:</strong> {{priority}}</li>
        <li><strong>Status:</strong> {{status}}</li>
      </ul>
      <p>Você pode acompanhar seu ticket em: <a href="{{ticketLink}}">Ver Ticket</a></p>
      <p>Nossa equipe entrará em contato em breve.</p>
    `,
    ticket_updated: `
      <h2>Atualização no Ticket {{ticketNumber}}</h2>
      <p>Olá {{guestName}},</p>
      <p>Seu ticket foi atualizado:</p>
      <ul>
        <li><strong>Status:</strong> {{status}}</li>
        <li><strong>Prioridade:</strong> {{priority}}</li>
      </ul>
      <p><a href="{{ticketLink}}">Ver detalhes do ticket</a></p>
    `,
    ticket_comment: `
      <h2>Novo Comentário no Ticket {{ticketNumber}}</h2>
      <p>Olá {{guestName}},</p>
      <p>Um novo comentário foi adicionado ao seu ticket:</p>
      <blockquote>{{comment}}</blockquote>
      <p><a href="{{ticketLink}}">Ver ticket completo</a></p>
    `,
    ticket_resolved: `
      <h2>Ticket Resolvido - {{ticketNumber}}</h2>
      <p>Olá {{guestName}},</p>
      <p>Seu ticket foi resolvido!</p>
      <p><strong>Assunto:</strong> {{subject}}</p>
      {{#if resolutionNotes}}
      <p><strong>Notas de Resolução:</strong></p>
      <blockquote>{{resolutionNotes}}</blockquote>
      {{/if}}
      <p><a href="{{ticketLink}}">Ver ticket</a></p>
      <p>Se você ainda tiver dúvidas, pode reabrir o ticket ou criar um novo.</p>
    `,
    ticket_assigned: `
      <h2>Novo Ticket Atribuído - {{ticketNumber}}</h2>
      <p>Olá {{staffName}},</p>
      <p>Um novo ticket foi atribuído a você:</p>
      <ul>
        <li><strong>Assunto:</strong> {{subject}}</li>
        <li><strong>Prioridade:</strong> {{priority}}</li>
        <li><strong>Categoria:</strong> {{category}}</li>
      </ul>
      <p><a href="{{ticketLink}}">Ver e responder ticket</a></p>
    `,
  };

  let template = templates[templateName] || '';
  
  // Substituir variáveis simples
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    template = template.replace(regex, variables[key] || '');
  });

  return template;
}

/**
 * Envia email de confirmação de ticket criado
 */
export async function sendTicketCreatedEmail(
  recipientEmail: string,
  guestName: string,
  ticketNumber: string,
  subject: string,
  category: string,
  priority: string,
  ticketLink: string
): Promise<void> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn('Email transporter not configured. Skipping ticket created email.');
    return;
  }

  const emailSubject = `Ticket de Suporte Criado - ${ticketNumber}`;
  const htmlContent = loadTemplate('ticket_created', {
    guestName,
    ticketNumber,
    subject,
    category,
    priority,
    status: 'Aberto',
    ticketLink,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@rsvgen2.com',
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de ticket criado enviado para ${recipientEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de ticket criado para ${recipientEmail}:`, error);
  }
}

/**
 * Envia email de atualização de ticket
 */
export async function sendTicketUpdatedEmail(
  recipientEmail: string,
  guestName: string,
  ticketNumber: string,
  status: string,
  priority: string,
  ticketLink: string
): Promise<void> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return;
  }

  const emailSubject = `Atualização no Ticket ${ticketNumber}`;
  const htmlContent = loadTemplate('ticket_updated', {
    guestName,
    ticketNumber,
    status,
    priority,
    ticketLink,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@rsvgen2.com',
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de atualização de ticket enviado para ${recipientEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de atualização para ${recipientEmail}:`, error);
  }
}

/**
 * Envia email de novo comentário
 */
export async function sendTicketCommentEmail(
  recipientEmail: string,
  guestName: string,
  ticketNumber: string,
  comment: string,
  ticketLink: string
): Promise<void> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return;
  }

  const emailSubject = `Novo Comentário no Ticket ${ticketNumber}`;
  const htmlContent = loadTemplate('ticket_comment', {
    guestName,
    ticketNumber,
    comment,
    ticketLink,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@rsvgen2.com',
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de comentário enviado para ${recipientEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de comentário para ${recipientEmail}:`, error);
  }
}

/**
 * Envia email de ticket resolvido
 */
export async function sendTicketResolvedEmail(
  recipientEmail: string,
  guestName: string,
  ticketNumber: string,
  subject: string,
  resolutionNotes: string | null,
  ticketLink: string
): Promise<void> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return;
  }

  const emailSubject = `Ticket Resolvido - ${ticketNumber}`;
  const htmlContent = loadTemplate('ticket_resolved', {
    guestName,
    ticketNumber,
    subject,
    resolutionNotes: resolutionNotes || '',
    ticketLink,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@rsvgen2.com',
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de ticket resolvido enviado para ${recipientEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de ticket resolvido para ${recipientEmail}:`, error);
  }
}

/**
 * Envia email de ticket atribuído (para staff)
 */
export async function sendTicketAssignedEmail(
  recipientEmail: string,
  staffName: string,
  ticketNumber: string,
  subject: string,
  priority: string,
  category: string,
  ticketLink: string
): Promise<void> {
  const transporter = createEmailTransporter();
  if (!transporter) {
    return;
  }

  const emailSubject = `Novo Ticket Atribuído - ${ticketNumber}`;
  const htmlContent = loadTemplate('ticket_assigned', {
    staffName,
    ticketNumber,
    subject,
    priority,
    category,
    ticketLink,
  });

  const mailOptions = {
    from: process.env.SMTP_FROM_EMAIL || 'noreply@rsvgen2.com',
    to: recipientEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de ticket atribuído enviado para ${recipientEmail}`);
  } catch (error) {
    console.error(`Erro ao enviar email de ticket atribuído para ${recipientEmail}:`, error);
  }
}

/**
 * Notificação completa de ticket criado
 */
export async function notifyTicketCreated(
  ticketId: number,
  userId: number,
  ticketNumber: string,
  subject: string,
  category: string,
  priority: string
): Promise<void> {
  try {
    // Buscar dados do usuário
    const users = await queryDatabase(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    // Enviar email
    await sendTicketCreatedEmail(
      user.email,
      user.name || 'Usuário',
      ticketNumber,
      subject,
      category,
      priority,
      ticketLink
    );

    // Notificação WebSocket já é enviada pelo ticket-service.ts
  } catch (error) {
    console.error('Erro ao enviar notificação de ticket criado:', error);
  }
}

/**
 * Notificação completa de ticket atualizado
 */
export async function notifyTicketUpdated(
  ticketId: number,
  userId: number,
  ticketNumber: string,
  status: string,
  priority: string
): Promise<void> {
  try {
    const users = await queryDatabase(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    await sendTicketUpdatedEmail(
      user.email,
      user.name || 'Usuário',
      ticketNumber,
      status,
      priority,
      ticketLink
    );
  } catch (error) {
    console.error('Erro ao enviar notificação de ticket atualizado:', error);
  }
}

/**
 * Notificação completa de comentário adicionado
 */
export async function notifyTicketComment(
  ticketId: number,
  userId: number,
  ticketNumber: string,
  comment: string
): Promise<void> {
  try {
    const users = await queryDatabase(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    await sendTicketCommentEmail(
      user.email,
      user.name || 'Usuário',
      ticketNumber,
      comment,
      ticketLink
    );
  } catch (error) {
    console.error('Erro ao enviar notificação de comentário:', error);
  }
}

/**
 * Notificação completa de ticket resolvido
 */
export async function notifyTicketResolved(
  ticketId: number,
  userId: number,
  ticketNumber: string,
  subject: string,
  resolutionNotes: string | null
): Promise<void> {
  try {
    const users = await queryDatabase(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [userId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    await sendTicketResolvedEmail(
      user.email,
      user.name || 'Usuário',
      ticketNumber,
      subject,
      resolutionNotes,
      ticketLink
    );
  } catch (error) {
    console.error('Erro ao enviar notificação de ticket resolvido:', error);
  }
}

/**
 * Notificação completa de ticket atribuído
 */
export async function notifyTicketAssigned(
  ticketId: number,
  assignedToUserId: number,
  ticketNumber: string,
  subject: string,
  priority: string,
  category: string
): Promise<void> {
  try {
    const users = await queryDatabase(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [assignedToUserId]
    );

    if (users.length === 0) return;

    const user = users[0];
    const ticketLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tickets/${ticketId}`;

    await sendTicketAssignedEmail(
      user.email,
      user.name || 'Staff',
      ticketNumber,
      subject,
      priority,
      category,
      ticketLink
    );
  } catch (error) {
    console.error('Erro ao enviar notificação de ticket atribuído:', error);
  }
}

