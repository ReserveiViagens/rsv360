'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Settings,
  BarChart3,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { ReportBuilder, ReportTemplates, DataExport, ReportScheduler } from '../src/components/reports';

// ===================================================================
// PÁGINA PRINCIPAL DO SISTEMA DE RELATÓRIOS
// ===================================================================

const ReportsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'builder' | 'templates' | 'export' | 'scheduler'>('overview');

  const sections = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'builder', label: 'Construtor', icon: <FileText className="w-5 h-5" /> },
    { id: 'templates', label: 'Templates', icon: <Settings className="w-5 h-5" /> },
    { id: 'export', label: 'Exportação', icon: <Download className="w-5 h-5" /> },
    { id: 'scheduler', label: 'Agendamento', icon: <Calendar className="w-5 h-5" /> }
  ];

  const stats = [
    { label: 'Relatórios Criados', value: '24', icon: <FileText className="w-6 h-6" />, color: 'text-blue-600' },
    { label: 'Exportações Hoje', value: '8', icon: <Download className="w-6 h-6" />, color: 'text-green-600' },
    { label: 'Agendamentos Ativos', value: '5', icon: <Calendar className="w-6 h-6" />, color: 'text-purple-600' },
    { label: 'Templates Disponíveis', value: '12', icon: <Settings className="w-6 h-6" />, color: 'text-orange-600' }
  ];

  const recentReports = [
    { name: 'Relatório de Vendas - Janeiro 2024', type: 'PDF', date: '2024-01-20', size: '2.4 MB' },
    { name: 'Análise de Clientes - Q4 2023', type: 'Excel', date: '2024-01-19', size: '1.8 MB' },
    { name: 'Resumo Financeiro - Dezembro', type: 'PDF', date: '2024-01-18', size: '3.1 MB' },
    { name: 'Performance de Marketing', type: 'CSV', date: '2024-01-17', size: '856 KB' }
  ];

  const scheduledReports = [
    { name: 'Relatório Diário de Vendas', nextRun: '2024-01-21 08:00', status: 'active' },
    { name: 'Relatório Semanal de Clientes', nextRun: '2024-01-22 09:00', status: 'active' },
    { name: 'Relatório Mensal Financeiro', nextRun: '2024-02-01 10:00', status: 'paused' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sistema de Relatórios</h1>
              <p className="text-gray-600">Gerencie relatórios, exportações e agendamentos</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <FileText className="w-4 h-4" />
                <span>Novo Relatório</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.icon}
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Reports */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Relatórios Recentes</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.name}</p>
                            <p className="text-sm text-gray-600">
                              {report.type} • {report.date} • {report.size}
                            </p>
                          </div>
                        </div>
                        <button 
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download do relatório"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scheduled Reports */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Agendamentos</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {scheduledReports.map((report, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{report.name}</p>
                            <p className="text-sm text-gray-600">
                              Próxima execução: {report.nextRun}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status === 'active' ? 'Ativo' : 'Pausado'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveSection('builder')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Criar Relatório</p>
                    <p className="text-sm text-gray-600">Use o construtor personalizado</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('templates')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Usar Template</p>
                    <p className="text-sm text-gray-600">Escolha um template pré-definido</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveSection('export')}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Exportar Dados</p>
                    <p className="text-sm text-gray-600">Exporte dados em diferentes formatos</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'builder' && <ReportBuilder />}
        {activeSection === 'templates' && <ReportTemplates />}
        {activeSection === 'export' && <DataExport />}
        {activeSection === 'scheduler' && <ReportScheduler />}
      </div>
    </div>
  );
};

export default ReportsPage;
