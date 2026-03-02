/**
 * ✅ SCHEMAS ZOD PARA VERIFICAÇÃO
 * Validação robusta com Zod para todas as operações de verificação
 */

import { z } from 'zod';

// Schema para criar solicitação de verificação
export const createVerificationRequestSchema = z.object({
  property_id: z.number().int().positive('ID da propriedade é obrigatório'),
  photos: z.array(z.instanceof(File)).min(1, 'Pelo menos uma foto é obrigatória').max(20, 'Máximo de 20 fotos'),
  video: z.instanceof(File).optional(),
}).refine(
  (data) => {
    // Validar tamanho de fotos (máx 10MB cada)
    const maxPhotoSize = 10 * 1024 * 1024; // 10MB
    return data.photos.every((photo) => photo.size <= maxPhotoSize);
  },
  {
    message: 'Cada foto deve ter no máximo 10MB',
    path: ['photos'],
  }
).refine(
  (data) => {
    // Validar tipos de arquivo de fotos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return data.photos.every((photo) => allowedTypes.includes(photo.type));
  },
  {
    message: 'Fotos devem ser JPEG, PNG ou WebP',
    path: ['photos'],
  }
).refine(
  (data) => {
    // Validar vídeo se fornecido
    if (!data.video) return true;
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const allowedVideoTypes = ['video/mp4', 'video/webm'];
    return data.video.size <= maxVideoSize && allowedVideoTypes.includes(data.video.type);
  },
  {
    message: 'Vídeo deve ser MP4 ou WebM e ter no máximo 100MB',
    path: ['video'],
  }
);

// Schema para aprovar/rejeitar verificação
export const reviewVerificationSchema = z.object({
  verification_id: z.number().int().positive('ID da verificação é obrigatório'),
  approved: z.boolean(),
  notes: z.string().max(2000).optional(),
  rejection_reason: z.string().min(10, 'Motivo da rejeição deve ter pelo menos 10 caracteres').max(1000).optional(),
}).refine(
  (data) => {
    if (!data.approved && !data.rejection_reason) {
      return false;
    }
    return true;
  },
  {
    message: 'Motivo da rejeição é obrigatório quando aprovado é false',
    path: ['rejection_reason'],
  }
);

// Schema para upload de fotos adicionais
export const uploadPhotosSchema = z.object({
  verification_id: z.number().int().positive('ID da verificação é obrigatório'),
  photos: z.array(z.instanceof(File)).min(1, 'Pelo menos uma foto é obrigatória').max(10, 'Máximo de 10 fotos por vez'),
}).refine(
  (data) => {
    const maxPhotoSize = 10 * 1024 * 1024; // 10MB
    return data.photos.every((photo) => photo.size <= maxPhotoSize);
  },
  {
    message: 'Cada foto deve ter no máximo 10MB',
    path: ['photos'],
  }
);

// Schema para query params de listagem
export const listVerificationRequestsQuerySchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'rejected']).optional(),
  host_id: z.string().transform((val) => val ? parseInt(val, 10) : undefined).optional(),
  limit: z.string().transform((val) => val ? parseInt(val, 10) : 50).optional(),
  offset: z.string().transform((val) => val ? parseInt(val, 10) : 0).optional(),
});

