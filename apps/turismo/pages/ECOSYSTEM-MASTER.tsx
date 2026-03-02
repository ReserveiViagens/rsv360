import React from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const EcosystemMaster: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="ecosystem-master-title">
              RSV 360° Ecosystem Master
            </h1>
            <p className="mt-2 text-gray-600" data-testid="ecosystem-master-subtitle">
              Centro de controle do ecossistema completo da Reservei Viagens
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics Intelligence */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="analytics-intelligence-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">Analytics Intelligence</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sistema avançado de análise de dados e inteligência artificial para insights de negócio.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>

            {/* Business Modules */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="business-modules-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">Business Modules</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Módulos de negócio especializados: Booking Engine, CRM System, Hotel Management.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>

            {/* Infrastructure */}
            <div className="bg-white rounded-lg shadow p-6" data-testid="infrastructure-card">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 ml-3">Infrastructure</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Infraestrutura completa com Docker, CI/CD, monitoramento e backup automatizado.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-600 font-medium">Ativo</span>
                <button className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Acessar →
                </button>
              </div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900" data-testid="system-status-title">
                Status do Sistema
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Frontend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Backend</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Database</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Monitoring</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default EcosystemMaster;
