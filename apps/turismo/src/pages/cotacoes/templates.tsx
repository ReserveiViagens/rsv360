import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, FileText, Plus, Eye, Copy } from 'lucide-react';

export default function TemplatesPage() {
  const templates = [
    {
      id: '1',
      name: 'Resort All Inclusive',
      category: 'Hotéis',
      description: 'Template para resorts com sistema all inclusive',
      icon: '🏨',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: '2',
      name: 'Parque Temático Família',
      category: 'Parques',
      description: 'Cotação para família em parques temáticos',
      icon: '🎢',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: '3',
      name: 'City Tour Histórico',
      category: 'Passeios',
      description: 'Tour pelos pontos históricos da cidade',
      icon: '🚌',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: '4',
      name: 'Museus e Cultura',
      category: 'Atrações',
      description: 'Roteiro cultural com museus e centros culturais',
      icon: '🎡',
      color: 'bg-green-100 text-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cotacoes" className="flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Cotações</span>
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">📋 Templates de Cotação</h1>
                <p className="text-gray-600">Modelos pré-configurados para agilizar suas cotações</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar por Categoria</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm">
              Todos
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Hotéis
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Parques
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Atrações
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
              Passeios
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${template.color}`}>
                    <span className="text-2xl">{template.icon}</span>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {template.category}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {template.description}
                </p>
                
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                    <Plus className="w-4 h-4" />
                    <span>Usar Template</span>
                  </button>
                  <button 
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Visualizar template"
                  >
                    <Eye className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Duplicar template"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Criar Template Personalizado */}
        <div className="mt-12 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-8 border border-teal-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Criar Template Personalizado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seus próprios templates para reutilizar em futuras cotações
            </p>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
              Começar Criação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
