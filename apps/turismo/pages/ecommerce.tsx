'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { ShoppingCart } from 'lucide-react'

interface EcommerceStats {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
}

export default function EcommercePage() {
  const [stats, setStats] = useState<EcommerceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/v1/ecommerce/stats');
        setStats(response.data || null);
      } catch (err) {
        console.error('Error fetching ecommerce stats:', err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">E-commerce</h1>
            <p className="text-gray-600 mt-1">Plataforma de e-commerce</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Produtos</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total_products || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Pedidos</h3>
              <p className="text-3xl font-bold text-green-600">{stats.total_orders || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Receita Total</h3>
              <p className="text-3xl font-bold text-purple-600">R$ {stats.total_revenue?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Pedidos Pendentes</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.pending_orders || 0}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Página de gestão de e-commerce em desenvolvimento.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
