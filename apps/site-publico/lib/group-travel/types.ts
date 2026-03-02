/**
 * ✅ FASE 1 - ETAPA 1.1: Types TypeScript Consolidados
 * Interfaces TypeScript centralizadas para Viagens em Grupo
 * 
 * @module group-travel/types
 */

// ============================================
// 1. SHARED WISHLIST
// ============================================

/**
 * Interface principal de Wishlist Compartilhada
 */
export interface SharedWishlist {
  id: string; // UUID
  name: string;
  description: string | null;
  createdBy: string; // userId
  createdAt: Date;
  updatedAt: Date;
  privacy: 'private' | 'shared' | 'public';
  members?: WishlistMember[];
  items?: WishlistItem[];
}

// ============================================
// 2. WISHLIST MEMBER
// ============================================

/**
 * Membro de uma Wishlist
 */
export interface WishlistMember {
  id: string;
  wishlistId: string;
  userId: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
}

// ============================================
// 3. WISHLIST ITEM
// ============================================

/**
 * Item adicionado a uma Wishlist
 */
export interface WishlistItem {
  id: string;
  wishlistId: string;
  propertyId: string;
  addedBy: string; // userId
  addedAt: Date;
  notes: string | null;
  priority: 'low' | 'medium' | 'high';
  votes?: Vote[];
  votesCount: number;
  property?: Property;
}

/**
 * Propriedade relacionada ao item
 */
export interface Property {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
}

// ============================================
// 4. VOTE
// ============================================

/**
 * Voto em um item da wishlist
 */
export interface Vote {
  id: string;
  itemId: string;
  userId: string;
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
}

// ============================================
// 5. SPLIT PAYMENT
// ============================================

/**
 * Divisão de pagamento de uma reserva
 */
export interface SplitPayment {
  id: string;
  bookingId: string;
  totalAmount: number;
  currency: string;
  splits: PaymentSplit[];
  status: 'pending' | 'partial' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 6. PAYMENT SPLIT
// ============================================

/**
 * Divisão individual de pagamento
 */
export interface PaymentSplit {
  id: string;
  splitPaymentId: string;
  userId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'paid' | 'failed';
  paidAt: Date | null;
  paymentMethod: string | null;
  user?: {
    name: string;
    email: string;
  };
}

// ============================================
// 7. TRIP INVITATION
// ============================================

/**
 * Convite para viagem em grupo
 */
export interface TripInvitation {
  id: string;
  wishlistId: string | null;
  bookingId: string | null;
  invitedBy: string; // userId
  invitedEmail: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}

// ============================================
// 8. GROUP CHAT
// ============================================

/**
 * Chat em grupo para viagem
 */
export interface GroupChat {
  id: string;
  wishlistId: string | null;
  bookingId: string | null;
  name: string;
  type: 'wishlist' | 'booking';
  members?: ChatMember[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// 9. CHAT MEMBER
// ============================================

/**
 * Membro de um chat em grupo
 */
export interface ChatMember {
  id: string;
  chatId: string;
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  lastReadAt: Date | null;
  user?: {
    name: string;
    avatar: string;
  };
}

// ============================================
// 10. GROUP MESSAGE
// ============================================

/**
 * Mensagem em chat em grupo
 */
export interface GroupMessage {
  id: string;
  chatId: string;
  userId: string;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: MessageAttachment[];
  replyTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
}

// ============================================
// 11. MESSAGE ATTACHMENT
// ============================================

/**
 * Anexo de mensagem
 */
export interface MessageAttachment {
  id: string;
  messageId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// ============================================
// 12. COMMENT
// ============================================

/**
 * Comentário em um item da wishlist
 */
export interface Comment {
  id: string;
  itemId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    name: string;
    avatar: string;
  };
}

// ============================================
// 13. DATA TRANSFER OBJECTS (DTOs)
// ============================================

/**
 * DTO para criar wishlist
 */
export interface CreateWishlistDTO {
  name: string;
  description?: string;
  privacy?: 'private' | 'shared' | 'public';
  memberEmails?: string[];
}

/**
 * DTO para atualizar wishlist
 */
export interface UpdateWishlistDTO {
  name?: string;
  description?: string;
  privacy?: 'private' | 'shared' | 'public';
}

/**
 * DTO para adicionar item à wishlist
 */
export interface AddItemDTO {
  propertyId: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * DTO para atualizar item
 */
export interface UpdateItemDTO {
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * DTO para votar em item
 */
export interface VoteDTO {
  itemId: string;
  voteType: 'upvote' | 'downvote';
}

/**
 * DTO para criar divisão de pagamento
 */
export interface CreateSplitPaymentDTO {
  bookingId: string;
  splits: Array<{
    userId: string;
    amount: number;
    percentage?: number;
  }>;
}

/**
 * DTO para atualizar divisão
 */
export interface UpdateSplitDTO {
  amount?: number;
  percentage?: number;
  status?: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
}

/**
 * DTO para criar convite
 */
export interface CreateInvitationDTO {
  wishlistId?: string;
  bookingId?: string;
  invitedEmail: string;
  role?: 'editor' | 'viewer';
  expiresInDays?: number; // Padrão: 7 dias
}

/**
 * DTO para criar chat
 */
export interface CreateChatDTO {
  wishlistId?: string;
  bookingId?: string;
  name: string;
  type: 'wishlist' | 'booking';
  memberIds: string[];
}

/**
 * DTO para enviar mensagem
 */
export interface SendMessageDTO {
  chatId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  replyTo?: string;
}

/**
 * DTO para adicionar comentário
 */
export interface AddCommentDTO {
  itemId: string;
  content: string;
}

// ============================================
// TIPOS AUXILIARES
// ============================================

/**
 * Filtros para busca de wishlists
 */
export interface WishlistQuery {
  userId?: string;
  privacy?: 'private' | 'shared' | 'public';
  search?: string;
  createdBy?: string;
  memberId?: string;
}

/**
 * Parâmetros de paginação
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Opções de ordenação
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Resposta paginada
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Resposta de API padrão
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

