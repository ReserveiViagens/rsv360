/**
 * ✅ ITEM 16: SERVIÇO DE SPLIT PAYMENT
 * Backend completo para divisão de pagamentos
 */

import { queryDatabase } from './db';
import crypto from 'crypto';

export interface SplitPayment {
  id: number;
  booking_id: number;
  payment_id?: number;
  total_amount: number;
  split_type: 'equal' | 'percentage' | 'custom';
  status: 'pending' | 'partial' | 'completed' | 'cancelled';
  created_by?: number;
  created_at: string;
  updated_at: string;
  participants?: SplitPaymentParticipant[];
}

export interface SplitPaymentParticipant {
  id: number;
  split_payment_id: number;
  user_id?: number;
  email: string;
  name?: string;
  amount: number;
  percentage?: number;
  status: 'pending' | 'invited' | 'paid' | 'cancelled';
  payment_method?: string;
  payment_token?: string;
  paid_at?: string;
  invitation_token: string;
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SplitPaymentHistory {
  id: number;
  split_payment_id: number;
  participant_id: number;
  amount: number;
  payment_method?: string;
  gateway_transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  gateway_response?: any;
  paid_at?: string;
  created_at: string;
}

/**
 * Gerar token único para convite
 */
function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Criar split payment
 */
export async function createSplitPayment(
  bookingId: number,
  totalAmount: number,
  splitType: 'equal' | 'percentage' | 'custom' = 'equal',
  participants: Array<{
    user_id?: number;
    email: string;
    name?: string;
    amount?: number;
    percentage?: number;
  }>,
  createdBy?: number
): Promise<SplitPayment> {
  // Validar que a soma dos valores é igual ao total
  if (splitType === 'custom' || splitType === 'percentage') {
    const totalSplit = participants.reduce((sum, p) => sum + (p.amount || 0), 0);
    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      throw new Error(`Soma dos valores (${totalSplit}) não corresponde ao total (${totalAmount})`);
    }
  }

  // Criar split payment
  const splitResult = await queryDatabase(
    `INSERT INTO split_payments (booking_id, total_amount, split_type, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [bookingId, totalAmount, splitType, createdBy || null]
  );

  const splitPayment = splitResult[0] as SplitPayment;

  // Calcular valores se for divisão igual
  let amounts: number[] = [];
  if (splitType === 'equal') {
    const amountPerPerson = totalAmount / participants.length;
    amounts = participants.map(() => amountPerPerson);
  } else {
    amounts = participants.map((p) => p.amount || 0);
  }

  // Criar participantes
  const participantPromises = participants.map(async (participant, index) => {
    const amount = amounts[index];
    const percentage = splitType === 'percentage' ? participant.percentage : (amount / totalAmount) * 100;
    const invitationToken = generateInvitationToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias para expirar

    const participantResult = await queryDatabase(
      `INSERT INTO split_payment_participants 
       (split_payment_id, user_id, email, name, amount, percentage, invitation_token, invitation_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        splitPayment.id,
        participant.user_id || null,
        participant.email,
        participant.name || null,
        amount,
        percentage || null,
        invitationToken,
        expiresAt.toISOString(),
      ]
    );

    return participantResult[0] as SplitPaymentParticipant;
  });

  const createdParticipants = await Promise.all(participantPromises);

  splitPayment.participants = createdParticipants;

  return splitPayment;
}

/**
 * Buscar split payment
 */
export async function getSplitPayment(
  splitPaymentId: number,
  includeParticipants: boolean = true
): Promise<SplitPayment | null> {
  const splits = await queryDatabase(
    `SELECT * FROM split_payments WHERE id = $1`,
    [splitPaymentId]
  );

  if (splits.length === 0) {
    return null;
  }

  const split = splits[0] as SplitPayment;

  if (includeParticipants) {
    const participants = await queryDatabase(
      `SELECT * FROM split_payment_participants 
       WHERE split_payment_id = $1
       ORDER BY created_at ASC`,
      [splitPaymentId]
    );
    split.participants = participants as SplitPaymentParticipant[];
  }

  return split;
}

/**
 * Buscar split payment por booking
 */
export async function getSplitPaymentByBooking(
  bookingId: number
): Promise<SplitPayment | null> {
  const splits = await queryDatabase(
    `SELECT * FROM split_payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [bookingId]
  );

  if (splits.length === 0) {
    return null;
  }

  const split = splits[0] as SplitPayment;

  const participants = await queryDatabase(
    `SELECT * FROM split_payment_participants 
     WHERE split_payment_id = $1
     ORDER BY created_at ASC`,
    [split.id]
  );
  split.participants = participants as SplitPaymentParticipant[];

  return split;
}

/**
 * Buscar split payment por token de convite
 */
export async function getSplitPaymentByToken(
  invitationToken: string
): Promise<{ split: SplitPayment; participant: SplitPaymentParticipant } | null> {
  const participants = await queryDatabase(
    `SELECT * FROM split_payment_participants 
     WHERE invitation_token = $1 AND invitation_expires_at > CURRENT_TIMESTAMP`,
    [invitationToken]
  );

  if (participants.length === 0) {
    return null;
  }

  const participant = participants[0] as SplitPaymentParticipant;

  const split = await getSplitPayment(participant.split_payment_id, true);

  if (!split) {
    return null;
  }

  return { split, participant };
}

/**
 * Adicionar participante ao split
 */
export async function addSplitParticipant(
  splitPaymentId: number,
  email: string,
  name?: string,
  amount?: number,
  percentage?: number,
  userId?: number
): Promise<SplitPaymentParticipant | null> {
  // Buscar split para obter total
  const split = await getSplitPayment(splitPaymentId, false);
  if (!split) {
    return null;
  }

  // Se não especificar amount, calcular baseado em percentage ou dividir igual
  let participantAmount = amount;
  if (!participantAmount) {
    if (percentage) {
      participantAmount = (split.total_amount * percentage) / 100;
    } else {
      // Dividir igual entre todos (incluindo o novo)
      const currentParticipants = await queryDatabase(
        `SELECT COUNT(*) as count FROM split_payment_participants WHERE split_payment_id = $1`,
        [splitPaymentId]
      );
      const count = parseInt(currentParticipants[0].count || '0') + 1;
      participantAmount = split.total_amount / count;
    }
  }

  const invitationToken = generateInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const result = await queryDatabase(
    `INSERT INTO split_payment_participants 
     (split_payment_id, user_id, email, name, amount, percentage, invitation_token, invitation_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (split_payment_id, COALESCE(user_id::text, email)) DO UPDATE
     SET name = EXCLUDED.name,
         amount = EXCLUDED.amount,
         percentage = EXCLUDED.percentage,
         invitation_token = EXCLUDED.invitation_token,
         invitation_expires_at = EXCLUDED.invitation_expires_at
     RETURNING *`,
    [
      splitPaymentId,
      userId || null,
      email,
      name || null,
      participantAmount,
      percentage || null,
      invitationToken,
      expiresAt.toISOString(),
    ]
  );

  return result[0] as SplitPaymentParticipant || null;
}

/**
 * Processar pagamento de participante
 */
export async function processParticipantPayment(
  participantId: number,
  paymentMethod: string,
  gatewayTransactionId?: string,
  gatewayResponse?: any
): Promise<SplitPaymentParticipant | null> {
  // Atualizar participante
  const result = await queryDatabase(
    `UPDATE split_payment_participants 
     SET 
       status = 'paid',
       payment_method = $1,
       payment_token = $2,
       paid_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [paymentMethod, gatewayTransactionId || null, participantId]
  );

  if (result.length === 0) {
    return null;
  }

  const participant = result[0] as SplitPaymentParticipant;

  // Registrar no histórico
  await queryDatabase(
    `INSERT INTO split_payment_history 
     (split_payment_id, participant_id, amount, payment_method, gateway_transaction_id, status, gateway_response, paid_at)
     VALUES ($1, $2, $3, $4, $5, 'completed', $6, CURRENT_TIMESTAMP)`,
    [
      participant.split_payment_id,
      participantId,
      participant.amount,
      paymentMethod,
      gatewayTransactionId || null,
      gatewayResponse ? JSON.stringify(gatewayResponse) : null,
    ]
  );

  return participant;
}

/**
 * Cancelar split payment
 */
export async function cancelSplitPayment(
  splitPaymentId: number
): Promise<boolean> {
  await queryDatabase(
    `UPDATE split_payments 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [splitPaymentId]
  );

  await queryDatabase(
    `UPDATE split_payment_participants 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE split_payment_id = $1 AND status != 'paid'`,
    [splitPaymentId]
  );

  return true;
}

/**
 * Calcular estatísticas do split
 */
export async function getSplitPaymentStats(
  splitPaymentId: number
): Promise<{
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  participants_count: number;
  paid_participants_count: number;
  completion_percentage: number;
}> {
  const split = await getSplitPayment(splitPaymentId, true);

  if (!split || !split.participants) {
    throw new Error('Split payment não encontrado');
  }

  const paidAmount = split.participants
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

  const paidCount = split.participants.filter((p) => p.status === 'paid').length;

  return {
    total_amount: parseFloat(split.total_amount.toString()),
    paid_amount: paidAmount,
    pending_amount: parseFloat(split.total_amount.toString()) - paidAmount,
    participants_count: split.participants.length,
    paid_participants_count: paidCount,
    completion_percentage: split.participants.length > 0
      ? (paidCount / split.participants.length) * 100
      : 0,
  };
}

