import React from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const BusinessModules: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="business-modules-title">
              Business Modules
            </h1>
            <p className="mt-2 text-gray-600" data-testid="business-modules-subtitle">
              Módulos especializados para gestão completa do negócio
            </p>
          </div>

          {/* Módulos Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Booking Engine */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="booking-engine-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">Booking Engine</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sistema completo de reservas com calendário, disponibilidade e pagamentos integrados.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Reservas em tempo real
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Integração com pagamentos
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Gestão de disponibilidade
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>

            {/* CRM System */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="crm-system-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">CRM System</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gestão completa de relacionamento com clientes, histórico e comunicação.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Perfil completo do cliente
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Histórico de interações
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Automação de marketing
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>

            {/* Hotel Management */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="hotel-management-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">Hotel Management</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gestão completa de hotéis, quartos, preços e disponibilidade.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Catálogo de hotéis
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Gestão de preços
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  Controle de estoque
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>
          </div>

          {/* Estatísticas dos Módulos */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900" data-testid="modules-stats-title">
                Estatísticas dos Módulos
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="bookings-count">1,247</div>
                  <div className="text-sm text-gray-600">Reservas Processadas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2" data-testid="customers-count">892</div>
                  <div className="text-sm text-gray-600">Clientes Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2" data-testid="hotels-count">156</div>
                  <div className="text-sm text-gray-600">Hotéis Cadastrados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default BusinessModules;
