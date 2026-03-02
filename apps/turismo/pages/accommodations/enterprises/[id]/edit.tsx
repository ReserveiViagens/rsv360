// ===================================================================
// PÁGINA - EDITAR EMPREENDIMENTO
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../../../src/context/AuthContext';
import ProtectedRoute from '../../../../src/components/ProtectedRoute';
import { EnterpriseForm } from '../../../../src/components/accommodations/EnterpriseForm';
import { enterprisesApi } from '../../../../src/services/api/accommodationsApi';
import type { Enterprise } from '../../../../src/types/accommodations';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function EditEnterprisePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadEnterprise();
    }
  }, [id]);

  const loadEnterprise = async () => {
    try {
      setLoading(true);
      const response = await enterprisesApi.getById(Number(id));
      if (response.success && response.data) {
        setEnterprise(response.data);
      } else {
        toast.error('Empreendimento não encontrado');
        router.push('/accommodations/enterprises');
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimento:', error);
      toast.error('Erro ao carregar empreendimento');
      router.push('/accommodations/enterprises');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Partial<Enterprise>) => {
    try {
      setSaving(true);
      const response = await enterprisesApi.update(Number(id), data);
      if (response.success) {
        toast.success('Empreendimento atualizado com sucesso!');
        router.push('/accommodations/enterprises');
      } else {
        toast.error('Erro ao atualizar empreendimento');
      }
    } catch (error) {
      console.error('Erro ao atualizar empreendimento:', error);
      toast.error('Erro ao atualizar empreendimento');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/accommodations/enterprises');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Carregando empreendimento...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!enterprise) {
    return null;
  }

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
                <h1 className="text-2xl font-bold text-gray-900">Editar Empreendimento</h1>
                <p className="text-sm text-gray-600">{enterprise.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <EnterpriseForm
            enterprise={enterprise}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
