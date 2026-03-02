/**
 * Serviço de Disponibilidade
 * Valida conflitos de datas e capacidade máxima
 */

import { queryDatabase } from './db';

export interface AvailabilityCheck {
  available: boolean;
  conflictingBookings: number;
  conflictingBookingIds: number[];
  reason?: string;
  capacityAvailable?: boolean;
  maxCapacity?: number;
  requestedGuests?: number;
}

export interface DateConflict {
  bookingId: number;
  bookingCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
}

/**
 * Verifica disponibilidade de um item (hotel/quarto) para um período
 * @param itemId - ID do item (hotel/quarto)
 * @param checkIn - Data de check-in (YYYY-MM-DD)
 * @param checkOut - Data de check-out (YYYY-MM-DD)
 * @param requestedGuests - Número de hóspedes solicitados (opcional)
 * @returns Resultado da verificação de disponibilidade
 */
export async function checkAvailability(
  itemId: number,
  checkIn: string,
  checkOut: string,
  requestedGuests?: number
): Promise<AvailabilityCheck> {
  try {
    // Validar formato de datas
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validações básicas
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return {
        available: false,
        conflictingBookings: 0,
        conflictingBookingIds: [],
        reason: 'Datas inválidas',
      };
    }

    if (checkInDate < today) {
      return {
        available: false,
        conflictingBookings: 0,
        conflictingBookingIds: [],
        reason: 'Data de check-in não pode ser no passado',
      };
    }

    if (checkOutDate <= checkInDate) {
      return {
        available: false,
        conflictingBookings: 0,
        conflictingBookingIds: [],
        reason: 'Data de check-out deve ser posterior ao check-in',
      };
    }

    // Verificar conflitos de datas na tabela bookings
    // Buscar reservas que conflitam com o período solicitado
    const conflictingBookings = await queryDatabase(
      `SELECT 
        id,
        booking_code,
        check_in,
        check_out,
        status,
        total_guests
      FROM bookings
      WHERE item_id = $1
        AND status IN ('pending', 'confirmed', 'in_progress')
        AND (
          -- Check-in dentro do período solicitado
          (check_in >= $2 AND check_in < $3)
          -- Check-out dentro do período solicitado
          OR (check_out > $2 AND check_out <= $3)
          -- Período solicitado está completamente dentro de uma reserva existente
          OR (check_in <= $2 AND check_out >= $3)
          -- Reserva existente está completamente dentro do período solicitado
          OR (check_in >= $2 AND check_out <= $3)
        )
      ORDER BY check_in ASC`,
      [itemId, checkIn, checkOut]
    );

    const conflicts = conflictingBookings as DateConflict[];

    // Verificar capacidade máxima (se houver informação de capacidade)
    let capacityAvailable = true;
    let maxCapacity: number | undefined;
    
    if (requestedGuests && requestedGuests > 0) {
      try {
        // Tentar buscar capacidade máxima do item
        const capacityInfo = await queryDatabase(
          `SELECT 
            max_guests,
            max_capacity
          FROM website_content
          WHERE id = $1 AND type = 'hotel'
          LIMIT 1`,
          [itemId]
        );

        if (capacityInfo && capacityInfo.length > 0) {
          maxCapacity = capacityInfo[0].max_guests || capacityInfo[0].max_capacity;
          
          if (maxCapacity) {
            // Calcular ocupação total no período
            const totalGuestsInPeriod = await queryDatabase(
              `SELECT COALESCE(SUM(total_guests), 0) as total
              FROM bookings
              WHERE item_id = $1
                AND status IN ('pending', 'confirmed', 'in_progress')
                AND (
                  (check_in >= $2 AND check_in < $3)
                  OR (check_out > $2 AND check_out <= $3)
                  OR (check_in <= $2 AND check_out >= $3)
                  OR (check_in >= $2 AND check_out <= $3)
                )`,
              [itemId, checkIn, checkOut]
            );

            const currentOccupancy = parseInt(totalGuestsInPeriod[0]?.total || '0');
            capacityAvailable = (currentOccupancy + requestedGuests) <= maxCapacity;
          }
        }
      } catch (error) {
        // Se não conseguir verificar capacidade, assumir que está disponível
        console.log('Não foi possível verificar capacidade máxima:', error);
      }
    }

    // Determinar se está disponível
    const available = conflicts.length === 0 && capacityAvailable;

    return {
      available,
      conflictingBookings: conflicts.length,
      conflictingBookingIds: conflicts.map(c => c.id),
      reason: !available 
        ? conflicts.length > 0 
          ? `Conflito com ${conflicts.length} reserva(s) existente(s)`
          : !capacityAvailable
          ? `Capacidade máxima excedida (${maxCapacity} hóspedes)`
          : undefined
        : undefined,
      capacityAvailable,
      maxCapacity,
      requestedGuests,
    };
  } catch (error: any) {
    console.error('Erro ao verificar disponibilidade:', error);
    return {
      available: false,
      conflictingBookings: 0,
      conflictingBookingIds: [],
      reason: `Erro ao verificar disponibilidade: ${error.message}`,
    };
  }
}

/**
 * Verifica se um período está temporariamente bloqueado
 * @param itemId - ID do item
 * @param checkIn - Data de check-in
 * @param checkOut - Data de check-out
 * @param excludeBookingId - ID de reserva a excluir da verificação (opcional)
 * @returns Status de bloqueio
 */
export async function isPeriodBlocked(
  itemId: number,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: number
): Promise<{ blocked: boolean; bookingId?: number; reason?: string }> {
  try {
    // Verificar se há bloqueios temporários (reservas em processo)
    // Por enquanto, verificamos apenas reservas pending recentes
    const recentPending = await queryDatabase(
      `SELECT id, booking_code, created_at
      FROM bookings
      WHERE item_id = $1
        AND status = 'pending'
        AND created_at > NOW() - INTERVAL '15 minutes'
        ${excludeBookingId ? 'AND id != $4' : ''}
        AND (
          (check_in >= $2 AND check_in < $3)
          OR (check_out > $2 AND check_out <= $3)
          OR (check_in <= $2 AND check_out >= $3)
          OR (check_in >= $2 AND check_out <= $3)
        )
      ORDER BY created_at DESC
      LIMIT 1`,
      excludeBookingId 
        ? [itemId, checkIn, checkOut, excludeBookingId]
        : [itemId, checkIn, checkOut]
    );

    if (recentPending && recentPending.length > 0) {
      return {
        blocked: true,
        bookingId: recentPending[0].id,
        reason: 'Período temporariamente bloqueado por reserva em processo',
      };
    }

    return { blocked: false };
  } catch (error: any) {
    console.error('Erro ao verificar bloqueio:', error);
    return { blocked: false };
  }
}

/**
 * Bloqueia um período temporariamente (durante processo de reserva)
 * @param itemId - ID do item
 * @param checkIn - Data de check-in
 * @param checkOut - Data de check-out
 * @param bookingId - ID da reserva (ou temporário)
 * @param timeoutMinutes - Tempo de timeout em minutos (padrão: 15)
 * @returns Sucesso do bloqueio
 */
export async function blockPeriod(
  itemId: number,
  checkIn: string,
  checkOut: string,
  bookingId: number,
  timeoutMinutes: number = 15
): Promise<{ success: boolean; error?: string }> {
  try {
    // Por enquanto, o bloqueio é implícito através da criação da reserva
    // Em uma implementação mais robusta, usaríamos uma tabela de bloqueios temporários
    // ou Redis para bloqueios de curta duração
    
    // Verificar se já está bloqueado por outra reserva
    const blockStatus = await isPeriodBlocked(itemId, checkIn, checkOut, bookingId);
    
    if (blockStatus.blocked) {
      return {
        success: false,
        error: blockStatus.reason || 'Período já está bloqueado',
      };
    }

    // O bloqueio será efetivado quando a reserva for criada com status 'pending'
    // e será liberado automaticamente após timeout ou quando a reserva for confirmada/cancelada
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao bloquear período:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Libera um bloqueio de período
 * @param itemId - ID do item
 * @param bookingId - ID da reserva
 * @returns Sucesso da liberação
 */
export async function releaseBlock(
  itemId: number,
  bookingId: number
): Promise<{ success: boolean }> {
  try {
    // A liberação acontece automaticamente quando:
    // 1. A reserva é confirmada (status muda para 'confirmed')
    // 2. A reserva é cancelada (status muda para 'cancelled')
    // 3. A reserva expira (timeout de 15 minutos)
    
    // Em uma implementação mais robusta, limparíamos bloqueios explícitos aqui
    
    return { success: true };
  } catch (error: any) {
    console.error('Erro ao liberar bloqueio:', error);
    return { success: false };
  }
}

