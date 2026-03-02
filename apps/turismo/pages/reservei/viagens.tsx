// 🏖️ SISTEMA DE VIAGENS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de pacotes de viagem
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, MapPin, Calendar, Users, DollarSign, Star, Filter, Grid, List, BarChart3 } from 'lucide-react';

interface Viagem {
  id: number;
  nome: string;
  destino: string;
  cidade: string;
  estado: string;
  duracao: number;
  preco: number;
  categoria: 'luxo' | 'executivo' | 'economico' | 'familia';
  status: 'ativo' | 'inativo' | 'promocao' | 'esgotado';
  avaliacao: number;
  numeroAvaliacoes: number;
  dataInicio: string;
  dataFim: string;
  vagasDisponiveis: number;
  vagasTotal: number;
  descricao: string;
  imagem: string;
  inclusos: string[];
  naoInclusos: string[];
  roteiro: Array<{
    dia: number;
    atividades: string[];
    local: string;
  }>;
  dataCriacao: string;
  vendas: number;
  receita: number;
}

const SistemaViagens: React.FC = () => {
  // Estados principais
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [loading, setLoading] = useState(false);

  // Estados de filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [ordenacao, setOrdenacao] = useState<string>('nome');
  const [ordemCrescente, setOrdemCrescente] = useState(true);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<Viagem>>({
    nome: '',
    destino: '',
    cidade: '',
    estado: '',
    duracao: 1,
    preco: 0,
    categoria: 'economico',
    status: 'ativo',
    vagasTotal: 10,
    vagasDisponiveis: 10,
    descricao: '',
    inclusos: [''],
    naoInclusos: [''],
    roteiro: [{ dia: 1, atividades: [''], local: '' }]
  });

  // Dados mock iniciais
  const viagensMock: Viagem[] = [
    {
      id: 1,
      nome: 'Caldas Novas Completo',
      destino: 'Caldas Novas',
      cidade: 'Caldas Novas',
      estado: 'GO',
      duracao: 3,
      preco: 599,
      categoria: 'familia',
      status: 'ativo',
      avaliacao: 4.8,
      numeroAvaliacoes: 156,
      dataInicio: '2025-09-01',
      dataFim: '2025-09-30',
      vagasDisponiveis: 15,
      vagasTotal: 30,
      descricao: 'Pacote completo para Caldas Novas com águas termais',
      imagem: '/api/placeholder/400/300',
      inclusos: ['Hospedagem 3 dias', 'Café da manhã', 'Ingresso parques', 'Transporte'],
      naoInclusos: ['Almoço', 'Jantar', 'Bebidas extras'],
      roteiro: [
        { dia: 1, atividades: ['Check-in hotel', 'Hot Park'], local: 'Caldas Novas' },
        { dia: 2, atividades: ['Lagoa Quente', 'Centro da cidade'], local: 'Caldas Novas' },
        { dia: 3, atividades: ['Check-out', 'Compras'], local: 'Caldas Novas' }
      ],
      dataCriacao: '2025-01-15',
      vendas: 125,
      receita: 74875
    },
    {
      id: 2,
      nome: 'Rio Quente Premium',
      destino: 'Rio Quente',
      cidade: 'Rio Quente',
      estado: 'GO',
      duracao: 4,
      preco: 899,
      categoria: 'luxo',
      status: 'promocao',
      avaliacao: 4.9,
      numeroAvaliacoes: 89,
      dataInicio: '2025-10-01',
      dataFim: '2025-10-31',
      vagasDisponiveis: 8,
      vagasTotal: 20,
      descricao: 'Experiência premium no Rio Quente Resort',
      imagem: '/api/placeholder/400/300',
      inclusos: ['Resort All Inclusive', 'Spa', 'Atividades aquáticas', 'Transfer'],
      naoInclusos: ['Bebidas alcoólicas premium', 'Massagens especiais'],
      roteiro: [
        { dia: 1, atividades: ['Check-in resort', 'Piscinas termais'], local: 'Rio Quente' },
        { dia: 2, atividades: ['Parque das Fontes', 'Spa'], local: 'Rio Quente' },
        { dia: 3, atividades: ['Atividades aquáticas', 'Relaxamento'], local: 'Rio Quente' },
        { dia: 4, atividades: ['Check-out', 'City tour'], local: 'Rio Quente' }
      ],
      dataCriacao: '2025-02-01',
      vendas: 67,
      receita: 60233
    }
  ];

  // Carregar dados
  useEffect(() => {
    setViagens(viagensMock);
  }, []);

  // Funções de filtro e busca
  const viagensFiltradas = viagens.filter(viagem => {
    const matchBusca = viagem.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      viagem.destino.toLowerCase().includes(busca.toLowerCase()) ||
                      viagem.cidade.toLowerCase().includes(busca.toLowerCase());

    const matchCategoria = filtroCategoria === 'todas' || viagem.categoria === filtroCategoria;
    const matchStatus = filtroStatus === 'todos' || viagem.status === filtroStatus;

    return matchBusca && matchCategoria && matchStatus;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'nome':
        valueA = a.nome;
        valueB = b.nome;
        break;
      case 'preco':
        valueA = a.preco;
        valueB = b.preco;
        break;
      case 'avaliacao':
        valueA = a.avaliacao;
        valueB = b.avaliacao;
        break;
      case 'vendas':
        valueA = a.vendas;
        valueB = b.vendas;
        break;
      default:
        valueA = a.nome;
        valueB = b.nome;
    }

    if (typeof valueA === 'string') {
      return ordemCrescente ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  // Estatísticas
  const estatisticas = {
    total: viagens.length,
    ativas: viagens.filter(v => v.status === 'ativo').length,
    promocoes: viagens.filter(v => v.status === 'promocao').length,
    receitaTotal: viagens.reduce((acc, v) => acc + v.receita, 0),
    vendasTotal: viagens.reduce((acc, v) => acc + v.vendas, 0),
    avaliacaoMedia: viagens.length > 0 ? viagens.reduce((acc, v) => acc + v.avaliacao, 0) / viagens.length : 0
  };

  // Funções CRUD
  const handleAddViagem = () => {
    setModalTipo('add');
    setFormData({
      nome: '',
      destino: '',
      cidade: '',
      estado: '',
      duracao: 1,
      preco: 0,
      categoria: 'economico',
      status: 'ativo',
      vagasTotal: 10,
      vagasDisponiveis: 10,
      descricao: '',
      inclusos: [''],
      naoInclusos: [''],
      roteiro: [{ dia: 1, atividades: [''], local: '' }]
    });
    setShowModal(true);
  };

  const handleEditViagem = (viagem: Viagem) => {
    setModalTipo('edit');
    setViagemSelecionada(viagem);
    setFormData(viagem);
    setShowModal(true);
  };

  const handleViewViagem = (viagem: Viagem) => {
    setModalTipo('view');
    setViagemSelecionada(viagem);
    setShowModal(true);
  };

  const handleDeleteViagem = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta viagem?')) {
      setViagens(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleSaveViagem = () => {
    setLoading(true);

    setTimeout(() => {
      if (modalTipo === 'add') {
        const novaViagem: Viagem = {
          ...formData as Viagem,
          id: Date.now(),
          avaliacao: 5.0,
          numeroAvaliacoes: 0,
          dataInicio: new Date().toISOString().split('T')[0],
          dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          imagem: '/api/placeholder/400/300',
          dataCriacao: new Date().toISOString().split('T')[0],
          vendas: 0,
          receita: 0,
          vagasDisponiveis: formData.vagasTotal || 10
        };
        setViagens(prev => [...prev, novaViagem]);
      } else if (modalTipo === 'edit' && viagemSelecionada) {
        setViagens(prev => prev.map(v => v.id === viagemSelecionada.id ? { ...formData as Viagem, id: viagemSelecionada.id } : v));
      }

      setLoading(false);
      setShowModal(false);
    }, 1000);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'luxo': return 'bg-purple-100 text-purple-800';
      case 'executivo': return 'bg-blue-100 text-blue-800';
      case 'familia': return 'bg-green-100 text-green-800';
      case 'economico': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'promocao': return 'bg-orange-100 text-orange-800';
      case 'esgotado': return 'bg-red-100 text-red-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
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
              <MapPin className="h-8 w-8 text-blue-600" />
              Sistema de Viagens
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de pacotes e destinos turísticos</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </button>
            <button
              onClick={handleAddViagem}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Viagem
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-gray-600">Total de Viagens</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.ativas}</div>
            <div className="text-sm text-gray-600">Viagens Ativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.promocoes}</div>
            <div className="text-sm text-gray-600">Em Promoção</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.vendasTotal}</div>
            <div className="text-sm text-gray-600">Total de Vendas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.avaliacaoMedia.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avaliação Média</div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, destino ou cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Categoria */}
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todas Categorias</option>
            <option value="luxo">Luxo</option>
            <option value="executivo">Executivo</option>
            <option value="familia">Família</option>
            <option value="economico">Econômico</option>
          </select>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="promocao">Promoção</option>
            <option value="esgotado">Esgotado</option>
            <option value="inativo">Inativo</option>
          </select>

          {/* Ordenação */}
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="nome">Nome</option>
            <option value="preco">Preço</option>
            <option value="avaliacao">Avaliação</option>
            <option value="vendas">Vendas</option>
          </select>

          {/* Visualização */}
          <div className="flex gap-2">
            <button
              onClick={() => setOrdemCrescente(!ordemCrescente)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {ordemCrescente ? '↑' : '↓'}
            </button>
            <button
              onClick={() => setVisualizacao(visualizacao === 'grid' ? 'lista' : 'grid')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {visualizacao === 'grid' ? <List className="h-4 w-4 mx-auto" /> : <Grid className="h-4 w-4 mx-auto" />}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Viagens */}
      {visualizacao === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viagensFiltradas.map((viagem) => (
            <div key={viagem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-green-400 relative">
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(viagem.categoria)}`}>
                    {viagem.categoria.charAt(0).toUpperCase() + viagem.categoria.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status)}`}>
                    {viagem.status.charAt(0).toUpperCase() + viagem.status.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{viagem.nome}</h3>
                  <p className="text-blue-100">{viagem.destino}, {viagem.estado}</p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{viagem.avaliacao}</span>
                    <span className="text-gray-500 text-sm">({viagem.numeroAvaliacoes})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">R$ {viagem.preco}</div>
                    <div className="text-sm text-gray-500">{viagem.duracao} dias</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {viagem.vagasDisponiveis}/{viagem.vagasTotal}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {viagem.duracao}d
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {viagem.vendas} vendas
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{viagem.descricao}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewViagem(viagem)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleEditViagem(viagem)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteViagem(viagem.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Lista tabular
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viagem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vagas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viagensFiltradas.map((viagem) => (
                  <tr key={viagem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{viagem.nome}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {viagem.avaliacao} ({viagem.numeroAvaliacoes})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{viagem.destino}</div>
                      <div className="text-sm text-gray-500">{viagem.cidade}, {viagem.estado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(viagem.categoria)}`}>
                        {viagem.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">R$ {viagem.preco}</div>
                      <div className="text-sm text-gray-500">{viagem.duracao} dias</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status)}`}>
                        {viagem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {viagem.vagasDisponiveis}/{viagem.vagasTotal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{viagem.vendas}</div>
                      <div className="text-sm text-gray-500">R$ {viagem.receita.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewViagem(viagem)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditViagem(viagem)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteViagem(viagem.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalTipo === 'add' ? 'Nova Viagem' : modalTipo === 'edit' ? 'Editar Viagem' : 'Detalhes da Viagem'}
              </h2>
            </div>

            <div className="p-6">
              {modalTipo === 'view' && viagemSelecionada ? (
                // Visualização detalhada
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
                      <div className="space-y-2">
                        <div><strong>Nome:</strong> {viagemSelecionada.nome}</div>
                        <div><strong>Destino:</strong> {viagemSelecionada.destino}</div>
                        <div><strong>Cidade:</strong> {viagemSelecionada.cidade}, {viagemSelecionada.estado}</div>
                        <div><strong>Duração:</strong> {viagemSelecionada.duracao} dias</div>
                        <div><strong>Preço:</strong> R$ {viagemSelecionada.preco}</div>
                        <div><strong>Categoria:</strong> {viagemSelecionada.categoria}</div>
                        <div><strong>Status:</strong> {viagemSelecionada.status}</div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
                      <div className="space-y-2">
                        <div><strong>Avaliação:</strong> {viagemSelecionada.avaliacao} ⭐ ({viagemSelecionada.numeroAvaliacoes} avaliações)</div>
                        <div><strong>Vagas:</strong> {viagemSelecionada.vagasDisponiveis}/{viagemSelecionada.vagasTotal}</div>
                        <div><strong>Vendas:</strong> {viagemSelecionada.vendas}</div>
                        <div><strong>Receita:</strong> R$ {viagemSelecionada.receita.toLocaleString()}</div>
                        <div><strong>Data de criação:</strong> {new Date(viagemSelecionada.dataCriacao).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                    <p className="text-gray-700">{viagemSelecionada.descricao}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Inclusos</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {viagemSelecionada.inclusos.map((item, index) => (
                          <li key={index} className="text-green-700">✓ {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Não Inclusos</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {viagemSelecionada.naoInclusos.map((item, index) => (
                          <li key={index} className="text-red-700">✗ {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Roteiro</h3>
                    <div className="space-y-3">
                      {viagemSelecionada.roteiro.map((dia, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Dia {dia.dia} - {dia.local}</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {dia.atividades.map((atividade, atIndex) => (
                              <li key={atIndex} className="text-gray-700">{atividade}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Formulário de edição/criação
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Viagem *</label>
                      <input
                        type="text"
                        value={formData.nome || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Caldas Novas Completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Destino *</label>
                      <input
                        type="text"
                        value={formData.destino || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, destino: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Caldas Novas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade *</label>
                      <input
                        type="text"
                        value={formData.cidade || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Caldas Novas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                      <input
                        type="text"
                        value={formData.estado || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: GO"
                        maxLength={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duração (dias) *</label>
                      <input
                        type="number"
                        value={formData.duracao || 1}
                        onChange={(e) => setFormData(prev => ({ ...prev, duracao: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                      <input
                        type="number"
                        value={formData.preco || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <select
                        value={formData.categoria || 'economico'}
                        onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="economico">Econômico</option>
                        <option value="familia">Família</option>
                        <option value="executivo">Executivo</option>
                        <option value="luxo">Luxo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        value={formData.status || 'ativo'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="promocao">Promoção</option>
                        <option value="esgotado">Esgotado</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total de Vagas *</label>
                      <input
                        type="number"
                        value={formData.vagasTotal || 10}
                        onChange={(e) => setFormData(prev => ({ ...prev, vagasTotal: parseInt(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                    <textarea
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descreva a viagem, principais atrativos e diferenciais..."
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {modalTipo === 'view' ? 'Fechar' : 'Cancelar'}
              </button>
              {modalTipo !== 'view' && (
                <button
                  onClick={handleSaveViagem}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : modalTipo === 'add' ? 'Criar Viagem' : 'Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viagensFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma viagem encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroCategoria !== 'todas' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar viagens.'
              : 'Comece criando sua primeira viagem.'}
          </p>
          <button
            onClick={handleAddViagem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Viagem
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaViagens;
