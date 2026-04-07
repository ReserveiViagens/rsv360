// ===================================================================
// PÁGINA - DASHBOARD DE ANALYTICS DE ACOMODAÇÕES
// ===================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import ProtectedRoute from '../../src/components/ProtectedRoute';
import { enterprisesApi, propertiesApi, accommodationsApi } from '../../src/services/api/accommodationsApi';
import {
  Building2,
  Home,
  Bed,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Star,
  BarChart3,
  PieChart,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AccommodationsAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [enterprises, setEnterprises] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [accommodations, setAccommodations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enterprisesRes, propertiesRes, accommodationsRes] = await Promise.all([
        enterprisesApi.list(),
        propertiesApi.list(),
        accommodationsApi.list()
      ]);

      if (enterprisesRes.success && enterprisesRes.data) {
        setEnterprises(Array.isArray(enterprisesRes.data) ? enterprisesRes.data : [enterprisesRes.data]);
      }
      if (propertiesRes.success && propertiesRes.data) {
        setProperties(Array.isArray(propertiesRes.data) ? propertiesRes.data : [propertiesRes.data]);
      }
      if (accommodationsRes.success && accommodationsRes.data) {
        setAccommodations(Array.isArray(accommodationsRes.data) ? accommodationsRes.data : [accommodationsRes.data]);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeEnterprises = enterprises.filter(e => e.status === 'active').length;
    const activeProperties = properties.filter(p => p.status === 'active').length;
    const activeAccommodations = accommodations.filter(a => a.status === 'active').length;
    
    const totalCapacity = accommodations.reduce((sum, acc) => sum + (acc.maxGuests || 0), 0);
    const averagePrice = accommodations
      .filter(a => a.basePricePerNight)
      .reduce((sum, acc, _, arr) => sum + (acc.basePricePerNight || 0) / arr.length, 0);

    const enterprisesByType = enterprises.reduce((acc, e) => {
      acc[e.enterpriseType] = (acc[e.enterpriseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEnterprises: enterprises.length,
      activeEnterprises,
      totalProperties: properties.length,
      activeProperties,
      totalAccommodations: accommodations.length,
      activeAccommodations,
      totalCapacity,
      averagePrice,
      enterprisesByType
    };
  }, [enterprises, properties, accommodations]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/accommodations/enterprises"
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics de Acomodações</h1>
                  <p className="text-sm text-gray-600">Estatísticas e métricas do sistema</p>
                </div>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
              </select>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="w-8 h-8 text-blue-600" />
                <span className="text-sm text-gray-500">Empreendimentos</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalEnterprises}</div>
              <div className="text-sm text-gray-600 mt-1">
                {stats.activeEnterprises} ativos
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Home className="w-8 h-8 text-green-600" />
                <span className="text-sm text-gray-500">Propriedades</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalProperties}</div>
              <div className="text-sm text-gray-600 mt-1">
                {stats.activeProperties} ativas
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Bed className="w-8 h-8 text-purple-600" />
                <span className="text-sm text-gray-500">Acomodações</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalAccommodations}</div>
              <div className="text-sm text-gray-600 mt-1">
                {stats.activeAccommodations} ativas
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 text-orange-600" />
                <span className="text-sm text-gray-500">Capacidade Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalCapacity}</div>
              <div className="text-sm text-gray-600 mt-1">
                hóspedes simultâneos
              </div>
            </div>
          </div>

          {/* Gráficos e Métricas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribuição por Tipo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Distribuição por Tipo de Empreendimento
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.enterprisesByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count / stats.totalEnterprises) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preço Médio */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Preço Médio por Noite
              </h3>
              <div className="text-center py-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  R$ {stats.averagePrice.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Média de todas as acomodações</p>
              </div>
            </div>
          </div>

          {/* Top Empreendimentos */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Empreendimentos em Destaque
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enterprises
                .filter(e => e.isFeatured)
                .slice(0, 6)
                .map(enterprise => (
                  <div
                    key={enterprise.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/accommodations/enterprises/${enterprise.id}`)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {enterprise.images && enterprise.images.length > 0 && (
                        <img
                          src={enterprise.images[0]}
                          alt={enterprise.name}
                          className="w-12 h-12 rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{enterprise.name}</h4>
                        <p className="text-xs text-gray-500">{enterprise.address.city}, {enterprise.address.state}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
