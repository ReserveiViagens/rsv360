/**
 * ✅ FASE 5: SERVIÇO DE SEGURO DE VIAGEM
 * Gerenciamento de apólices e sinistros com integração Kakau
 */

import { queryDatabase } from './db';
import { kakauInsuranceClient, KakauPolicyRequest } from './kakau-insurance-client';

export interface InsurancePolicy {
  id?: number;
  booking_id: number;
  user_id: number;
  policy_number?: string;
  insurance_provider?: string;
  coverage_type?: 'basic' | 'standard' | 'premium' | 'comprehensive';
  coverage_amount: number;
  premium_amount: number;
  deductible?: number;
  coverage_start_date: string;
  coverage_end_date: string;
  status?: 'active' | 'expired' | 'cancelled' | 'claimed';
  insured_name: string;
  insured_document?: string;
  insured_email?: string;
  insured_phone?: string;
  policy_details?: any;
  terms_accepted?: boolean;
}

export interface InsuranceClaim {
  id?: number;
  policy_id: number;
  booking_id: number;
  user_id: number;
  claim_number?: string;
  claim_type: 'cancellation' | 'medical' | 'baggage' | 'trip_delay' | 'accident' | 'other';
  description: string;
  incident_date: string;
  incident_location?: string;
  claimed_amount: number;
  approved_amount?: number;
  rejected_amount?: number;
  status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'paid' | 'closed';
  documents?: string[];
  evidence_files?: string[];
  reviewed_by?: number;
  reviewed_at?: string;
  review_notes?: string;
  rejection_reason?: string;
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  metadata?: any;
}

/**
 * ✅ Criar apólice de seguro (com integração Kakau)
 */
export async function createInsurancePolicy(
  policy: InsurancePolicy
): Promise<InsurancePolicy> {
  // Buscar informações da reserva
  const booking = await queryDatabase(
    `SELECT 
      b.*,
      p.name as property_name,
      p.city as destination
     FROM bookings b
     LEFT JOIN properties p ON b.property_id = p.id
     WHERE b.id = $1`,
    [policy.booking_id]
  );

  if (booking.length === 0) {
    throw new Error('Reserva não encontrada');
  }

  const bookingData = booking[0];
  const tripDuration = Math.ceil(
    (new Date(policy.coverage_end_date).getTime() - new Date(policy.coverage_start_date).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  // Criar apólice na Kakau (se habilitado)
  let kakauPolicy = null;
  if (policy.insurance_provider === 'kakau' || process.env.KAKAU_INSURANCE_ENABLED === 'true') {
    try {
      const kakauRequest: KakauPolicyRequest = {
        booking_id: policy.booking_id.toString(),
        coverage_type: policy.coverage_type || 'standard',
        coverage_amount: policy.coverage_amount,
        trip_start_date: policy.coverage_start_date,
        trip_end_date: policy.coverage_end_date,
        insured_name: policy.insured_name,
        insured_document: policy.insured_document,
        insured_email: policy.insured_email,
        insured_phone: policy.insured_phone,
        number_of_travelers: bookingData.guests || 1,
        destination: bookingData.destination || bookingData.property_name,
      };

      kakauPolicy = await kakauInsuranceClient.createPolicy(kakauRequest);
    } catch (error: any) {
      console.warn('Erro ao criar apólice na Kakau, usando apólice local:', error);
    }
  }

  // Gerar número de apólice
  const policyNumber = kakauPolicy?.policy_number || 
    policy.policy_number || 
    `RSV360-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // Usar prêmio da Kakau se disponível
  const premiumAmount = kakauPolicy?.premium_amount || policy.premium_amount;

  // Preparar detalhes da apólice
  const policyDetails = {
    ...(policy.policy_details || {}),
    kakau_policy_id: kakauPolicy?.provider_policy_id,
    kakau_document_url: kakauPolicy?.document_url,
    kakau_terms_url: kakauPolicy?.terms_url,
    trip_duration_days: tripDuration,
    destination: bookingData.destination || bookingData.property_name,
  };

  const result = await queryDatabase(
    `INSERT INTO insurance_policies 
     (booking_id, user_id, policy_number, insurance_provider, coverage_type,
      coverage_amount, premium_amount, deductible, coverage_start_date, coverage_end_date,
      status, insured_name, insured_document, insured_email, insured_phone,
      policy_details, terms_accepted, terms_accepted_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      policy.booking_id,
      policy.user_id,
      policyNumber,
      kakauPolicy ? 'kakau' : (policy.insurance_provider || 'rsv360'),
      policy.coverage_type || 'standard',
      policy.coverage_amount,
      premiumAmount,
      policy.deductible || 0,
      policy.coverage_start_date,
      policy.coverage_end_date,
      kakauPolicy?.status || policy.status || 'active',
      policy.insured_name,
      policy.insured_document || null,
      policy.insured_email || null,
      policy.insured_phone || null,
      JSON.stringify(policyDetails),
      policy.terms_accepted || false,
      policy.terms_accepted ? new Date().toISOString() : null,
    ]
  );

  return result[0];
}

/**
 * Buscar apólice por booking
 */
export async function getInsurancePolicyByBooking(
  bookingId: number
): Promise<InsurancePolicy | null> {
  const result = await queryDatabase(
    `SELECT * FROM insurance_policies 
     WHERE booking_id = $1 
     ORDER BY created_at DESC 
     LIMIT 1`,
    [bookingId]
  );

  return result[0] || null;
}

/**
 * Criar sinistro
 */
export async function createInsuranceClaim(
  claim: InsuranceClaim
): Promise<InsuranceClaim> {
  // Gerar número de sinistro se não fornecido
  const claimNumber = claim.claim_number || `CLM-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const result = await queryDatabase(
    `INSERT INTO insurance_claims 
     (policy_id, booking_id, user_id, claim_number, claim_type, description,
      incident_date, incident_location, claimed_amount, status, documents, evidence_files, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      claim.policy_id,
      claim.booking_id,
      claim.user_id,
      claimNumber,
      claim.claim_type,
      claim.description,
      claim.incident_date,
      claim.incident_location || null,
      claim.claimed_amount,
      claim.status || 'pending',
      claim.documents ? JSON.stringify(claim.documents) : null,
      claim.evidence_files ? JSON.stringify(claim.evidence_files) : null,
      claim.metadata ? JSON.stringify(claim.metadata) : null,
    ]
  );

  return result[0];
}

/**
 * Atualizar status do sinistro
 */
export async function updateClaimStatus(
  claimId: number,
  status: string,
  reviewedBy: number,
  reviewNotes?: string,
  approvedAmount?: number,
  rejectedAmount?: number,
  rejectionReason?: string
): Promise<void> {
  await queryDatabase(
    `UPDATE insurance_claims 
     SET status = $1,
         reviewed_by = $2,
         reviewed_at = CURRENT_TIMESTAMP,
         review_notes = $3,
         approved_amount = $4,
         rejected_amount = $5,
         rejection_reason = $6
     WHERE id = $7`,
    [status, reviewedBy, reviewNotes || null, approvedAmount || null, rejectedAmount || null, rejectionReason || null, claimId]
  );
}

/**
 * Listar sinistros
 */
export async function listInsuranceClaims(filters: {
  user_id?: number;
  policy_id?: number;
  booking_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<InsuranceClaim[]> {
  let query = `SELECT * FROM insurance_claims WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(filters.user_id);
    paramIndex++;
  }

  if (filters.policy_id) {
    query += ` AND policy_id = $${paramIndex}`;
    params.push(filters.policy_id);
    paramIndex++;
  }

  if (filters.booking_id) {
    query += ` AND booking_id = $${paramIndex}`;
    params.push(filters.booking_id);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
    paramIndex++;
  }

  return await queryDatabase(query, params);
}

/**
 * ✅ Calcular prêmio de seguro
 */
export async function calculatePremium(params: {
  booking_id: number;
  coverage_type: 'basic' | 'standard' | 'premium' | 'comprehensive';
  coverage_amount: number;
  trip_duration_days: number;
  number_of_travelers: number;
  destination?: string;
}): Promise<number> {
  return await kakauInsuranceClient.calculatePremium({
    coverage_type: params.coverage_type,
    coverage_amount: params.coverage_amount,
    trip_duration_days: params.trip_duration_days,
    number_of_travelers: params.number_of_travelers,
    destination: params.destination,
  });
}

/**
 * ✅ Buscar apólice por ID
 */
export async function getInsurancePolicy(
  policyId: number,
  userId?: number
): Promise<InsurancePolicy | null> {
  let query = `SELECT * FROM insurance_policies WHERE id = $1`;
  const params: any[] = [policyId];

  if (userId) {
    query += ` AND user_id = $2`;
    params.push(userId);
  }

  const result = await queryDatabase(query, params);
  return result[0] || null;
}

/**
 * ✅ Listar apólices do usuário
 */
export async function listInsurancePolicies(filters: {
  user_id?: number;
  booking_id?: number;
  status?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<InsurancePolicy[]> {
  let query = `SELECT * FROM insurance_policies WHERE 1=1`;
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.user_id) {
    query += ` AND user_id = $${paramIndex}`;
    params.push(filters.user_id);
    paramIndex++;
  }

  if (filters.booking_id) {
    query += ` AND booking_id = $${paramIndex}`;
    params.push(filters.booking_id);
    paramIndex++;
  }

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  query += ` ORDER BY created_at DESC`;

  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`;
    params.push(filters.limit);
    paramIndex++;
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex}`;
    params.push(filters.offset);
    paramIndex++;
  }

  return await queryDatabase(query, params);
}

