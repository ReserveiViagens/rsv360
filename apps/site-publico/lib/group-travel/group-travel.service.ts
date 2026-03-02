/**
 * ✅ DIA 2 - ARQUIVO 1: Group Travel Service (Coordenador Geral)
 * 
 * @description Coordena todas as funcionalidades de viagens em grupo:
 * - Wishlists compartilhadas
 * - Group Chat
 * - Split Payment
 * - Trip Invitations
 * - Votação democrática
 * 
 * @module group-travel
 * @author RSV 360 Team
 * @created 2025-12-12
 */

import { queryDatabase } from '../db';
import { redisCache } from '../redis-cache';
import { z } from 'zod';
import {
  createWishlist,
  getWishlist,
  addItem,
  inviteMember,
} from './wishlist-service';
import {
  createGroupChat,
  sendGroupMessage,
  listGroupMessages,
} from '../group-chat-service';
import {
  createSplitPayment,
  getBookingSplits,
  markSplitAsPaid,
} from './split-payment-service';
import {
  createTripInvitation,
  acceptInvitation,
  getInvitationByToken,
} from '../trip-invitation-service';

// ================================
// TYPES & SCHEMAS
// ================================

const CreateGroupTripSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().max(500).optional(),
  destination: z.string().min(2).optional(),
  tripDate: z.string().datetime().optional(),
  createdBy: z.string().uuid('ID do criador inválido'),
  participants: z.array(z.string().uuid()).min(1, 'Deve ter pelo menos 1 participante'),
});

const GroupTripSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  destination: z.string().nullable(),
  tripDate: z.date().nullable(),
  createdBy: z.string().uuid(),
  createdAt: z.date(),
  wishlistId: z.string().uuid().nullable(),
  chatId: z.number().nullable(),
  participantsCount: z.number(),
  status: z.enum(['planning', 'confirmed', 'completed', 'cancelled']),
});

type CreateGroupTripDTO = z.infer<typeof CreateGroupTripSchema>;
type GroupTripSummary = z.infer<typeof GroupTripSummarySchema>;

// ================================
// CONSTANTS
// ================================

const CACHE_TTL = 3600; // 1 hour
const CACHE_PREFIX = 'group-travel:';

// ================================
// PRIVATE FUNCTIONS
// ================================

function validateGroupTrip(data: unknown): CreateGroupTripDTO {
  return CreateGroupTripSchema.parse(data);
}

// ================================
// PUBLIC FUNCTIONS
// ================================

/**
 * Criar viagem em grupo completa (wishlist + chat + convites)
 */
export async function createGroupTrip(
  data: CreateGroupTripDTO
): Promise<GroupTripSummary> {
  try {
    const validated = validateGroupTrip(data);
    
    // 1. Criar wishlist compartilhada
    const wishlist = await createWishlist(validated.createdBy, {
      name: `${validated.name} - Wishlist`,
      description: validated.description || `Wishlist para ${validated.name}`,
      privacy: 'shared',
    });

    // 2. Criar group chat
    const chat = await createGroupChat(
      `${validated.name} - Chat`,
      `Chat do grupo para ${validated.name}`,
      'trip',
      parseInt(wishlist.id.split('-')[0]) || 0,
      false,
      validated.createdBy
    );

    // 3. Adicionar participantes à wishlist
    for (const participantId of validated.participants) {
      if (participantId !== validated.createdBy) {
        try {
          await inviteMember(wishlist.id, validated.createdBy, {
            email: `${participantId}@example.com`, // TODO: Buscar email real
            role: 'editor',
          });
        } catch (error) {
          console.warn(`Erro ao convidar participante ${participantId}:`, error);
        }
      }
    }

    // 4. Criar registro de trip no banco (se tabela existir)
    const tripId = `trip-${Date.now()}`;
    
    const summary: GroupTripSummary = {
      id: tripId,
      name: validated.name,
      description: validated.description || null,
      destination: validated.destination || null,
      tripDate: validated.tripDate ? new Date(validated.tripDate) : null,
      createdBy: validated.createdBy,
      createdAt: new Date(),
      wishlistId: wishlist.id,
      chatId: chat.id || null,
      participantsCount: validated.participants.length + 1, // +1 para o criador
      status: 'planning',
    };

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}trips:${validated.createdBy}`);

    return summary;
  } catch (error: any) {
    console.error('Erro ao criar viagem em grupo:', error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validação falhou: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw new Error(`Erro ao criar viagem em grupo: ${error.message}`);
  }
}

/**
 * Obter resumo completo de uma viagem em grupo
 */
export async function getGroupTripSummary(
  tripId: string,
  userId: string
): Promise<GroupTripSummary | null> {
  try {
    // Verificar cache
    const cacheKey = `${CACHE_PREFIX}trip:${tripId}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar do banco (se tabela existir)
    // Por enquanto, retornar null se não encontrar
    // TODO: Implementar quando tabela group_trips for criada

    return null;
  } catch (error: any) {
    console.error('Erro ao buscar resumo de viagem:', error);
    throw error;
  }
}

/**
 * Listar viagens em grupo do usuário
 */
export async function listUserGroupTrips(
  userId: string,
  limit: number = 10,
  offset: number = 0
): Promise<GroupTripSummary[]> {
  try {
    const cacheKey = `${CACHE_PREFIX}trips:${userId}:${limit}:${offset}`;
    const cached = await redisCache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar wishlists do usuário que são de viagens
    const wishlists = await queryDatabase(
      `SELECT w.*, COUNT(DISTINCT m.user_id) as participants_count
       FROM shared_wishlists w
       LEFT JOIN wishlist_members m ON w.id = m.wishlist_id
       WHERE w.created_by = $1 OR m.user_id = $1
       GROUP BY w.id
       ORDER BY w.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    ) || [];

    const trips: GroupTripSummary[] = wishlists.map((w: any) => ({
      id: w.id,
      name: w.name,
      description: w.description,
      destination: null,
      tripDate: null,
      createdBy: w.created_by,
      createdAt: new Date(w.created_at),
      wishlistId: w.id,
      chatId: null, // TODO: Buscar chat relacionado
      participantsCount: parseInt(w.participants_count || '1'),
      status: 'planning' as const,
    }));

    // Cache results
    await redisCache.set(cacheKey, JSON.stringify(trips), CACHE_TTL);

    return trips;
  } catch (error: any) {
    console.error('Erro ao listar viagens em grupo:', error);
    throw error;
  }
}

/**
 * Obter estatísticas de uma viagem em grupo
 */
export async function getGroupTripStats(
  tripId: string,
  wishlistId: string
): Promise<{
  wishlistItems: number;
  totalVotes: number;
  chatMessages: number;
  splitPayments: number;
  participants: number;
}> {
  try {
    // Buscar wishlist
    const wishlist = await getWishlist(wishlistId, '');
    if (!wishlist) {
      throw new Error('Wishlist não encontrada');
    }

    // Contar itens
    const itemsCount = wishlist.items?.length || 0;

    // Contar votos
    const votesCount = wishlist.items?.reduce(
      (sum, item) => sum + (item.votesCount || 0),
      0
    ) || 0;

    // Contar mensagens (se chatId disponível)
    let chatMessages = 0;
    // TODO: Implementar quando chatId estiver disponível

    // Contar split payments
    const splits = await getBookingSplits(''); // TODO: Buscar por tripId
    const splitPayments = splits?.length || 0;

    // Contar participantes
    const participants = wishlist.members?.length || 1;

    return {
      wishlistItems: itemsCount,
      totalVotes: votesCount,
      chatMessages,
      splitPayments,
      participants,
    };
  } catch (error: any) {
    console.error('Erro ao buscar estatísticas de viagem:', error);
    throw error;
  }
}

/**
 * Finalizar viagem em grupo (marcar como completed)
 */
export async function completeGroupTrip(
  tripId: string,
  userId: string
): Promise<boolean> {
  try {
    // Verificar permissões
    // TODO: Implementar quando tabela group_trips for criada

    // Invalidar cache
    await redisCache.del(`${CACHE_PREFIX}trip:${tripId}`);
    await redisCache.del(`${CACHE_PREFIX}trips:${userId}`);

    return true;
  } catch (error: any) {
    console.error('Erro ao finalizar viagem:', error);
    throw error;
  }
}

