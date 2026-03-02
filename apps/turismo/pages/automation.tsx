'use client'

import React, { useState, useEffect } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import { api } from '../src/services/apiClient'
import { Zap } from 'lucide-react'

interface Automation {
  id: number;
  name: string;
  description: string;
  status: string;
  trigger_type: string;
  actions_count: number;
  last_executed?: string;
}

export default function AutomationPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAutomations = async () => {
      try {
        const response = await api.get('/api/v1/automation');
        setAutomations(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error fetching automations:', err);
        setAutomations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAutomations();
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
          <Zap className="w-8 h-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automação</h1>
            <p className="text-gray-600 mt-1">Sistema de automação</p>
          </div>
        </div>

        {automations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Nenhuma automação encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automations.map(automation => (
              <div key={automation.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{automation.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    automation.status === 'active' ? 'bg-green-100 text-green-800' :
                    automation.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {automation.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{automation.description}</p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    Tipo de gatilho: <span className="font-medium">{automation.trigger_type}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Ações: <span className="font-medium">{automation.actions_count || 0}</span>
                  </p>
                  {automation.last_executed && (
                    <p className="text-xs text-gray-500">
                      Última execução: {new Date(automation.last_executed).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
