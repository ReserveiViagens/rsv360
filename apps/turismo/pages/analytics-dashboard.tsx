// ===================================================================
// ANALYTICS DASHBOARD PAGE - PÁGINA DEDICADA PARA ANALYTICS
// ===================================================================

import React, { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NotificationProvider } from '../src/context/NotificationContext';
import { NotificationBell, NotificationToastContainer } from '../src/components/notifications';
import { AnalyticsDashboard, AdvancedCharts, ReportBuilder } from '../src/components/analytics';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

export default function AnalyticsDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advanced' | 'reports'>('dashboard');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleGenerateReport = (config: any) => {
    console.log('Gerando relatório:', config);
    // Implementar geração de relatório
    alert('Relatório gerado com sucesso!');
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <ProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    title="Abrir menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div className="ml-4 lg:ml-0">
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-sm text-gray-500">Análise avançada do seu negócio</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</p>
                      <p className="text-xs text-gray-500">{user?.role || 'Analista'}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md"
                      title="Sair"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="flex">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
                    title="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                  <Link href="/dashboard-rsv" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md">
                    <ArrowLeft className="w-5 h-5 mr-3" />
                    Voltar ao Dashboard
                  </Link>
                  
                  <div className="pt-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Analytics
                    </h3>
                    <div className="mt-2 space-y-1">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'dashboard'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <BarChart3 className="w-5 h-5 mr-3" />
                        Dashboard Principal
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('advanced')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'advanced'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <TrendingUp className="w-5 h-5 mr-3" />
                        Análise Avançada
                      </button>
                      
                      <button
                        onClick={() => setActiveTab('reports')}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                          activeTab === 'reports'
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <FileText className="w-5 h-5 mr-3" />
                        Relatórios
                      </button>
                    </div>
                  </div>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="mb-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'dashboard'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Dashboard Principal
                      </button>
                      <button
                        onClick={() => setActiveTab('advanced')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'advanced'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Análise Avançada
                      </button>
                      <button
                        onClick={() => setActiveTab('reports')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'reports'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Relatórios
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && <AnalyticsDashboard />}
                {activeTab === 'advanced' && (
                  <AdvancedCharts 
                    data={null} // Em produção, passar dados reais
                    selectedMetric={selectedMetric}
                    onMetricChange={setSelectedMetric}
                  />
                )}
                {activeTab === 'reports' && (
                  <ReportBuilder 
                    data={null} // Em produção, passar dados reais
                    onGenerateReport={handleGenerateReport}
                  />
                )}
              </div>
            </div>
          </div>
          
          <NotificationToastContainer />
        </div>
      </NotificationProvider>
    </ProtectedRoute>
  );
}