// 🏪 SISTEMA DE LOJA - RESERVEI VIAGENS
// Funcionalidade: Loja virtual e catálogo público
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Heart, Star, Filter, Grid, List, Eye, Share2, Gift } from 'lucide-react';

interface ProdutoLoja {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  precoPromocional?: number;
  descricao: string;
  imagem: string;
  avaliacao: number;
  numeroAvaliacoes: number;
  tags: string[];
  promocao: boolean;
  destaque: boolean;
  disponivel: boolean;
  vendidos: number;
  desconto?: number;
}

const SistemaLoja: React.FC = () => {
  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [carrinho, setCarrinho] = useState<number[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPreco, setFiltroPreco] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('relevancia');
  const [visualizacao, setVisualizacao] = useState<'grid' | 'lista'>('grid');
  const [showFiltros, setShowFiltros] = useState(false);

  // Dados mock
  const produtosMock: ProdutoLoja[] = [
    {
      id: 1,
      nome: 'Pacote Caldas Novas Família 3 dias',
      categoria: 'Pacotes',
      preco: 599.00,
      precoPromocional: 499.00,
      descricao: 'Pacote completo para família em Caldas Novas com hospedagem e atrações',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.8,
      numeroAvaliacoes: 89,
      tags: ['família', 'águas termais', 'parques'],
      promocao: true,
      destaque: true,
      disponivel: true,
      vendidos: 156,
      desconto: 17
    },
    {
      id: 2,
      nome: 'Hot Park - Ingresso Individual',
      categoria: 'Ingressos',
      preco: 89.90,
      descricao: 'Ingresso para o maior parque aquático de águas termais do mundo',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.9,
      numeroAvaliacoes: 312,
      tags: ['parque', 'aquático', 'diversão'],
      promocao: false,
      destaque: true,
      disponivel: true,
      vendidos: 445
    },
    {
      id: 3,
      nome: 'Seguro Viagem Nacional Premium',
      categoria: 'Seguros',
      preco: 45.00,
      descricao: 'Seguro viagem nacional com cobertura completa',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.6,
      numeroAvaliacoes: 67,
      tags: ['seguro', 'proteção', 'emergência'],
      promocao: false,
      destaque: false,
      disponivel: true,
      vendidos: 234
    },
    {
      id: 4,
      nome: 'Transfer Aeroporto Executivo',
      categoria: 'Transporte',
      preco: 120.00,
      descricao: 'Transfer executivo do aeroporto até Caldas Novas',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.7,
      numeroAvaliacoes: 23,
      tags: ['transfer', 'conforto', 'executivo'],
      promocao: false,
      destaque: false,
      disponivel: true,
      vendidos: 67
    },
    {
      id: 5,
      nome: 'Combo Caldas + Rio Quente',
      categoria: 'Combos',
      preco: 899.00,
      precoPromocional: 799.00,
      descricao: 'Combo especial visitando Caldas Novas e Rio Quente',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.9,
      numeroAvaliacoes: 45,
      tags: ['combo', 'caldas', 'rio quente'],
      promocao: true,
      destaque: true,
      disponivel: true,
      vendidos: 89,
      desconto: 11
    },
    {
      id: 6,
      nome: 'Passeio Ecológico Serra de Caldas',
      categoria: 'Passeios',
      preco: 75.00,
      descricao: 'Trilha ecológica pela serra com guia especializado',
      imagem: '/api/placeholder/400/300',
      avaliacao: 4.5,
      numeroAvaliacoes: 34,
      tags: ['ecológico', 'trilha', 'natureza'],
      promocao: false,
      destaque: false,
      disponivel: true,
      vendidos: 123
    }
  ];

  useEffect(() => {
    setProdutos(produtosMock);
  }, []);

  // Funções de filtro e busca
  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      produto.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchCategoria = filtroCategoria === 'todas' || produto.categoria === filtroCategoria;

    let matchPreco = true;
    if (filtroPreco !== 'todos') {
      const preco = produto.precoPromocional || produto.preco;
      switch (filtroPreco) {
        case 'ate100':
          matchPreco = preco <= 100;
          break;
        case '100a300':
          matchPreco = preco > 100 && preco <= 300;
          break;
        case '300a600':
          matchPreco = preco > 300 && preco <= 600;
          break;
        case 'acima600':
          matchPreco = preco > 600;
          break;
      }
    }

    return matchBusca && matchCategoria && matchPreco;
  }).sort((a, b) => {
    switch (ordenacao) {
      case 'preco-menor':
        return (a.precoPromocional || a.preco) - (b.precoPromocional || b.preco);
      case 'preco-maior':
        return (b.precoPromocional || b.preco) - (a.precoPromocional || a.preco);
      case 'avaliacao':
        return b.avaliacao - a.avaliacao;
      case 'vendidos':
        return b.vendidos - a.vendidos;
      default: // relevancia
        return (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0) || b.avaliacao - a.avaliacao;
    }
  });

  const toggleFavorito = (id: number) => {
    setFavoritos(prev =>
      prev.includes(id)
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const adicionarCarrinho = (id: number) => {
    setCarrinho(prev => [...prev, id]);
  };

  const categorias = [...new Set(produtos.map(p => p.categoria))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Loja */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Loja Reservei Viagens</h1>
            <p className="text-xl text-blue-100">Descubra experiências incríveis em Caldas Novas</p>
          </div>

          {/* Busca Principal */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="h-6 w-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar pacotes, ingressos, hotéis..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:ring-2 focus:ring-blue-300 focus:outline-none text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setShowFiltros(!showFiltros)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>

              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas Categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="relevancia">Relevância</option>
                <option value="preco-menor">Menor Preço</option>
                <option value="preco-maior">Maior Preço</option>
                <option value="avaliacao">Melhor Avaliação</option>
                <option value="vendidos">Mais Vendidos</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{produtosFiltrados.length} produtos encontrados</span>
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setVisualizacao('grid')}
                  className={`p-2 ${visualizacao === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setVisualizacao('lista')}
                  className={`p-2 ${visualizacao === 'lista' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-gray-600" />
                {carrinho.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {carrinho.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filtros Expandidos */}
          {showFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
                  <select
                    value={filtroPreco}
                    onChange={(e) => setFiltroPreco(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="todos">Todos os Preços</option>
                    <option value="ate100">Até R$ 100</option>
                    <option value="100a300">R$ 100 - R$ 300</option>
                    <option value="300a600">R$ 300 - R$ 600</option>
                    <option value="acima600">Acima de R$ 600</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Produtos em Destaque */}
      {busca === '' && filtroCategoria === 'todas' && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Produtos em Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {produtos.filter(p => p.destaque).slice(0, 3).map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-400">
                  {produto.promocao && produto.desconto && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {produto.desconto}% OFF
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => toggleFavorito(produto.id)}
                      className={`p-2 rounded-full ${favoritos.includes(produto.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600'} hover:scale-110 transition-transform`}
                    >
                      <Heart className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">{produto.nome}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{produto.avaliacao}</span>
                    <span className="text-gray-500 text-sm">({produto.numeroAvaliacoes})</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{produto.descricao}</p>
                  <div className="flex justify-between items-center">
                    {produto.precoPromocional ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">R$ {produto.preco}</div>
                        <div className="text-xl font-bold text-orange-600">R$ {produto.precoPromocional}</div>
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-green-600">R$ {produto.preco}</div>
                    )}
                    <button
                      onClick={() => adicionarCarrinho(produto.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Produtos */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {visualizacao === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gradient-to-br from-blue-400 to-purple-400">
                  {produto.promocao && produto.desconto && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {produto.desconto}% OFF
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleFavorito(produto.id)}
                      className={`p-1.5 rounded-full ${favoritos.includes(produto.id) ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}
                    >
                      <Heart className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{produto.nome}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{produto.avaliacao}</span>
                    <span className="text-gray-500 text-xs">({produto.numeroAvaliacoes})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    {produto.precoPromocional ? (
                      <div>
                        <div className="text-xs text-gray-500 line-through">R$ {produto.preco}</div>
                        <div className="text-lg font-bold text-orange-600">R$ {produto.precoPromocional}</div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-green-600">R$ {produto.preco}</div>
                    )}
                    <button
                      onClick={() => adicionarCarrinho(produto.id)}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Lista
          <div className="space-y-4">
            {produtosFiltrados.map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg mb-2">{produto.nome}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{produto.avaliacao}</span>
                          <span className="text-gray-500 text-sm">({produto.numeroAvaliacoes} avaliações)</span>
                        </div>
                        <p className="text-gray-600 mb-3">{produto.descricao}</p>
                        <div className="flex flex-wrap gap-1">
                          {produto.tags.map((tag, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        {produto.precoPromocional ? (
                          <div>
                            <div className="text-sm text-gray-500 line-through">R$ {produto.preco}</div>
                            <div className="text-2xl font-bold text-orange-600">R$ {produto.precoPromocional}</div>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold text-green-600">R$ {produto.preco}</div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => toggleFavorito(produto.id)}
                            className={`p-2 rounded-lg ${favoritos.includes(produto.id) ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Comprar Agora
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {produtosFiltrados.length === 0 && (
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border p-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros ou buscar por outros termos.</p>
            <button
              onClick={() => {
                setBusca('');
                setFiltroCategoria('todas');
                setFiltroPreco('todos');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Footer da Loja */}
      <div className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Reservei Viagens</h3>
            <p className="text-gray-400">Sua experiência em Caldas Novas começa aqui</p>
            <div className="flex justify-center gap-4 mt-4">
              <span className="text-sm">📞 (64) 99319-7555</span>
              <span className="text-sm">📧 reservas@reserveiviagens.com.br</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemaLoja;
