/**
 * ✅ SCHEMAS ZOD PARA WISHLISTS
 * Validação robusta com Zod para todas as operações de wishlist
 */

import { z } from 'zod';

// Schema para criar wishlist
export const createWishlistSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  is_public: z.boolean().default(false),
  creator_id: z.number().int().positive().optional().nullable(),
});

// Schema para atualizar wishlist
export const updateWishlistSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  is_public: z.boolean().optional(),
});

// Schema para adicionar item à wishlist
export const addWishlistItemSchema = z.object({
  property_id: z.number().int().positive('ID da propriedade é obrigatório'),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

// Schema para adicionar membro à wishlist
export const addWishlistMemberSchema = z.object({
  user_id: z.number().int().positive().optional().nullable(),
  email: z.string()
    .email('Email inválido')
    .optional()
    .nullable(),
  role: z.enum(['owner', 'admin', 'member', 'viewer']).default('member'),
  can_add: z.boolean().default(true),
  can_vote: z.boolean().default(true),
  can_invite: z.boolean().default(false),
}).refine(
  (data) => data.user_id || data.email,
  {
    message: 'user_id ou email é obrigatório',
    path: ['user_id'],
  }
);

// Schema para votar em item
export const voteWishlistItemSchema = z.object({
  item_id: z.number().int().positive('ID do item é obrigatório'),
  vote_type: z.enum(['up', 'down']),
});

// Schema para query params de listagem
export const listWishlistsQuerySchema = z.object({
  user_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  email: z.string().email().optional(),
  id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  token: z.string().optional(),
});

// Schema para query params de wishlist específica
export const getWishlistQuerySchema = z.object({
  id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  token: z.string().optional(),
  user_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  email: z.string().email().optional(),
}).refine(
  (data) => data.id || data.token,
  {
    message: 'id ou token é obrigatório',
    path: ['id'],
  }
);

