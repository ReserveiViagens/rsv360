/**
 * Serviço de Notificações para Check-in/Check-out
 * Envia notificações por email e WebSocket para eventos de check-in
 */

import { sendBookingConfirmation } from './email';
import { queryDatabase } from './db';

export interface CheckinNotificationData {
  checkinId: number;
  bookingId: number;
  userId: number;
  propertyId: number;
  checkInCode: string;
  status: string;
  qrCodeUrl?: string;
  accessCode?: string;
}

/**
 * Envia notificação de check-in criado
 */
export async function sendCheckinCreatedNotification(data: CheckinNotificationData): Promise<void> {
  try {
    // Buscar dados do usuário e reserva
    const [users, bookings, properties] = await Promise.all([
      queryDatabase('SELECT id, name, email, phone FROM users WHERE id = $1', [data.userId]),
      queryDatabase('SELECT id, check_in, check_out, customer FROM bookings WHERE id = $1', [data.bookingId]),
      queryDatabase('SELECT id, name, address FROM properties WHERE id = $1', [data.propertyId])
    ]);

    const user = users[0];
    const booking = bookings[0];
    const property = properties[0];

    if (!user || !booking) {
      console.error('Usuário ou reserva não encontrados para notificação');
      return;
    }

    // Enviar email
    const emailSubject = 'Check-in Digital Criado - RSV Gen 2';
    const emailBody = `
      <h2>Check-in Digital Criado com Sucesso!</h2>
      <p>Olá ${user.name},</p>
      <p>Seu check-in digital foi criado para a reserva #${data.bookingId}.</p>
      
      <h3>Detalhes do Check-in:</h3>
      <ul>
        <li><strong>Código:</strong> ${data.checkInCode}</li>
        <li><strong>Propriedade:</strong> ${property?.name || 'N/A'}</li>
        <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString('pt-BR')}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString('pt-BR')}</li>
      </ul>

      ${data.qrCodeUrl ? `
        <p><strong>QR Code:</strong> <a href="${data.qrCodeUrl}">Ver QR Code</a></p>
      ` : ''}

      ${data.accessCode ? `
        <p><strong>Código de Acesso:</strong> ${data.accessCode}</p>
      ` : ''}

      <p>Você pode acessar seu check-in em: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkin/${data.checkinId}">Ver Check-in</a></p>

      <p>Próximos passos:</p>
      <ol>
        <li>Envie os documentos necessários para verificação</li>
        <li>Aguarde a verificação dos documentos</li>
        <li>Use o QR code ou código de acesso no dia do check-in</li>
      </ol>

      <p>Obrigado por usar o RSV Gen 2!</p>
    `;

    await sendBookingConfirmation(user.email, emailSubject, emailBody);

    // Em produção, também enviar via WebSocket
    // await sendWebSocketNotification(userId, { type: 'checkin_created', data });

  } catch (error) {
    console.error('Erro ao enviar notificação de check-in criado:', error);
  }
}

/**
 * Envia notificação de documentos verificados
 */
export async function sendDocumentsVerifiedNotification(data: CheckinNotificationData): Promise<void> {
  try {
    const [users] = await Promise.all([
      queryDatabase('SELECT id, name, email FROM users WHERE id = $1', [data.userId])
    ]);

    const user = users[0];
    if (!user) return;

    const emailSubject = 'Documentos Verificados - Check-in Aprovado';
    const emailBody = `
      <h2>Documentos Verificados com Sucesso!</h2>
      <p>Olá ${user.name},</p>
      <p>Seus documentos foram verificados e seu check-in foi aprovado.</p>
      
      <p><strong>Código de Check-in:</strong> ${data.checkInCode}</p>
      
      ${data.qrCodeUrl ? `
        <p><a href="${data.qrCodeUrl}">Ver QR Code</a></p>
      ` : ''}

      <p>Você está pronto para fazer check-in na propriedade!</p>
    `;

    await sendBookingConfirmation(user.email, emailSubject, emailBody);

  } catch (error) {
    console.error('Erro ao enviar notificação de documentos verificados:', error);
  }
}

/**
 * Envia notificação de check-in realizado
 */
export async function sendCheckinCompletedNotification(data: CheckinNotificationData): Promise<void> {
  try {
    const [users, bookings, properties] = await Promise.all([
      queryDatabase('SELECT id, name, email FROM users WHERE id = $1', [data.userId]),
      queryDatabase('SELECT id, check_in, check_out FROM bookings WHERE id = $1', [data.bookingId]),
      queryDatabase('SELECT id, name FROM properties WHERE id = $1', [data.propertyId])
    ]);

    const user = users[0];
    const booking = bookings[0];
    const property = properties[0];

    if (!user) return;

    const emailSubject = 'Check-in Realizado com Sucesso!';
    const emailBody = `
      <h2>Check-in Realizado!</h2>
      <p>Olá ${user.name},</p>
      <p>Seu check-in foi realizado com sucesso na propriedade ${property?.name || 'N/A'}.</p>
      
      <h3>Detalhes:</h3>
      <ul>
        <li><strong>Reserva:</strong> #${data.bookingId}</li>
        <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString('pt-BR')}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString('pt-BR')}</li>
      </ul>

      ${data.accessCode ? `
        <p><strong>Código de Acesso:</strong> ${data.accessCode}</p>
      ` : ''}

      <p>Tenha uma ótima estadia!</p>
    `;

    await sendBookingConfirmation(user.email, emailSubject, emailBody);

    // Notificar host/proprietário também
    // await notifyHost(data.propertyId, { type: 'guest_checked_in', data });

  } catch (error) {
    console.error('Erro ao enviar notificação de check-in realizado:', error);
  }
}

/**
 * Envia notificação de check-out realizado
 */
export async function sendCheckoutCompletedNotification(data: CheckinNotificationData): Promise<void> {
  try {
    const [users, bookings, properties] = await Promise.all([
      queryDatabase('SELECT id, name, email FROM users WHERE id = $1', [data.userId]),
      queryDatabase('SELECT id, check_in, check_out FROM bookings WHERE id = $1', [data.bookingId]),
      queryDatabase('SELECT id, name FROM properties WHERE id = $1', [data.propertyId])
    ]);

    const user = users[0];
    const booking = bookings[0];
    const property = properties[0];

    if (!user) return;

    const emailSubject = 'Check-out Realizado';
    const emailBody = `
      <h2>Check-out Realizado com Sucesso!</h2>
      <p>Olá ${user.name},</p>
      <p>Seu check-out foi realizado na propriedade ${property?.name || 'N/A'}.</p>
      
      <p>Obrigado por escolher o RSV Gen 2. Esperamos vê-lo novamente em breve!</p>
    `;

    await sendBookingConfirmation(user.email, emailSubject, emailBody);

  } catch (error) {
    console.error('Erro ao enviar notificação de check-out realizado:', error);
  }
}

/**
 * Envia notificação para host sobre novo check-in
 */
export async function notifyHostAboutCheckin(propertyId: number, checkinData: CheckinNotificationData): Promise<void> {
  try {
    // Buscar proprietário da propriedade
    const properties = await queryDatabase(
      'SELECT id, owner_id, name FROM properties WHERE id = $1',
      [propertyId]
    );

    const property = properties[0];
    if (!property || !property.owner_id) return;

    const [owners] = await Promise.all([
      queryDatabase('SELECT id, name, email FROM users WHERE id = $1', [property.owner_id])
    ]);

    const owner = owners[0];
    if (!owner) return;

    const emailSubject = 'Novo Check-in Digital - ' + property.name;
    const emailBody = `
      <h2>Novo Check-in Digital</h2>
      <p>Olá ${owner.name},</p>
      <p>Um novo check-in digital foi criado para sua propriedade <strong>${property.name}</strong>.</p>
      
      <h3>Detalhes:</h3>
      <ul>
        <li><strong>Reserva:</strong> #${checkinData.bookingId}</li>
        <li><strong>Código:</strong> ${checkinData.checkInCode}</li>
        <li><strong>Status:</strong> ${checkinData.status}</li>
      </ul>

      <p>Acompanhe o check-in em: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/checkins/${checkinData.checkinId}">Ver Check-in</a></p>
    `;

    await sendBookingConfirmation(owner.email, emailSubject, emailBody);

  } catch (error) {
    console.error('Erro ao notificar host sobre check-in:', error);
  }
}

