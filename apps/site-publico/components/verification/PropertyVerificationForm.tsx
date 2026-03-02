/**
 * ✅ FASE 6.1: PropertyVerificationForm Component
 * 
 * Formulário para submissão de verificação de propriedade
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PhotoUpload } from './PhotoUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const verificationSchema = z.object({
  propertyId: z.number(),
  verificationType: z.enum(['standard', 'premium', 'luxury']),
  notes: z.string().optional(),
  photos: z.array(z.instanceof(File)).min(5, 'Mínimo de 5 fotos'),
  documents: z.array(z.instanceof(File)).optional(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface Props {
  propertyId: number;
  onSuccess?: () => void;
}

export function PropertyVerificationForm({ propertyId, onSuccess }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      propertyId,
      verificationType: 'standard',
    }
  });
  
  const onSubmit = async (data: VerificationFormData) => {
    try {
      setUploading(true);
      
      // Upload de fotos
      const photoUrls = await uploadPhotos(data.photos);
      
      // Upload de documentos
      const docUrls = data.documents 
        ? await uploadDocuments(data.documents)
        : [];
      
      // Submeter verificação
      const response = await fetch(`/api/verification/submit/${propertyId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationType: data.verificationType,
          notes: data.notes,
          photoUrls,
          documentUrls: docUrls
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao submeter verificação');
      }
      
      toast.success('Verificação submetida com sucesso!');
      onSuccess?.();
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao submeter verificação');
    } finally {
      setUploading(false);
    }
  };
  
  const uploadPhotos = async (photos: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const photo of photos) {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('type', 'property_verification');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao fazer upload: ${photo.name}`);
      }
      
      const { url } = await response.json();
      urls.push(url);
    }
    
    return urls;
  };
  
  const uploadDocuments = async (docs: File[]): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const doc of docs) {
      const formData = new FormData();
      formData.append('file', doc);
      formData.append('type', 'property_document');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao fazer upload: ${doc.name}`);
      }
      
      const { url } = await response.json();
      urls.push(url);
    }
    
    return urls;
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label>Tipo de Verificação</Label>
        <select
          {...register('verificationType')}
          className="w-full p-2 border rounded"
        >
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="luxury">Luxury</option>
        </select>
      </div>
      
      <div>
        <Label>Fotos da Propriedade (mínimo 5)</Label>
        <PhotoUpload
          onPhotosSelected={(photos) => {
            setUploadedPhotos(photos);
            setValue('photos', photos);
          }}
          maxPhotos={20}
          minPhotos={5}
        />
        {errors.photos && (
          <p className="text-red-500 text-sm mt-1">{errors.photos.message}</p>
        )}
      </div>
      
      <div>
        <Label>Documentos (opcional)</Label>
        <PhotoUpload
          onPhotosSelected={(docs) => {
            setUploadedDocs(docs);
            setValue('documents', docs);
          }}
          maxPhotos={5}
          accept=".pdf,.doc,.docx"
        />
      </div>
      
      <div>
        <Label>Notas Adicionais</Label>
        <Textarea
          {...register('notes')}
          placeholder="Informações adicionais sobre a propriedade..."
          rows={4}
        />
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" disabled={uploading}>
          {uploading ? 'Enviando...' : 'Submeter Verificação'}
        </Button>
      </div>
    </form>
  );
}
