/**
 * ✅ DIA 2 - ARQUIVO 6: Insurance Claims Service
 * 
 * @description Gerenciamento completo de sinistros de seguro:
 * - Criação e submissão de sinistros
 * - Revisão e aprovação
 * - Processamento de pagamentos
 * - Upload de documentos
 * - Rastreamento de status
 * 
 * @module insurance
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';
import type { InsuranceClaim } from '../insurance-service';

// ================================
// TYPES & SCHEMAS
// ================================

const CreateClaimSchema = z.object({
  policyId: z.number().int().positive(),
  bookingId: z.number().int().positive(),
  userId: z.number().int().positive(),
  claimType: z.enum(['cancellation', 'medical', 'baggage', 'trip_delay', 'accident', 'other']),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  incidentDate: z.string().datetime(),
  incidentLocation: z.string().optional(),
  claimedAmount: z.number().positive('Valor reclamado deve ser positivo'),
  documents: z.array(z.string().url()).optional(),
  evidenceFiles: z.array(z.string().url()).optional(),
});

const ReviewClaimSchema = z.object({
  claimId: z.number().int().positive(),
  reviewerId: z.number().int().positive(),
  status: z.enum(['approved', 'rejected']),
  approvedAmount: z.number().min(0).optional(),
  rejectionReason: z.string().optional(),
  reviewNotes: z.string().optional(),
});

type CreateClaimDTO = z.infer<typeof CreateClaimSchema>;
type ReviewClaimDTO = z.infer<typeof ReviewClaimSchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'insurance-claims:';

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Criar novo sinistro
 */
export async function createClaim(
  data: CreateClaimDTO
): Promise<InsuranceClaim> {
  try {
    const validated = CreateClaimSchema.parse(data);

    // Verificar se apólice existe e está ativa
    // Otimizado: SELECT campos específicos ao invés de SELECT *
    const policy = await queryDatabase(
      `SELECT id, user_id, policy_number, insurance_provider, status, 
              coverage_amount, premium_amount, start_date, end_date
       FROM insurance_policies 
       WHERE id = $1 AND user_id = $2 AND status = 'active'`,
      [validated.policyId, validated.userId]
    ) || [];

    if (policy.length === 0) {
      throw new Error('Apólice não encontrada ou não está ativa');
    }

    // Verificar se já existe sinistro para esta apólice e tipo
    // Otimizado: SELECT apenas campos necessários
    const existingClaim = await queryDatabase(
      `SELECT id, claim_number, status 
       FROM insurance_claims 
       WHERE policy_id = $1 
       AND claim_type = $2 
       AND status NOT IN ('closed', 'rejected')
       AND incident_date::date = $3::date
       LIMIT 1`,
      [validated.policyId, validated.claimType, validated.incidentDate]
    ) || [];

    if (existingClaim.length > 0) {
      throw new Error('Já existe um sinistro aberto para este incidente');
    }

    // Gerar número do sinistro
    const claimNumber = `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Criar sinistro no banco
    const result = await queryDatabase(
      `INSERT INTO insurance_claims (
        policy_id, booking_id, user_id, claim_number, claim_type,
        description, incident_date, incident_location, claimed_amount,
        documents, evidence_files, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        validated.policyId,
        validated.bookingId,
        validated.userId,
        claimNumber,
        validated.claimType,
        validated.description,
        validated.incidentDate,
        validated.incidentLocation || null,
        validated.claimedAmount,
        JSON.stringify(validated.documents || []),
        JSON.stringify(validated.evidenceFiles || []),
      ]
    ) || [];

    if (result.length === 0) {
      throw new Error('Erro ao criar sinistro');
    }

    const claim = result[0];

    // Invalidar cache
    await redisCache.delete(`${CACHE_PREFIX}user:${validated.userId}`);
    await redisCache.delete(`${CACHE_PREFIX}policy:${validated.policyId}`);

    // Enviar notificação para seguradora
    try {
      const policyData = policy[0];
      const insuranceProvider = policyData.insurance_provider || 'default';
      
      // Buscar email de notificação da seguradora (pode estar em configurações ou na apólice)
      const insuranceEmail = process.env.INSURANCE_NOTIFICATION_EMAIL || 
                            process.env.INSURANCE_WEBHOOK_URL ||
                            'insurance@rsv360.com';
      
      // Enviar notificação via webhook ou email
      if (process.env.INSURANCE_WEBHOOK_URL) {
        try {
          await fetch(process.env.INSURANCE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'claim_created',
              claim_number: claimNumber,
              policy_id: validated.policyId,
              claim_type: validated.claimType,
              claimed_amount: validated.claimedAmount,
              incident_date: validated.incidentDate,
            }),
          });
        } catch (webhookError: any) {
          console.error('Erro ao enviar webhook para seguradora:', webhookError);
        }
      } else {
        // Fallback: enviar email
        const { sendEmail } = await import('../email');
        await sendEmail(
          insuranceEmail,
          `Novo Sinistro Criado - ${claimNumber}`,
          `
            <h2>Novo Sinistro Criado</h2>
            <p><strong>Número do Sinistro:</strong> ${claimNumber}</p>
            <p><strong>Apólice:</strong> ${policyData.policy_number || validated.policyId}</p>
            <p><strong>Tipo:</strong> ${validated.claimType}</p>
            <p><strong>Valor Reclamado:</strong> R$ ${validated.claimedAmount.toFixed(2)}</p>
            <p><strong>Data do Incidente:</strong> ${new Date(validated.incidentDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Descrição:</strong> ${validated.description}</p>
          `
        );
      }
    } catch (error: any) {
      console.error('Erro ao enviar notificação para seguradora:', error);
      // Não falhar o processo se a notificação falhar
    }

    // Enviar email de confirmação para usuário
    try {
      // Buscar email do usuário
      const userResult = await queryDatabase(
        `SELECT email, name FROM users WHERE id = $1`,
        [validated.userId]
      ) || [];
      
      if (userResult.length > 0) {
        const user = userResult[0];
        const { sendEmail } = await import('../email');
        
        await sendEmail(
          user.email,
          `Sinistro Criado - ${claimNumber}`,
          `
            <h2>Sinistro Criado com Sucesso</h2>
            <p>Olá ${user.name || 'Usuário'},</p>
            <p>Seu sinistro foi criado e está em análise.</p>
            <p><strong>Número do Sinistro:</strong> ${claimNumber}</p>
            <p><strong>Tipo:</strong> ${validated.claimType}</p>
            <p><strong>Valor Reclamado:</strong> R$ ${validated.claimedAmount.toFixed(2)}</p>
            <p>Você receberá atualizações sobre o status do seu sinistro por email.</p>
          `
        );
      }
    } catch (error: any) {
      console.error('Erro ao enviar email de confirmação:', error);
      // Não falhar o processo se o email falhar
    }

    return mapClaimFromDB(claim);
  } catch (error: any) {
    console.error('Erro ao criar sinistro:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Obter sinistro por ID
 */
export async function getClaimById(
  claimId: number,
  userId?: number
): Promise<InsuranceClaim | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}${claimId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco
    let query = `SELECT c.*, p.policy_number, p.insurance_provider
                 FROM insurance_claims c
                 LEFT JOIN insurance_policies p ON c.policy_id = p.id
                 WHERE c.id = $1`;
    const params: any[] = [claimId];

    if (userId) {
      query += ` AND c.user_id = $2`;
      params.push(userId);
    }

    const result = await queryDatabase(query, params) || [];

    if (result.length === 0) {
      return null;
    }

    const claim = mapClaimFromDB(result[0]);

    // Cache
    await redisCache.set(cacheKey, JSON.stringify(claim), CACHE_TTL);

    return claim;
  } catch (error: any) {
    console.error('Erro ao buscar sinistro:', error);
    throw error;
  }
}

/**
 * Listar sinistros do usuário
 */
export async function listUserClaims(
  userId: number,
  filters?: {
    status?: InsuranceClaim['status'];
    claimType?: InsuranceClaim['claim_type'];
    limit?: number;
    offset?: number;
  }
): Promise<InsuranceClaim[]> {
  try {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}user:${userId}:${JSON.stringify(filters)}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Construir query
    let query = `SELECT c.*, p.policy_number, p.insurance_provider
                 FROM insurance_claims c
                 LEFT JOIN insurance_policies p ON c.policy_id = p.id
                 WHERE c.user_id = $1`;
    const params: any[] = [userId];

    if (filters?.status) {
      query += ` AND c.status = $${params.length + 1}`;
      params.push(filters.status);
    }

    if (filters?.claimType) {
      query += ` AND c.claim_type = $${params.length + 1}`;
      params.push(filters.claimType);
    }

    query += ` ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await queryDatabase(query, params) || [];

    const claims = result.map(mapClaimFromDB);

    // Cache
    await redisCache.set(cacheKey, JSON.stringify(claims), CACHE_TTL);

    return claims;
  } catch (error: any) {
    console.error('Erro ao listar sinistros:', error);
    throw error;
  }
}

/**
 * Revisar sinistro (aprovado/rejeitado)
 */
export async function reviewClaim(
  data: ReviewClaimDTO
): Promise<InsuranceClaim> {
  try {
    const validated = ReviewClaimSchema.parse(data);

    // Buscar sinistro
    const claim = await getClaimById(validated.claimId);
    if (!claim) {
      throw new Error('Sinistro não encontrado');
    }

    if (claim.status !== 'pending' && claim.status !== 'under_review') {
      throw new Error('Sinistro não pode ser revisado neste status');
    }

    // Atualizar sinistro
    let updateQuery = '';
    const updateParams: any[] = [];

    if (validated.status === 'approved') {
      if (!validated.approvedAmount) {
        throw new Error('Valor aprovado é obrigatório para aprovação');
      }

      updateQuery = `UPDATE insurance_claims
                     SET status = 'approved',
                         approved_amount = $1,
                         reviewed_by = $2,
                         reviewed_at = CURRENT_TIMESTAMP,
                         review_notes = $3
                     WHERE id = $4
                     RETURNING *`;
      updateParams.push(
        validated.approvedAmount,
        validated.reviewerId,
        validated.reviewNotes || null,
        validated.claimId
      );
    } else {
      if (!validated.rejectionReason) {
        throw new Error('Motivo da rejeição é obrigatório');
      }

      updateQuery = `UPDATE insurance_claims
                     SET status = 'rejected',
                         rejected_amount = $1,
                         rejection_reason = $2,
                         reviewed_by = $3,
                         reviewed_at = CURRENT_TIMESTAMP,
                         review_notes = $4
                     WHERE id = $5
                     RETURNING *`;
      updateParams.push(
        claim.claimed_amount,
        validated.rejectionReason,
        validated.reviewerId,
        validated.reviewNotes || null,
        validated.claimId
      );
    }

    const result = await queryDatabase(updateQuery, updateParams) || [];

    if (result.length === 0) {
      throw new Error('Erro ao atualizar sinistro');
    }

    const updatedClaim = mapClaimFromDB(result[0]);

    // Invalidar cache
    await redisCache.delete(`${CACHE_PREFIX}${validated.claimId}`);
    await redisCache.delete(`${CACHE_PREFIX}user:${claim.user_id}`);
    await redisCache.delete(`${CACHE_PREFIX}policy:${claim.policy_id}`);

    // Enviar notificação para usuário
    try {
      const { createInAppNotification } = await import('../notification-service');
      await createInAppNotification(
        claim.user_id,
        'system',
        `Sinistro ${claim.claim_number || validated.claimId} ${validated.status === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
        validated.status === 'approved'
          ? `Seu sinistro foi aprovado. O pagamento será processado em breve.`
          : `Seu sinistro foi rejeitado. Motivo: ${validated.rejectionReason || 'Não especificado'}`,
        {
          claimId: validated.claimId,
          status: validated.status,
        }
      );
    } catch (error: any) {
      console.error('Erro ao enviar notificação:', error);
      // Não falhar o processo se a notificação falhar
    }

    // Se aprovado, iniciar processo de pagamento
    if (validated.status === 'approved' && claim.approved_amount) {
      try {
        await processClaimPayment(validated.claimId, {
          paymentMethod: 'automatic',
        });
      } catch (error: any) {
        console.error('Erro ao processar pagamento automático:', error);
        // Não falhar o processo se o pagamento automático falhar
      }
    }

    return updatedClaim;
  } catch (error: any) {
    console.error('Erro ao revisar sinistro:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Processar pagamento de sinistro aprovado
 */
export async function processClaimPayment(
  claimId: number,
  paymentData: {
    paymentMethod: string;
    paymentReference?: string;
  }
): Promise<InsuranceClaim> {
  try {
    // Buscar sinistro
    const claim = await getClaimById(claimId);
    if (!claim) {
      throw new Error('Sinistro não encontrado');
    }

    if (claim.status !== 'approved') {
      throw new Error('Sinistro deve estar aprovado para processar pagamento');
    }

    // Atualizar status para pago
    const result = await queryDatabase(
      `UPDATE insurance_claims
       SET status = 'paid',
           payment_date = CURRENT_TIMESTAMP,
           payment_method = $1,
           payment_reference = $2
       WHERE id = $3
       RETURNING *`,
      [
        paymentData.paymentMethod,
        paymentData.paymentReference || null,
        claimId,
      ]
    ) || [];

    if (result.length === 0) {
      throw new Error('Erro ao processar pagamento');
    }

    const updatedClaim = mapClaimFromDB(result[0]);

    // Invalidar cache
    await redisCache.delete(`${CACHE_PREFIX}${claimId}`);

    // Enviar confirmação de pagamento
    try {
      const { paymentGatewayService } = await import('../external/payment-gateway.service');
      const approvedAmount = claim.approved_amount || claim.claimed_amount;
      const paymentResult = await paymentGatewayService.processPayment({
        amount: approvedAmount,
        currency: 'BRL',
        destinationAccountId: claim.user_id.toString(), // Usar user_id como identificador da conta
        description: `Pagamento de sinistro ${claim.claim_number || claimId}`,
        metadata: {
          claim_id: claimId,
          policy_id: claim.policy_id,
          booking_id: claim.booking_id,
        },
      });

      if (paymentResult.success) {
        // Atualizar sinistro com referência do pagamento
        await queryDatabase(
          `UPDATE insurance_claims
           SET payment_reference = $1,
               payment_method = $2
           WHERE id = $3`,
          [
            paymentResult.reference || paymentResult.transactionId,
            paymentResult.method,
            claimId,
          ]
        );

        // Enviar confirmação de pagamento por email
        try {
          // Buscar email do usuário
          const userResult = await queryDatabase(
            `SELECT email, name FROM users WHERE id = $1`,
            [claim.user_id]
          ) || [];
          
          if (userResult.length > 0) {
            const user = userResult[0];
            const { sendEmail } = await import('../email');
            
            await sendEmail(
              user.email,
              `Pagamento de Sinistro Confirmado - ${claim.claim_number || claimId}`,
              `
                <h2>Pagamento Confirmado</h2>
                <p>Olá ${user.name || 'Usuário'},</p>
                <p>O pagamento do seu sinistro foi processado com sucesso.</p>
                <p><strong>Número do Sinistro:</strong> ${claim.claim_number || claimId}</p>
                <p><strong>Valor Pago:</strong> R$ ${approvedAmount.toFixed(2)}</p>
                <p><strong>Método de Pagamento:</strong> ${paymentResult.method || paymentData.paymentMethod}</p>
                <p><strong>Referência:</strong> ${paymentResult.reference || paymentResult.transactionId || paymentData.paymentReference || 'N/A'}</p>
                <p>O valor será creditado em sua conta em até 3 dias úteis.</p>
              `
            );
          }
        } catch (emailError: any) {
          console.error('Erro ao enviar email de confirmação de pagamento:', emailError);
          // Não falhar o processo se o email falhar
        }
      } else {
        throw new Error(paymentResult.error || 'Falha no pagamento');
      }
    } catch (error: any) {
      console.error('Erro ao processar pagamento do sinistro:', error);
      throw error;
    }

    return updatedClaim;
  } catch (error: any) {
    console.error('Erro ao processar pagamento:', error);
    throw error;
  }
}

/**
 * Adicionar documentos ao sinistro
 */
export async function addClaimDocuments(
  claimId: number,
  userId: number,
  documents: string[]
): Promise<InsuranceClaim> {
  try {
    // Verificar se sinistro pertence ao usuário
    const claim = await getClaimById(claimId, userId);
    if (!claim) {
      throw new Error('Sinistro não encontrado ou acesso negado');
    }

    // Adicionar documentos
    const currentDocs = claim.documents || [];
    const newDocs = [...currentDocs, ...documents];

    const result = await queryDatabase(
      `UPDATE insurance_claims
       SET documents = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [JSON.stringify(newDocs), claimId]
    ) || [];

    if (result.length === 0) {
      throw new Error('Erro ao adicionar documentos');
    }

    const updatedClaim = mapClaimFromDB(result[0]);

    // Invalidar cache
    await redisCache.delete(`${CACHE_PREFIX}${claimId}`);

    return updatedClaim;
  } catch (error: any) {
    console.error('Erro ao adicionar documentos:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de sinistros
 */
export async function getClaimStatistics(
  userId?: number,
  policyId?: number
): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  paid: number;
  totalClaimed: number;
  totalApproved: number;
  totalPaid: number;
}> {
  try {
    let query = `SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status = 'pending') as pending,
      COUNT(*) FILTER (WHERE status = 'approved') as approved,
      COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
      COUNT(*) FILTER (WHERE status = 'paid') as paid,
      SUM(claimed_amount) as total_claimed,
      SUM(approved_amount) as total_approved,
      SUM(approved_amount) FILTER (WHERE status = 'paid') as total_paid
    FROM insurance_claims`;
    const params: any[] = [];

    if (userId) {
      query += ` WHERE user_id = $1`;
      params.push(userId);
    } else if (policyId) {
      query += ` WHERE policy_id = $1`;
      params.push(policyId);
    }

    const result = await queryDatabase(query, params) || [];
    const stats = result[0] || {};

    return {
      total: parseInt(stats.total || '0'),
      pending: parseInt(stats.pending || '0'),
      approved: parseInt(stats.approved || '0'),
      rejected: parseInt(stats.rejected || '0'),
      paid: parseInt(stats.paid || '0'),
      totalClaimed: parseFloat(stats.total_claimed || '0'),
      totalApproved: parseFloat(stats.total_approved || '0'),
      totalPaid: parseFloat(stats.total_paid || '0'),
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas:', error);
    throw error;
  }
}

// ================================
// HELPER FUNCTIONS
// ================================

function mapClaimFromDB(row: any): InsuranceClaim {
  return {
    id: row.id,
    policy_id: row.policy_id,
    booking_id: row.booking_id,
    user_id: row.user_id,
    claim_number: row.claim_number,
    claim_type: row.claim_type,
    description: row.description,
    incident_date: row.incident_date,
    incident_location: row.incident_location,
    claimed_amount: parseFloat(row.claimed_amount || '0'),
    approved_amount: row.approved_amount ? parseFloat(row.approved_amount) : undefined,
    rejected_amount: row.rejected_amount ? parseFloat(row.rejected_amount) : undefined,
    status: row.status || 'pending',
    documents: typeof row.documents === 'string' ? JSON.parse(row.documents || '[]') : (row.documents || []),
    evidence_files: typeof row.evidence_files === 'string' ? JSON.parse(row.evidence_files || '[]') : (row.evidence_files || []),
    reviewed_by: row.reviewed_by ? parseInt(row.reviewed_by) : undefined,
    reviewed_at: row.reviewed_at,
    review_notes: row.review_notes,
    rejection_reason: row.rejection_reason,
    payment_date: row.payment_date,
    payment_method: row.payment_method,
    payment_reference: row.payment_reference,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : (row.metadata || {}),
  };
}

