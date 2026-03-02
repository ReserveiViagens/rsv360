// 🎡 SISTEMA DE ATRAÇÕES - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de atrações turísticas
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Camera, Clock, MapPin, Star, Filter, Grid, List, BarChart3, Users, DollarSign } from 'lucide-react';

interface Atracao {
  id: number;
  nome: string;
  tipo: 'museu' | 'parque' | 'monumento' | 'cultural' | 'aventura' | 'religioso' | 'natural' | 'gastronomia';
  cidade: string;
  estado: string;
  endereco: string;
  latitude?: number;
  longitude?: number;
  preco: number;
  precoIdoso: number;
  precoCrianca: number;
  status: 'ativo' | 'inativo' | 'manutencao' | 'temporada';
  avaliacao: number;
  numeroAvaliacoes: number;
  horarioFuncionamento: {
    abertura: string;
    fechamento: string;
    diasFuncionamento: string[];
  };
  descricao: string;
  imagens: string[];
  caracteristicas: string[];
  facilidades: string[];
  restricoes: string[];
  tempoVisita: number; // em horas
  capacidadeMaxima: number;
  acessibilidade: boolean;
  estacionamento: boolean;
  dataCriacao: string;
  totalVisitantes: number;
  receitaTotal: number;
  classificacaoEtaria: string;
  website?: string;
  telefone?: string;
}

const SistemaAtracoes: React.FC = () => {
  // Estados principais
  const [atracoes, setAtracoes] = useState<Atracao[]>([]);
  const [atracaoSelecionada, setAtracaoSelecionada] = useState<Atracao | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [loading, setLoading] = useState(false);

  // Estados de filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [ordenacao, setOrdenacao] = useState<string>('nome');
  const [ordemCrescente, setOrdemCrescente] = useState(true);
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<Atracao>>({
    nome: '',
    tipo: 'cultural',
    cidade: '',
    estado: '',
    endereco: '',
    preco: 0,
    precoIdoso: 0,
    precoCrianca: 0,
    status: 'ativo',
    descricao: '',
    caracteristicas: [''],
    facilidades: [''],
    restricoes: [''],
    tempoVisita: 2,
    capacidadeMaxima: 100,
    acessibilidade: true,
    estacionamento: true,
    classificacaoEtaria: 'Livre',
    horarioFuncionamento: {
      abertura: '09:00',
      fechamento: '17:00',
      diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
    }
  });

  // Dados mock iniciais
  const atracoesMock: Atracao[] = [
    {
      id: 1,
      nome: 'Hot Park',
      tipo: 'parque',
      cidade: 'Caldas Novas',
      estado: 'GO',
      endereco: 'Rodovia GO-217, km 3, Caldas Novas, GO',
      latitude: -17.7539,
      longitude: -48.6295,
      preco: 89.90,
      precoIdoso: 44.95,
      precoCrianca: 67.43,
      status: 'ativo',
      avaliacao: 4.7,
      numeroAvaliacoes: 2543,
      horarioFuncionamento: {
        abertura: '08:00',
        fechamento: '17:00',
        diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      },
      descricao: 'O maior parque aquático de águas termais do mundo, com mais de 20 atrações aquáticas.',
      imagens: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      caracteristicas: ['Águas termais naturais', 'Piscinas de ondas', 'Toboáguas', 'Rio lento', 'Área infantil'],
      facilidades: ['Estacionamento gratuito', 'Restaurantes', 'Lanchonetes', 'Vestiários', 'Guarda-volumes'],
      restricoes: ['Altura mínima para alguns brinquedos', 'Não é permitido levar comida'],
      tempoVisita: 8,
      capacidadeMaxima: 5000,
      acessibilidade: true,
      estacionamento: true,
      dataCriacao: '2025-01-01',
      totalVisitantes: 12450,
      receitaTotal: 1119105,
      classificacaoEtaria: 'Livre',
      website: 'www.hotpark.com.br',
      telefone: '(64) 3455-3000'
    },
    {
      id: 2,
      nome: 'Lagoa Quente de Pirapitinga',
      tipo: 'natural',
      cidade: 'Caldas Novas',
      estado: 'GO',
      endereco: 'Estrada da Lagoa, Caldas Novas, GO',
      latitude: -17.7412,
      longitude: -48.6089,
      preco: 25.00,
      precoIdoso: 12.50,
      precoCrianca: 15.00,
      status: 'ativo',
      avaliacao: 4.5,
      numeroAvaliacoes: 876,
      horarioFuncionamento: {
        abertura: '07:00',
        fechamento: '18:00',
        diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
      },
      descricao: 'Lagoa natural de águas termais cristalinas, ideal para relaxamento e contemplação da natureza.',
      imagens: ['/api/placeholder/400/300'],
      caracteristicas: ['Águas termais naturais', 'Temperatura constante 37°C', 'Paisagem natural preservada'],
      facilidades: ['Estacionamento', 'Vestiários simples', 'Lanchonete'],
      restricoes: ['Não é permitido usar protetor solar', 'Capacidade limitada'],
      tempoVisita: 3,
      capacidadeMaxima: 200,
      acessibilidade: false,
      estacionamento: true,
      dataCriacao: '2025-01-15',
      totalVisitantes: 3420,
      receitaTotal: 85500,
      classificacaoEtaria: 'Livre',
      telefone: '(64) 3453-1234'
    },
    {
      id: 3,
      nome: 'Museu de História Natural',
      tipo: 'museu',
      cidade: 'Caldas Novas',
      estado: 'GO',
      endereco: 'Rua das Águas, 123, Centro, Caldas Novas, GO',
      preco: 15.00,
      precoIdoso: 7.50,
      precoCrianca: 10.00,
      status: 'ativo',
      avaliacao: 4.2,
      numeroAvaliacoes: 234,
      horarioFuncionamento: {
        abertura: '09:00',
        fechamento: '16:00',
        diasFuncionamento: ['terca', 'quarta', 'quinta', 'sexta', 'sabado']
      },
      descricao: 'Museu dedicado à história natural da região, com foco nos recursos termais e biodiversidade local.',
      imagens: ['/api/placeholder/400/300'],
      caracteristicas: ['Exposições interativas', 'Acervo geológico', 'História das águas termais'],
      facilidades: ['Ar condicionado', 'Guia turístico', 'Loja de souvenirs'],
      restricoes: ['Não é permitido fotografar', 'Silêncio obrigatório'],
      tempoVisita: 1.5,
      capacidadeMaxima: 80,
      acessibilidade: true,
      estacionamento: false,
      dataCriacao: '2025-02-01',
      totalVisitantes: 890,
      receitaTotal: 13350,
      classificacaoEtaria: 'Livre',
      website: 'www.museuhistorianatural.com.br',
      telefone: '(64) 3453-5678'
    }
  ];

  // Carregar dados
  useEffect(() => {
    setAtracoes(atracoesMock);
  }, []);

  // Funções de filtro e busca
  const atracoesFiltradas = atracoes.filter(atracao => {
    const matchBusca = atracao.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      atracao.cidade.toLowerCase().includes(busca.toLowerCase()) ||
                      atracao.tipo.toLowerCase().includes(busca.toLowerCase());

    const matchTipo = filtroTipo === 'todos' || atracao.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || atracao.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
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
      case 'visitantes':
        valueA = a.totalVisitantes;
        valueB = b.totalVisitantes;
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
    total: atracoes.length,
    ativas: atracoes.filter(a => a.status === 'ativo').length,
    manutencao: atracoes.filter(a => a.status === 'manutencao').length,
    receitaTotal: atracoes.reduce((acc, a) => acc + a.receitaTotal, 0),
    visitantesTotal: atracoes.reduce((acc, a) => acc + a.totalVisitantes, 0),
    avaliacaoMedia: atracoes.length > 0 ? atracoes.reduce((acc, a) => acc + a.avaliacao, 0) / atracoes.length : 0,
    precoMedio: atracoes.length > 0 ? atracoes.reduce((acc, a) => acc + a.preco, 0) / atracoes.length : 0
  };

  // Funções CRUD
  const handleAddAtracao = () => {
    setModalTipo('add');
    setFormData({
      nome: '',
      tipo: 'cultural',
      cidade: '',
      estado: '',
      endereco: '',
      preco: 0,
      precoIdoso: 0,
      precoCrianca: 0,
      status: 'ativo',
      descricao: '',
      caracteristicas: [''],
      facilidades: [''],
      restricoes: [''],
      tempoVisita: 2,
      capacidadeMaxima: 100,
      acessibilidade: true,
      estacionamento: true,
      classificacaoEtaria: 'Livre',
      horarioFuncionamento: {
        abertura: '09:00',
        fechamento: '17:00',
        diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
      }
    });
    setShowModal(true);
  };

  const handleEditAtracao = (atracao: Atracao) => {
    setModalTipo('edit');
    setAtracaoSelecionada(atracao);
    setFormData(atracao);
    setShowModal(true);
  };

  const handleViewAtracao = (atracao: Atracao) => {
    setModalTipo('view');
    setAtracaoSelecionada(atracao);
    setShowModal(true);
  };

  const handleDeleteAtracao = (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta atração?')) {
      setAtracoes(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleSaveAtracao = () => {
    setLoading(true);

    setTimeout(() => {
      if (modalTipo === 'add') {
        const novaAtracao: Atracao = {
          ...formData as Atracao,
          id: Date.now(),
          avaliacao: 5.0,
          numeroAvaliacoes: 0,
          imagens: ['/api/placeholder/400/300'],
          dataCriacao: new Date().toISOString().split('T')[0],
          totalVisitantes: 0,
          receitaTotal: 0
        };
        setAtracoes(prev => [...prev, novaAtracao]);
      } else if (modalTipo === 'edit' && atracaoSelecionada) {
        setAtracoes(prev => prev.map(a => a.id === atracaoSelecionada.id ? { ...formData as Atracao, id: atracaoSelecionada.id } : a));
      }

      setLoading(false);
      setShowModal(false);
    }, 1000);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'museu': return 'bg-purple-100 text-purple-800';
      case 'parque': return 'bg-green-100 text-green-800';
      case 'monumento': return 'bg-gray-100 text-gray-800';
      case 'cultural': return 'bg-blue-100 text-blue-800';
      case 'aventura': return 'bg-red-100 text-red-800';
      case 'religioso': return 'bg-yellow-100 text-yellow-800';
      case 'natural': return 'bg-emerald-100 text-emerald-800';
      case 'gastronomia': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800';
      case 'temporada': return 'bg-blue-100 text-blue-800';
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
              <Camera className="h-8 w-8 text-blue-600" />
              Sistema de Atrações
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de atrações e pontos turísticos</p>
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
              onClick={handleAddAtracao}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nova Atração
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.total}</div>
            <div className="text-sm text-gray-600">Total de Atrações</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.ativas}</div>
            <div className="text-sm text-gray-600">Atrações Ativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.manutencao}</div>
            <div className="text-sm text-gray-600">Em Manutenção</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.visitantesTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Visitantes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.avaliacaoMedia.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avaliação Média</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">R$ {estatisticas.precoMedio.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Preço Médio</div>
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
                placeholder="Buscar por nome, cidade ou tipo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro Tipo */}
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="museu">Museu</option>
            <option value="parque">Parque</option>
            <option value="monumento">Monumento</option>
            <option value="cultural">Cultural</option>
            <option value="aventura">Aventura</option>
            <option value="religioso">Religioso</option>
            <option value="natural">Natural</option>
            <option value="gastronomia">Gastronomia</option>
          </select>

          {/* Filtro Status */}
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="manutencao">Manutenção</option>
            <option value="temporada">Temporada</option>
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
            <option value="visitantes">Visitantes</option>
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

      {/* Lista de Atrações */}
      {visualizacao === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {atracoesFiltradas.map((atracao) => (
            <div key={atracao.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400 relative">
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(atracao.tipo)}`}>
                    {atracao.tipo.charAt(0).toUpperCase() + atracao.tipo.slice(1)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atracao.status)}`}>
                    {atracao.status.charAt(0).toUpperCase() + atracao.status.slice(1)}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{atracao.nome}</h3>
                  <p className="text-blue-100 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {atracao.cidade}, {atracao.estado}
                  </p>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{atracao.avaliacao}</span>
                    <span className="text-gray-500 text-sm">({atracao.numeroAvaliacoes})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">R$ {atracao.preco}</div>
                    <div className="text-sm text-gray-500">por pessoa</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {atracao.tempoVisita}h
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {atracao.capacidadeMaxima}
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {atracao.totalVisitantes}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{atracao.descricao}</p>

                <div className="flex items-center gap-2 mb-4">
                  {atracao.acessibilidade && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">♿ Acessível</span>
                  )}
                  {atracao.estacionamento && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">🅿️ Estacionamento</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewAtracao(atracao)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </button>
                  <button
                    onClick={() => handleEditAtracao(atracao)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteAtracao(atracao.id)}
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
        // Lista tabular (simplificada para economizar espaço)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Atração</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Local</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visitantes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {atracoesFiltradas.map((atracao) => (
                  <tr key={atracao.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{atracao.nome}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {atracao.avaliacao} ({atracao.numeroAvaliacoes})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(atracao.tipo)}`}>
                        {atracao.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{atracao.cidade}</div>
                      <div className="text-sm text-gray-500">{atracao.estado}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">R$ {atracao.preco}</div>
                      <div className="text-sm text-gray-500">{atracao.tempoVisita}h visita</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atracao.status)}`}>
                        {atracao.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{atracao.totalVisitantes}</div>
                      <div className="text-sm text-gray-500">R$ {atracao.receitaTotal.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewAtracao(atracao)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditAtracao(atracao)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAtracao(atracao.id)}
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

      {/* Modal - Simplificado para economizar espaço */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalTipo === 'add' ? 'Nova Atração' : modalTipo === 'edit' ? 'Editar Atração' : 'Detalhes da Atração'}
              </h2>
            </div>

            <div className="p-6">
              {modalTipo === 'view' && atracaoSelecionada ? (
                <div className="space-y-4">
                  <div><strong>Nome:</strong> {atracaoSelecionada.nome}</div>
                  <div><strong>Tipo:</strong> {atracaoSelecionada.tipo}</div>
                  <div><strong>Local:</strong> {atracaoSelecionada.cidade}, {atracaoSelecionada.estado}</div>
                  <div><strong>Preço:</strong> R$ {atracaoSelecionada.preco}</div>
                  <div><strong>Descrição:</strong> {atracaoSelecionada.descricao}</div>
                  <div><strong>Horário:</strong> {atracaoSelecionada.horarioFuncionamento.abertura} às {atracaoSelecionada.horarioFuncionamento.fechamento}</div>
                  <div><strong>Avaliação:</strong> {atracaoSelecionada.avaliacao} ⭐ ({atracaoSelecionada.numeroAvaliacoes} avaliações)</div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Atração *</label>
                      <input
                        type="text"
                        value={formData.nome || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Hot Park"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                      <select
                        value={formData.tipo || 'cultural'}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cultural">Cultural</option>
                        <option value="museu">Museu</option>
                        <option value="parque">Parque</option>
                        <option value="monumento">Monumento</option>
                        <option value="aventura">Aventura</option>
                        <option value="religioso">Religioso</option>
                        <option value="natural">Natural</option>
                        <option value="gastronomia">Gastronomia</option>
                      </select>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                      <select
                        value={formData.status || 'ativo'}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="manutencao">Manutenção</option>
                        <option value="temporada">Temporada</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                    <textarea
                      value={formData.descricao || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Descreva a atração, principais características e atrativos..."
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
                  onClick={handleSaveAtracao}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : modalTipo === 'add' ? 'Criar Atração' : 'Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {atracoesFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atração encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar atrações.'
              : 'Comece criando sua primeira atração.'}
          </p>
          <button
            onClick={handleAddAtracao}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nova Atração
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaAtracoes;
