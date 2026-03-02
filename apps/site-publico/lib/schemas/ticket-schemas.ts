/**
 * Schemas Zod para Sistema de Tickets de Suporte
 * Validação de dados de entrada para APIs de tickets
 */

import { z } from 'zod';

// Status do ticket
export const TicketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting_customer',
  'waiting_third_party',
  'resolved',
  'closed',
  'cancelled'
]);

// Prioridade do ticket
export const TicketPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
  'critical'
]);

// Categoria do ticket
export const TicketCategorySchema = z.enum([
  'general',
  'technical',
  'billing',
  'booking',
  'account',
  'payment',
  'refund',
  'cancellation',
  'other'
]);

// Origem do ticket
export const TicketSourceSchema = z.enum([
  'web',
  'email',
  'phone',
  'chat',
  'api',
  'other'
]);

// Schema para criar ticket
export const CreateTicketSchema = z.object({
  user_id: z.number().int().positive(),
  category: TicketCategorySchema.default('general'),
  priority: TicketPrioritySchema.default('medium'),
  subject: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  source: TicketSourceSchema.default('web'),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para atualizar ticket
export const UpdateTicketSchema = z.object({
  category: TicketCategorySchema.optional(),
  priority: TicketPrioritySchema.optional(),
  status: TicketStatusSchema.optional(),
  subject: z.string().min(3).max(255).optional(),
  description: z.string().min(10).max(5000).optional(),
  assigned_to: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para criar comentário
export const CreateCommentSchema = z.object({
  ticket_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  comment: z.string().min(1).max(5000),
  is_internal: z.boolean().default(false),
  attachments: z.array(z.string().url()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para atualizar comentário
export const UpdateCommentSchema = z.object({
  comment: z.string().min(1).max(5000).optional(),
  is_internal: z.boolean().optional()
});

// Schema para anexar arquivo
export const AttachmentSchema = z.object({
  ticket_id: z.number().int().positive(),
  comment_id: z.number().int().positive().optional(),
  user_id: z.number().int().positive(),
  file_name: z.string().min(1).max(255),
  file_path: z.string().min(1).max(500),
  file_size: z.number().int().positive(),
  mime_type: z.string().optional()
});

// Schema para atribuir ticket
export const AssignTicketSchema = z.object({
  ticket_id: z.number().int().positive(),
  assigned_to: z.number().int().positive().nullable(),
  assigned_by: z.number().int().positive(),
  notes: z.string().max(500).optional()
});

// Schema para mudar status
export const ChangeStatusSchema = z.object({
  ticket_id: z.number().int().positive(),
  status: TicketStatusSchema,
  changed_by: z.number().int().positive(),
  notes: z.string().max(500).optional(),
  resolution_notes: z.string().max(2000).optional()
});

// Schema para filtrar tickets
export const TicketFilterSchema = z.object({
  user_id: z.number().int().positive().optional(),
  assigned_to: z.number().int().positive().optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  category: TicketCategorySchema.optional(),
  source: TicketSourceSchema.optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(), // Busca em subject e description
  created_from: z.string().datetime().optional(),
  created_to: z.string().datetime().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'updated_at', 'priority', 'status']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// Schema para estatísticas
export const TicketStatsFilterSchema = z.object({
  user_id: z.number().int().positive().optional(),
  assigned_to: z.number().int().positive().optional(),
  category: TicketCategorySchema.optional(),
  status: TicketStatusSchema.optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional()
});

// Schema para SLA
export const SLASchema = z.object({
  ticket_id: z.number().int().positive(),
  priority: TicketPrioritySchema,
  first_response_target_minutes: z.number().int().positive(),
  resolution_target_minutes: z.number().int().positive()
});

// Tipos TypeScript derivados dos schemas
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export type TicketPriority = z.infer<typeof TicketPrioritySchema>;
export type TicketCategory = z.infer<typeof TicketCategorySchema>;
export type TicketSource = z.infer<typeof TicketSourceSchema>;
export type CreateTicket = z.infer<typeof CreateTicketSchema>;
export type UpdateTicket = z.infer<typeof UpdateTicketSchema>;
export type CreateComment = z.infer<typeof CreateCommentSchema>;
export type UpdateComment = z.infer<typeof UpdateCommentSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type AssignTicket = z.infer<typeof AssignTicketSchema>;
export type ChangeStatus = z.infer<typeof ChangeStatusSchema>;
export type TicketFilter = z.infer<typeof TicketFilterSchema>;
export type TicketStatsFilter = z.infer<typeof TicketStatsFilterSchema>;
export type SLA = z.infer<typeof SLASchema>;

