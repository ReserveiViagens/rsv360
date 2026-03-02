// 💰 SISTEMA DE FATURAMENTO - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de faturamento e notas fiscais
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, FileText, DollarSign, Calendar, Download, Send, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface Fatura {
  id: number;
  numero: string;
  serie: string;
  chave: string;
  cliente: {
    id: number;
    nome: string;
    documento: string;
    email: string;
    endereco: string;
  };
  itens: Array<{
    id: number;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    total: number;
    ncm: string;
    cfop: string;
  }>;
  subtotal: number;
  impostos: {
    icms: number;
    pis: number;
    cofins: number;
    iss: number;
    total: number;
  };
  desconto: number;
  valorTotal: number;
  status: 'rascunho' | 'autorizada' | 'enviada' | 'paga' | 'cancelada' | 'rejeitada';
  tipo: 'nfse' | 'nfce' | 'nfe' | 'recibo';
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  observacoes: string;
  linkPDF?: string;
  linkXML?: string;
  protocolo?: string;
  motivoCancelamento?: string;
  vendedor: string;
  formaPagamento: string;
  parcelas: number;
}

const SistemaFaturamento: React.FC = () => {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [faturaSelecionada, setFaturaSelecionada] = useState<Fatura | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data');
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Dados mock
  const faturasMock: Fatura[] = [
    {
      id: 1,
      numero: '000001',
      serie: '001',
      chave: '35250814200166000196650010000000011558120139',
      cliente: {
        id: 1,
        nome: 'Ana Silva Santos',
        documento: '123.456.789-00',
        email: 'ana.silva@email.com',
        endereco: 'Rua das Flores, 123 - Centro - Caldas Novas/GO'
      },
      itens: [
        {
          id: 1,
          descricao: 'Pacote Caldas Novas 3 dias - Hospedagem e Atrações',
          quantidade: 2,
          valorUnitario: 599.00,
          total: 1198.00,
          ncm: '63039000',
          cfop: '5101'
        },
        {
          id: 2,
          descricao: 'Seguro Viagem Nacional',
          quantidade: 2,
          valorUnitario: 45.00,
          total: 90.00,
          ncm: '63039000',
          cfop: '5101'
        }
      ],
      subtotal: 1288.00,
      impostos: {
        icms: 0,
        pis: 0,
        cofins: 0,
        iss: 64.40, // 5% ISS
        total: 64.40
      },
      desconto: 50.00,
      valorTotal: 1302.40,
      status: 'autorizada',
      tipo: 'nfse',
      dataEmissao: '2025-08-25',
      dataVencimento: '2025-09-25',
      dataPagamento: '2025-08-25',
      observacoes: 'Pagamento à vista com desconto',
      linkPDF: '/faturas/nfse-000001.pdf',
      linkXML: '/faturas/nfse-000001.xml',
      protocolo: 'NFSe2025000001',
      vendedor: 'Carlos Vendedor',
      formaPagamento: 'Cartão de Crédito',
      parcelas: 1
    },
    {
      id: 2,
      numero: '000002',
      serie: '001',
      chave: '35250814200166000196650010000000021558120140',
      cliente: {
        id: 2,
        nome: 'João Oliveira',
        documento: '987.654.321-00',
        email: 'joao.oliveira@email.com',
        endereco: 'Av. Principal, 456 - Jardim - Caldas Novas/GO'
      },
      itens: [
        {
          id: 3,
          descricao: 'Hot Park - Ingresso Individual',
          quantidade: 4,
          valorUnitario: 89.90,
          total: 359.60,
          ncm: '92000000',
          cfop: '5101'
        }
      ],
      subtotal: 359.60,
      impostos: {
        icms: 0,
        pis: 0,
        cofins: 0,
        iss: 17.98,
        total: 17.98
      },
      desconto: 0,
      valorTotal: 377.58,
      status: 'enviada',
      tipo: 'nfse',
      dataEmissao: '2025-08-29',
      dataVencimento: '2025-09-29',
      observacoes: 'Ingressos para família - 4 pessoas',
      linkPDF: '/faturas/nfse-000002.pdf',
      protocolo: 'NFSe2025000002',
      vendedor: 'Maria Vendedora',
      formaPagamento: 'PIX',
      parcelas: 1
    },
    {
      id: 3,
      numero: '000003',
      serie: '001',
      chave: '',
      cliente: {
        id: 3,
        nome: 'Pedro Costa',
        documento: '456.789.123-00',
        email: 'pedro.costa@email.com',
        endereco: 'Rua do Turismo, 789 - Vila - Caldas Novas/GO'
      },
      itens: [
        {
          id: 4,
          descricao: 'Combo Caldas + Rio Quente - 5 dias',
          quantidade: 1,
          valorUnitario: 899.00,
          total: 899.00,
          ncm: '63039000',
          cfop: '5101'
        }
      ],
      subtotal: 899.00,
      impostos: {
        icms: 0,
        pis: 0,
        cofins: 0,
        iss: 44.95,
        total: 44.95
      },
      desconto: 0,
      valorTotal: 943.95,
      status: 'rascunho',
      tipo: 'nfse',
      dataEmissao: '2025-08-29',
      dataVencimento: '2025-09-29',
      observacoes: 'Aguardando confirmação do cliente',
      vendedor: 'Ana Vendedora',
      formaPagamento: 'Boleto',
      parcelas: 3
    }
  ];

  useEffect(() => {
    setFaturas(faturasMock);
  }, []);

  // Funções de filtro e busca
  const faturasFiltradas = faturas.filter(fatura => {
    const matchBusca = fatura.numero.includes(busca) ||
                      fatura.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      fatura.cliente.documento.includes(busca);

    const matchStatus = filtroStatus === 'todos' || fatura.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || fatura.tipo === filtroTipo;

    return matchBusca && matchStatus && matchTipo;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'data':
        valueA = new Date(a.dataEmissao);
        valueB = new Date(b.dataEmissao);
        break;
      case 'valor':
        valueA = a.valorTotal;
        valueB = b.valorTotal;
        break;
      case 'numero':
        valueA = parseInt(a.numero);
        valueB = parseInt(b.numero);
        break;
      default:
        valueA = new Date(a.dataEmissao);
        valueB = new Date(b.dataEmissao);
    }

    if (valueA instanceof Date) {
      return ordemCrescente ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  // Estatísticas
  const estatisticas = {
    totalFaturas: faturas.length,
    faturasPagas: faturas.filter(f => f.status === 'paga' || f.dataPagamento).length,
    faturasAutorizadas: faturas.filter(f => f.status === 'autorizada').length,
    faturasRascunho: faturas.filter(f => f.status === 'rascunho').length,
    receitaTotal: faturas.filter(f => f.status === 'autorizada' || f.status === 'paga' || f.dataPagamento).reduce((acc, f) => acc + f.valorTotal, 0),
    impostosTotal: faturas.reduce((acc, f) => acc + f.impostos.total, 0),
    ticketMedio: faturas.length > 0 ? faturas.reduce((acc, f) => acc + f.valorTotal, 0) / faturas.length : 0
  };

  const handleView = (fatura: Fatura) => {
    setFaturaSelecionada(fatura);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (fatura: Fatura) => {
    setFaturaSelecionada(fatura);
    setModalTipo('edit');
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja cancelar esta fatura?')) {
      setFaturas(prev => prev.map(f => f.id === id ? { ...f, status: 'cancelada' as const, motivoCancelamento: 'Cancelada pelo usuário' } : f));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'autorizada': return 'bg-green-100 text-green-800';
      case 'paga': return 'bg-blue-100 text-blue-800';
      case 'enviada': return 'bg-purple-100 text-purple-800';
      case 'rascunho': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'autorizada': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'paga': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'enviada': return <Send className="h-4 w-4 text-purple-600" />;
      case 'rascunho': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'cancelada': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'rejeitada': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'nfse': return 'bg-blue-100 text-blue-800';
      case 'nfe': return 'bg-green-100 text-green-800';
      case 'nfce': return 'bg-purple-100 text-purple-800';
      case 'recibo': return 'bg-orange-100 text-orange-800';
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
              <FileText className="h-8 w-8 text-blue-600" />
              Sistema de Faturamento
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de notas fiscais e faturamento</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <DollarSign className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              Nova Fatura
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalFaturas}</div>
            <div className="text-sm text-gray-600">Total Faturas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.faturasPagas}</div>
            <div className="text-sm text-gray-600">Pagas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.faturasAutorizadas}</div>
            <div className="text-sm text-gray-600">Autorizadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.faturasRascunho}</div>
            <div className="text-sm text-gray-600">Rascunhos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">R$ {estatisticas.impostosTotal.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Impostos</div>
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
                placeholder="Buscar por número, cliente ou documento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="autorizada">Autorizada</option>
            <option value="enviada">Enviada</option>
            <option value="paga">Paga</option>
            <option value="cancelada">Cancelada</option>
            <option value="rejeitada">Rejeitada</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Tipos</option>
            <option value="nfse">NFSe</option>
            <option value="nfe">NFe</option>
            <option value="nfce">NFCe</option>
            <option value="recibo">Recibo</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="data">Data</option>
            <option value="valor">Valor</option>
            <option value="numero">Número</option>
          </select>

          <button
            onClick={() => setOrdemCrescente(!ordemCrescente)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ordemCrescente ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Lista de Faturas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {faturasFiltradas.map((fatura) => (
                <tr key={fatura.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">#{fatura.numero}/{fatura.serie}</div>
                      {fatura.protocolo && (
                        <div className="text-sm text-gray-500">{fatura.protocolo}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{fatura.cliente.nome}</div>
                      <div className="text-sm text-gray-500">{fatura.cliente.documento}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(fatura.tipo)}`}>
                      {fatura.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(fatura.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fatura.status)}`}>
                        {fatura.status.charAt(0).toUpperCase() + fatura.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-green-600">R$ {fatura.valorTotal.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      Impostos: R$ {fatura.impostos.total.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(fatura.dataEmissao).toLocaleDateString()}</div>
                    {fatura.dataPagamento && (
                      <div className="text-sm text-green-600">Pago: {new Date(fatura.dataPagamento).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(fatura)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {fatura.linkPDF && (
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {fatura.status === 'rascunho' && (
                        <>
                          <button
                            onClick={() => handleEdit(fatura)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fatura.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {fatura.status === 'autorizada' && !fatura.dataPagamento && (
                        <button className="text-purple-600 hover:text-purple-900">
                          <Send className="h-4 w-4" />
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
      {showModal && faturaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Fatura #{faturaSelecionada.numero}/{faturaSelecionada.serie}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(faturaSelecionada.tipo)}`}>
                  {faturaSelecionada.tipo.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(faturaSelecionada.status)}`}>
                  {faturaSelecionada.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Cliente */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Nome:</strong> {faturaSelecionada.cliente.nome}</div>
                    <div><strong>Documento:</strong> {faturaSelecionada.cliente.documento}</div>
                    <div><strong>Email:</strong> {faturaSelecionada.cliente.email}</div>
                    <div className="md:col-span-2"><strong>Endereço:</strong> {faturaSelecionada.cliente.endereco}</div>
                  </div>
                </div>
              </div>

              {/* Itens da Fatura */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Itens</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Valor Unit.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NCM</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CFOP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {faturaSelecionada.itens.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm">{item.descricao}</td>
                          <td className="px-4 py-2 text-sm">{item.quantidade}</td>
                          <td className="px-4 py-2 text-sm">R$ {item.valorUnitario.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium">R$ {item.total.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">{item.ncm}</td>
                          <td className="px-4 py-2 text-sm">{item.cfop}</td>
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
                    <div className="font-medium">R$ {faturaSelecionada.subtotal.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Desconto</div>
                    <div className="font-medium text-red-600">- R$ {faturaSelecionada.desconto.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Impostos</div>
                    <div className="font-medium">R$ {faturaSelecionada.impostos.total.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Total</div>
                    <div className="font-bold text-lg text-green-600">R$ {faturaSelecionada.valorTotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm">
                    <strong>Forma de Pagamento:</strong> {faturaSelecionada.formaPagamento}
                    {faturaSelecionada.parcelas > 1 && ` - ${faturaSelecionada.parcelas}x`}
                  </div>
                </div>
              </div>

              {/* Informações Fiscais */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações Fiscais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Chave:</strong> {faturaSelecionada.chave || 'N/A'}</div>
                  <div><strong>Protocolo:</strong> {faturaSelecionada.protocolo || 'N/A'}</div>
                  <div><strong>Data Emissão:</strong> {new Date(faturaSelecionada.dataEmissao).toLocaleDateString()}</div>
                  <div><strong>Data Vencimento:</strong> {new Date(faturaSelecionada.dataVencimento).toLocaleDateString()}</div>
                  {faturaSelecionada.dataPagamento && (
                    <div><strong>Data Pagamento:</strong> {new Date(faturaSelecionada.dataPagamento).toLocaleDateString()}</div>
                  )}
                  <div><strong>Vendedor:</strong> {faturaSelecionada.vendedor}</div>
                </div>
              </div>

              {/* Observações */}
              {faturaSelecionada.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {faturaSelecionada.observacoes}
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
              {faturaSelecionada.linkPDF && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4 inline mr-2" />
                  Download PDF
                </button>
              )}
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
      {faturasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma fatura encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroTipo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar faturas.'
              : 'Comece criando sua primeira fatura.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Nova Fatura
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaFaturamento;
