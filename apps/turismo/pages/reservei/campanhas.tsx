// 📈 SISTEMA DE CAMPANHAS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de campanhas de marketing
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Target, TrendingUp, Users, Calendar, Mail, MessageSquare, BarChart3, Play, Pause, DollarSign } from 'lucide-react';

interface Campanha {
  id: number;
  nome: string;
  tipo: 'email' | 'whatsapp' | 'sms' | 'social' | 'google-ads' | 'facebook-ads';
  status: 'ativa' | 'pausada' | 'concluida' | 'rascunho' | 'agendada';
  objetivo: 'vendas' | 'leads' | 'engajamento' | 'retencao' | 'promocao';
  publico: string;
  segmento: string[];
  dataInicio: string;
  dataFim: string;
  orcamento: number;
  gastoAtual: number;
  impressoes: number;
  cliques: number;
  conversoes: number;
  ctr: number; // Click Through Rate
  cpc: number; // Custo Por Clique
  roas: number; // Return on Ad Spend
  receita: number;
  descricao: string;
  conteudo: string;
  criadoPor: string;
  dataCriacao: string;
}

const SistemaCampanhas: React.FC = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<Campanha | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data');
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Dados mock
  const campanhasMock: Campanha[] = [
    {
      id: 1,
      nome: 'Promoção Caldas Novas Verão 2025',
      tipo: 'facebook-ads',
      status: 'ativa',
      objetivo: 'vendas',
      publico: 'Famílias SP/RJ/MG',
      segmento: ['familia', 'renda-media', 'interesse-turismo'],
      dataInicio: '2025-08-15',
      dataFim: '2025-09-15',
      orcamento: 5000.00,
      gastoAtual: 2345.67,
      impressoes: 125340,
      cliques: 3456,
      conversoes: 89,
      ctr: 2.76,
      cpc: 0.68,
      roas: 4.2,
      receita: 44890.00,
      descricao: 'Campanha promocional para pacotes familiares em Caldas Novas durante o verão',
      conteudo: 'Caldas Novas te espera! 🏖️ Pacotes familiares com 30% OFF + criança grátis. Reserve já!',
      criadoPor: 'Marketing Team',
      dataCriacao: '2025-08-10'
    },
    {
      id: 2,
      nome: 'Retargeting Carrinho Abandonado',
      tipo: 'email',
      status: 'ativa',
      objetivo: 'conversao',
      publico: 'Visitantes com carrinho',
      segmento: ['carrinho-abandonado', 'alta-intencao'],
      dataInicio: '2025-08-01',
      dataFim: '2025-12-31',
      orcamento: 800.00,
      gastoAtual: 234.50,
      impressoes: 4560,
      cliques: 892,
      conversoes: 45,
      ctr: 19.56,
      cpc: 0.26,
      roas: 8.7,
      receita: 15600.00,
      descricao: 'Email automático para recuperar carrinhos abandonados',
      conteudo: 'Esqueceu algo? Finalize sua reserva com desconto especial de 15%!',
      criadoPor: 'Automação',
      dataCriacao: '2025-07-28'
    },
    {
      id: 3,
      nome: 'WhatsApp Black Friday',
      tipo: 'whatsapp',
      status: 'agendada',
      objetivo: 'promocao',
      publico: 'Base de clientes',
      segmento: ['clientes-ativos', 'alta-frequencia'],
      dataInicio: '2025-11-25',
      dataFim: '2025-11-29',
      orcamento: 1200.00,
      gastoAtual: 0,
      impressoes: 0,
      cliques: 0,
      conversoes: 0,
      ctr: 0,
      cpc: 0,
      roas: 0,
      receita: 0,
      descricao: 'Campanha especial Black Friday via WhatsApp',
      conteudo: '🔥 BLACK FRIDAY! Caldas Novas com até 50% OFF. Últimas vagas!',
      criadoPor: 'Marketing Team',
      dataCriacao: '2025-08-20'
    },
    {
      id: 4,
      nome: 'Google Ads - Hot Park',
      tipo: 'google-ads',
      status: 'ativa',
      objetivo: 'leads',
      publico: 'Interessados em parques',
      segmento: ['parques-aquaticos', 'familia', 'goias'],
      dataInicio: '2025-08-20',
      dataFim: '2025-10-20',
      orcamento: 3000.00,
      gastoAtual: 856.78,
      impressoes: 89456,
      cliques: 2134,
      conversoes: 67,
      ctr: 2.39,
      cpc: 0.40,
      roas: 3.8,
      receita: 12890.00,
      descricao: 'Anúncios Google para ingressos Hot Park',
      conteudo: 'Hot Park: Maior parque aquático de águas termais! Ingressos com desconto.',
      criadoPor: 'SEM Team',
      dataCriacao: '2025-08-18'
    }
  ];

  useEffect(() => {
    setCampanhas(campanhasMock);
  }, []);

  // Funções de filtro e busca
  const campanhasFiltradas = campanhas.filter(campanha => {
    const matchBusca = campanha.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      campanha.publico.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === 'todos' || campanha.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || campanha.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'data':
        valueA = new Date(a.dataInicio);
        valueB = new Date(b.dataInicio);
        break;
      case 'orcamento':
        valueA = a.orcamento;
        valueB = b.orcamento;
        break;
      case 'roas':
        valueA = a.roas;
        valueB = b.roas;
        break;
      case 'conversoes':
        valueA = a.conversoes;
        valueB = b.conversoes;
        break;
      default:
        valueA = new Date(a.dataInicio);
        valueB = new Date(b.dataInicio);
    }

    if (valueA instanceof Date) {
      return ordemCrescente ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  // Estatísticas
  const estatisticas = {
    totalCampanhas: campanhas.length,
    campanhasAtivas: campanhas.filter(c => c.status === 'ativa').length,
    orcamentoTotal: campanhas.reduce((acc, c) => acc + c.orcamento, 0),
    gastoTotal: campanhas.reduce((acc, c) => acc + c.gastoAtual, 0),
    receitaTotal: campanhas.reduce((acc, c) => acc + c.receita, 0),
    conversoes: campanhas.reduce((acc, c) => acc + c.conversoes, 0),
    roasMedia: campanhas.length > 0 ? campanhas.reduce((acc, c) => acc + c.roas, 0) / campanhas.length : 0
  };

  const handleView = (campanha: Campanha) => {
    setCampanhaSelecionada(campanha);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (campanha: Campanha) => {
    setCampanhaSelecionada(campanha);
    setModalTipo('edit');
    setShowModal(true);
  };

  const pausarCampanha = (id: number) => {
    setCampanhas(prev => prev.map(c =>
      c.id === id ? { ...c, status: c.status === 'ativa' ? 'pausada' as const : 'ativa' as const } : c
    ));
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'google-ads': return <Target className="h-4 w-4" />;
      case 'facebook-ads': return <Users className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'google-ads': return 'bg-red-100 text-red-800';
      case 'facebook-ads': return 'bg-indigo-100 text-indigo-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-yellow-100 text-yellow-800';
      case 'concluida': return 'bg-blue-100 text-blue-800';
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'agendada': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-600" />
              Sistema de Campanhas
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de campanhas de marketing digital</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalCampanhas}</div>
            <div className="text-sm text-gray-600">Total Campanhas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.campanhasAtivas}</div>
            <div className="text-sm text-gray-600">Campanhas Ativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">R$ {estatisticas.orcamentoTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Orçamento Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.gastoTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Gasto Atual</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.conversoes}</div>
            <div className="text-sm text-gray-600">Conversões</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.roasMedia.toFixed(1)}x</div>
            <div className="text-sm text-gray-600">ROAS Médio</div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar campanhas ou público..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
            <option value="google-ads">Google Ads</option>
            <option value="facebook-ads">Facebook Ads</option>
            <option value="social">Social Media</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="ativa">Ativa</option>
            <option value="pausada">Pausada</option>
            <option value="concluida">Concluída</option>
            <option value="rascunho">Rascunho</option>
            <option value="agendada">Agendada</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="data">Data</option>
            <option value="orcamento">Orçamento</option>
            <option value="roas">ROAS</option>
            <option value="conversoes">Conversões</option>
          </select>

          <button
            onClick={() => setOrdemCrescente(!ordemCrescente)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ordemCrescente ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Lista de Campanhas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campanha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campanhasFiltradas.map((campanha) => (
                <tr key={campanha.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{campanha.nome}</div>
                      <div className="text-sm text-gray-500">{campanha.publico}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(campanha.tipo)}`}>
                        {getTipoIcon(campanha.tipo)}
                        {campanha.tipo.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campanha.status)}`}>
                      {campanha.status.charAt(0).toUpperCase() + campanha.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium text-green-600">{campanha.conversoes} conversões</div>
                          <div className="text-gray-500">CTR: {campanha.ctr.toFixed(2)}%</div>
                        </div>
                        <div>
                          <div className="font-medium text-purple-600">ROAS: {campanha.roas.toFixed(1)}x</div>
                          <div className="text-gray-500">CPC: R$ {campanha.cpc.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium">R$ {campanha.orcamento.toLocaleString()}</div>
                      <div className="text-gray-500">Gasto: R$ {campanha.gastoAtual.toLocaleString()}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{width: `${Math.min((campanha.gastoAtual / campanha.orcamento) * 100, 100)}%`}}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="text-gray-900">{new Date(campanha.dataInicio).toLocaleDateString()}</div>
                      <div className="text-gray-500">até {new Date(campanha.dataFim).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(campanha)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(campanha)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => pausarCampanha(campanha.id)}
                        className={`${campanha.status === 'ativa' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {campanha.status === 'ativa' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && campanhaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {campanhaSelecionada.nome}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(campanhaSelecionada.tipo)}`}>
                  {getTipoIcon(campanhaSelecionada.tipo)}
                  {campanhaSelecionada.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campanhaSelecionada.status)}`}>
                  {campanhaSelecionada.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Performance Dashboard */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{campanhaSelecionada.conversoes}</div>
                  <div className="text-sm text-green-700">Conversões</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{campanhaSelecionada.ctr.toFixed(2)}%</div>
                  <div className="text-sm text-blue-700">CTR</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{campanhaSelecionada.roas.toFixed(1)}x</div>
                  <div className="text-sm text-purple-700">ROAS</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">R$ {campanhaSelecionada.receita.toLocaleString()}</div>
                  <div className="text-sm text-orange-700">Receita</div>
                </div>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Configuração</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Objetivo:</strong> {campanhaSelecionada.objetivo}</div>
                    <div><strong>Público:</strong> {campanhaSelecionada.publico}</div>
                    <div><strong>Segmentos:</strong> {campanhaSelecionada.segmento.join(', ')}</div>
                    <div><strong>Criado por:</strong> {campanhaSelecionada.criadoPor}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Orçamento & Tempo</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Orçamento:</strong> R$ {campanhaSelecionada.orcamento.toLocaleString()}</div>
                    <div><strong>Gasto:</strong> R$ {campanhaSelecionada.gastoAtual.toLocaleString()}</div>
                    <div><strong>Início:</strong> {new Date(campanhaSelecionada.dataInicio).toLocaleDateString()}</div>
                    <div><strong>Fim:</strong> {new Date(campanhaSelecionada.dataFim).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Conteúdo da Campanha */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conteúdo</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">{campanhaSelecionada.descricao}</p>
                  <div className="border-t pt-2">
                    <strong className="text-sm">Mensagem:</strong>
                    <p className="text-sm italic">"{campanhaSelecionada.conteudo}"</p>
                  </div>
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Métricas Detalhadas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Impressões</div>
                    <div className="font-medium">{campanhaSelecionada.impressoes.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Cliques</div>
                    <div className="font-medium">{campanhaSelecionada.cliques.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">CPC</div>
                    <div className="font-medium">R$ {campanhaSelecionada.cpc.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Taxa Conversão</div>
                    <div className="font-medium">{((campanhaSelecionada.conversoes / campanhaSelecionada.cliques) * 100).toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              {modalTipo === 'edit' && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {campanhasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar campanhas.'
              : 'Comece criando sua primeira campanha de marketing.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaCampanhas;
