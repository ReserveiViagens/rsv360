/**
 * Schemas Zod para Check-in/Check-out Digital
 * Validação de dados de entrada para APIs de check-in
 */

import { z } from 'zod';

// Status do check-in
export const CheckinStatusSchema = z.enum([
  'pending',
  'documents_pending',
  'verified',
  'checked_in',
  'checked_out',
  'cancelled'
]);

// Tipos de documento
export const DocumentTypeSchema = z.enum([
  'rg',
  'cpf',
  'cnh',
  'passport',
  'selfie',
  'proof_address',
  'other'
]);

// Tipos de código de acesso
export const AccessCodeTypeSchema = z.enum([
  'qr',
  'smart_lock',
  'pin',
  'nfc',
  'other'
]);

// Tipos de vistoria
export const InspectionTypeSchema = z.enum([
  'before_checkin',
  'after_checkout'
]);

// Schema para criar solicitação de check-in
export const CheckinRequestSchema = z.object({
  booking_id: z.number().int().positive(),
  user_id: z.number().int().positive(),
  property_id: z.number().int().positive(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para atualizar check-in
export const CheckinUpdateSchema = z.object({
  status: CheckinStatusSchema.optional(),
  check_in_at: z.string().datetime().optional(),
  check_out_at: z.string().datetime().optional(),
  documents_verified: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para upload de documento
export const CheckinDocumentSchema = z.object({
  checkin_id: z.number().int().positive(),
  document_type: DocumentTypeSchema,
  document_url: z.string().url(),
  document_name: z.string().min(1).max(255).optional(),
  document_size: z.number().int().positive().optional(),
  mime_type: z.string().optional(),
  extracted_data: z.record(z.unknown()).optional()
});

// Schema para verificar documento
export const DocumentVerificationSchema = z.object({
  document_id: z.number().int().positive(),
  is_verified: z.boolean(),
  verification_notes: z.string().optional(),
  verified_by: z.number().int().positive().optional()
});

// Schema para criar código de acesso
export const AccessCodeSchema = z.object({
  checkin_id: z.number().int().positive(),
  code_type: AccessCodeTypeSchema,
  code: z.string().min(1).max(255),
  expires_at: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional()
});

// Schema para vistoria
export const InspectionSchema = z.object({
  checkin_id: z.number().int().positive(),
  inspection_type: InspectionTypeSchema,
  photos: z.array(z.string().url()).min(0).max(20),
  notes: z.string().optional(),
  damages: z.string().optional(), // Apenas para after_checkout
  inspected_by: z.number().int().positive().optional()
});

// Schema para processar check-in
export const ProcessCheckinSchema = z.object({
  checkin_id: z.number().int().positive(),
  verify_documents: z.boolean().default(true),
  generate_access_codes: z.boolean().default(true)
});

// Schema para processar check-out
export const ProcessCheckoutSchema = z.object({
  checkin_id: z.number().int().positive(),
  inspection_notes: z.string().optional(),
  inspection_photos: z.array(z.string().url()).optional(),
  damages: z.string().optional()
});

// Schema para escanear QR code
export const ScanQRCodeSchema = z.object({
  code: z.string().min(1).max(255)
});

// Schema para filtrar check-ins
export const CheckinFilterSchema = z.object({
  booking_id: z.number().int().positive().optional(),
  user_id: z.number().int().positive().optional(),
  property_id: z.number().int().positive().optional(),
  status: CheckinStatusSchema.optional(),
  check_in_code: z.string().optional(),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0)
});

// Tipos TypeScript derivados dos schemas
export type CheckinStatus = z.infer<typeof CheckinStatusSchema>;
export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type AccessCodeType = z.infer<typeof AccessCodeTypeSchema>;
export type InspectionType = z.infer<typeof InspectionTypeSchema>;
export type CheckinRequest = z.infer<typeof CheckinRequestSchema>;
export type CheckinUpdate = z.infer<typeof CheckinUpdateSchema>;
export type CheckinDocument = z.infer<typeof CheckinDocumentSchema>;
export type DocumentVerification = z.infer<typeof DocumentVerificationSchema>;
export type AccessCode = z.infer<typeof AccessCodeSchema>;
export type Inspection = z.infer<typeof InspectionSchema>;
export type ProcessCheckin = z.infer<typeof ProcessCheckinSchema>;
export type ProcessCheckout = z.infer<typeof ProcessCheckoutSchema>;
export type ScanQRCode = z.infer<typeof ScanQRCodeSchema>;
export type CheckinFilter = z.infer<typeof CheckinFilterSchema>;

