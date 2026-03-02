'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy,
  Star,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Filter,
  Search,
  Plus,
  Grid,
  List
} from 'lucide-react';

// ===================================================================
// TIPOS E INTERFACES
// ===================================================================

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  fields: number;
  isDefault: boolean;
  isFavorite: boolean;
  lastUsed?: string;
  usageCount: number;
  tags: string[];
}

interface TemplateCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

// ===================================================================
// DADOS MOCK
// ===================================================================

const categories: TemplateCategory[] = [
  { id: 'all', name: 'Todos', icon: <Grid className="w-4 h-4" />, count: 12 },
  { id: 'customer', name: 'Clientes', icon: <Users className="w-4 h-4" />, count: 3 },
  { id: 'financial', name: 'Financeiro', icon: <DollarSign className="w-4 h-4" />, count: 4 },
  { id: 'booking', name: 'Reservas', icon: <Calendar className="w-4 h-4" />, count: 3 },
  { id: 'marketing', name: 'Marketing', icon: <TrendingUp className="w-4 h-4" />, count: 2 }
];

const reportTemplates: ReportTemplate[] = [
  {
    id: 'customer-analysis',
    name: 'Análise de Clientes',
    description: 'Relatório completo de análise de clientes, comportamento de compra e satisfação',
    category: 'customer',
    icon: <Users className="w-5 h-5" />,
    fields: 8,
    isDefault: true,
    isFavorite: true,
    lastUsed: '2024-01-20',
    usageCount: 15,
    tags: ['clientes', 'análise', 'satisfação']
  },
  {
    id: 'financial-summary',
    name: 'Resumo Financeiro',
    description: 'Relatório de receitas, despesas, lucratividade e métricas financeiras',
    category: 'financial',
    icon: <DollarSign className="w-5 h-5" />,
    fields: 12,
    isDefault: true,
    isFavorite: false,
    lastUsed: '2024-01-19',
    usageCount: 23,
    tags: ['financeiro', 'receita', 'lucro']
  },
  {
    id: 'booking-analytics',
    name: 'Analytics de Reservas',
    description: 'Análise detalhada de reservas, destinos populares e tendências',
    category: 'booking',
    icon: <BarChart3 className="w-5 h-5" />,
    fields: 10,
    isDefault: true,
    isFavorite: true,
    lastUsed: '2024-01-18',
    usageCount: 18,
    tags: ['reservas', 'destinos', 'tendências']
  },
  {
    id: 'marketing-performance',
    name: 'Performance de Marketing',
    description: 'Métricas de campanhas, conversões e ROI de marketing',
    category: 'marketing',
    icon: <TrendingUp className="w-5 h-5" />,
    fields: 9,
    isDefault: false,
    isFavorite: false,
    lastUsed: '2024-01-17',
    usageCount: 8,
    tags: ['marketing', 'campanhas', 'conversão']
  }
];

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const ReportTemplates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  // ===================================================================
  // FILTROS E ORDENAÇÃO
  // ===================================================================

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !favoritesOnly || template.isFavorite;
    
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  // ===================================================================
  // HANDLERS
  // ===================================================================

  const handleUseTemplate = (template: ReportTemplate) => {
    console.log('Usando template:', template.name);
    alert(`Iniciando relatório com template: ${template.name}`);
  };

  const handleDuplicateTemplate = (template: ReportTemplate) => {
    console.log('Duplicando template:', template.name);
    alert(`Template "${template.name}" duplicado com sucesso!`);
  };

  const handleToggleFavorite = (templateId: string) => {
    console.log('Alternando favorito:', templateId);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      console.log('Excluindo template:', templateId);
      alert('Template excluído com sucesso!');
    }
  };

  // ===================================================================
  // RENDERIZAÇÃO
  // ===================================================================

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Templates de Relatórios
              </h1>
              <p className="text-gray-600">
                Escolha entre templates pré-definidos ou crie seus próprios relatórios
              </p>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </button>
          </div>
        </div>

        {/* Filtros e Controles */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Busca */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                title="Buscar templates por nome, descrição ou tags"
              />
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-4">
              {/* Favoritos */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Apenas favoritos</span>
              </label>

              {/* Modo de visualização */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="Visualização em grade"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  title="Visualização em lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Categorias */}
          <div className="lg:w-64">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {category.icon}
                      <span className="text-sm font-medium">{category.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{reportTemplates.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Favoritos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {reportTemplates.filter(t => t.isFavorite).length}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mais Usados</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.max(...reportTemplates.map(t => t.usageCount))}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Resultados</p>
                    <p className="text-2xl font-bold text-gray-900">{filteredTemplates.length}</p>
                  </div>
                  <Filter className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Lista de Templates */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="p-6">
                      {/* Header do Card */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            {template.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                            {template.isDefault && (
                              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                Padrão
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleToggleFavorite(template.id)}
                            className={`p-1 rounded ${
                              template.isFavorite 
                                ? 'text-yellow-500 hover:text-yellow-600' 
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={template.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          >
                            <Star className={`w-4 h-4 ${template.isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {template.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Estatísticas */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>{template.fields} campos</span>
                        <span>{template.usageCount} usos</span>
                        {template.lastUsed && (
                          <span>Usado em {new Date(template.lastUsed).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Usar</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          title="Duplicar template"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Template
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Campos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredTemplates.map(template => (
                        <tr key={template.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                {template.icon}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900">{template.name}</span>
                                  {template.isDefault && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      Padrão
                                    </span>
                                  )}
                                  {template.isFavorite && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900 capitalize">
                              {template.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{template.fields}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{template.usageCount}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUseTemplate(template)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Usar
                              </button>
                              <button
                                onClick={() => handleDuplicateTemplate(template)}
                                className="text-gray-600 hover:text-gray-800 text-sm"
                                title="Duplicar template"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mensagem quando não há resultados */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum template encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar os filtros ou criar um novo template.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Criar Novo Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTemplates;