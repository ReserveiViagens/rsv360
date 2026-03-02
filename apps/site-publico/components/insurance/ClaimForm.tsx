/**
 * ✅ FASE 6.8: ClaimForm Component
 * 
 * Formulário para criação de sinistro de seguro
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FileText, Upload, AlertCircle, Calendar, MapPin } from 'lucide-react';
import { PhotoUpload } from '@/components/verification/PhotoUpload';

const claimFormSchema = z.object({
  policyId: z.number().int().positive('ID da apólice é obrigatório'),
  bookingId: z.number().int().positive('ID da reserva é obrigatório'),
  claimType: z.enum(['cancellation', 'medical', 'baggage', 'trip_delay', 'accident', 'other']),
  description: z.string().min(20, 'Descrição deve ter pelo menos 20 caracteres'),
  incidentDate: z.string().datetime('Data do incidente inválida'),
  incidentLocation: z.string().optional(),
  claimedAmount: z.number().min(0, 'Valor deve ser positivo'),
  documents: z.array(z.instanceof(File)).optional(),
  evidenceFiles: z.array(z.instanceof(File)).optional(),
});

type ClaimFormData = z.infer<typeof claimFormSchema>;

interface Props {
  policyId: number;
  bookingId: number;
  onSuccess?: (claimId: number) => void;
}

export function ClaimForm({ policyId, bookingId, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<File[]>([]);
  const [uploadedEvidence, setUploadedEvidence] = useState<File[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ClaimFormData>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      policyId,
      bookingId,
      claimType: 'other',
    }
  });

  const onSubmit = async (data: ClaimFormData) => {
    try {
      setSubmitting(true);
      
      // Upload de documentos
      const docUrls = uploadedDocs.length > 0 
        ? await uploadFiles(uploadedDocs, 'claim_document')
        : [];
      
      // Upload de evidências
      const evidenceUrls = uploadedEvidence.length > 0
        ? await uploadFiles(uploadedEvidence, 'claim_evidence')
        : [];
      
      // Criar sinistro
      const response = await fetch('/api/insurance/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          documents: docUrls,
          evidenceFiles: evidenceUrls,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar sinistro');
      }
      
      const result = await response.json();
      
      toast.success('Sinistro criado com sucesso!');
      onSuccess?.(result.data.id);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar sinistro');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFiles = async (files: File[], type: string): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao fazer upload: ${file.name}`);
      }
      
      const { url } = await response.json();
      urls.push(url);
    }
    
    return urls;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo de Sinistro */}
      <div>
        <Label>Tipo de Sinistro</Label>
        <select
          {...register('claimType')}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="cancellation">Cancelamento</option>
          <option value="medical">Emergência Médica</option>
          <option value="baggage">Bagagem Perdida/Danificada</option>
          <option value="trip_delay">Atraso na Viagem</option>
          <option value="accident">Acidente</option>
          <option value="other">Outro</option>
        </select>
        {errors.claimType && (
          <p className="text-red-500 text-sm mt-1">{errors.claimType.message}</p>
        )}
      </div>

      {/* Descrição */}
      <div>
        <Label className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Descrição do Sinistro
        </Label>
        <Textarea
          {...register('description')}
          placeholder="Descreva detalhadamente o que aconteceu..."
          rows={6}
          className="mt-1"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Mínimo de 20 caracteres. Seja o mais detalhado possível.
        </p>
      </div>

      {/* Data do Incidente */}
      <div>
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Data do Incidente
        </Label>
        <Input
          type="datetime-local"
          {...register('incidentDate')}
          className="mt-1"
        />
        {errors.incidentDate && (
          <p className="text-red-500 text-sm mt-1">{errors.incidentDate.message}</p>
        )}
      </div>

      {/* Local do Incidente */}
      <div>
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Local do Incidente (opcional)
        </Label>
        <Input
          {...register('incidentLocation')}
          placeholder="Endereço ou localização"
          className="mt-1"
        />
      </div>

      {/* Valor Reclamado */}
      <div>
        <Label>Valor Reclamado (R$)</Label>
        <Input
          type="number"
          {...register('claimedAmount', { valueAsNumber: true })}
          min="0"
          step="0.01"
          placeholder="0.00"
          className="mt-1"
        />
        {errors.claimedAmount && (
          <p className="text-red-500 text-sm mt-1">{errors.claimedAmount.message}</p>
        )}
      </div>

      {/* Documentos */}
      <div>
        <Label>Documentos de Apoio (opcional)</Label>
        <PhotoUpload
          onPhotosSelected={(docs) => {
            setUploadedDocs(docs);
            setValue('documents', docs);
          }}
          maxPhotos={10}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload de documentos que comprovem o sinistro (máx. 10 arquivos)
        </p>
      </div>

      {/* Evidências */}
      <div>
        <Label>Fotos/Evidências (opcional)</Label>
        <PhotoUpload
          onPhotosSelected={(photos) => {
            setUploadedEvidence(photos);
            setValue('evidenceFiles', photos);
          }}
          maxPhotos={20}
          accept="image/*"
        />
        <p className="text-xs text-gray-500 mt-1">
          Fotos que comprovem o sinistro (máx. 20 fotos)
        </p>
      </div>

      {/* Aviso */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Forneça o máximo de detalhes possível</li>
              <li>Documentos e evidências ajudam na análise</li>
              <li>O processo de análise pode levar até 5 dias úteis</li>
              <li>Você receberá notificações sobre o status do sinistro</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botão de Submissão */}
      <div className="flex gap-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          <Upload className="h-4 w-4 mr-2" />
          {submitting ? 'Enviando Sinistro...' : 'Enviar Sinistro'}
        </Button>
      </div>
    </form>
  );
}

