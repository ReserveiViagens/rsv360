import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ArrowLeft,
  FileText,
  Plus,
  Eye,
  Copy,
  Download,
  Share2,
  Search,
  Filter,
  Star,
  Trash2,
  Edit,
  Users,
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  BarChart3,
  History,
  Settings,
  Globe,
  Zap,
  Award,
  Target,
  Activity
} from 'lucide-react';
import { TemplateManager, Template } from '@/lib/templates-data';
import { QuotePreview } from '@/components/QuotePreview';
import { Budget } from '@/lib/types/budget';
import { budgetStorage } from '@/lib/budget-storage';

export default function TemplatesPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'date'>('usage');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState<'all' | 'alta' | 'baixa'>('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecommended, setShowRecommended] = useState(false);
  const [advancedStats, setAdvancedStats] = useState<any>(null);

  // Hidratação inicial dos templates V0, caso inexistentes
  const ensureExternalTemplatesInitialized = () => {
    try {
      const existing = localStorage.getItem('reservei-templates');
      if (!existing) {
        // Mapear nossos templates atuais para o formato V0 básico e salvar
        const current = TemplateManager.getAll();
        const v0 = current.map(t => ({
          id: t.id,
          name: t.name,
          mainCategory: t.category === 'hotel' ? 'Hotéis' : t.category === 'parque' ? 'Parques' : t.category === 'atracao' ? 'Atrações' : t.category === 'passeio' ? 'Passeios' : 'Outros',
          subCategory: '',
          description: t.description || '',
          thumbnailUrl: t.preview || '',
          title: t.budget?.title || t.name,
          templateDescription: t.description || '',
          photos: (t.budget?.photos || []).map(p => ({ id: p.id, url: p.url, caption: p.caption })),
          highlights: (t.budget?.highlights || []).map(h => ({ id: h.id, title: h.title, description: h.description, checked: h.checked })),
          benefits: (t.budget?.benefits || []).map(b => ({ id: b.id, description: b.description, checked: b.checked })),
          importantNotes: (t.budget?.importantNotes || []).map(n => ({ id: n.id, note: n.note, checked: n.checked })),
          items: (t.budget?.items || []).map(i => ({ id: i.id, description: i.description || i.name, quantity: i.quantity, unitPrice: i.unitPrice, total: i.totalPrice })),
          discount: t.budget?.discount || 0,
          discountType: t.budget?.discountType || 'percentage',
          tax: t.budget?.taxes || 0,
          taxType: t.budget?.taxType || 'percentage',
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString(),
        }));
        localStorage.setItem('reservei-templates', JSON.stringify(v0));
      }
    } catch (e) {
      console.error('Falha ao inicializar templates V0:', e);
    }
  };

  useEffect(() => {
    setIsClient(true);
    // Hidratar V0 se necessário
    try { ensureExternalTemplatesInitialized(); } catch {}
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, selectedCategory, searchQuery, sortBy]);

  const loadTemplates = () => {
    const allTemplates = TemplateManager.getAll();
    setTemplates(allTemplates);
    
    // Carregar estatísticas avançadas
    const stats = TemplateManager.getAdvancedStats();
    setAdvancedStats(stats);
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filtros especiais
    if (showFavorites) {
      filtered = TemplateManager.getFavoriteTemplates();
    } else if (showRecommended) {
      filtered = TemplateManager.getRecommendedTemplates();
    } else {
      // Filtrar por categoria
      if (selectedCategory !== 'all') {
        filtered = filtered.filter(template => template.category === selectedCategory);
      }

      // Filtrar por região
      if (selectedRegion !== 'all') {
        filtered = TemplateManager.getTemplatesByRegion(selectedRegion);
      }

      // Filtrar por temporada
      if (selectedSeason !== 'all') {
        const seasonalTemplates = TemplateManager.getSeasonalTemplates(selectedSeason);
        filtered = filtered.filter(template => 
          seasonalTemplates.some(st => st.id === template.id)
        );
      }

      // Filtrar por busca
      if (searchQuery.trim()) {
        filtered = TemplateManager.search(searchQuery);
        if (selectedCategory !== 'all') {
          filtered = filtered.filter(template => template.category === selectedCategory);
        }
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: Template) => {
    // Incrementar contador de uso
    TemplateManager.incrementUsage(template.id);
    
    // Criar nova cotação baseada no template
    const newBudget: Budget = {
      ...template.budget,
      id: budgetStorage.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft'
    } as Budget;

    // Salvar a nova cotação
    budgetStorage.save(newBudget);

    // Redirecionar para a página de edição apropriada
    const routes = {
      hotel: '/cotacoes/hoteis',
      parque: '/cotacoes/parques',
      atracao: '/cotacoes/atracoes',
      passeio: '/cotacoes/passeios',
      personalizado: '/cotacoes/new'
    };

    const route = routes[template.category as keyof typeof routes] || '/cotacoes/new';
    router.push(`${route}?template=${template.id}&budget=${newBudget.id}`);
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicated = TemplateManager.duplicate(template.id);
    if (duplicated) {
      loadTemplates();
      alert('Template duplicado com sucesso!');
    } else {
      alert('Erro ao duplicar template.');
    }
  };

  const handleImportFromV0 = () => {
    try {
      // Se houver uma fonte global injetada pelo módulo V0, preferir
      const anyWin = window as any;
      if (anyWin && Array.isArray(anyWin.__V0_DEFAULT_TEMPLATES__)) {
        localStorage.setItem('reservei-templates', JSON.stringify(anyWin.__V0_DEFAULT_TEMPLATES__));
      } else {
        // Fallback: garantir hidratação a partir dos nossos templates
        ensureExternalTemplatesInitialized();
      }
      loadTemplates();
      alert('Templates do Módulo V0 importados com sucesso!');
    } catch (e) {
      console.error('Erro ao importar V0:', e);
      alert('Falha ao importar do Módulo V0.');
    }
  };

  const handleDeleteTemplate = (template: Template) => {
    if (template.isDefault) {
      alert('Não é possível deletar templates padrão.');
      return;
    }

    if (confirm(`Tem certeza que deseja deletar o template "${template.name}"?`)) {
      TemplateManager.delete(template.id);
      loadTemplates();
    }
  };

  const handleToggleFavorite = (template: Template) => {
    const isFavorite = TemplateManager.toggleFavorite(template.id);
    alert(isFavorite ? 'Template adicionado aos favoritos!' : 'Template removido dos favoritos!');
    loadTemplates();
  };

  const handleShareTemplate = (template: Template) => {
    const userIds = ['user_vendas', 'user_marketing']; // Usuários exemplo
    const success = TemplateManager.shareTemplate(template.id, userIds, 'Template compartilhado para colaboração');
    
    if (success) {
      alert('Template compartilhado com sucesso!');
      TemplateManager.trackTemplateShare(template.id);
    } else {
      alert('Erro ao compartilhar template.');
    }
  };

  const handleViewAnalytics = (template: Template) => {
    const analytics = TemplateManager.getTemplateAnalytics(template.id);
    if (analytics) {
      alert(`Analytics do Template:\n\nVisualizações: ${analytics.metrics.totalViews}\nUsos: ${analytics.metrics.totalUses}\nCompartilhamentos: ${analytics.metrics.totalShares}\nTaxa de Conversão: ${analytics.metrics.conversionRate.toFixed(1)}%`);
    } else {
      alert('Dados de analytics não disponíveis para este template.');
    }
  };

  const handleViewVersions = (template: Template) => {
    const versions = TemplateManager.getTemplateVersions(template.id);
    if (versions.length > 0) {
      alert(`Histórico de Versões:\n\n${versions.map(v => `Versão ${v.version}: ${v.changeDescription} (${new Date(v.createdAt).toLocaleDateString()})`).join('\n')}`);
    } else {
      alert('Nenhuma versão encontrada para este template.');
    }
  };

  const categories = [
    { value: 'all', label: 'Todos', icon: '📋', count: templates.length },
    { value: 'hotel', label: 'Hotéis', icon: '🏨', count: templates.filter(t => t.category === 'hotel').length },
    { value: 'parque', label: 'Parques', icon: '🎢', count: templates.filter(t => t.category === 'parque').length },
    { value: 'atracao', label: 'Atrações', icon: '🎡', count: templates.filter(t => t.category === 'atracao').length },
    { value: 'passeio', label: 'Passeios', icon: '🚌', count: templates.filter(t => t.category === 'passeio').length },
    { value: 'personalizado', label: 'Personalizados', icon: '⚙️', count: templates.filter(t => t.category === 'personalizado').length }
  ];

  const getTemplateStats = () => {
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0);
    const mostUsed = templates.reduce((max, t) => t.usageCount > max.usageCount ? t : max, templates[0]);
    const recentlyCreated = templates.filter(t => {
      const daysDiff = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    return { totalUsage, mostUsed, recentlyCreated };
  };

  const computeValidUntil = (createdAt: string) => {
    const created = createdAt ? new Date(createdAt) : new Date();
    const d = new Date(created);
    d.setDate(d.getDate() + 30);
    return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isClient) {
    return null;
  }

  const stats = getTemplateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
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
            <button
              onClick={handleImportFromV0}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Importar templates do Módulo V0"
            >
              <Download className="w-4 h-4" />
              <span>Importar do Módulo V0</span>
            </button>
            <Link
              href="/cotacoes/templates/new"
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Template</span>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Templates</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                <p className="text-xs text-gray-500">
                  {advancedStats?.templatesByRegion ? Object.keys(advancedStats.templatesByRegion).length : 0} regiões
                </p>
              </div>
              <FileText className="w-8 h-8 text-teal-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usos Totais</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
                <p className="text-xs text-gray-500">
                  Média: {advancedStats?.averageUsage?.toFixed(1) || 0} por template
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900">{advancedStats?.favorites?.totalFavorites || 0}</p>
                <p className="text-xs text-gray-500">
                  {TemplateManager.getFavoriteTemplates().length} seus favoritos
                </p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Analytics</p>
                <p className="text-2xl font-bold text-gray-900">{advancedStats?.analytics?.totalViews || 0}</p>
                <p className="text-xs text-gray-500">
                  {advancedStats?.analytics?.avgConversionRate?.toFixed(1) || 0}% conversão
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Busca */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Ordenação */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'usage' | 'date')}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="usage">Mais Usados</option>
                  <option value="name">Nome A-Z</option>
                  <option value="date">Mais Recentes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filtros Rápidos */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filtros Rápidos</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowRecommended(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFavorites
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Favoritos</span>
              </button>
              
              <button
                onClick={() => {
                  setShowRecommended(!showRecommended);
                  setShowFavorites(false);
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showRecommended
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Recomendados</span>
              </button>

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAdvanced
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Avançado</span>
              </button>
            </div>
          </div>

          {/* Filtros Avançados */}
          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Região */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Região</label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Todas as Regiões</option>
                    <option value="caldas-novas">🌊 Caldas Novas</option>
                    <option value="bonito">🐠 Bonito</option>
                    <option value="gramado">🏔️ Gramado</option>
                    <option value="fernando-noronha">🐢 Fernando de Noronha</option>
                  </select>
                </div>

                {/* Filtro por Temporada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temporada</label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value as 'all' | 'alta' | 'baixa')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Todas as Temporadas</option>
                    <option value="alta">☀️ Alta Temporada</option>
                    <option value="baixa">🍂 Baixa Temporada</option>
                  </select>
                </div>

                {/* Analytics */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Analytics</label>
                  <button
                    onClick={() => {
                      const report = TemplateManager.exportAllData();
                      const blob = new Blob([report], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'rsv360-templates-report.json';
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Dados</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categorias */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Filtrar por Categoria</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${template.color}`}>
                    <span className="text-2xl">{template.icon}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        Padrão
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {template.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {template.description}
                </p>
                <p className="text-xs text-red-600 font-medium mb-4">Válido até: {computeValidUntil(template.createdAt)}</p>

                {/* Estatísticas do Template */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{template.usageCount} usos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(template.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {/* Ações */}
                <div className="space-y-2">
                  {/* Ação Principal */}
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Usar Template</span>
                  </button>
                  
                  {/* Ações Secundárias */}
                  <div className="grid grid-cols-4 gap-1">
                    <button 
                      onClick={() => handlePreviewTemplate(template)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Visualizar template"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button 
                      onClick={() => handleToggleFavorite(template)}
                      className={`p-2 border rounded-lg transition-colors ${
                        TemplateManager.getFavoriteTemplates().some(f => f.id === template.id)
                          ? 'border-red-300 bg-red-50 text-red-600'
                          : 'border-gray-300 hover:bg-gray-50 text-gray-600'
                      }`}
                      title="Favoritar template"
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    
                    <button 
                      onClick={() => handleShareTemplate(template)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Compartilhar template"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <div className="relative group">
                      <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                      <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={() => handleDuplicateTemplate(template)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Duplicar</span>
                        </button>
                        <button
                          onClick={() => handleViewAnalytics(template)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>Analytics</span>
                        </button>
                        <button
                          onClick={() => handleViewVersions(template)}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <History className="w-4 h-4" />
                          <span>Versões</span>
                        </button>
                        {!template.isDefault && (
                          <button 
                            onClick={() => handleDeleteTemplate(template)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Deletar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há templates */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Crie seu primeiro template personalizado.'}
            </p>
            <Link
              href="/cotacoes/templates/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Template</span>
            </Link>
          </div>
        )}

        {/* Criar Template Personalizado */}
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-8 border border-teal-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Criar Template Personalizado
            </h3>
            <p className="text-gray-600 mb-6">
              Crie seus próprios templates para reutilizar em futuras cotações e agilizar seu trabalho
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/cotacoes/templates/new"
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Começar Criação
              </Link>
              <Link
                href="/cotacoes/new"
                className="px-6 py-3 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Criar Cotação Primeiro
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <QuotePreview
          budget={previewTemplate.budget as Budget}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewTemplate(null);
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      )}
    </div>
  );
}