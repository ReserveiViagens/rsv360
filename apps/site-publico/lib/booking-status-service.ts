/**
 * Serviço de Gerenciamento de Status de Reservas
 * Gerencia transições de status validadas, histórico e notificações
 */

import { queryDatabase } from './db';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress' | 'expired';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed' | 'partial';

export interface StatusTransition {
  from: BookingStatus;
  to: BookingStatus;
  allowed: boolean;
  reason?: string;
}

export interface StatusChange {
  bookingId: number;
  oldStatus: BookingStatus;
  newStatus: BookingStatus;
  changedBy?: number; // user_id
  changedByEmail?: string;
  reason?: string;
  timestamp: Date;
}

/**
 * Matriz de transições de status permitidas
 */
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled', 'expired'],
  confirmed: ['in_progress', 'cancelled', 'completed'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Status final
  cancelled: [], // Status final
  expired: ['cancelled'], // Pode cancelar reserva expirada
};

/**
 * Valida se uma transição de status é permitida
 */
export function validateStatusTransition(
  from: BookingStatus,
  to: BookingStatus
): StatusTransition {
  const allowed = ALLOWED_TRANSITIONS[from]?.includes(to) || false;

  return {
    from,
    to,
    allowed,
    reason: allowed 
      ? undefined 
      : `Transição de '${from}' para '${to}' não é permitida. Transições permitidas: ${ALLOWED_TRANSITIONS[from]?.join(', ') || 'nenhuma'}`,
  };
}

/**
 * Registra mudança de status no histórico
 */
export async function logStatusChange(
  bookingId: number,
  oldStatus: BookingStatus,
  newStatus: BookingStatus,
  changedBy?: number,
  changedByEmail?: string,
  reason?: string
): Promise<void> {
  try {
    // Verificar se tabela booking_status_history existe
    const tableExists = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_status_history'
      ) as exists`
    );

    if (tableExists[0]?.exists) {
      await queryDatabase(
        `INSERT INTO booking_status_history (
          booking_id, old_status, new_status, changed_by, changed_by_email, reason, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [bookingId, oldStatus, newStatus, changedBy || null, changedByEmail || null, reason || null]
      );
    } else {
      // Se tabela não existir, registrar no metadata da reserva
      const booking = await queryDatabase(
        `SELECT metadata FROM bookings WHERE id = $1`,
        [bookingId]
      );

      if (booking && booking.length > 0) {
        const metadata = booking[0].metadata 
          ? (typeof booking[0].metadata === 'string' 
              ? JSON.parse(booking[0].metadata) 
              : booking[0].metadata)
          : {};

        if (!metadata.statusHistory) {
          metadata.statusHistory = [];
        }

        metadata.statusHistory.push({
          oldStatus,
          newStatus,
          changedBy,
          changedByEmail,
          reason,
          timestamp: new Date().toISOString(),
        });

        await queryDatabase(
          `UPDATE bookings SET metadata = $1 WHERE id = $2`,
          [JSON.stringify(metadata), bookingId]
        );
      }
    }
  } catch (error) {
    console.error('Erro ao registrar mudança de status:', error);
    // Não falhar a operação se não conseguir registrar histórico
  }
}

/**
 * Atualiza status de uma reserva com validação
 */
export async function updateBookingStatus(
  bookingId: number,
  newStatus: BookingStatus,
  changedBy?: number,
  changedByEmail?: string,
  reason?: string
): Promise<{ success: boolean; error?: string; booking?: any }> {
  try {
    // Buscar reserva atual
    const booking = await queryDatabase(
      `SELECT id, status, booking_code FROM bookings WHERE id = $1`,
      [bookingId]
    );

    if (!booking || booking.length === 0) {
      return {
        success: false,
        error: 'Reserva não encontrada',
      };
    }

    const currentStatus = booking[0].status as BookingStatus;

    // Validar transição
    const validation = validateStatusTransition(currentStatus, newStatus);

    if (!validation.allowed) {
      return {
        success: false,
        error: validation.reason,
      };
    }

    // Atualizar status
    await queryDatabase(
      `UPDATE bookings SET status = $1, updated_at = NOW() WHERE id = $2`,
      [newStatus, bookingId]
    );

    // Registrar no histórico
    await logStatusChange(
      bookingId,
      currentStatus,
      newStatus,
      changedBy,
      changedByEmail,
      reason
    );

    // Buscar reserva atualizada
    const updatedBooking = await queryDatabase(
      `SELECT * FROM bookings WHERE id = $1`,
      [bookingId]
    );

    return {
      success: true,
      booking: updatedBooking[0],
    };
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Busca histórico de mudanças de status
 */
export async function getStatusHistory(bookingId: number): Promise<StatusChange[]> {
  try {
    // Tentar buscar da tabela dedicada
    const tableExists = await queryDatabase(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'booking_status_history'
      ) as exists`
    );

    if (tableExists[0]?.exists) {
      const history = await queryDatabase(
        `SELECT 
          old_status, new_status, changed_by, changed_by_email, reason, created_at
        FROM booking_status_history
        WHERE booking_id = $1
        ORDER BY created_at DESC`,
        [bookingId]
      );

      return history.map((h: any) => ({
        bookingId,
        oldStatus: h.old_status as BookingStatus,
        newStatus: h.new_status as BookingStatus,
        changedBy: h.changed_by,
        changedByEmail: h.changed_by_email,
        reason: h.reason,
        timestamp: new Date(h.created_at),
      }));
    } else {
      // Buscar do metadata
      const booking = await queryDatabase(
        `SELECT metadata FROM bookings WHERE id = $1`,
        [bookingId]
      );

      if (booking && booking.length > 0) {
        const metadata = booking[0].metadata
          ? (typeof booking[0].metadata === 'string'
              ? JSON.parse(booking[0].metadata)
              : booking[0].metadata)
          : {};

        const history = metadata.statusHistory || [];

        return history.map((h: any) => ({
          bookingId,
          oldStatus: h.oldStatus as BookingStatus,
          newStatus: h.newStatus as BookingStatus,
          changedBy: h.changedBy,
          changedByEmail: h.changedByEmail,
          reason: h.reason,
          timestamp: new Date(h.timestamp),
        }));
      }
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return [];
  }
}

/**
 * Expira reservas pendentes antigas (mais de 15 minutos)
 */
export async function expirePendingBookings(): Promise<number> {
  try {
    const result = await queryDatabase(
      `UPDATE bookings
      SET status = 'expired', updated_at = NOW()
      WHERE status = 'pending'
        AND created_at < NOW() - INTERVAL '15 minutes'
      RETURNING id`
    );

    // Registrar mudanças no histórico
    if (result && result.length > 0) {
      for (const booking of result) {
        await logStatusChange(
          booking.id,
          'pending',
          'expired',
          undefined,
          'system',
          'Reserva expirada automaticamente (timeout de 15 minutos)'
        );
      }
    }

    return result?.length || 0;
  } catch (error) {
    console.error('Erro ao expirar reservas:', error);
    return 0;
  }
}

