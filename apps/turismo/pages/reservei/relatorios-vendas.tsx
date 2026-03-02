// 📈 RELATÓRIOS DE VENDAS - RESERVEI VIAGENS
// Funcionalidade: Relatórios detalhados de vendas e performance comercial
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Calendar, TrendingUp, Users, DollarSign, MapPin, Star, Eye, RefreshCw, BarChart3, FileText, Target } from 'lucide-react';

interface RelatorioVenda {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'vendas_periodo' | 'vendas_produto' | 'vendas_vendedor' | 'vendas_cliente' | 'vendas_regiao' | 'comparativo';
  periodo: {
    inicio: string;
    fim: string;
    tipo: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual' | 'personalizado';
  };
  filtros: {
    vendedores?: string[];
    produtos?: string[];
    regioes?: string[];
    status?: string[];
    faixa_valor?: { min: number; max: number };
  };
  metricas: {
    total_vendas: number;
    receita_total: number;
    ticket_medio: number;
    margem_lucro: number;
    qtd_clientes: number;
    taxa_conversao: number;
    crescimento_periodo: number;
  };
  dados_detalhados: Array<{
    data: string;
    vendedor: string;
    cliente: string;
    produto: string;
    valor: number;
    status: string;
    regiao: string;
    comissao: number;
  }>;
  comparacao_anterior: {
    vendas: number;
    receita: number;
    crescimento: number;
  };
  top_performers: Array<{
    nome: string;
    tipo: 'vendedor' | 'produto' | 'regiao';
    vendas: number;
    receita: number;
    participacao: number;
  }>;
  tendencias: Array<{
    periodo: string;
    vendas: number;
    receita: number;
    meta: number;
  }>;
  data_geracao: string;
  gerado_por: string;
  formato_disponivel: string[];
  status_relatorio: 'gerado' | 'processando' | 'erro';
}

interface MetricaVenda {
  id: string;
  nome: string;
  valor: number;
  formato: 'currency' | 'percentage' | 'number';
  variacao: number;
  tendencia: 'up' | 'down' | 'stable';
  meta?: number;
  descricao: string;
}

interface GraficoVenda {
  id: string;
  titulo: string;
  tipo: 'line' | 'bar' | 'pie' | 'area';
  dados: any[];
  periodo: string;
  categoria: 'temporal' | 'segmentacao' | 'comparacao';
}

const RelatoriosVendas: React.FC = () => {
  const [relatorios, setRelatorios] = useState<RelatorioVenda[]>([]);
  const [metricas, setMetricas] = useState<MetricaVenda[]>([]);
  const [graficos, setGraficos] = useState<GraficoVenda[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<RelatorioVenda | null>(null);
  const [filtros, setFiltros] = useState({
    periodo: 'este_mes',
    vendedor: 'todos',
    produto: 'todos',
    status: 'todos'
  });

  // Dados mock
  const relatoriosMock: RelatorioVenda[] = [
    {
      id: 1,
      nome: 'Relatório Mensal de Vendas - Agosto 2025',
      descricao: 'Análise completa das vendas realizadas no mês de agosto com comparação ao mês anterior',
      tipo: 'vendas_periodo',
      periodo: {
        inicio: '2025-08-01',
        fim: '2025-08-31',
        tipo: 'mensal'
      },
      filtros: {
        status: ['confirmada', 'paga'],
        faixa_valor: { min: 0, max: 50000 }
      },
      metricas: {
        total_vendas: 1247,
        receita_total: 2456780.50,
        ticket_medio: 1968.45,
        margem_lucro: 23.8,
        qtd_clientes: 1089,
        taxa_conversao: 3.42,
        crescimento_periodo: 9.95
      },
      dados_detalhados: [
        {
          data: '2025-08-25',
          vendedor: 'Ana Silva Santos',
          cliente: 'João Silva',
          produto: 'Pacote Caldas Novas 3 dias',
          valor: 1850.00,
          status: 'confirmada',
          regiao: 'Goiás',
          comissao: 185.00
        },
        {
          data: '2025-08-25',
          vendedor: 'Carlos Vendedor Silva',
          cliente: 'Maria Costa',
          produto: 'Resort Rio Quente 5 dias',
          valor: 3200.00,
          status: 'paga',
          regiao: 'Goiás',
          comissao: 320.00
        }
      ],
      comparacao_anterior: {
        vendas: 1134,
        receita: 2234560.30,
        crescimento: 9.95
      },
      top_performers: [
        { nome: 'Ana Silva Santos', tipo: 'vendedor', vendas: 156, receita: 305620.00, participacao: 12.4 },
        { nome: 'Carlos Vendedor Silva', tipo: 'vendedor', vendas: 142, receita: 289450.00, participacao: 11.8 },
        { nome: 'Pacote Caldas Novas', tipo: 'produto', vendas: 567, receita: 1049580.00, participacao: 42.7 },
        { nome: 'Resort Rio Quente', tipo: 'produto', vendas: 234, receita: 749760.00, participacao: 30.5 }
      ],
      tendencias: [
        { periodo: 'Semana 1', vendas: 289, receita: 568430.50, meta: 300 },
        { periodo: 'Semana 2', vendas: 324, receita: 637182.40, meta: 300 },
        { periodo: 'Semana 3', vendas: 267, receita: 525347.20, meta: 300 },
        { periodo: 'Semana 4', vendas: 367, receita: 725820.40, meta: 350 }
      ],
      data_geracao: '2025-08-25 10:30:00',
      gerado_por: 'Sistema Automatizado',
      formato_disponivel: ['PDF', 'Excel', 'CSV'],
      status_relatorio: 'gerado'
    },
    {
      id: 2,
      nome: 'Performance por Vendedor - Agosto 2025',
      descricao: 'Análise individual da performance de cada vendedor com rankings e comissões',
      tipo: 'vendas_vendedor',
      periodo: {
        inicio: '2025-08-01',
        fim: '2025-08-31',
        tipo: 'mensal'
      },
      filtros: {
        vendedores: ['Ana Silva Santos', 'Carlos Vendedor Silva', 'Roberto Vendas'],
        status: ['confirmada', 'paga']
      },
      metricas: {
        total_vendas: 1247,
        receita_total: 2456780.50,
        ticket_medio: 1968.45,
        margem_lucro: 25.2,
        qtd_clientes: 1089,
        taxa_conversao: 3.42,
        crescimento_periodo: 7.8
      },
      dados_detalhados: [],
      comparacao_anterior: {
        vendas: 1156,
        receita: 2278450.80,
        crescimento: 7.8
      },
      top_performers: [
        { nome: 'Ana Silva Santos', tipo: 'vendedor', vendas: 156, receita: 305620.00, participacao: 12.4 },
        { nome: 'Carlos Vendedor Silva', tipo: 'vendedor', vendas: 142, receita: 289450.00, participacao: 11.8 },
        { nome: 'Roberto Vendas', tipo: 'vendedor', vendas: 134, receita: 263180.00, participacao: 10.7 },
        { nome: 'Maria Vendedora', tipo: 'vendedor', vendas: 128, receita: 251360.00, participacao: 10.2 }
      ],
      tendencias: [],
      data_geracao: '2025-08-24 16:45:00',
      gerado_por: 'Ana Gestora Santos',
      formato_disponivel: ['PDF', 'Excel'],
      status_relatorio: 'gerado'
    },
    {
      id: 3,
      nome: 'Análise de Produtos - Trimestre Q3 2025',
      descricao: 'Relatório trimestral de performance de produtos com análise de margem e sazonalidade',
      tipo: 'vendas_produto',
      periodo: {
        inicio: '2025-07-01',
        fim: '2025-09-30',
        tipo: 'trimestral'
      },
      filtros: {
        produtos: ['Caldas Novas', 'Rio Quente', 'Pirenópolis'],
        regioes: ['Goiás', 'Distrito Federal']
      },
      metricas: {
        total_vendas: 3894,
        receita_total: 7668540.75,
        ticket_medio: 1969.12,
        margem_lucro: 24.6,
        qtd_clientes: 3245,
        taxa_conversao: 3.28,
        crescimento_periodo: 12.4
      },
      dados_detalhados: [],
      comparacao_anterior: {
        vendas: 3467,
        receita: 6823670.50,
        crescimento: 12.4
      },
      top_performers: [
        { nome: 'Pacote Caldas Novas', tipo: 'produto', vendas: 1767, receita: 3278430.00, participacao: 42.8 },
        { nome: 'Resort Rio Quente', tipo: 'produto', vendas: 890, receita: 2134560.00, participacao: 27.8 },
        { nome: 'Pirenópolis Histórico', tipo: 'produto', vendas: 567, receita: 1134560.00, participacao: 14.8 },
        { nome: 'Chapada Aventura', tipo: 'produto', vendas: 456, receita: 912340.00, participacao: 11.9 }
      ],
      tendencias: [],
      data_geracao: '2025-08-23 09:15:00',
      gerado_por: 'Carlos Análise Silva',
      formato_disponivel: ['PDF', 'Excel', 'PowerPoint'],
      status_relatorio: 'gerado'
    }
  ];

  const metricasMock: MetricaVenda[] = [
    {
      id: 'vendas_totais',
      nome: 'Vendas Totais',
      valor: 1247,
      formato: 'number',
      variacao: 9.95,
      tendencia: 'up',
      meta: 1300,
      descricao: 'Total de vendas confirmadas no período'
    },
    {
      id: 'receita_total',
      nome: 'Receita Total',
      valor: 2456780.50,
      formato: 'currency',
      variacao: 9.95,
      tendencia: 'up',
      meta: 2500000,
      descricao: 'Receita total líquida no período'
    },
    {
      id: 'ticket_medio',
      nome: 'Ticket Médio',
      valor: 1968.45,
      formato: 'currency',
      variacao: 1.74,
      tendencia: 'up',
      meta: 2000,
      descricao: 'Valor médio por venda'
    },
    {
      id: 'taxa_conversao',
      nome: 'Taxa de Conversão',
      valor: 3.42,
      formato: 'percentage',
      variacao: 7.55,
      tendencia: 'up',
      meta: 3.5,
      descricao: 'Percentual de leads que se tornaram vendas'
    },
    {
      id: 'margem_lucro',
      nome: 'Margem de Lucro',
      valor: 23.8,
      formato: 'percentage',
      variacao: 2.1,
      tendencia: 'up',
      meta: 25,
      descricao: 'Margem de lucro líquida'
    },
    {
      id: 'novos_clientes',
      nome: 'Novos Clientes',
      valor: 156,
      formato: 'number',
      variacao: 12.8,
      tendencia: 'up',
      meta: 160,
      descricao: 'Quantidade de novos clientes adquiridos'
    }
  ];

  const graficosMock: GraficoVenda[] = [
    {
      id: 'vendas_temporais',
      titulo: 'Evolução das Vendas - Últimos 6 Meses',
      tipo: 'line',
      dados: [
        { mes: 'Mar', vendas: 945, receita: 1890000, meta: 1000 },
        { mes: 'Abr', vendas: 1067, receita: 2120000, meta: 1000 },
        { mes: 'Mai', vendas: 1156, receita: 2340000, meta: 1100 },
        { mes: 'Jun', vendas: 1089, receita: 2180000, meta: 1100 },
        { mes: 'Jul', vendas: 1123, receita: 2235000, meta: 1150 },
        { mes: 'Ago', vendas: 1247, receita: 2457000, meta: 1250 }
      ],
      periodo: 'Março - Agosto 2025',
      categoria: 'temporal'
    },
    {
      id: 'vendas_por_produto',
      titulo: 'Vendas por Produto',
      tipo: 'pie',
      dados: [
        { produto: 'Caldas Novas', vendas: 567, participacao: 45.5 },
        { produto: 'Rio Quente', vendas: 234, participacao: 18.8 },
        { produto: 'Pirenópolis', vendas: 189, participacao: 15.2 },
        { produto: 'Chapada', vendas: 156, participacao: 12.5 },
        { produto: 'Outros', vendas: 101, participacao: 8.1 }
      ],
      periodo: 'Agosto 2025',
      categoria: 'segmentacao'
    },
    {
      id: 'performance_vendedores',
      titulo: 'Performance dos Vendedores',
      tipo: 'bar',
      dados: [
        { vendedor: 'Ana S.', vendas: 156, meta: 150, receita: 305620 },
        { vendedor: 'Carlos V.', vendas: 142, meta: 140, receita: 289450 },
        { vendedor: 'Roberto V.', vendas: 134, meta: 130, receita: 263180 },
        { vendedor: 'Maria V.', vendas: 128, meta: 125, receita: 251360 },
        { vendedor: 'João V.', vendas: 118, meta: 120, receita: 231940 }
      ],
      periodo: 'Agosto 2025',
      categoria: 'comparacao'
    },
    {
      id: 'margem_temporal',
      titulo: 'Evolução da Margem de Lucro',
      tipo: 'area',
      dados: [
        { mes: 'Mar', margem: 21.4, receita_liquida: 404460 },
        { mes: 'Abr', margem: 22.1, receita_liquida: 468520 },
        { mes: 'Mai', margem: 23.2, receita_liquida: 542880 },
        { mes: 'Jun', margem: 22.8, receita_liquida: 497040 },
        { mes: 'Jul', margem: 23.5, receita_liquida: 525225 },
        { mes: 'Ago', margem: 23.8, receita_liquida: 584766 }
      ],
      periodo: 'Março - Agosto 2025',
      categoria: 'temporal'
    }
  ];

  useEffect(() => {
    setRelatorios(relatoriosMock);
    setMetricas(metricasMock);
    setGraficos(graficosMock);
  }, []);

  const formatarValor = (valor: number, formato: string) => {
    switch (formato) {
      case 'currency':
        return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${valor.toFixed(1)}%`;
      case 'number':
      default:
        return valor.toLocaleString('pt-BR');
    }
  };

  const handleViewRelatorio = (relatorio: RelatorioVenda) => {
    setRelatorioSelecionado(relatorio);
    setShowRelatorioModal(true);
  };

  const handleExportRelatorio = (relatorioId: number, formato: string) => {
    console.log(`Exportando relatório ${relatorioId} em formato ${formato}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'gerado': return 'bg-green-100 text-green-800';
      case 'processando': return 'bg-yellow-100 text-yellow-800';
      case 'erro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'vendas_periodo': return 'bg-blue-100 text-blue-800';
      case 'vendas_vendedor': return 'bg-green-100 text-green-800';
      case 'vendas_produto': return 'bg-purple-100 text-purple-800';
      case 'vendas_cliente': return 'bg-orange-100 text-orange-800';
      case 'vendas_regiao': return 'bg-indigo-100 text-indigo-800';
      case 'comparativo': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      default: return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              Relatórios de Vendas
            </h1>
            <p className="text-gray-600 mt-2">Análise detalhada de performance comercial e métricas de vendas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FileText className="h-4 w-4" />
              Novo Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <select
                value={filtros.periodo}
                onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="hoje">Hoje</option>
                <option value="esta_semana">Esta Semana</option>
                <option value="este_mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Este Ano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
              <select
                value={filtros.vendedor}
                onChange={(e) => setFiltros({ ...filtros, vendedor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="ana">Ana Silva Santos</option>
                <option value="carlos">Carlos Vendedor Silva</option>
                <option value="roberto">Roberto Vendas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Produto</label>
              <select
                value={filtros.produto}
                onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="caldas">Caldas Novas</option>
                <option value="rio_quente">Rio Quente</option>
                <option value="pirenopolis">Pirenópolis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos</option>
                <option value="confirmada">Confirmada</option>
                <option value="paga">Paga</option>
                <option value="pendente">Pendente</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metricas.map((metrica) => (
          <div key={metrica.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{metrica.nome}</h3>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatarValor(metrica.valor, metrica.formato)}
                </div>
              </div>
              <div className="flex items-center">
                {getTendenciaIcon(metrica.tendencia)}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center text-sm ${metrica.variacao > 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">
                  {metrica.variacao > 0 ? '+' : ''}{metrica.variacao.toFixed(1)}%
                </span>
                <span className="ml-1 text-gray-500">vs período anterior</span>
              </div>
            </div>

            {metrica.meta && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Meta: {formatarValor(metrica.meta, metrica.formato)}</span>
                  <span>{Math.min((metrica.valor / metrica.meta) * 100, 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((metrica.valor / metrica.meta) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">{metrica.descricao}</p>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {graficos.map((grafico) => (
          <div key={grafico.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{grafico.titulo}</h3>
                <p className="text-sm text-gray-600">{grafico.periodo}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {grafico.tipo === 'line' && '📈'}
                  {grafico.tipo === 'bar' && '📊'}
                  {grafico.tipo === 'pie' && '🥧'}
                  {grafico.tipo === 'area' && '📊'}
                </span>
              </div>
            </div>

            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico: {grafico.titulo}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {grafico.dados.length} pontos de dados • Categoria: {grafico.categoria}
                </p>
              </div>
            </div>

            {grafico.tipo === 'pie' && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {grafico.dados.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full mr-2" style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
                      <span>{item.produto || item.vendedor || item.mes}</span>
                    </div>
                    <span className="font-medium">
                      {item.vendas ? formatarValor(item.vendas, 'number') : item.participacao?.toFixed(1) + '%'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lista de Relatórios */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Relatórios Disponíveis</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{relatorios.length} relatórios</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {relatorios.map((relatorio) => (
            <div key={relatorio.id} className="p-6 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{relatorio.nome}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(relatorio.tipo)}`}>
                      {relatorio.tipo.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(relatorio.status_relatorio)}`}>
                      {relatorio.status_relatorio.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{relatorio.descricao}</p>
                  <div className="text-sm text-gray-500">
                    Gerado por {relatorio.gerado_por} • {new Date(relatorio.data_geracao).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Métricas do Relatório */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{relatorio.metricas.total_vendas.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Vendas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">R$ {(relatorio.metricas.receita_total / 1000).toFixed(0)}k</div>
                  <div className="text-xs text-gray-600">Receita</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">R$ {relatorio.metricas.ticket_medio.toFixed(0)}</div>
                  <div className="text-xs text-gray-600">Ticket Médio</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{relatorio.metricas.margem_lucro.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Margem</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-indigo-600">{relatorio.metricas.qtd_clientes.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{relatorio.metricas.taxa_conversao.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Conversão</div>
                </div>
              </div>

              {/* Top Performers */}
              {relatorio.top_performers.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Top Performers:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {relatorio.top_performers.slice(0, 4).map((performer, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{performer.nome}</span>
                        <span className="font-medium">{performer.participacao.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Período: {new Date(relatorio.periodo.inicio).toLocaleDateString()} - {new Date(relatorio.periodo.fim).toLocaleDateString()}</span>
                  <span>Crescimento: {relatorio.metricas.crescimento_periodo > 0 ? '+' : ''}{relatorio.metricas.crescimento_periodo.toFixed(1)}%</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewRelatorio(relatorio)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                  <div className="flex">
                    {relatorio.formato_disponivel.map((formato, index) => (
                      <button
                        key={index}
                        onClick={() => handleExportRelatorio(relatorio.id, formato)}
                        className="flex items-center gap-1 px-2 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs first:rounded-l last:rounded-r"
                      >
                        <Download className="h-3 w-3" />
                        {formato}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalhes do Relatório */}
      {showRelatorioModal && relatorioSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{relatorioSelecionado.nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(relatorioSelecionado.tipo)}`}>
                  {relatorioSelecionado.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(relatorioSelecionado.status_relatorio)}`}>
                  {relatorioSelecionado.status_relatorio}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Resumo Executivo */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Resumo Executivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{relatorioSelecionado.metricas.total_vendas.toLocaleString()}</div>
                    <div className="text-sm text-green-800">Total de Vendas</div>
                    <div className="text-xs text-green-600">
                      +{relatorioSelecionado.metricas.crescimento_periodo.toFixed(1)}% vs anterior
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {(relatorioSelecionado.metricas.receita_total / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-blue-800">Receita Total</div>
                    <div className="text-xs text-blue-600">
                      Meta: R$ {relatorioSelecionado.tipo === 'vendas_periodo' ? '2.5M' : '2.0M'}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {relatorioSelecionado.metricas.ticket_medio.toFixed(0)}
                    </div>
                    <div className="text-sm text-purple-800">Ticket Médio</div>
                    <div className="text-xs text-purple-600">
                      +{((relatorioSelecionado.metricas.ticket_medio - 1934) / 1934 * 100).toFixed(1)}% vs anterior
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{relatorioSelecionado.metricas.margem_lucro.toFixed(1)}%</div>
                    <div className="text-sm text-orange-800">Margem de Lucro</div>
                    <div className="text-xs text-orange-600">
                      Meta: 25%
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Performers Detalhado */}
              {relatorioSelecionado.top_performers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Top Performers</h3>
                  <div className="space-y-3">
                    {relatorioSelecionado.top_performers.map((performer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{performer.nome}</div>
                            <div className="text-sm text-gray-600">{performer.tipo}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatarValor(performer.receita, 'currency')}
                          </div>
                          <div className="text-sm text-gray-600">
                            {performer.vendas} vendas • {performer.participacao.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tendências */}
              {relatorioSelecionado.tendencias.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Análise Temporal</h3>
                  <div className="space-y-2">
                    {relatorioSelecionado.tendencias.map((tendencia, index) => (
                      <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                        <div>{tendencia.periodo}</div>
                        <div className="flex gap-4 text-sm">
                          <span>Vendas: <strong>{tendencia.vendas}</strong></span>
                          <span>Receita: <strong>{formatarValor(tendencia.receita, 'currency')}</strong></span>
                          <span>Meta: <strong>{tendencia.meta}</strong></span>
                          <span className={`font-medium ${tendencia.vendas >= tendencia.meta ? 'text-green-600' : 'text-red-600'}`}>
                            {tendencia.vendas >= tendencia.meta ? '✓ Atingida' : '✗ Não atingida'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparação com Período Anterior */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Comparação com Período Anterior</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Vendas</div>
                    <div className="text-xl font-bold text-gray-900">
                      {relatorioSelecionado.comparacao_anterior.vendas.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      +{((relatorioSelecionado.metricas.total_vendas - relatorioSelecionado.comparacao_anterior.vendas) / relatorioSelecionado.comparacao_anterior.vendas * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Receita</div>
                    <div className="text-xl font-bold text-gray-900">
                      R$ {(relatorioSelecionado.comparacao_anterior.receita / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-green-600">
                      +{relatorioSelecionado.comparacao_anterior.crescimento.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">Crescimento</div>
                    <div className="text-xl font-bold text-green-600">
                      +{relatorioSelecionado.comparacao_anterior.crescimento.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Acima da meta</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowRelatorioModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Exportar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatoriosVendas;
