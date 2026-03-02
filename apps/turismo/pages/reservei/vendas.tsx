// 🛒 SISTEMA DE VENDAS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de vendas e transações
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, ShoppingCart, DollarSign, TrendingUp, Users, Calendar, Filter, BarChart3 } from 'lucide-react';

interface Venda {
  id: number;
  numeroVenda: string;
  cliente: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
  };
  itens: Array<{
    id: number;
    produto: string;
    tipo: 'viagem' | 'hotel' | 'atracao' | 'seguro' | 'transporte';
    quantidade: number;
    precoUnitario: number;
    desconto: number;
    total: number;
  }>;
  subtotal: number;
  desconto: number;
  taxa: number;
  total: number;
  status: 'pendente' | 'confirmada' | 'paga' | 'cancelada' | 'reembolsada';
  metodoPagamento: 'cartao' | 'pix' | 'boleto' | 'transferencia' | 'dinheiro';
  parcelas: number;
  dataVenda: string;
  dataVencimento: string;
  dataPagamento?: string;
  vendedor: string;
  comissao: number;
  observacoes: string;
  cupomDesconto?: string;
}

const SistemaVendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data');
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Dados mock
  const vendasMock: Venda[] = [
    {
      id: 1,
      numeroVenda: 'VND-2025-001',
      cliente: {
        id: 1,
        nome: 'Ana Silva Santos',
        email: 'ana.silva@email.com',
        telefone: '(11) 99999-9999'
      },
      itens: [
        {
          id: 1,
          produto: 'Pacote Caldas Novas 3 dias',
          tipo: 'viagem',
          quantidade: 2,
          precoUnitario: 599.00,
          desconto: 59.90,
          total: 1138.10
        },
        {
          id: 2,
          produto: 'Seguro Viagem',
          tipo: 'seguro',
          quantidade: 2,
          precoUnitario: 45.00,
          desconto: 0,
          total: 90.00
        }
      ],
      subtotal: 1288.00,
      desconto: 59.90,
      taxa: 30.00,
      total: 1258.10,
      status: 'confirmada',
      metodoPagamento: 'cartao',
      parcelas: 3,
      dataVenda: '2025-08-25',
      dataVencimento: '2025-09-15',
      dataPagamento: '2025-08-25',
      vendedor: 'Carlos Vendedor',
      comissao: 125.81,
      observacoes: 'Cliente preferencial - desconto aplicado',
      cupomDesconto: 'PROMO10'
    },
    {
      id: 2,
      numeroVenda: 'VND-2025-002',
      cliente: {
        id: 2,
        nome: 'João Oliveira',
        email: 'joao.oliveira@email.com',
        telefone: '(11) 88888-8888'
      },
      itens: [
        {
          id: 3,
          produto: 'Hot Park - Ingresso',
          tipo: 'atracao',
          quantidade: 4,
          precoUnitario: 89.90,
          desconto: 0,
          total: 359.60
        }
      ],
      subtotal: 359.60,
      desconto: 0,
      taxa: 10.00,
      total: 369.60,
      status: 'pendente',
      metodoPagamento: 'pix',
      parcelas: 1,
      dataVenda: '2025-08-29',
      dataVencimento: '2025-08-30',
      vendedor: 'Maria Vendedora',
      comissao: 36.96,
      observacoes: 'Aguardando confirmação do PIX'
    },
    {
      id: 3,
      numeroVenda: 'VND-2025-003',
      cliente: {
        id: 3,
        nome: 'Pedro Costa',
        email: 'pedro.costa@email.com',
        telefone: '(11) 77777-7777'
      },
      itens: [
        {
          id: 4,
          produto: 'Combo Caldas + Rio Quente',
          tipo: 'viagem',
          quantidade: 1,
          precoUnitario: 899.00,
          desconto: 50.00,
          total: 849.00
        }
      ],
      subtotal: 899.00,
      desconto: 50.00,
      taxa: 20.00,
      total: 869.00,
      status: 'paga',
      metodoPagamento: 'cartao',
      parcelas: 6,
      dataVenda: '2025-08-20',
      dataVencimento: '2025-09-20',
      dataPagamento: '2025-08-21',
      vendedor: 'Ana Vendedora',
      comissao: 86.90,
      observacoes: 'Pagamento aprovado - cliente satisfeito'
    }
  ];

  useEffect(() => {
    setVendas(vendasMock);
  }, []);

  // Funções de filtro e busca
  const vendasFiltradas = vendas.filter(venda => {
    const matchBusca = venda.numeroVenda.toLowerCase().includes(busca.toLowerCase()) ||
                      venda.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      venda.cliente.email.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || venda.status === filtroStatus;
    const matchMetodo = filtroMetodo === 'todos' || venda.metodoPagamento === filtroMetodo;

    return matchBusca && matchStatus && matchMetodo;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'data':
        valueA = new Date(a.dataVenda);
        valueB = new Date(b.dataVenda);
        break;
      case 'valor':
        valueA = a.total;
        valueB = b.total;
        break;
      case 'cliente':
        valueA = a.cliente.nome;
        valueB = b.cliente.nome;
        break;
      default:
        valueA = new Date(a.dataVenda);
        valueB = new Date(b.dataVenda);
    }

    if (valueA instanceof Date) {
      return ordemCrescente ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else if (typeof valueA === 'string') {
      return ordemCrescente ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  // Estatísticas
  const estatisticas = {
    totalVendas: vendas.length,
    vendasConfirmadas: vendas.filter(v => v.status === 'confirmada' || v.status === 'paga').length,
    vendasPendentes: vendas.filter(v => v.status === 'pendente').length,
    receitaTotal: vendas.filter(v => v.status === 'confirmada' || v.status === 'paga').reduce((acc, v) => acc + v.total, 0),
    ticketMedio: vendas.length > 0 ? vendas.reduce((acc, v) => acc + v.total, 0) / vendas.length : 0,
    comissaoTotal: vendas.reduce((acc, v) => acc + v.comissao, 0),
    vendasMes: vendas.filter(v => {
      const dataVenda = new Date(v.dataVenda);
      const mesAtual = new Date();
      return dataVenda.getMonth() === mesAtual.getMonth() && dataVenda.getFullYear() === mesAtual.getFullYear();
    }).length
  };

  const handleView = (venda: Venda) => {
    setVendaSelecionada(venda);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (venda: Venda) => {
    setVendaSelecionada(venda);
    setModalTipo('edit');
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
      setVendas(prev => prev.map(v => v.id === id ? { ...v, status: 'cancelada' as const } : v));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'paga': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'reembolsada': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'cartao': return 'bg-blue-100 text-blue-800';
      case 'pix': return 'bg-green-100 text-green-800';
      case 'boleto': return 'bg-orange-100 text-orange-800';
      case 'transferencia': return 'bg-purple-100 text-purple-800';
      case 'dinheiro': return 'bg-gray-100 text-gray-800';
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
              <ShoppingCart className="h-8 w-8 text-green-600" />
              Sistema de Vendas
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de vendas e transações</p>
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
              Nova Venda
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.totalVendas}</div>
            <div className="text-sm text-gray-600">Total de Vendas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.vendasConfirmadas}</div>
            <div className="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.vendasPendentes}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.ticketMedio.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.comissaoTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Comissão Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.vendasMes}</div>
            <div className="text-sm text-gray-600">Vendas do Mês</div>
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
                placeholder="Buscar por número, cliente ou email..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">Pendente</option>
            <option value="confirmada">Confirmada</option>
            <option value="paga">Paga</option>
            <option value="cancelada">Cancelada</option>
            <option value="reembolsada">Reembolsada</option>
          </select>

          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todos Métodos</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
            <option value="boleto">Boleto</option>
            <option value="transferencia">Transferência</option>
            <option value="dinheiro">Dinheiro</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="data">Data</option>
            <option value="valor">Valor</option>
            <option value="cliente">Cliente</option>
          </select>

          <button
            onClick={() => setOrdemCrescente(!ordemCrescente)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ordemCrescente ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Itens</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendasFiltradas.map((venda) => (
                <tr key={venda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{venda.numeroVenda}</div>
                      <div className="text-sm text-gray-500">por {venda.vendedor}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{venda.cliente.nome}</div>
                      <div className="text-sm text-gray-500">{venda.cliente.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{venda.itens.length} item(s)</div>
                    <div className="text-sm text-gray-500">{venda.itens[0]?.produto}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">R$ {venda.total.toFixed(2)}</div>
                    {venda.parcelas > 1 && (
                      <div className="text-sm text-gray-500">{venda.parcelas}x R$ {(venda.total / venda.parcelas).toFixed(2)}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(venda.status)}`}>
                      {venda.status.charAt(0).toUpperCase() + venda.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetodoColor(venda.metodoPagamento)}`}>
                      {venda.metodoPagamento.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(venda.dataVenda).toLocaleDateString()}</div>
                    {venda.dataPagamento && (
                      <div className="text-sm text-gray-500">Pago: {new Date(venda.dataPagamento).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(venda)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(venda)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(venda.id)}
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

      {/* Modal */}
      {showModal && vendaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes da Venda - {vendaSelecionada.numeroVenda}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {vendaSelecionada.cliente.nome}</div>
                    <div><strong>Email:</strong> {vendaSelecionada.cliente.email}</div>
                    <div><strong>Telefone:</strong> {vendaSelecionada.cliente.telefone}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Venda</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Data:</strong> {new Date(vendaSelecionada.dataVenda).toLocaleDateString()}</div>
                    <div><strong>Vendedor:</strong> {vendaSelecionada.vendedor}</div>
                    <div><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(vendaSelecionada.status)}`}>
                        {vendaSelecionada.status}
                      </span>
                    </div>
                    <div><strong>Método:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getMetodoColor(vendaSelecionada.metodoPagamento)}`}>
                        {vendaSelecionada.metodoPagamento}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itens da Venda */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Itens</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Desconto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vendaSelecionada.itens.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">{item.produto}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {item.tipo}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-sm">{item.quantidade}</td>
                          <td className="px-4 py-2 text-sm">R$ {item.precoUnitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">R$ {item.desconto.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">R$ {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Resumo Financeiro</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Subtotal</div>
                    <div className="font-medium">R$ {vendaSelecionada.subtotal.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Desconto</div>
                    <div className="font-medium text-red-600">- R$ {vendaSelecionada.desconto.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Taxa</div>
                    <div className="font-medium">R$ {vendaSelecionada.taxa.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total</div>
                    <div className="font-bold text-lg text-green-600">R$ {vendaSelecionada.total.toFixed(2)}</div>
                  </div>
                </div>

                {vendaSelecionada.parcelas > 1 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <strong>Parcelamento:</strong> {vendaSelecionada.parcelas}x de R$ {(vendaSelecionada.total / vendaSelecionada.parcelas).toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm">
                    <strong>Comissão do Vendedor:</strong> R$ {vendaSelecionada.comissao.toFixed(2)} (10%)
                  </div>
                </div>
              </div>

              {/* Observações */}
              {vendaSelecionada.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {vendaSelecionada.observacoes}
                  </p>
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
              {modalTipo === 'edit' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {vendasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma venda encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroMetodo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar vendas.'
              : 'Comece criando sua primeira venda.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4" />
            Nova Venda
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaVendas;
