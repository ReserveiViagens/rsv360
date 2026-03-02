// ===================================================================
// PÁGINA - CRIAR EMPREENDIMENTO
// ===================================================================

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { EnterpriseForm } from '../../src/components/accommodations/EnterpriseForm';
import { enterprisesApi } from '../../src/services/api/accommodationsApi';
import type { Enterprise } from '../../src/types/accommodations';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewEnterprisePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: Partial<Enterprise>) => {
    try {
      setSaving(true);
      const response = await enterprisesApi.create(data);
      if (response.success) {
        toast.success('Empreendimento criado com sucesso!');
        router.push('/accommodations/enterprises');
      } else {
        toast.error('Erro ao criar empreendimento');
      }
    } catch (error) {
      console.error('Erro ao criar empreendimento:', error);
      toast.error('Erro ao criar empreendimento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/accommodations/enterprises');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/accommodations/enterprises"
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Novo Empreendimento</h1>
                <p className="text-sm text-gray-600">Crie um novo hotel, pousada, resort ou outro empreendimento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EnterpriseForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
