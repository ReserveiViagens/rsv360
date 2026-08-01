import { z } from 'zod';

/** Numeric path id used by housekeeping + CRM in-memory stores (I2). */
export const PositiveIntIdParamSchema = z
  .object({
    id: z.coerce.number().int().positive().finite(),
  })
  .strict();

export function parsePositiveIntId(raw: unknown): number {
  const parsed = PositiveIntIdParamSchema.safeParse({ id: raw });
  if (!parsed.success) throw parsed.error;
  return parsed.data.id;
}

const checklistItemSchema = z
  .object({
    id: z.string().default(''),
    text: z.string(),
    category: z.string().default('general'),
    is_required: z.boolean().default(false),
    completed: z.boolean().optional(),
    completed_at: z.string().optional(),
  })
  .strict();

export const HkTaskCreateSchema = z
  .object({
    room_id: z.coerce.number().int().positive(),
    task_type: z.enum(['checkout_clean', 'stayover_clean', 'deep_clean', 'turndown', 'inspection']),
    status: z
      .enum(['pending', 'assigned', 'in_progress', 'completed', 'inspected', 'rejected'])
      .optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
    assigned_to: z.coerce.number().int().positive().optional(),
    checklist_id: z.coerce.number().int().positive().optional(),
    checklist_items: z.array(checklistItemSchema).optional(),
    estimated_minutes: z.coerce.number().int().nonnegative().optional(),
    notes: z.string().max(5000).optional(),
    property_id: z.coerce.number().int().positive().optional(),
    room_name: z.string().max(255).optional(),
  })
  .strict();

export const HkTaskUpdateSchema = HkTaskCreateSchema.partial().strict();

export const HkAssignSchema = z
  .object({
    userId: z.coerce.number().int().positive(),
  })
  .strict();

export const HkTaskCompleteSchema = z
  .object({
    checklistResults: z.array(checklistItemSchema).optional(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const HkTaskInspectSchema = z
  .object({
    rating: z.coerce.number().min(0).max(5),
    inspectorId: z.coerce.number().int().positive(),
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const HkChecklistCreateSchema = z
  .object({
    name: z.string().min(1).max(255),
    task_type: z.string().min(1).max(100),
    room_type: z.string().max(100).optional(),
    items: z.array(checklistItemSchema).min(1),
    is_default: z.boolean().optional(),
    property_id: z.coerce.number().int().positive().optional(),
  })
  .strict();

export const HkChecklistUpdateSchema = HkChecklistCreateSchema.partial().strict();

export const HkMaintenanceCreateSchema = z
  .object({
    room_id: z.coerce.number().int().positive(),
    title: z.string().min(1).max(255),
    description: z.string().min(1).max(5000),
    category: z
      .enum(['plumbing', 'electrical', 'hvac', 'furniture', 'appliance', 'structural', 'other'])
      .optional(),
    priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
    status: z
      .enum(['open', 'assigned', 'in_progress', 'waiting_parts', 'completed', 'cancelled'])
      .optional(),
    reported_by: z.coerce.number().int().positive().optional(),
    assigned_to: z.coerce.number().int().positive().optional(),
    estimated_cost: z.coerce.number().nonnegative().optional(),
    property_id: z.coerce.number().int().positive().optional(),
    room_name: z.string().max(255).optional(),
  })
  .strict();

export const HkMaintenanceUpdateSchema = HkMaintenanceCreateSchema.partial().strict();

export const HkMaintenanceCompleteSchema = z
  .object({
    resolution: z.string().min(1).max(5000),
    actualCost: z.coerce.number().nonnegative().optional(),
  })
  .strict();

export const HkMaintenanceCancelSchema = z
  .object({
    reason: z.string().min(1).max(2000),
  })
  .strict();

const roomStatus = z.enum([
  'clean',
  'dirty',
  'cleaning',
  'inspected',
  'maintenance',
  'out_of_order',
]);

export const HkRoomStatusUpdateSchema = z
  .object({
    status: roomStatus,
    notes: z.string().max(5000).optional(),
  })
  .strict();

export const HkRoomBulkStatusSchema = z
  .object({
    ids: z.array(z.coerce.number().int().positive()).min(1),
    status: roomStatus,
  })
  .strict();
