// ===================================================================
// PÁGINA - GERENCIAMENTO DE EMPREENDIMENTOS
// ===================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { EnterpriseCard, HierarchyView } from '../../src/components/accommodations';
import { enterprisesApi } from '../../src/services/api/accommodationsApi';
import type { Enterprise } from '../../src/types/accommodations';
import {
  Plus,
  Search,
  Filter,
  Building2,
  Grid,
  List,
  ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function EnterprisesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'hierarchy'>('grid');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    city: ''
  });

  useEffect(() => {
    loadEnterprises();
  }, [filters]);

  const loadEnterprises = async () => {
    try {
      setLoading(true);
      const response = await enterprisesApi.list({
        search: searchTerm || undefined,
        type: filters.type || undefined,
        status: filters.status || undefined,
        city: filters.city || undefined
      });
      if (response.success && response.data) {
        setEnterprises(Array.isArray(response.data) ? response.data : [response.data]);
      }
    } catch (error) {
      console.error('Erro ao carregar empreendimentos:', error);
      toast.error('Erro ao carregar empreendimentos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este empreendimento?')) {
      return;
    }

    try {
      const response = await enterprisesApi.delete(id);
      if (response.success) {
        toast.success('Empreendimento deletado com sucesso');
        loadEnterprises();
      }
    } catch (error) {
      console.error('Erro ao deletar empreendimento:', error);
      toast.error('Erro ao deletar empreendimento');
    }
  };

  const handleEdit = (enterprise: Enterprise) => {
    router.push(`/accommodations/enterprises/${enterprise.id}/edit`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Empreendimentos</h1>
                  <p className="text-sm text-gray-600">Gerencie hotéis, pousadas, resorts e mais</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/accommodations/enterprises/new')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Empreendimento
              </button>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar empreendimentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadEnterprises()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os tipos</option>
                  <option value="hotel">Hotel</option>
                  <option value="pousada">Pousada</option>
                  <option value="resort">Resort</option>
                  <option value="flat">Flat</option>
                  <option value="chacara">Chácara</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos os status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="maintenance">Manutenção</option>
                </select>
              </div>

              {/* Modo de visualização */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('hierarchy')}
                  className={`p-2 rounded ${viewMode === 'hierarchy' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  title="Hierarquia"
                >
                  <Building2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : viewMode === 'hierarchy' ? (
            <HierarchyView
              onEditEnterprise={handleEdit}
              onDeleteEnterprise={handleDelete}
            />
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterprises.map(enterprise => (
                <EnterpriseCard
                  key={enterprise.id}
                  enterprise={enterprise}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {enterprises.map(enterprise => (
                <EnterpriseCard
                  key={enterprise.id}
                  enterprise={enterprise}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {!loading && enterprises.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Nenhum empreendimento encontrado</p>
              <button
                onClick={() => router.push('/accommodations/enterprises/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Criar Primeiro Empreendimento
              </button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
