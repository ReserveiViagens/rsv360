import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Plus,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Download,
  Layout,
  ChevronDown,
  Calculator,
  Calendar,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Budget } from '../../lib/types/budget';
import { budgetStorage } from '../../lib/budget-storage';
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../lib/budget-utils';
import { BudgetTypeSelector } from '@/components/budget-type-selector';
import { BudgetEditSelector } from '@/components/budget-edit-selector';

export default function CotacoesPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);
  const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
  const [isEditSelectorOpen, setIsEditSelectorOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadBudgets();
  }, []);

  const loadBudgets = () => {
    const allBudgets = budgetStorage.getAll();
    setBudgets(allBudgets);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta cotação?')) {
      budgetStorage.delete(id);
      loadBudgets();
    }
  };

  const handleDuplicate = (budget: Budget) => {
    const duplicated = budgetStorage.duplicate(budget.id);
    if (duplicated) {
      loadBudgets();
    }
  };

  const handleLoadSampleData = () => {
    if (confirm('Deseja carregar dados de exemplo? Isso adicionará cotações de demonstração.')) {
      budgetStorage.loadSampleData();
      loadBudgets();
    }
  };

  const handleView = (budget: Budget) => {
    // Redirecionar para página de visualização baseada no tipo
    const routes = {
      hotel: '/cotacoes/hoteis',
      parque: '/cotacoes/parques',
      atracao: '/cotacoes/atracoes',
      passeio: '/cotacoes/passeios',
      personalizado: '/cotacoes/new'
    };
    
    const route = routes[budget.type as keyof typeof routes] || '/cotacoes/new';
    router.push(`${route}?view=${budget.id}`);
  };

  const handleEdit = (budget: Budget) => {
    // Redirecionar para página de edição baseada no tipo
    const routes = {
      hotel: '/cotacoes/hoteis',
      parque: '/cotacoes/parques',
      atracao: '/cotacoes/atracoes',
      passeio: '/cotacoes/passeios',
      personalizado: '/cotacoes/new'
    };
    
    const route = routes[budget.type as keyof typeof routes] || '/cotacoes/new';
    router.push(`${route}?edit=${budget.id}`);
  };

  // Filtrar por período conforme documento (linha 361)
  const filterByPeriod = (budget: Budget, period: string): boolean => {
    if (period === 'all') return true;
    
    const now = new Date();
    const budgetDate = new Date(budget.createdAt);
    
    switch (period) {
      case 'today':
        return budgetDate.toDateString() === now.toDateString();
      case 'last7days':
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return budgetDate >= sevenDaysAgo;
      case 'thismonth':
        return budgetDate.getMonth() === now.getMonth() && budgetDate.getFullYear() === now.getFullYear();
      case 'thisyear':
        return budgetDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredBudgets = budgets.filter(
    (budget) => {
      const matchesSearch = 
        (budget.clientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (budget.title?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
      const matchesPeriod = filterByPeriod(budget, periodFilter);
      
      return matchesSearch && matchesPeriod;
    }
  );

  const stats = budgetStorage.getStats();

  const computeValidUntil = (b: Budget) => {
    const base = b.validUntil || (b as any).expiresAt;
    if (base) return new Date(base).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const created = b.createdAt ? new Date(b.createdAt) : new Date();
    const d = new Date(created);
    d.setDate(d.getDate() + 30);
    return d.toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditValidity = (id: string) => {
    try {
      const b = budgets.find((x) => x.id === id);
      if (!b) return;
      const base = (b as any).validUntil || (b as any).expiresAt;
      const fallback = (() => {
        const created = b.createdAt ? new Date(b.createdAt) : new Date();
        const d = new Date(created);
        d.setDate(d.getDate() + 30);
        return d;
      })();
      const current = base ? new Date(base) : fallback;
      const defaultStr = `${current.toISOString().slice(0, 16)}`; // yyyy-MM-ddTHH:mm
      const input = prompt('Nova validade (AAAA-MM-DDTHH:MM):', defaultStr);
      if (!input) return;
      const newDate = new Date(input);
      if (isNaN(newDate.getTime())) {
        alert('Data/hora inválida. Use o formato AAAA-MM-DDTHH:MM.');
        return;
      }
      const updated: Budget = {
        ...(b as Budget),
        validUntil: newDate.toISOString(),
        updatedAt: new Date().toISOString(),
      } as Budget;
      budgetStorage.save(updated);
      loadBudgets();
      alert('Validade atualizada com sucesso!');
    } catch (e) {
      console.error('Erro ao atualizar validade:', e);
      alert('Não foi possível atualizar a validade.');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🧮 Cotações</h1>
                <p className="text-gray-600">Sistema de Orçamentos RSV 360</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/cotacoes/templates">
                <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Layout className="w-4 h-4" />
                  <span>Templates</span>
                </button>
              </Link>
              {budgets.length === 0 && (
                <button
                  onClick={handleLoadSampleData}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Carregar Exemplos</span>
                </button>
              )}
              <button
                onClick={() => setIsTypeSelectorOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Cotação</span>
              </button>
              <button
                onClick={() => setIsEditSelectorOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Editar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Cotações</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">🚀 Cotação Rápida</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setIsTypeSelectorOpen(true);
                }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">🏨</div>
                <p className="font-medium">Hotéis</p>
              </button>
              <button
                onClick={() => {
                  setIsTypeSelectorOpen(true);
                }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">🎢</div>
                <p className="font-medium">Parques</p>
              </button>
              <button
                onClick={() => {
                  setIsTypeSelectorOpen(true);
                }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">🎡</div>
                <p className="font-medium">Atrações</p>
              </button>
              <button
                onClick={() => {
                  setIsTypeSelectorOpen(true);
                }}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer text-center"
              >
                <div className="text-3xl mb-2">🚌</div>
                <p className="font-medium">Passeios</p>
              </button>
            </div>
          </div>
        </div>

        {/* Search and Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold">Cotações Recentes</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Filtro por Período */}
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                    <SelectItem value="thismonth">Este mês</SelectItem>
                    <SelectItem value="thisyear">Este ano</SelectItem>
                  </SelectContent>
                </Select>
                {/* Busca */}
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cotações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {filteredBudgets.length === 0 ? (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'Nenhuma cotação encontrada' : 'Nenhuma cotação criada'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'Tente buscar com outros termos' : 'Comece criando sua primeira cotação'}
                </p>
                {!searchQuery && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleLoadSampleData}
                      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Carregar Exemplos</span>
                    </button>
                    <Link href="/cotacoes/new">
                      <button className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Criar Primeira Cotação</span>
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Título</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Validade</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBudgets.map((budget) => (
                      <tr key={budget.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{budget.clientName || 'Cliente não informado'}</div>
                            <div className="text-sm text-gray-500">{budget.clientEmail || ''}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">{budget.title || 'Título não informado'}</td>
                        <td className="py-3 px-4 font-semibold text-gray-900">{formatCurrency(budget.total || 0)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(budget.status || 'draft')}`}>
                            {getStatusLabel(budget.status || 'draft')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{formatDate(budget.createdAt || new Date().toISOString())}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span>{computeValidUntil(budget as Budget)}</span>
                            <button
                              onClick={() => handleEditValidity(budget.id)}
                              className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                              title="Editar validade"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleView(budget)}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Visualizar cotação"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(budget)}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                              title="Editar cotação"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDuplicate(budget)}
                              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Duplicar cotação"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(budget.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                              title="Excluir cotação"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Componentes de Seleção conforme documento (linha 612-627) */}
      <BudgetTypeSelector
        open={isTypeSelectorOpen}
        onOpenChange={setIsTypeSelectorOpen}
        onSelect={(type) => {
          // Redirecionar baseado no tipo ou para galeria de templates
          const routes = {
            hotel: '/cotacoes/hoteis',
            parque: '/cotacoes/parques',
            atracao: '/cotacoes/atracoes',
            passeio: '/cotacoes/passeios',
            personalizado: '/cotacoes/new'
          };
          // Opção: redirecionar para galeria de templates primeiro (recomendado)
          router.push('/cotacoes/templates');
        }}
      />
      
      <BudgetEditSelector
        open={isEditSelectorOpen}
        onOpenChange={setIsEditSelectorOpen}
      />
    </div>
  );
}
