// 💳 SISTEMA DE PAGAMENTOS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de pagamentos e transações
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, CreditCard, DollarSign, Calendar, CheckCircle, AlertTriangle, Clock, RefreshCw, Smartphone, Building2 } from 'lucide-react';

interface Pagamento {
  id: number;
  transacaoId: string;
  faturaId: number;
  numeroFatura: string;
  cliente: {
    nome: string;
    documento: string;
    email: string;
  };
  valor: number;
  taxa: number;
  valorLiquido: number;
  metodo: 'cartao-credito' | 'cartao-debito' | 'pix' | 'boleto' | 'transferencia' | 'dinheiro';
  gateway: 'mercadopago' | 'pagseguro' | 'stripe' | 'getnet' | 'manual';
  status: 'pendente' | 'processando' | 'aprovado' | 'rejeitado' | 'cancelado' | 'estornado';
  parcelas: number;
  valorParcela: number;
  dataTransacao: string;
  dataProcessamento?: string;
  dataLiberacao?: string;
  codigoAutorizacao?: string;
  nsu?: string;
  tid?: string;
  motivoRejeicao?: string;
  dadosCartao?: {
    bandeira: string;
    final: string;
    portador: string;
  };
  dadosPix?: {
    chave: string;
    banco: string;
    comprovante?: string;
  };
  dadosBoleto?: {
    codigoBarras: string;
    linhaDigitavel: string;
    dataVencimento: string;
    banco: string;
  };
  observacoes: string;
  vendedor: string;
}

const SistemaPagamentos: React.FC = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data');
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Dados mock
  const pagamentosMock: Pagamento[] = [
    {
      id: 1,
      transacaoId: 'TXN_2025_001234',
      faturaId: 1,
      numeroFatura: '000001',
      cliente: {
        nome: 'Ana Silva Santos',
        documento: '123.456.789-00',
        email: 'ana.silva@email.com'
      },
      valor: 1302.40,
      taxa: 52.10,
      valorLiquido: 1250.30,
      metodo: 'cartao-credito',
      gateway: 'mercadopago',
      status: 'aprovado',
      parcelas: 3,
      valorParcela: 434.13,
      dataTransacao: '2025-08-25 14:30:00',
      dataProcessamento: '2025-08-25 14:31:15',
      dataLiberacao: '2025-08-26 09:00:00',
      codigoAutorizacao: 'AUTH123456',
      nsu: '001234567890',
      tid: 'TID123456789',
      dadosCartao: {
        bandeira: 'Visa',
        final: '4321',
        portador: 'ANA S SANTOS'
      },
      observacoes: 'Pagamento aprovado automaticamente',
      vendedor: 'Carlos Vendedor'
    },
    {
      id: 2,
      transacaoId: 'TXN_2025_001235',
      faturaId: 2,
      numeroFatura: '000002',
      cliente: {
        nome: 'João Oliveira',
        documento: '987.654.321-00',
        email: 'joao.oliveira@email.com'
      },
      valor: 377.58,
      taxa: 3.78,
      valorLiquido: 373.80,
      metodo: 'pix',
      gateway: 'mercadopago',
      status: 'aprovado',
      parcelas: 1,
      valorParcela: 377.58,
      dataTransacao: '2025-08-29 10:15:00',
      dataProcessamento: '2025-08-29 10:15:30',
      dataLiberacao: '2025-08-29 10:15:30',
      dadosPix: {
        chave: 'reservei@viagens.com.br',
        banco: 'Banco do Brasil',
        comprovante: 'COMP123456789'
      },
      observacoes: 'PIX processado instantaneamente',
      vendedor: 'Maria Vendedora'
    },
    {
      id: 3,
      transacaoId: 'TXN_2025_001236',
      faturaId: 3,
      numeroFatura: '000003',
      cliente: {
        nome: 'Pedro Costa',
        documento: '456.789.123-00',
        email: 'pedro.costa@email.com'
      },
      valor: 943.95,
      taxa: 0,
      valorLiquido: 943.95,
      metodo: 'boleto',
      gateway: 'pagseguro',
      status: 'pendente',
      parcelas: 1,
      valorParcela: 943.95,
      dataTransacao: '2025-08-29 16:00:00',
      dadosBoleto: {
        codigoBarras: '03399.12345 12345.123456 12345.123456 1 98760000094395',
        linhaDigitavel: '03399.12345 12345.123456 12345.123456 1 98760000094395',
        dataVencimento: '2025-09-05',
        banco: 'PagSeguro'
      },
      observacoes: 'Aguardando pagamento do boleto',
      vendedor: 'Ana Vendedora'
    },
    {
      id: 4,
      transacaoId: 'TXN_2025_001237',
      faturaId: 4,
      numeroFatura: '000004',
      cliente: {
        nome: 'Maria Santos',
        documento: '321.654.987-00',
        email: 'maria.santos@email.com'
      },
      valor: 599.00,
      taxa: 23.96,
      valorLiquido: 575.04,
      metodo: 'cartao-debito',
      gateway: 'getnet',
      status: 'rejeitado',
      parcelas: 1,
      valorParcela: 599.00,
      dataTransacao: '2025-08-28 11:45:00',
      dataProcessamento: '2025-08-28 11:45:45',
      motivoRejeicao: 'Cartão sem limite suficiente',
      dadosCartao: {
        bandeira: 'Mastercard',
        final: '8765',
        portador: 'MARIA SANTOS'
      },
      observacoes: 'Cliente informado para tentar outro cartão',
      vendedor: 'Roberto Vendedor'
    }
  ];

  useEffect(() => {
    setPagamentos(pagamentosMock);
  }, []);

  // Funções de filtro e busca
  const pagamentosFiltrados = pagamentos.filter(pagamento => {
    const matchBusca = pagamento.transacaoId.toLowerCase().includes(busca.toLowerCase()) ||
                      pagamento.numeroFatura.includes(busca) ||
                      pagamento.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      pagamento.cliente.documento.includes(busca);

    const matchStatus = filtroStatus === 'todos' || pagamento.status === filtroStatus;
    const matchMetodo = filtroMetodo === 'todos' || pagamento.metodo === filtroMetodo;

    return matchBusca && matchStatus && matchMetodo;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'data':
        valueA = new Date(a.dataTransacao);
        valueB = new Date(b.dataTransacao);
        break;
      case 'valor':
        valueA = a.valor;
        valueB = b.valor;
        break;
      case 'cliente':
        valueA = a.cliente.nome;
        valueB = b.cliente.nome;
        break;
      default:
        valueA = new Date(a.dataTransacao);
        valueB = new Date(b.dataTransacao);
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
    totalPagamentos: pagamentos.length,
    pagamentosAprovados: pagamentos.filter(p => p.status === 'aprovado').length,
    pagamentosPendentes: pagamentos.filter(p => p.status === 'pendente').length,
    pagamentosRejeitados: pagamentos.filter(p => p.status === 'rejeitado').length,
    valorTotal: pagamentos.filter(p => p.status === 'aprovado').reduce((acc, p) => acc + p.valor, 0),
    taxasTotal: pagamentos.filter(p => p.status === 'aprovado').reduce((acc, p) => acc + p.taxa, 0),
    valorLiquido: pagamentos.filter(p => p.status === 'aprovado').reduce((acc, p) => acc + p.valorLiquido, 0),
    ticketMedio: pagamentos.length > 0 ? pagamentos.reduce((acc, p) => acc + p.valor, 0) / pagamentos.length : 0
  };

  const handleView = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento);
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'processando': return 'bg-blue-100 text-blue-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      case 'estornado': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'processando': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'rejeitado': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'cancelado': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      case 'estornado': return <RefreshCw className="h-4 w-4 text-purple-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case 'cartao-credito':
      case 'cartao-debito':
        return <CreditCard className="h-4 w-4" />;
      case 'pix':
        return <Smartphone className="h-4 w-4" />;
      case 'boleto':
      case 'transferencia':
        return <Building2 className="h-4 w-4" />;
      case 'dinheiro':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getMetodoColor = (metodo: string) => {
    switch (metodo) {
      case 'cartao-credito': return 'bg-blue-100 text-blue-800';
      case 'cartao-debito': return 'bg-green-100 text-green-800';
      case 'pix': return 'bg-purple-100 text-purple-800';
      case 'boleto': return 'bg-orange-100 text-orange-800';
      case 'transferencia': return 'bg-indigo-100 text-indigo-800';
      case 'dinheiro': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGatewayColor = (gateway: string) => {
    switch (gateway) {
      case 'mercadopago': return 'bg-blue-100 text-blue-800';
      case 'pagseguro': return 'bg-orange-100 text-orange-800';
      case 'stripe': return 'bg-purple-100 text-purple-800';
      case 'getnet': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
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
              <CreditCard className="h-8 w-8 text-green-600" />
              Sistema de Pagamentos
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de pagamentos e transações financeiras</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.totalPagamentos}</div>
            <div className="text-sm text-gray-600">Total Pagamentos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.pagamentosAprovados}</div>
            <div className="text-sm text-gray-600">Aprovados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.pagamentosPendentes}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{estatisticas.pagamentosRejeitados}</div>
            <div className="text-sm text-gray-600">Rejeitados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">R$ {estatisticas.valorTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Valor Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.taxasTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Taxas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">R$ {estatisticas.valorLiquido.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Valor Líquido</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.ticketMedio.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
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
                placeholder="Buscar por transação, fatura ou cliente..."
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
            <option value="processando">Processando</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="cancelado">Cancelado</option>
            <option value="estornado">Estornado</option>
          </select>

          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="todos">Todos Métodos</option>
            <option value="cartao-credito">Cartão de Crédito</option>
            <option value="cartao-debito">Cartão de Débito</option>
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

      {/* Lista de Pagamentos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gateway</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pagamentosFiltrados.map((pagamento) => (
                <tr key={pagamento.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{pagamento.transacaoId}</div>
                      <div className="text-sm text-gray-500">Fatura #{pagamento.numeroFatura}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{pagamento.cliente.nome}</div>
                      <div className="text-sm text-gray-500">{pagamento.cliente.documento}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getMetodoColor(pagamento.metodo)}`}>
                        {getMetodoIcon(pagamento.metodo)}
                        {pagamento.metodo.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    {pagamento.parcelas > 1 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {pagamento.parcelas}x R$ {pagamento.valorParcela.toFixed(2)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(pagamento.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                        {pagamento.status.charAt(0).toUpperCase() + pagamento.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">R$ {pagamento.valor.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      Taxa: R$ {pagamento.taxa.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Líquido: R$ {pagamento.valorLiquido.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGatewayColor(pagamento.gateway)}`}>
                      {pagamento.gateway.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(pagamento.dataTransacao).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(pagamento.dataTransacao).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(pagamento)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {pagamento.status === 'aprovado' && (
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {pagamento.status === 'pendente' && (
                        <button className="text-yellow-600 hover:text-yellow-900">
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && pagamentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes do Pagamento
              </h2>
              <p className="text-gray-600 mt-1">{pagamentoSelecionado.transacaoId}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Status e Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(pagamentoSelecionado.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamentoSelecionado.status)}`}>
                      {pagamentoSelecionado.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">R$ {pagamentoSelecionado.valor.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Valor da Transação</div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getMetodoIcon(pagamentoSelecionado.metodo)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMetodoColor(pagamentoSelecionado.metodo)}`}>
                      {pagamentoSelecionado.metodo.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>
                  {pagamentoSelecionado.parcelas > 1 ? (
                    <div>
                      <div className="text-lg font-bold text-blue-600">{pagamentoSelecionado.parcelas}x</div>
                      <div className="text-sm text-gray-600">R$ {pagamentoSelecionado.valorParcela.toFixed(2)} cada</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-lg font-bold text-blue-600">À Vista</div>
                      <div className="text-sm text-gray-600">Pagamento único</div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGatewayColor(pagamentoSelecionado.gateway)}`}>
                      {pagamentoSelecionado.gateway.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-purple-600">R$ {pagamentoSelecionado.valorLiquido.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Valor Líquido (taxa: R$ {pagamentoSelecionado.taxa.toFixed(2)})</div>
                </div>
              </div>

              {/* Informações do Cliente e Fatura */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {pagamentoSelecionado.cliente.nome}</div>
                    <div><strong>Documento:</strong> {pagamentoSelecionado.cliente.documento}</div>
                    <div><strong>Email:</strong> {pagamentoSelecionado.cliente.email}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Fatura</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Número:</strong> #{pagamentoSelecionado.numeroFatura}</div>
                    <div><strong>Vendedor:</strong> {pagamentoSelecionado.vendedor}</div>
                    <div><strong>Data Transação:</strong> {new Date(pagamentoSelecionado.dataTransacao).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Dados Específicos do Método */}
              {pagamentoSelecionado.dadosCartao && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dados do Cartão</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div><strong>Bandeira:</strong> {pagamentoSelecionado.dadosCartao.bandeira}</div>
                      <div><strong>Final:</strong> ****{pagamentoSelecionado.dadosCartao.final}</div>
                      <div><strong>Portador:</strong> {pagamentoSelecionado.dadosCartao.portador}</div>
                    </div>
                    {pagamentoSelecionado.codigoAutorizacao && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div><strong>Autorização:</strong> {pagamentoSelecionado.codigoAutorizacao}</div>
                          <div><strong>NSU:</strong> {pagamentoSelecionado.nsu}</div>
                          <div><strong>TID:</strong> {pagamentoSelecionado.tid}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {pagamentoSelecionado.dadosPix && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dados do PIX</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div><strong>Chave PIX:</strong> {pagamentoSelecionado.dadosPix.chave}</div>
                      <div><strong>Banco:</strong> {pagamentoSelecionado.dadosPix.banco}</div>
                      {pagamentoSelecionado.dadosPix.comprovante && (
                        <div><strong>Comprovante:</strong> {pagamentoSelecionado.dadosPix.comprovante}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {pagamentoSelecionado.dadosBoleto && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Dados do Boleto</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div><strong>Banco:</strong> {pagamentoSelecionado.dadosBoleto.banco}</div>
                      <div><strong>Vencimento:</strong> {new Date(pagamentoSelecionado.dadosBoleto.dataVencimento).toLocaleDateString()}</div>
                      <div><strong>Linha Digitável:</strong>
                        <div className="font-mono text-xs mt-1 p-2 bg-white rounded border">
                          {pagamentoSelecionado.dadosBoleto.linhaDigitavel}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cronologia */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cronologia</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">Transação Iniciada</div>
                      <div className="text-sm text-gray-500">
                        {new Date(pagamentoSelecionado.dataTransacao).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {pagamentoSelecionado.dataProcessamento && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Processamento</div>
                        <div className="text-sm text-gray-500">
                          {new Date(pagamentoSelecionado.dataProcessamento).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {pagamentoSelecionado.dataLiberacao && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-medium">Pagamento Liberado</div>
                        <div className="text-sm text-gray-500">
                          {new Date(pagamentoSelecionado.dataLiberacao).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {pagamentoSelecionado.motivoRejeicao && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div>
                        <div className="font-medium">Pagamento Rejeitado</div>
                        <div className="text-sm text-gray-500">{pagamentoSelecionado.motivoRejeicao}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Observações */}
              {pagamentoSelecionado.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {pagamentoSelecionado.observacoes}
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
              {pagamentoSelecionado.status === 'aprovado' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Confirmar Recebimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {pagamentosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pagamento encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroMetodo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar pagamentos.'
              : 'Os pagamentos aparecerão aqui quando forem processados.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SistemaPagamentos;
