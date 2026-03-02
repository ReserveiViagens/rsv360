import React from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

const AnalyticsIntelligence: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900" data-testid="analytics-intelligence-title">
              Analytics Intelligence
            </h1>
            <p className="mt-2 text-gray-600" data-testid="analytics-intelligence-subtitle">
              Sistema avançado de análise de dados e inteligência artificial
            </p>
          </div>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6" data-testid="total-analytics-card">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Análises</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="total-analytics-value">2,847</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6" data-testid="ai-insights-card">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Insights de IA</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="ai-insights-value">156</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6" data-testid="predictions-card">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Previsões</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="predictions-value">89</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6" data-testid="accuracy-card">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Precisão</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="accuracy-value">94.2%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos e Análises */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6" data-testid="trend-analysis-card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Análise de Tendências</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gráfico de Tendências</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6" data-testid="customer-insights-card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Insights de Clientes</h3>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Análise de Comportamento</p>
              </div>
            </div>
          </div>

          {/* Relatórios Automatizados */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900" data-testid="automated-reports-title">
                Relatórios Automatizados
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Relatório de Vendas Diário</h4>
                    <p className="text-sm text-gray-600">Análise automática de vendas e conversões</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Ativo</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Análise de Satisfação</h4>
                    <p className="text-sm text-gray-600">Monitoramento de NPS e feedback dos clientes</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Ativo</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Previsão de Demanda</h4>
                    <p className="text-sm text-gray-600">IA prevê demanda futura baseada em histórico</p>
                  </div>
                  <span className="text-sm text-green-600 font-medium">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AnalyticsIntelligence;
