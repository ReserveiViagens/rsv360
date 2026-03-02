/**
 * ✅ SCHEMAS ZOD PARA TRIP INVITATIONS
 * Validação robusta com Zod para todas as operações de convites
 */

import { z } from 'zod';

// Schema para criar convite
export const createTripInvitationSchema = z.object({
  booking_id: z.number().int().positive().optional().nullable(),
  wishlist_id: z.number().int().positive().optional().nullable(),
  trip_name: z.string()
    .min(1, 'Nome da viagem é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional()
    .nullable(),
  invited_email: z.string()
    .email('Email inválido')
    .min(1, 'Email do convidado é obrigatório'),
  invited_name: z.string()
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional()
    .nullable(),
  invitation_type: z.enum(['booking', 'wishlist', 'trip', 'split_payment']).default('trip'),
  message: z.string()
    .max(1000, 'Mensagem deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  expires_at: z.string()
    .datetime('Data de expiração inválida')
    .or(z.date())
    .transform((val) => typeof val === 'string' ? new Date(val) : val)
    .refine((date) => date > new Date(), {
      message: 'Data de expiração deve ser no futuro',
    })
    .optional(),
  invited_by: z.number().int().positive('ID do convidante é obrigatório'),
}).refine(
  (data) => data.booking_id || data.wishlist_id || data.trip_name,
  {
    message: 'booking_id, wishlist_id ou trip_name é obrigatório',
    path: ['booking_id'],
  }
);

// Schema para aceitar convite
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  user_id: z.number().int().positive().optional().nullable(),
  email: z.string().email().optional().nullable(),
}).refine(
  (data) => data.user_id || data.email,
  {
    message: 'user_id ou email é obrigatório',
    path: ['user_id'],
  }
);

// Schema para query params
export const getInvitationQuerySchema = z.object({
  token: z.string().min(1).optional(),
  booking_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  wishlist_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired', 'cancelled']).optional(),
});

