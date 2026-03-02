/**
 * ✅ SCHEMAS ZOD PARA GROUP CHAT
 * Validação robusta com Zod para todas as operações de chat em grupo
 */

import { z } from 'zod';

// Schema para criar grupo de chat
export const createGroupChatSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  booking_id: z.number().int().positive().optional().nullable(),
  chat_type: z.enum(['booking', 'wishlist', 'trip', 'custom']).default('booking'),
  is_private: z.boolean().default(false),
  created_by: z.number().int().positive().optional().nullable(),
});

// Schema para adicionar membro ao grupo
export const addGroupMemberSchema = z.object({
  user_id: z.number().int().positive().optional().nullable(),
  email: z.string()
    .email('Email inválido')
    .optional()
    .nullable(),
  name: z.string()
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional()
    .nullable(),
  role: z.enum(['admin', 'member']).default('member'),
}).refine(
  (data) => data.user_id || data.email,
  {
    message: 'user_id ou email é obrigatório',
    path: ['user_id'],
  }
);

// Schema para enviar mensagem
export const sendMessageSchema = z.object({
  message: z.string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres')
    .trim(),
  message_type: z.enum(['text', 'image', 'file', 'system']).default('text'),
  attachments: z.array(z.object({
    url: z.string().url('URL inválida'),
    type: z.string(),
    name: z.string().optional(),
    size: z.number().optional(),
  })).optional().nullable(),
  reply_to_message_id: z.number().int().positive().optional().nullable(),
});

// Schema para atualizar grupo
export const updateGroupChatSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  is_private: z.boolean().optional(),
});

// Schema para query params
export const getGroupChatQuerySchema = z.object({
  id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  booking_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  chat_type: z.enum(['booking', 'wishlist', 'trip', 'custom']).optional(),
});

