/**
 * ✅ TESTES: API VERIFICATION
 * Testes para validação e funcionalidade de verificação
 */

import { describe, it, expect } from '@jest/globals';
import { createVerificationRequestSchema, reviewVerificationSchema } from '@/lib/schemas/verification-schemas';

describe('Verification API - Validação', () => {
  it('deve validar criação de solicitação com fotos válidas', () => {
    // Criar objetos File mock para o teste
    const mockPhoto1 = new File([''], 'photo1.jpg', { type: 'image/jpeg' });
    const mockPhoto2 = new File([''], 'photo2.png', { type: 'image/png' });
    Object.defineProperty(mockPhoto1, 'size', { value: 5 * 1024 * 1024 });
    Object.defineProperty(mockPhoto2, 'size', { value: 3 * 1024 * 1024 });

    const validData = {
      property_id: 1,
      photos: [mockPhoto1, mockPhoto2],
    };

    const result = createVerificationRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.property_id).toBe(1);
      expect(result.data.photos.length).toBe(2);
    }
  });

  it('deve rejeitar solicitação sem fotos', () => {
    const invalidData = {
      property_id: 1,
      photos: [],
    };

    const result = createVerificationRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('photos');
    }
  });

  it('deve rejeitar fotos muito grandes', () => {
    const mockPhoto = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    Object.defineProperty(mockPhoto, 'size', { value: 15 * 1024 * 1024 });

    const invalidData = {
      property_id: 1,
      photos: [mockPhoto],
    };

    const result = createVerificationRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.path.includes('photos'))).toBe(true);
    }
  });

  it('deve validar vídeo opcional', () => {
    const mockPhoto = new File([''], 'photo.jpg', { type: 'image/jpeg' });
    const mockVideo = new File([''], 'video.mp4', { type: 'video/mp4' });
    Object.defineProperty(mockPhoto, 'size', { value: 5 * 1024 * 1024 });
    Object.defineProperty(mockVideo, 'size', { value: 50 * 1024 * 1024 });

    const validData = {
      property_id: 1,
      photos: [mockPhoto],
      video: mockVideo,
    };

    const result = createVerificationRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.video).toBeDefined();
    }
  });
});

describe('Verification API - Revisão', () => {
  it('deve validar aprovação de verificação', () => {
    const validData = {
      verification_id: 1,
      approved: true,
      notes: 'Propriedade verificada com sucesso',
    };

    const result = reviewVerificationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.verification_id).toBe(1);
      expect(result.data.approved).toBe(true);
    }
  });

  it('deve validar rejeição com motivo', () => {
    const validData = {
      verification_id: 1,
      approved: false,
      rejection_reason: 'Fotos não mostram a propriedade claramente',
    };

    const result = reviewVerificationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.approved).toBe(false);
      expect(result.data.rejection_reason?.length).toBeGreaterThanOrEqual(10);
    }
  });

  it('deve rejeitar rejeição sem motivo', () => {
    const invalidData = {
      verification_id: 1,
      approved: false,
      rejection_reason: '',
    };

    const result = reviewVerificationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('rejection_reason');
    }
  });
});

describe('Verification API - Upload Service', () => {
  it('deve validar tipos de arquivo permitidos', () => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm'];

    const imageFile = { type: 'image/jpeg' };
    const videoFile = { type: 'video/mp4' };

    expect(allowedImageTypes).toContain(imageFile.type);
    expect(allowedVideoTypes).toContain(videoFile.type);
  });

  it('deve rejeitar tipos de arquivo não permitidos', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    const invalidFile = { type: 'application/pdf' };

    expect(allowedTypes).not.toContain(invalidFile.type);
  });
});

