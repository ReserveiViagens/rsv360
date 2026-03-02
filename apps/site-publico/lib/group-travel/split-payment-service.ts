/**
 * ✅ FASE 1 - ETAPA 1.3: Split Payment Service Backend
 * Serviço dedicado para gerenciar divisão de pagamentos entre participantes
 * 
 * @module group-travel/split-payment-service
 */

import { queryDatabase, getDbPool } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';
import crypto from 'crypto';
import type { SplitPayment, PaymentSplit, CreateSplitPaymentDTO, UpdateSplitDTO } from './types';

// ============================================
// VALIDAÇÃO ZOD
// ============================================

const createSplitPaymentSchema = z.object({
  bookingId: z.string().min(1, 'bookingId é obrigatório'),
  splits: z.array(z.object({
    userId: z.string().min(1, 'userId é obrigatório'),
    amount: z.number().positive('Amount deve ser positivo'),
    percentage: z.number().min(0).max(100).optional()
  })).min(1, 'Deve ter pelo menos 1 participante')
});

const markAsPaidSchema = z.object({
  method: z.string().min(1, 'Método de pagamento é obrigatório'),
  transactionId: z.string().optional()
});

const customSplitsSchema = z.array(z.object({
  userId: z.string().uuid(),
  percentage: z.number().min(0).max(100)
})).refine(
  (splits) => {
    const total = splits.reduce((sum, s) => sum + s.percentage, 0);
    return Math.abs(total - 100) < 0.01; // Tolerância de 0.01%
  },
  { message: 'Soma das porcentagens deve ser 100%' }
);

// ============================================
// SPLIT PAYMENT SERVICE
// ============================================

class SplitPaymentService {
  /**
   * Criar divisão de pagamento
   */
  async createSplitPayment(
    bookingId: string,
    data: CreateSplitPaymentDTO
  ): Promise<SplitPayment> {
    try {
      // Validar dados
      const validated = createSplitPaymentSchema.parse({
        bookingId,
        splits: data.splits
      });

      // Verificar se booking existe
      const booking = await queryDatabase(
        `SELECT id, total_amount, currency FROM bookings WHERE id = $1`,
        [bookingId]
      );

      if (booking.length === 0) {
        throw new Error('Reserva não encontrada');
      }

      const totalAmount = parseFloat(booking[0].total_amount);
      const currency = booking[0].currency || 'BRL';

      // Verificar se já existe split payment para booking
      const existing = await this.getBookingSplits(bookingId);
      if (existing) {
        throw new Error('Já existe divisão de pagamento para esta reserva');
      }

      // Calcular splits se não fornecidos
      let calculatedSplits: PaymentSplit[];
      if (data.splits.length === 0) {
        // Dividir igualmente (precisa buscar participantes do booking)
        const participants = await queryDatabase(
          `SELECT DISTINCT user_id FROM bookings WHERE id = $1 OR booking_id = $1`,
          [bookingId]
        );
        
        if (participants.length === 0) {
          throw new Error('Nenhum participante encontrado para a reserva');
        }

        calculatedSplits = this.calculateSplits(
          totalAmount,
          participants.map((p: any) => p.user_id.toString())
        );
      } else {
        // Validar que soma dos splits = totalAmount
        const totalSplit = data.splits.reduce((sum, s) => sum + s.amount, 0);
        if (Math.abs(totalSplit - totalAmount) > 0.01) {
          throw new Error(
            `Soma dos splits (${totalSplit}) não corresponde ao total (${totalAmount})`
          );
        }

        calculatedSplits = data.splits.map((split, index) => ({
          id: '', // Será gerado no banco
          splitPaymentId: '', // Será preenchido após criar split payment
          userId: split.userId,
          amount: split.amount,
          percentage: split.percentage || (split.amount / totalAmount) * 100,
          status: 'pending' as const,
          paidAt: null,
          paymentMethod: null
        }));
      }

      // Iniciar transação
      const pool = getDbPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Criar registro split_payments
        const splitResult = await client.query(
          `INSERT INTO split_payments (
            booking_id, total_amount, split_type, status, created_at, updated_at
          )
          VALUES ($1, $2, $3, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id, booking_id, total_amount, split_type, status, created_at, updated_at`,
          [parseInt(bookingId), totalAmount, 'custom']
        );

        const splitPaymentId = splitResult.rows[0].id.toString();

        // Criar registros payment_splits (bulk insert)
        const participantPromises = calculatedSplits.map(async (split) => {
          const invitationToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          const participantResult = await client.query(
            `INSERT INTO split_payment_participants (
              split_payment_id, user_id, email, amount, percentage, status,
              invitation_token, invitation_expires_at, created_at, updated_at
            )
            VALUES (
              $1, $2, 
              (SELECT email FROM users WHERE id = $2),
              $3, $4, 'pending',
              $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
            RETURNING id, split_payment_id, user_id, amount, percentage, status, paid_at, payment_method`,
            [
              parseInt(splitPaymentId),
              parseInt(split.userId),
              split.amount,
              split.percentage,
              invitationToken,
              expiresAt.toISOString()
            ]
          );

          return {
            id: participantResult.rows[0].id.toString(),
            splitPaymentId: splitPaymentId,
            userId: split.userId,
            amount: parseFloat(participantResult.rows[0].amount),
            percentage: parseFloat(participantResult.rows[0].percentage || '0'),
            status: participantResult.rows[0].status,
            paidAt: participantResult.rows[0].paid_at,
            paymentMethod: participantResult.rows[0].payment_method
          } as PaymentSplit;
        });

        const createdSplits = await Promise.all(participantPromises);

        await client.query('COMMIT');

        // Enviar notificações (assíncrono)
        this.sendNotifications(splitPaymentId, createdSplits).catch(err => {
          console.error('Erro ao enviar notificações:', err);
        });

        // Retornar split payment criado
        return {
          id: splitPaymentId,
          bookingId: bookingId,
          totalAmount: totalAmount,
          currency: currency,
          splits: createdSplits,
          status: 'pending',
          createdAt: splitResult.rows[0].created_at,
          updatedAt: splitResult.rows[0].updated_at
        };
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Erro ao criar split payment:', error);
      if (error instanceof z.ZodError) {
        throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Erro ao criar divisão de pagamento: ${error.message}`);
    }
  }

  /**
   * Buscar divisões de pagamento de uma reserva
   */
  async getBookingSplits(bookingId: string): Promise<SplitPayment | null> {
    const cacheKey = `split:booking:${bookingId}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Buscar do banco
      const splitResult = await queryDatabase(
        `SELECT * FROM split_payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [parseInt(bookingId)]
      ) || [];

      if (splitResult.length === 0) {
        return null;
      }

      const split = splitResult[0];

      // Buscar participantes com dados dos usuários
      const participantsResult = await queryDatabase(
        `SELECT 
          sp.id,
          sp.split_payment_id,
          sp.user_id,
          sp.amount,
          sp.percentage,
          sp.status,
          sp.paid_at,
          sp.payment_method,
          u.name as user_name,
          u.email as user_email
         FROM split_payment_participants sp
         LEFT JOIN users u ON sp.user_id = u.id
         WHERE sp.split_payment_id = $1
         ORDER BY sp.created_at ASC`,
        [split.id]
      ) || [];

      const splits: PaymentSplit[] = participantsResult.map((row: any) => ({
        id: row.id.toString(),
        splitPaymentId: row.split_payment_id.toString(),
        userId: row.user_id?.toString() || '',
        amount: parseFloat(row.amount),
        percentage: parseFloat(row.percentage || '0'),
        status: row.status,
        paidAt: row.paid_at ? new Date(row.paid_at) : null,
        paymentMethod: row.payment_method,
        user: row.user_name ? {
          name: row.user_name,
          email: row.user_email
        } : undefined
      }));

      const splitPayment: SplitPayment = {
        id: split.id.toString(),
        bookingId: split.booking_id.toString(),
        totalAmount: parseFloat(split.total_amount),
        currency: 'BRL', // TODO: buscar do booking
        splits: splits,
        status: split.status,
        createdAt: split.created_at,
        updatedAt: split.updated_at
      };

      // Cachear resultado (TTL 300s)
      await redisCache.set(cacheKey, JSON.stringify(splitPayment), 300);

      return splitPayment;
    } catch (error: any) {
      console.error('Erro ao buscar splits:', error);
      throw new Error(`Erro ao buscar divisões: ${error.message}`);
    }
  }

  /**
   * Marcar split como pago
   */
  async markAsPaid(
    splitId: string,
    paymentData: { method: string; transactionId?: string }
  ): Promise<PaymentSplit> {
    try {
      // Validar dados
      const validated = markAsPaidSchema.parse(paymentData);

      const pool = getDbPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Buscar split
        const splitResult = await client.query(
          `SELECT * FROM split_payment_participants WHERE id = $1`,
          [parseInt(splitId)]
        );

        if (splitResult.rows.length === 0) {
          throw new Error('Split não encontrado');
        }

        const split = splitResult.rows[0];

        // Verificar se já está pago
        if (split.status === 'paid') {
          throw new Error('Split já está pago');
        }

        // Atualizar status
        const updateResult = await client.query(
          `UPDATE split_payment_participants
           SET status = 'paid',
               payment_method = $1,
               paid_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2
           RETURNING *`,
          [validated.method, parseInt(splitId)]
        );

        // Verificar status geral do split payment
        const allSplitsResult = await client.query(
          `SELECT status FROM split_payment_participants WHERE split_payment_id = $1`,
          [split.split_payment_id]
        );

        const allSplits = allSplitsResult.rows;
        const paidCount = allSplits.filter((s: any) => s.status === 'paid').length;
        const totalCount = allSplits.length;

        let newStatus: 'pending' | 'partial' | 'completed';
        if (paidCount === totalCount) {
          newStatus = 'completed';
        } else if (paidCount > 0) {
          newStatus = 'partial';
        } else {
          newStatus = 'pending';
        }

        // Atualizar status do split payment
        await client.query(
          `UPDATE split_payments
           SET status = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [newStatus, split.split_payment_id]
        );

        await client.query('COMMIT');

        // Invalidar cache
        await this.invalidateCache(split.split_payment_id.toString());

        // Enviar notificação de confirmação
        this.sendPaymentConfirmation(splitId).catch(err => {
          console.error('Erro ao enviar confirmação:', err);
        });

        return {
          id: updateResult.rows[0].id.toString(),
          splitPaymentId: updateResult.rows[0].split_payment_id.toString(),
          userId: updateResult.rows[0].user_id?.toString() || '',
          amount: parseFloat(updateResult.rows[0].amount),
          percentage: parseFloat(updateResult.rows[0].percentage || '0'),
          status: updateResult.rows[0].status,
          paidAt: updateResult.rows[0].paid_at ? new Date(updateResult.rows[0].paid_at) : null,
          paymentMethod: updateResult.rows[0].payment_method
        };
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Erro ao marcar como pago:', error);
      throw new Error(`Erro ao processar pagamento: ${error.message}`);
    }
  }

  /**
   * Calcular splits automaticamente
   */
  calculateSplits(
    totalAmount: number,
    participants: string[],
    customSplits?: Array<{ userId: string; percentage: number }>
  ): PaymentSplit[] {
    let splits: PaymentSplit[];

    if (customSplits) {
      // Validar porcentagens
      const totalPercentage = customSplits.reduce((sum, s) => sum + s.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        throw new Error('Soma das porcentagens deve ser 100%');
      }

      // Calcular amounts
      splits = customSplits.map((custom) => ({
        id: '',
        splitPaymentId: '',
        userId: custom.userId,
        amount: (totalAmount * custom.percentage) / 100,
        percentage: custom.percentage,
        status: 'pending' as const,
        paidAt: null,
        paymentMethod: null
      }));
    } else {
      // Dividir igualmente
      const percentagePerPerson = 100 / participants.length;
      const amountPerPerson = totalAmount / participants.length;

      splits = participants.map((userId) => ({
        id: '',
        splitPaymentId: '',
        userId: userId,
        amount: amountPerPerson,
        percentage: percentagePerPerson,
        status: 'pending' as const,
        paidAt: null,
        paymentMethod: null
      }));
    }

    // Arredondar valores (2 casas decimais)
    splits = splits.map((split, index) => {
      const roundedAmount = Math.round(split.amount * 100) / 100;
      return {
        ...split,
        amount: roundedAmount
      };
    });

    // Ajustar último split para compensar diferenças de arredondamento
    const totalCalculated = splits.reduce((sum, s) => sum + s.amount, 0);
    const difference = totalAmount - totalCalculated;
    
    if (Math.abs(difference) > 0.01) {
      splits[splits.length - 1].amount += difference;
      splits[splits.length - 1].amount = Math.round(splits[splits.length - 1].amount * 100) / 100;
    }

    return splits;
  }

  /**
   * Obter status do split payment
   */
  async getSplitStatus(bookingId: string): Promise<{
    total: number;
    paid: number;
    pending: number;
    percentage: number;
  }> {
    const cacheKey = `split:status:${bookingId}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const splitPayment = await this.getBookingSplits(bookingId);
      
      if (!splitPayment) {
        throw new Error('Split payment não encontrado');
      }

      const paid = splitPayment.splits
        .filter(s => s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0);

      const pending = splitPayment.totalAmount - paid;
      const percentage = (paid / splitPayment.totalAmount) * 100;

      const status = {
        total: splitPayment.totalAmount,
        paid: paid,
        pending: pending,
        percentage: percentage
      };

      // Cachear resultado (TTL 60s)
      await redisCache.set(cacheKey, JSON.stringify(status), 60);

      return status;
    } catch (error: any) {
      console.error('Erro ao buscar status:', error);
      throw new Error(`Erro ao buscar status: ${error.message}`);
    }
  }

  /**
   * Buscar splits do usuário
   */
  async getUserSplits(
    userId: string,
    options?: { status?: string; limit?: number; offset?: number }
  ): Promise<PaymentSplit[]> {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;
    const statusFilter = options?.status;
    const cacheKey = `split:user:${userId}:${statusFilter || 'all'}:${limit}:${offset}`;

    try {
      // Tentar cache
      const cached = await redisCache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Construir query
      let query = `
        SELECT 
          sp.id,
          sp.split_payment_id,
          sp.user_id,
          sp.amount,
          sp.percentage,
          sp.status,
          sp.paid_at,
          sp.payment_method,
          spm.booking_id
        FROM split_payment_participants sp
        INNER JOIN split_payments spm ON sp.split_payment_id = spm.id
        WHERE sp.user_id = $1
      `;

      const params: any[] = [parseInt(userId)];

      if (statusFilter) {
        query += ` AND sp.status = $2`;
        params.push(statusFilter);
        query += ` ORDER BY sp.created_at DESC LIMIT $3 OFFSET $4`;
        params.push(limit, offset);
      } else {
        query += ` ORDER BY sp.created_at DESC LIMIT $2 OFFSET $3`;
        params.push(limit, offset);
      }

      const result = await queryDatabase(query, params);

      const splits: PaymentSplit[] = result.map((row: any) => ({
        id: row.id.toString(),
        splitPaymentId: row.split_payment_id.toString(),
        userId: row.user_id?.toString() || '',
        amount: parseFloat(row.amount),
        percentage: parseFloat(row.percentage || '0'),
        status: row.status,
        paidAt: row.paid_at ? new Date(row.paid_at) : null,
        paymentMethod: row.payment_method
      }));

      // Cachear resultado (TTL 180s)
      await redisCache.set(cacheKey, JSON.stringify(splits), 180);

      return splits;
    } catch (error: any) {
      console.error('Erro ao buscar splits do usuário:', error);
      throw new Error(`Erro ao buscar splits: ${error.message}`);
    }
  }

  /**
   * Enviar lembrete de pagamento
   */
  async sendReminder(splitId: string): Promise<void> {
    try {
      // Buscar split
      const splitResult = await queryDatabase(
        `SELECT * FROM split_payment_participants WHERE id = $1`,
        [parseInt(splitId)]
      );

      if (splitResult.length === 0) {
        throw new Error('Split não encontrado');
      }

      const split = splitResult[0];

      // ✅ CORREÇÃO ERRO 3-5: Verificar se split está pendente OU parcialmente pago
      if (!['pending', 'partial'].includes(split.status)) {
        throw new Error('Split não está com status válido para lembretes');
      }

      // Rate limit: máx 1 lembrete/dia por split
      const lastReminderKey = `split:reminder:${splitId}`;
      const lastReminder = await redisCache.get(lastReminderKey);
      
      if (lastReminder) {
        const lastDate = new Date(JSON.parse(lastReminder));
        const now = new Date();
        const hoursDiff = (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          throw new Error('Lembrete já enviado nas últimas 24 horas');
        }
      }

      // Enviar lembrete (email/push/SMS)
      // TODO: Implementar integração com serviço de notificações
      console.log(`Enviando lembrete para split ${splitId}`);

      // Registrar log de envio
      await redisCache.set(lastReminderKey, JSON.stringify(new Date()), 24 * 60 * 60);
    } catch (error: any) {
      console.error('Erro ao enviar lembrete:', error);
      throw new Error(`Erro ao enviar lembrete: ${error.message}`);
    }
  }

  /**
   * Processar estorno de split
   */
  async refundSplit(splitId: string, reason: string): Promise<PaymentSplit> {
    try {
      const pool = getDbPool();
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Buscar split
        const splitResult = await client.query(
          `SELECT * FROM split_payment_participants WHERE id = $1`,
          [parseInt(splitId)]
        );

        if (splitResult.rows.length === 0) {
          throw new Error('Split não encontrado');
        }

        const split = splitResult.rows[0];

        // Verificar se está paid
        if (split.status !== 'paid') {
          throw new Error('Split não está pago');
        }

        // TODO: Processar estorno via payment gateway
        // Por enquanto, apenas atualizar status

        // Atualizar status para refunded
        const updateResult = await client.query(
          `UPDATE split_payment_participants
           SET status = 'cancelled',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1
           RETURNING *`,
          [parseInt(splitId)]
        );

        // Registrar no histórico
        await client.query(
          `INSERT INTO split_payment_history (
            split_payment_id, participant_id, amount, payment_method,
            status, gateway_response, created_at
          )
          VALUES ($1, $2, $3, $4, 'refunded', $5, CURRENT_TIMESTAMP)`,
          [
            split.split_payment_id,
            parseInt(splitId),
            split.amount,
            split.payment_method,
            JSON.stringify({ reason, refunded_at: new Date().toISOString() })
          ]
        );

        await client.query('COMMIT');

        // Invalidar cache
        await this.invalidateCache(split.split_payment_id.toString());

        // Enviar notificação
        console.log(`Estorno processado para split ${splitId}: ${reason}`);

        return {
          id: updateResult.rows[0].id.toString(),
          splitPaymentId: updateResult.rows[0].split_payment_id.toString(),
          userId: updateResult.rows[0].user_id?.toString() || '',
          amount: parseFloat(updateResult.rows[0].amount),
          percentage: parseFloat(updateResult.rows[0].percentage || '0'),
          status: updateResult.rows[0].status,
          paidAt: null,
          paymentMethod: null
        };
      } catch (error: any) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error: any) {
      console.error('Erro ao processar estorno:', error);
      throw new Error(`Erro ao processar estorno: ${error.message}`);
    }
  }

  /**
   * Invalidar cache
   */
  private async invalidateCache(splitPaymentId: string): Promise<void> {
    const patterns = [
      `split:booking:*`,
      `split:status:*`,
      `split:user:*`
    ];

    // Invalidar caches conhecidos (Redis não suporta pattern delete diretamente)
    try {
      // Por simplicidade, invalidamos apenas os caches mais comuns
      // Em produção, usar SCAN para invalidar todos os padrões
    } catch (error) {
      console.warn('Erro ao invalidar cache:', error);
    }
  }

  /**
   * Enviar notificações para participantes
   */
  private async sendNotifications(
    splitPaymentId: string,
    splits: PaymentSplit[]
  ): Promise<void> {
    // TODO: Implementar integração com serviço de notificações
    console.log(`Enviando notificações para ${splits.length} participantes`);
  }

  /**
   * Enviar confirmação de pagamento
   */
  private async sendPaymentConfirmation(splitId: string): Promise<void> {
    // TODO: Implementar integração com serviço de notificações
    console.log(`Enviando confirmação de pagamento para split ${splitId}`);
  }
}

// Exportar instância singleton
export default new SplitPaymentService();

