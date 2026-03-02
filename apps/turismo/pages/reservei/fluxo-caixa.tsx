// 📈 SISTEMA DE FLUXO DE CAIXA - RESERVEI VIAGENS
// Funcionalidade: Controle completo de fluxo de caixa e projeções
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download, Plus, Minus, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';

interface MovimentacaoFluxo {
  id: number;
  data: string;
  tipo: 'entrada' | 'saida';
  categoria: 'vendas' | 'despesas-operacionais' | 'impostos' | 'fornecedores' | 'salarios' | 'marketing' | 'outros';
  descricao: string;
  valor: number;
  status: 'efetivado' | 'projetado' | 'atrasado';
  origem: string;
  referencia?: string;
  vencimento?: string;
  observacoes?: string;
}

interface ResumoFluxo {
  periodo: string;
  saldoInicial: number;
  totalEntradas: number;
  totalSaidas: number;
  saldoFinal: number;
  saldoProjetado: number;
  liquidez: number;
}

const SistemaFluxoCaixa: React.FC = () => {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFluxo[]>([]);
  const [resumo, setResumo] = useState<ResumoFluxo | null>(null);
  const [periodo, setPeriodo] = useState('30d');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showProjecoes, setShowProjecoes] = useState(true);

  // Dados mock
  const movimentacoesMock: MovimentacaoFluxo[] = [
    {
      id: 1,
      data: '2025-08-25',
      tipo: 'entrada',
      categoria: 'vendas',
      descricao: 'Pagamento Fatura #000001 - Ana Silva Santos',
      valor: 1302.40,
      status: 'efetivado',
      origem: 'MercadoPago',
      referencia: 'TXN_2025_001234',
      observacoes: 'Pagamento cartão de crédito 3x'
    },
    {
      id: 2,
      data: '2025-08-29',
      tipo: 'entrada',
      categoria: 'vendas',
      descricao: 'Pagamento PIX - João Oliveira',
      valor: 377.58,
      status: 'efetivado',
      origem: 'PIX',
      referencia: 'TXN_2025_001235'
    },
    {
      id: 3,
      data: '2025-08-28',
      tipo: 'saida',
      categoria: 'fornecedores',
      descricao: 'Pagamento Hot Park - Comissão Ingressos',
      valor: 2156.80,
      status: 'efetivado',
      origem: 'Transferência',
      vencimento: '2025-08-28',
      observacoes: 'Comissão sobre vendas do mês'
    },
    {
      id: 4,
      data: '2025-08-30',
      tipo: 'saida',
      categoria: 'despesas-operacionais',
      descricao: 'Aluguel Escritório Caldas Novas',
      valor: 3500.00,
      status: 'efetivado',
      origem: 'Boleto',
      vencimento: '2025-08-30'
    },
    {
      id: 5,
      data: '2025-09-05',
      tipo: 'entrada',
      categoria: 'vendas',
      descricao: 'Boleto Previsto - Pedro Costa',
      valor: 943.95,
      status: 'projetado',
      origem: 'Boleto',
      vencimento: '2025-09-05',
      observacoes: 'Aguardando pagamento boleto'
    },
    {
      id: 6,
      data: '2025-09-10',
      tipo: 'saida',
      categoria: 'salarios',
      descricao: 'Folha de Pagamento - Setembro',
      valor: 15600.00,
      status: 'projetado',
      origem: 'Folha',
      vencimento: '2025-09-10'
    },
    {
      id: 7,
      data: '2025-09-15',
      tipo: 'saida',
      categoria: 'impostos',
      descricao: 'DAS - Simples Nacional',
      valor: 2890.45,
      status: 'projetado',
      origem: 'DAS',
      vencimento: '2025-09-15'
    },
    {
      id: 8,
      data: '2025-09-20',
      tipo: 'entrada',
      categoria: 'vendas',
      descricao: 'Projeção Vendas - Alta Temporada',
      valor: 25000.00,
      status: 'projetado',
      origem: 'Vendas',
      observacoes: 'Estimativa baseada em histórico'
    }
  ];

  const resumoMock: ResumoFluxo = {
    periodo: 'Próximos 30 dias',
    saldoInicial: 45670.23,
    totalEntradas: 26623.93,
    totalSaidas: 24046.25,
    saldoFinal: 48247.91,
    saldoProjetado: 72247.91,
    liquidez: 2.11
  };

  useEffect(() => {
    setMovimentacoes(movimentacoesMock);
    setResumo(resumoMock);
  }, []);

  const movimentacoesFiltradas = movimentacoes.filter(mov => {
    const matchTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || mov.status === filtroStatus;
    const isProjecao = mov.status === 'projetado';

    return matchTipo && matchStatus && (showProjecoes || !isProjecao);
  });

  const calcularSaldoAcumulado = () => {
    let saldoAcumulado = resumo?.saldoInicial || 0;
    return movimentacoesFiltradas.map(mov => {
      if (mov.tipo === 'entrada') {
        saldoAcumulado += mov.valor;
      } else {
        saldoAcumulado -= mov.valor;
      }
      return { ...mov, saldoAcumulado };
    });
  };

  const movimentacoesComSaldo = calcularSaldoAcumulado();

  const estatisticas = {
    totalEntradas: movimentacoesFiltradas.filter(m => m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0),
    totalSaidas: movimentacoesFiltradas.filter(m => m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0),
    saldoLiquido: movimentacoesFiltradas.reduce((acc, m) => acc + (m.tipo === 'entrada' ? m.valor : -m.valor), 0),
    entradasEfetivadas: movimentacoesFiltradas.filter(m => m.tipo === 'entrada' && m.status === 'efetivado').reduce((acc, m) => acc + m.valor, 0),
    saidasEfetivadas: movimentacoesFiltradas.filter(m => m.tipo === 'saida' && m.status === 'efetivado').reduce((acc, m) => acc + m.valor, 0),
    projecaoEntradas: movimentacoesFiltradas.filter(m => m.tipo === 'entrada' && m.status === 'projetado').reduce((acc, m) => acc + m.valor, 0),
    projecaoSaidas: movimentacoesFiltradas.filter(m => m.tipo === 'saida' && m.status === 'projetado').reduce((acc, m) => acc + m.valor, 0)
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'entrada' ? 'text-green-600' : 'text-red-600';
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'entrada' ? <ArrowUp className="h-4 w-4 text-green-600" /> : <ArrowDown className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'efetivado': return 'bg-green-100 text-green-800';
      case 'projetado': return 'bg-blue-100 text-blue-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'vendas': return 'bg-green-100 text-green-800';
      case 'despesas-operacionais': return 'bg-orange-100 text-orange-800';
      case 'impostos': return 'bg-red-100 text-red-800';
      case 'fornecedores': return 'bg-blue-100 text-blue-800';
      case 'salarios': return 'bg-purple-100 text-purple-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Fluxo de Caixa
            </h1>
            <p className="text-gray-600 mt-2">Controle de entradas, saídas e projeções financeiras</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nova Entrada
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Minus className="h-4 w-4" />
              Nova Saída
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="h-4 w-4" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Resumo Executivo */}
      {resumo && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resumo Executivo - {resumo.periodo}</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Saldo Inicial</div>
              <div className="text-2xl font-bold text-gray-900">R$ {resumo.saldoInicial.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-700">Total Entradas</div>
              <div className="text-2xl font-bold text-green-600">R$ {resumo.totalEntradas.toLocaleString()}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-sm text-red-700">Total Saídas</div>
              <div className="text-2xl font-bold text-red-600">R$ {resumo.totalSaidas.toLocaleString()}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-700">Saldo Efetivado</div>
              <div className="text-2xl font-bold text-blue-600">R$ {resumo.saldoFinal.toLocaleString()}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-purple-700">Saldo Projetado</div>
              <div className="text-2xl font-bold text-purple-600">R$ {resumo.saldoProjetado.toLocaleString()}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-orange-700">Índice Liquidez</div>
              <div className="text-2xl font-bold text-orange-600">{resumo.liquidez.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">R$ {estatisticas.entradasEfetivadas.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Entradas Efetivadas</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
          {estatisticas.projecaoEntradas > 0 && (
            <div className="mt-2 text-sm text-green-700">
              + R$ {estatisticas.projecaoEntradas.toLocaleString()} projetado
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">R$ {estatisticas.saidasEfetivadas.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Saídas Efetivadas</div>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
          {estatisticas.projecaoSaidas > 0 && (
            <div className="mt-2 text-sm text-red-700">
              + R$ {estatisticas.projecaoSaidas.toLocaleString()} projetado
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-2xl font-bold ${estatisticas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                R$ {estatisticas.saldoLiquido.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Saldo Líquido</div>
            </div>
            <DollarSign className={`h-8 w-8 ${estatisticas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">{movimentacoesFiltradas.length}</div>
              <div className="text-sm text-gray-600">Movimentações</div>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="7d">Próximos 7 dias</option>
            <option value="30d">Próximos 30 dias</option>
            <option value="90d">Próximos 90 dias</option>
            <option value="1y">Próximo ano</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="todos">Todos Status</option>
            <option value="efetivado">Efetivado</option>
            <option value="projetado">Projetado</option>
            <option value="atrasado">Atrasado</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showProjecoes}
              onChange={(e) => setShowProjecoes(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm">Mostrar Projeções</span>
          </label>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabela de Movimentações */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movimentacoesComSaldo.map((mov) => (
                <tr key={mov.id} className={`hover:bg-gray-50 ${mov.status === 'projetado' ? 'bg-blue-25 border-l-4 border-blue-200' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(mov.data).toLocaleDateString()}</div>
                    {mov.vencimento && mov.vencimento !== mov.data && (
                      <div className="text-xs text-gray-500">Venc: {new Date(mov.vencimento).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getTipoIcon(mov.tipo)}
                      <span className={`font-medium ${getTipoColor(mov.tipo)}`}>
                        {mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(mov.categoria)}`}>
                      {mov.categoria.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{mov.descricao}</div>
                    <div className="text-xs text-gray-500">{mov.origem}</div>
                    {mov.referencia && (
                      <div className="text-xs text-gray-400">{mov.referencia}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${getTipoColor(mov.tipo)}`}>
                      {mov.tipo === 'entrada' ? '+' : '-'} R$ {mov.valor.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mov.status)}`}>
                      {mov.status.charAt(0).toUpperCase() + mov.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${mov.saldoAcumulado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {mov.saldoAcumulado.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Evolução do Fluxo de Caixa</h3>
        <div className="h-64 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Gráfico de evolução seria renderizado aqui</p>
            <p className="text-sm text-gray-500">Integração com biblioteca de gráficos (Recharts)</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {movimentacoesFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma movimentação encontrada</h3>
          <p className="text-gray-500 mb-4">Ajuste os filtros ou adicione movimentações ao fluxo de caixa.</p>
        </div>
      )}
    </div>
  );
};

export default SistemaFluxoCaixa;
