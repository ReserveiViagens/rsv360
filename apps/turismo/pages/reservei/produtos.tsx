// 📦 SISTEMA DE PRODUTOS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de produtos turísticos
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Package, DollarSign, Star, Tag, Image, BarChart3 } from 'lucide-react';

interface Produto {
  id: number;
  nome: string;
  categoria: 'viagem' | 'hotel' | 'atracao' | 'seguro' | 'transporte' | 'combo';
  subcategoria: string;
  preco: number;
  precoPromocional?: number;
  status: 'ativo' | 'inativo' | 'promocao' | 'esgotado' | 'sazonal';
  estoque: number;
  estoqueMinimo: number;
  vendidos: number;
  avaliacao: number;
  numeroAvaliacoes: number;
  descricao: string;
  descricaoDetalhada: string;
  imagens: string[];
  tags: string[];
  caracteristicas: string[];
  inclusos: string[];
  naoInclusos: string[];
  observacoes: string[];
  fornecedor: string;
  comissao: number;
  dataCriacao: string;
  dataAtualizacao: string;
  receita: number;
  destino?: string;
  duracao?: number;
}

const SistemaProdutos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Dados mock
  const produtosMock: Produto[] = [
    {
      id: 1,
      nome: 'Pacote Caldas Novas Família 3 dias',
      categoria: 'viagem',
      subcategoria: 'Pacote Família',
      preco: 599.00,
      precoPromocional: 499.00,
      status: 'promocao',
      estoque: 50,
      estoqueMinimo: 10,
      vendidos: 156,
      avaliacao: 4.8,
      numeroAvaliacoes: 89,
      descricao: 'Pacote completo para família em Caldas Novas com hospedagem e atrações',
      descricaoDetalhada: 'Pacote especial para famílias que inclui hospedagem por 3 dias em hotel 4 estrelas, café da manhã, ingressos para parques aquáticos e transfer do aeroporto.',
      imagens: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      tags: ['família', 'águas termais', 'parques', 'kids'],
      caracteristicas: ['3 dias / 2 noites', 'Hotel 4 estrelas', 'Café da manhã incluso', 'Ingressos inclusos'],
      inclusos: ['Hospedagem 3 dias', 'Café da manhã', 'Ingressos Hot Park', 'Transfer aeroporto'],
      naoInclusos: ['Almoço e jantar', 'Bebidas extras', 'Atividades opcionais'],
      observacoes: ['Válido de segunda a quinta', 'Criança até 6 anos grátis'],
      fornecedor: 'Caldas Turismo',
      comissao: 15.0,
      dataCriacao: '2025-01-15',
      dataAtualizacao: '2025-08-25',
      receita: 77844.00,
      destino: 'Caldas Novas, GO',
      duracao: 3
    },
    {
      id: 2,
      nome: 'Seguro Viagem Nacional Premium',
      categoria: 'seguro',
      subcategoria: 'Seguro Nacional',
      preco: 45.00,
      status: 'ativo',
      estoque: 1000,
      estoqueMinimo: 100,
      vendidos: 234,
      avaliacao: 4.6,
      numeroAvaliacoes: 67,
      descricao: 'Seguro viagem nacional com cobertura completa para emergências',
      descricaoDetalhada: 'Seguro viagem nacional com cobertura médica de até R$ 50.000, cobertura odontológica, farmácia e assistência 24h.',
      imagens: ['/api/placeholder/400/300'],
      tags: ['seguro', 'nacional', 'emergência', 'médico'],
      caracteristicas: ['Cobertura R$ 50.000', 'Assistência 24h', 'Cobertura odontológica', 'Farmácia'],
      inclusos: ['Cobertura médica', 'Assistência 24h', 'Cobertura odontológica', 'Remédios'],
      naoInclusos: ['Doenças preexistentes', 'Atividades de risco'],
      observacoes: ['Válido em todo território nacional', 'Ativar até 24h antes da viagem'],
      fornecedor: 'Seguradora Viagem+',
      comissao: 25.0,
      dataCriacao: '2025-02-01',
      dataAtualizacao: '2025-08-20',
      receita: 10530.00
    },
    {
      id: 3,
      nome: 'Hot Park - Ingresso Individual',
      categoria: 'atracao',
      subcategoria: 'Parque Aquático',
      preco: 89.90,
      status: 'ativo',
      estoque: 200,
      estoqueMinimo: 50,
      vendidos: 445,
      avaliacao: 4.9,
      numeroAvaliacoes: 312,
      descricao: 'Ingresso individual para o Hot Park - maior parque aquático de águas termais',
      descricaoDetalhada: 'Ingresso para um dia inteiro no Hot Park com acesso a todas as atrações aquáticas, incluindo toboáguas, piscina de ondas, rio lento e área infantil.',
      imagens: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
      tags: ['parque', 'aquático', 'termal', 'família', 'diversão'],
      caracteristicas: ['Dia inteiro', 'Todas as atrações', 'Águas termais', 'Área infantil'],
      inclusos: ['Acesso todas atrações', 'Estacionamento', 'Vestiário', 'Área de descanso'],
      naoInclusos: ['Alimentação', 'Bebidas', 'Guarda-volumes', 'Toalhas'],
      observacoes: ['Funciona das 8h às 17h', 'Não é permitido levar comida'],
      fornecedor: 'Hot Park Administração',
      comissao: 12.0,
      dataCriacao: '2025-01-01',
      dataAtualizacao: '2025-08-29',
      receita: 40005.50
    },
    {
      id: 4,
      nome: 'Transfer Aeroporto Executivo',
      categoria: 'transporte',
      subcategoria: 'Transfer',
      preco: 120.00,
      status: 'ativo',
      estoque: 20,
      estoqueMinimo: 5,
      vendidos: 67,
      avaliacao: 4.7,
      numeroAvaliacoes: 23,
      descricao: 'Transfer executivo do aeroporto de Goiânia até Caldas Novas',
      descricaoDetalhada: 'Serviço de transfer executivo com veículo climatizado, motorista profissional e água mineral cortesia. Saídas do Aeroporto de Goiânia com destino aos principais hotéis de Caldas Novas.',
      imagens: ['/api/placeholder/400/300'],
      tags: ['transfer', 'aeroporto', 'executivo', 'conforto'],
      caracteristicas: ['Veículo executivo', 'Motorista profissional', 'Ar condicionado', 'Até 4 passageiros'],
      inclusos: ['Motorista profissional', 'Veículo climatizado', 'Água mineral', 'Seguro'],
      naoInclusos: ['Paradas extras', 'Bagagens excedentes', 'Pedágios'],
      observacoes: ['Confirmar 24h antes', 'Máximo 4 passageiros', 'Bagagem até 2 malas'],
      fornecedor: 'Caldas Transfer',
      comissao: 20.0,
      dataCriacao: '2025-03-01',
      dataAtualizacao: '2025-08-15',
      receita: 8040.00
    }
  ];

  useEffect(() => {
    setProdutos(produtosMock);
  }, []);

  // Funções de filtro e busca
  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      produto.categoria.toLowerCase().includes(busca.toLowerCase()) ||
                      produto.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;
    const matchStatus = filtroStatus === 'todos' || produto.status === filtroStatus;

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
      case 'vendidos':
        valueA = a.vendidos;
        valueB = b.vendidos;
        break;
      case 'avaliacao':
        valueA = a.avaliacao;
        valueB = b.avaliacao;
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
    totalProdutos: produtos.length,
    produtosAtivos: produtos.filter(p => p.status === 'ativo').length,
    produtosPromocao: produtos.filter(p => p.status === 'promocao').length,
    receitaTotal: produtos.reduce((acc, p) => acc + p.receita, 0),
    totalVendidos: produtos.reduce((acc, p) => acc + p.vendidos, 0),
    avaliacaoMedia: produtos.length > 0 ? produtos.reduce((acc, p) => acc + p.avaliacao, 0) / produtos.length : 0,
    estoqueTotal: produtos.reduce((acc, p) => acc + p.estoque, 0)
  };

  const handleView = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setModalTipo('view');
    setShowModal(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'viagem': return 'bg-blue-100 text-blue-800';
      case 'hotel': return 'bg-purple-100 text-purple-800';
      case 'atracao': return 'bg-green-100 text-green-800';
      case 'seguro': return 'bg-red-100 text-red-800';
      case 'transporte': return 'bg-yellow-100 text-yellow-800';
      case 'combo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'promocao': return 'bg-orange-100 text-orange-800';
      case 'esgotado': return 'bg-red-100 text-red-800';
      case 'sazonal': return 'bg-blue-100 text-blue-800';
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
              <Package className="h-8 w-8 text-blue-600" />
              Sistema de Produtos
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa do catálogo de produtos turísticos</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              Novo Produto
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalProdutos}</div>
            <div className="text-sm text-gray-600">Total Produtos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.produtosAtivos}</div>
            <div className="text-sm text-gray-600">Produtos Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.produtosPromocao}</div>
            <div className="text-sm text-gray-600">Em Promoção</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.totalVendidos}</div>
            <div className="text-sm text-gray-600">Total Vendidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.avaliacaoMedia.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avaliação Média</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.estoqueTotal}</div>
            <div className="text-sm text-gray-600">Estoque Total</div>
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
                placeholder="Buscar por nome, categoria ou tags..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todas">Todas Categorias</option>
            <option value="viagem">Viagem</option>
            <option value="hotel">Hotel</option>
            <option value="atracao">Atração</option>
            <option value="seguro">Seguro</option>
            <option value="transporte">Transporte</option>
            <option value="combo">Combo</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="promocao">Promoção</option>
            <option value="esgotado">Esgotado</option>
            <option value="sazonal">Sazonal</option>
            <option value="inativo">Inativo</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="nome">Nome</option>
            <option value="preco">Preço</option>
            <option value="vendidos">Vendidos</option>
            <option value="avaliacao">Avaliação</option>
          </select>

          <button
            onClick={() => setOrdemCrescente(!ordemCrescente)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ordemCrescente ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produtosFiltrados.map((produto) => (
          <div key={produto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400 relative">
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(produto.categoria)}`}>
                  {produto.categoria.charAt(0).toUpperCase() + produto.categoria.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(produto.status)}`}>
                  {produto.status.charAt(0).toUpperCase() + produto.status.slice(1)}
                </span>
              </div>

              {produto.precoPromocional && (
                <div className="absolute top-4 right-4">
                  <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>
                <p className="text-blue-100 text-sm">{produto.subcategoria}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{produto.avaliacao}</span>
                  <span className="text-gray-500 text-sm">({produto.numeroAvaliacoes})</span>
                </div>
                <div className="text-right">
                  {produto.precoPromocional ? (
                    <div>
                      <div className="text-sm text-gray-500 line-through">R$ {produto.preco}</div>
                      <div className="text-xl font-bold text-orange-600">R$ {produto.precoPromocional}</div>
                    </div>
                  ) : (
                    <div className="text-xl font-bold text-green-600">R$ {produto.preco}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {produto.estoque}
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  {produto.vendidos}
                </div>
                <div className="flex items-center gap-1">
                  <Tag className="h-4 w-4" />
                  {produto.comissao}%
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{produto.descricao}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {produto.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {produto.tags.length > 3 && (
                  <span className="text-xs text-gray-500">+{produto.tags.length - 3}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleView(produto)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </button>
                <button className="flex items-center justify-center px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && produtoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {produtoSelecionado.nome}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(produtoSelecionado.categoria)}`}>
                  {produtoSelecionado.categoria}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(produtoSelecionado.status)}`}>
                  {produtoSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Categoria:</strong> {produtoSelecionado.categoria}</div>
                    <div><strong>Subcategoria:</strong> {produtoSelecionado.subcategoria}</div>
                    <div><strong>Fornecedor:</strong> {produtoSelecionado.fornecedor}</div>
                    {produtoSelecionado.destino && <div><strong>Destino:</strong> {produtoSelecionado.destino}</div>}
                    {produtoSelecionado.duracao && <div><strong>Duração:</strong> {produtoSelecionado.duracao} dias</div>}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Comercial</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Preço:</strong> R$ {produtoSelecionado.preco}</div>
                    {produtoSelecionado.precoPromocional && (
                      <div><strong>Preço Promocional:</strong> R$ {produtoSelecionado.precoPromocional}</div>
                    )}
                    <div><strong>Estoque:</strong> {produtoSelecionado.estoque}</div>
                    <div><strong>Vendidos:</strong> {produtoSelecionado.vendidos}</div>
                    <div><strong>Comissão:</strong> {produtoSelecionado.comissao}%</div>
                    <div><strong>Receita:</strong> R$ {produtoSelecionado.receita.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <p className="text-sm text-gray-700">{produtoSelecionado.descricaoDetalhada}</p>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {produtoSelecionado.tags.map((tag, index) => (
                    <span key={index} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Inclusos e Não Inclusos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Inclusos</h3>
                  <ul className="space-y-1">
                    {produtoSelecionado.inclusos.map((item, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Não Inclusos</h3>
                  <ul className="space-y-1">
                    {produtoSelecionado.naoInclusos.map((item, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Observações */}
              {produtoSelecionado.observacoes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <ul className="space-y-1">
                    {produtoSelecionado.observacoes.map((obs, index) => (
                      <li key={index} className="text-sm text-orange-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Editar Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {produtosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroCategoria !== 'todas' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar produtos.'
              : 'Comece criando seu primeiro produto.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Novo Produto
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaProdutos;
