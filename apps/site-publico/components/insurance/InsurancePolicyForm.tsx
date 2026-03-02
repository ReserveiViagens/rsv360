/**
 * ✅ FASE 6.7: InsurancePolicyForm Component
 * 
 * Formulário para criação de apólice de seguro
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
import { Shield, Calendar, Users, DollarSign } from 'lucide-react';

const insurancePolicySchema = z.object({
  bookingId: z.number().int().positive('ID da reserva é obrigatório'),
  coverageType: z.enum(['basic', 'standard', 'premium', 'comprehensive']),
  coverageAmount: z.number().min(1000, 'Valor mínimo de cobertura: R$ 1.000'),
  insuredName: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  insuredDocument: z.string().optional(),
  insuredEmail: z.string().email('Email inválido').optional(),
  insuredPhone: z.string().optional(),
  coverageStartDate: z.string().datetime('Data de início inválida'),
  coverageEndDate: z.string().datetime('Data de fim inválida'),
  termsAccepted: z.boolean().refine(val => val === true, 'Você deve aceitar os termos'),
});

type InsurancePolicyFormData = z.infer<typeof insurancePolicySchema>;

interface Props {
  bookingId: number;
  onSuccess?: (policyId: number) => void;
}

export function InsurancePolicyForm({ bookingId, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<InsurancePolicyFormData>({
    resolver: zodResolver(insurancePolicySchema),
    defaultValues: {
      bookingId,
      coverageType: 'standard',
      termsAccepted: false,
    }
  });

  const coverageType = watch('coverageType');
  const coverageAmount = watch('coverageAmount');

  const calculatePremium = (type: string, amount: number) => {
    const rates = {
      basic: 0.02,
      standard: 0.035,
      premium: 0.05,
      comprehensive: 0.07,
    };
    return Math.round(amount * (rates[type as keyof typeof rates] || 0.035));
  };

  const premium = coverageAmount ? calculatePremium(coverageType, coverageAmount) : 0;

  const onSubmit = async (data: InsurancePolicyFormData) => {
    try {
      setSubmitting(true);
      
      const response = await fetch('/api/insurance/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          premiumAmount: premium,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar apólice');
      }
      
      const result = await response.json();
      
      toast.success('Apólice criada com sucesso!');
      onSuccess?.(result.data.id);
      
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar apólice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Tipo de Cobertura */}
      <div>
        <Label>Tipo de Cobertura</Label>
        <select
          {...register('coverageType')}
          className="w-full p-2 border rounded mt-1"
        >
          <option value="basic">Básica (2% do valor)</option>
          <option value="standard">Padrão (3.5% do valor)</option>
          <option value="premium">Premium (5% do valor)</option>
          <option value="comprehensive">Completa (7% do valor)</option>
        </select>
        {errors.coverageType && (
          <p className="text-red-500 text-sm mt-1">{errors.coverageType.message}</p>
        )}
      </div>

      {/* Valor de Cobertura */}
      <div>
        <Label className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Valor de Cobertura (R$)
        </Label>
        <Input
          type="number"
          {...register('coverageAmount', { valueAsNumber: true })}
          min="1000"
          step="100"
          className="mt-1"
        />
        {errors.coverageAmount && (
          <p className="text-red-500 text-sm mt-1">{errors.coverageAmount.message}</p>
        )}
      </div>

      {/* Prêmio Calculado */}
      {coverageAmount && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-900">Prêmio Estimado:</span>
            <span className="text-xl font-bold text-blue-700">
              R$ {premium.toLocaleString('pt-BR')}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Baseado em {coverageType} e cobertura de R$ {coverageAmount.toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      {/* Nome do Segurado */}
      <div>
        <Label>Nome do Segurado</Label>
        <Input
          {...register('insuredName')}
          placeholder="Nome completo"
          className="mt-1"
        />
        {errors.insuredName && (
          <p className="text-red-500 text-sm mt-1">{errors.insuredName.message}</p>
        )}
      </div>

      {/* Documento */}
      <div>
        <Label>CPF/CNPJ (opcional)</Label>
        <Input
          {...register('insuredDocument')}
          placeholder="000.000.000-00"
          className="mt-1"
        />
      </div>

      {/* Email */}
      <div>
        <Label>Email (opcional)</Label>
        <Input
          type="email"
          {...register('insuredEmail')}
          placeholder="email@exemplo.com"
          className="mt-1"
        />
        {errors.insuredEmail && (
          <p className="text-red-500 text-sm mt-1">{errors.insuredEmail.message}</p>
        )}
      </div>

      {/* Telefone */}
      <div>
        <Label>Telefone (opcional)</Label>
        <Input
          {...register('insuredPhone')}
          placeholder="(00) 00000-0000"
          className="mt-1"
        />
      </div>

      {/* Datas de Cobertura */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Início
          </Label>
          <Input
            type="datetime-local"
            {...register('coverageStartDate')}
            className="mt-1"
          />
          {errors.coverageStartDate && (
            <p className="text-red-500 text-sm mt-1">{errors.coverageStartDate.message}</p>
          )}
        </div>
        <div>
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Data de Término
          </Label>
          <Input
            type="datetime-local"
            {...register('coverageEndDate')}
            className="mt-1"
          />
          {errors.coverageEndDate && (
            <p className="text-red-500 text-sm mt-1">{errors.coverageEndDate.message}</p>
          )}
        </div>
      </div>

      {/* Termos */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          {...register('termsAccepted')}
          className="mt-1"
        />
        <Label className="text-sm">
          Aceito os termos e condições da apólice de seguro
        </Label>
      </div>
      {errors.termsAccepted && (
        <p className="text-red-500 text-sm">{errors.termsAccepted.message}</p>
      )}

      {/* Botão de Submissão */}
      <div className="flex gap-4">
        <Button type="submit" disabled={submitting} className="flex-1">
          <Shield className="h-4 w-4 mr-2" />
          {submitting ? 'Criando Apólice...' : 'Criar Apólice'}
        </Button>
      </div>
    </form>
  );
}

