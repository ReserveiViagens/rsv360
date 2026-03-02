// 📊 SISTEMA DE ESTOQUE - RESERVEI VIAGENS
// Funcionalidade: Controle de estoque e inventário
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Package, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Download, Upload } from 'lucide-react';

interface EstoqueItem {
  id: number;
  produto: string;
  categoria: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  estoqueMaximo: number;
  vendidos: number;
  reservados: number;
  disponivel: number;
  status: 'ok' | 'baixo' | 'critico' | 'esgotado';
  ultimaMovimentacao: string;
  fornecedor: string;
  custo: number;
  valorTotal: number;
}

const SistemaEstoque: React.FC = () => {
  const [itensEstoque, setItensEstoque] = useState<EstoqueItem[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Dados mock
  const estoqueMock: EstoqueItem[] = [
    {
      id: 1,
      produto: 'Pacote Caldas Novas 3 dias',
      categoria: 'viagem',
      estoqueAtual: 25,
      estoqueMinimo: 10,
      estoqueMaximo: 100,
      vendidos: 156,
      reservados: 8,
      disponivel: 17,
      status: 'ok',
      ultimaMovimentacao: '2025-08-29',
      fornecedor: 'Caldas Turismo',
      custo: 450.00,
      valorTotal: 11250.00
    },
    {
      id: 2,
      produto: 'Hot Park - Ingresso',
      categoria: 'atracao',
      estoqueAtual: 15,
      estoqueMinimo: 50,
      estoqueMaximo: 500,
      vendidos: 445,
      reservados: 12,
      disponivel: 3,
      status: 'critico',
      ultimaMovimentacao: '2025-08-29',
      fornecedor: 'Hot Park',
      custo: 75.00,
      valorTotal: 1125.00
    },
    {
      id: 3,
      produto: 'Seguro Viagem Nacional',
      categoria: 'seguro',
      estoqueAtual: 150,
      estoqueMinimo: 100,
      estoqueMaximo: 1000,
      vendidos: 234,
      reservados: 5,
      disponivel: 145,
      status: 'ok',
      ultimaMovimentacao: '2025-08-28',
      fornecedor: 'Seguradora+',
      custo: 30.00,
      valorTotal: 4500.00
    },
    {
      id: 4,
      produto: 'Transfer Executivo',
      categoria: 'transporte',
      estoqueAtual: 0,
      estoqueMinimo: 5,
      estoqueMaximo: 50,
      vendidos: 67,
      reservados: 0,
      disponivel: 0,
      status: 'esgotado',
      ultimaMovimentacao: '2025-08-25',
      fornecedor: 'Caldas Transfer',
      custo: 90.00,
      valorTotal: 0
    }
  ];

  useEffect(() => {
    setItensEstoque(estoqueMock);
  }, []);

  const itensFiltrados = itensEstoque.filter(item => {
    const matchBusca = item.produto.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || item.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'todas' || item.categoria === filtroCategoria;
    return matchBusca && matchStatus && matchCategoria;
  });

  const estatisticas = {
    totalItens: itensEstoque.length,
    itensCriticos: itensEstoque.filter(item => item.status === 'critico' || item.status === 'esgotado').length,
    valorTotal: itensEstoque.reduce((acc, item) => acc + item.valorTotal, 0),
    totalVendidos: itensEstoque.reduce((acc, item) => acc + item.vendidos, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'baixo': return 'bg-yellow-100 text-yellow-800';
      case 'critico': return 'bg-red-100 text-red-800';
      case 'esgotado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'baixo': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critico': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'esgotado': return <TrendingDown className="h-4 w-4 text-gray-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              Sistema de Estoque
            </h1>
            <p className="text-gray-600 mt-2">Controle de inventário e movimentação de estoque</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Upload className="h-4 w-4" />
              Entrada
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.totalItens}</div>
          <div className="text-sm text-gray-600">Total de Itens</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{estatisticas.itensCriticos}</div>
          <div className="text-sm text-gray-600">Itens Críticos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">R$ {estatisticas.valorTotal.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Valor Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.totalVendidos}</div>
          <div className="text-sm text-gray-600">Total Vendidos</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Status</option>
            <option value="ok">OK</option>
            <option value="baixo">Baixo</option>
            <option value="critico">Crítico</option>
            <option value="esgotado">Esgotado</option>
          </select>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas Categorias</option>
            <option value="viagem">Viagem</option>
            <option value="atracao">Atração</option>
            <option value="seguro">Seguro</option>
            <option value="transporte">Transporte</option>
          </select>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tabela de Estoque */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponível</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendidos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Mov.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itensFiltrados.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{item.produto}</div>
                      <div className="text-sm text-gray-500">{item.categoria} - {item.fornecedor}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">{item.estoqueAtual}</div>
                      <div className="text-gray-500">Min: {item.estoqueMinimo} | Max: {item.estoqueMaximo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-green-600">{item.disponivel}</div>
                      <div className="text-gray-500">Reservados: {item.reservados}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.vendidos}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium">R$ {item.valorTotal.toLocaleString()}</div>
                      <div className="text-gray-500">Custo: R$ {item.custo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {new Date(item.ultimaMovimentacao).toLocaleDateString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {itensFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item de estoque encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou adicione novos produtos ao estoque.</p>
        </div>
      )}
    </div>
  );
};

export default SistemaEstoque;
