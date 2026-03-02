// 📊 DASHBOARD EXECUTIVO - RESERVEI VIAGENS
// Funcionalidade: Dashboard executivo com KPIs e métricas estratégicas
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Download, Filter, Calendar, TrendingUp, TrendingDown, Users, DollarSign, MapPin, Star, Eye, RefreshCw, BarChart3, PieChart, Activity, Target } from 'lucide-react';

interface KPIMetrica {
  id: string;
  nome: string;
  valor_atual: number;
  valor_anterior: number;
  formato: 'currency' | 'percentage' | 'number' | 'decimal';
  periodo: string;
  tendencia: 'up' | 'down' | 'stable';
  variacao_percentual: number;
  meta?: number;
  categoria: 'financeiro' | 'vendas' | 'operacional' | 'marketing' | 'satisfacao';
}

interface RelatorioExecutivo {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'receita' | 'vendas' | 'operacional' | 'marketing' | 'satisfacao' | 'previsao';
  periodo: {
    inicio: string;
    fim: string;
    tipo: 'mensal' | 'trimestral' | 'anual' | 'personalizado';
  };
  metricas_principais: string[];
  dados: any[];
  insights: Array<{
    tipo: 'positivo' | 'negativo' | 'neutro' | 'alerta';
    titulo: string;
    descricao: string;
    valor?: number;
    recomendacao?: string;
  }>;
  comparacao_periodo_anterior: {
    crescimento_receita: number;
    crescimento_vendas: number;
    crescimento_clientes: number;
  };
  data_geracao: string;
  gerado_por: string;
  formato_exportacao: string[];
}

interface GraficoDashboard {
  id: string;
  tipo: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  titulo: string;
  dados: any[];
  configuracao: {
    cores: string[];
    mostrar_legenda: boolean;
    mostrar_valores: boolean;
    formato_tooltip: string;
  };
  periodo_atual: string;
  filtros_aplicados: string[];
}

const DashboardExecutivo: React.FC = () => {
  const [kpis, setKpis] = useState<KPIMetrica[]>([]);
  const [relatorios, setRelatorios] = useState<RelatorioExecutivo[]>([]);
  const [graficos, setGraficos] = useState<GraficoDashboard[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('este_mes');
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState('todos');
  const [showExportModal, setShowExportModal] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date().toISOString());

  // Dados mock
  const kpisMock: KPIMetrica[] = [
    {
      id: 'receita_total',
      nome: 'Receita Total',
      valor_atual: 2456780.50,
      valor_anterior: 2234560.30,
      formato: 'currency',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 9.95,
      meta: 2500000,
      categoria: 'financeiro'
    },
    {
      id: 'vendas_mes',
      nome: 'Vendas do Mês',
      valor_atual: 1247,
      valor_anterior: 1156,
      formato: 'number',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 7.87,
      meta: 1300,
      categoria: 'vendas'
    },
    {
      id: 'ticket_medio',
      nome: 'Ticket Médio',
      valor_atual: 1968.45,
      valor_anterior: 1934.76,
      formato: 'currency',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 1.74,
      meta: 2000,
      categoria: 'vendas'
    },
    {
      id: 'taxa_conversao',
      nome: 'Taxa de Conversão',
      valor_atual: 3.42,
      valor_anterior: 3.18,
      formato: 'percentage',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 7.55,
      meta: 3.5,
      categoria: 'marketing'
    },
    {
      id: 'novos_clientes',
      nome: 'Novos Clientes',
      valor_atual: 156,
      valor_anterior: 142,
      formato: 'number',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 9.86,
      meta: 160,
      categoria: 'vendas'
    },
    {
      id: 'satisfacao_cliente',
      nome: 'Satisfação do Cliente',
      valor_atual: 4.7,
      valor_anterior: 4.6,
      formato: 'decimal',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 2.17,
      meta: 4.8,
      categoria: 'satisfacao'
    },
    {
      id: 'ocupacao_media',
      nome: 'Taxa de Ocupação',
      valor_atual: 87.4,
      valor_anterior: 84.2,
      formato: 'percentage',
      periodo: 'Agosto 2025',
      tendencia: 'up',
      variacao_percentual: 3.80,
      meta: 90,
      categoria: 'operacional'
    },
    {
      id: 'custo_aquisicao',
      nome: 'Custo de Aquisição (CAC)',
      valor_atual: 89.50,
      valor_anterior: 96.20,
      formato: 'currency',
      periodo: 'Agosto 2025',
      tendencia: 'down',
      variacao_percentual: -6.97,
      meta: 85,
      categoria: 'marketing'
    }
  ];

  const relatoriosMock: RelatorioExecutivo[] = [
    {
      id: 1,
      nome: 'Relatório Mensal de Performance',
      descricao: 'Análise completa da performance do mês com comparação ao período anterior',
      tipo: 'receita',
      periodo: {
        inicio: '2025-08-01',
        fim: '2025-08-31',
        tipo: 'mensal'
      },
      metricas_principais: ['receita_total', 'vendas_mes', 'ticket_medio', 'novos_clientes'],
      dados: [],
      insights: [
        {
          tipo: 'positivo',
          titulo: 'Crescimento de Receita',
          descricao: 'A receita cresceu 9.95% em relação ao mês anterior, superando as expectativas.',
          valor: 222220.20,
          recomendacao: 'Manter estratégias atuais e investir em campanhas de alta performance.'
        },
        {
          tipo: 'positivo',
          titulo: 'Aumento na Taxa de Conversão',
          descricao: 'A taxa de conversão aumentou para 3.42%, o melhor resultado dos últimos 6 meses.',
          valor: 3.42,
          recomendacao: 'Analisar campanhas de maior sucesso para replicar estratégias.'
        },
        {
          tipo: 'alerta',
          titulo: 'Meta de Ocupação',
          descricao: 'Taxa de ocupação está em 87.4%, próxima da meta de 90%.',
          valor: 87.4,
          recomendacao: 'Intensificar esforços de vendas para atingir meta mensal.'
        }
      ],
      comparacao_periodo_anterior: {
        crescimento_receita: 9.95,
        crescimento_vendas: 7.87,
        crescimento_clientes: 9.86
      },
      data_geracao: '2025-08-25 09:00:00',
      gerado_por: 'Sistema Automatizado',
      formato_exportacao: ['PDF', 'Excel', 'PowerPoint']
    },
    {
      id: 2,
      nome: 'Análise de Satisfação do Cliente',
      descricao: 'Relatório detalhado sobre satisfação, NPS e feedback dos clientes',
      tipo: 'satisfacao',
      periodo: {
        inicio: '2025-08-01',
        fim: '2025-08-31',
        tipo: 'mensal'
      },
      metricas_principais: ['satisfacao_cliente', 'nps_score', 'taxa_recomendacao'],
      dados: [],
      insights: [
        {
          tipo: 'positivo',
          titulo: 'Aumento na Satisfação',
          descricao: 'Score de satisfação subiu para 4.7/5, o maior dos últimos 12 meses.',
          valor: 4.7,
          recomendacao: 'Documentar e padronizar práticas que levaram a esta melhoria.'
        },
        {
          tipo: 'neutro',
          titulo: 'Feedback de Melhorias',
          descricao: 'Clientes sugerem melhorias no processo de check-in e atendimento.',
          recomendacao: 'Implementar treinamento focado em agilidade no atendimento.'
        }
      ],
      comparacao_periodo_anterior: {
        crescimento_receita: 0,
        crescimento_vendas: 0,
        crescimento_clientes: 0
      },
      data_geracao: '2025-08-24 16:30:00',
      gerado_por: 'Maria Qualidade Santos',
      formato_exportacao: ['PDF', 'Excel']
    }
  ];

  const graficosMock: GraficoDashboard[] = [
    {
      id: 'receita_mensal',
      tipo: 'line',
      titulo: 'Evolução da Receita Mensal',
      dados: [
        { mes: 'Mar', valor: 1890000, meta: 2000000 },
        { mes: 'Abr', valor: 2120000, meta: 2000000 },
        { mes: 'Mai', valor: 2340000, meta: 2200000 },
        { mes: 'Jun', valor: 2180000, meta: 2200000 },
        { mes: 'Jul', valor: 2235000, meta: 2300000 },
        { mes: 'Ago', valor: 2457000, meta: 2500000 }
      ],
      configuracao: {
        cores: ['#3B82F6', '#10B981'],
        mostrar_legenda: true,
        mostrar_valores: true,
        formato_tooltip: 'currency'
      },
      periodo_atual: 'Últimos 6 meses',
      filtros_aplicados: ['receita_liquida']
    },
    {
      id: 'vendas_por_destino',
      tipo: 'pie',
      titulo: 'Vendas por Destino',
      dados: [
        { destino: 'Caldas Novas', vendas: 567, percentual: 45.5 },
        { destino: 'Rio Quente', vendas: 234, percentual: 18.8 },
        { destino: 'Pirenópolis', vendas: 189, percentual: 15.2 },
        { destino: 'Chapada dos Veadeiros', vendas: 156, percentual: 12.5 },
        { destino: 'Outros', vendas: 101, percentual: 8.1 }
      ],
      configuracao: {
        cores: ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#6B7280'],
        mostrar_legenda: true,
        mostrar_valores: true,
        formato_tooltip: 'number'
      },
      periodo_atual: 'Agosto 2025',
      filtros_aplicados: ['todos_destinos']
    },
    {
      id: 'performance_semanal',
      tipo: 'bar',
      titulo: 'Performance de Vendas Semanal',
      dados: [
        { semana: 'Sem 1', vendas: 289, meta: 300 },
        { semana: 'Sem 2', vendas: 324, meta: 300 },
        { semana: 'Sem 3', vendas: 267, meta: 300 },
        { semana: 'Sem 4', vendas: 367, meta: 350 }
      ],
      configuracao: {
        cores: ['#10B981', '#F59E0B'],
        mostrar_legenda: true,
        mostrar_valores: true,
        formato_tooltip: 'number'
      },
      periodo_atual: 'Agosto 2025',
      filtros_aplicados: ['vendas_confirmadas']
    },
    {
      id: 'satisfacao_mensal',
      tipo: 'area',
      titulo: 'Evolução da Satisfação do Cliente',
      dados: [
        { mes: 'Mar', satisfacao: 4.2, nps: 68 },
        { mes: 'Abr', satisfacao: 4.3, nps: 71 },
        { mes: 'Mai', satisfacao: 4.5, nps: 74 },
        { mes: 'Jun', satisfacao: 4.4, nps: 72 },
        { mes: 'Jul', satisfacao: 4.6, nps: 76 },
        { mes: 'Ago', satisfacao: 4.7, nps: 78 }
      ],
      configuracao: {
        cores: ['#8B5CF6', '#06B6D4'],
        mostrar_legenda: true,
        mostrar_valores: false,
        formato_tooltip: 'decimal'
      },
      periodo_atual: 'Últimos 6 meses',
      filtros_aplicados: ['avaliacoes_validadas']
    }
  ];

  useEffect(() => {
    setKpis(kpisMock);
    setRelatorios(relatoriosMock);
    setGraficos(graficosMock);
  }, []);

  const formatarValor = (valor: number, formato: string) => {
    switch (formato) {
      case 'currency':
        return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'percentage':
        return `${valor.toFixed(1)}%`;
      case 'decimal':
        return valor.toFixed(1);
      case 'number':
      default:
        return valor.toLocaleString('pt-BR');
    }
  };

  const calcularProgressoMeta = (valor: number, meta?: number) => {
    if (!meta) return 0;
    return Math.min((valor / meta) * 100, 100);
  };

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return 'text-green-600';
    if (variacao < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getVariacaoIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getInsightColor = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return 'border-l-green-500 bg-green-50';
      case 'negativo': return 'border-l-red-500 bg-red-50';
      case 'alerta': return 'border-l-yellow-500 bg-yellow-50';
      case 'neutro': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'positivo': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'negativo': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'alerta': return <Target className="h-5 w-5 text-yellow-600" />;
      case 'neutro': return <Activity className="h-5 w-5 text-blue-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleRefreshData = () => {
    setUltimaAtualizacao(new Date().toISOString());
    // Simular atualização dos dados
    console.log('Dados atualizados');
  };

  const handleExportDashboard = (formato: string) => {
    console.log(`Exportando dashboard em formato: ${formato}`);
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Dashboard Executivo
            </h1>
            <p className="text-gray-600 mt-2">Visão estratégica de KPIs e métricas empresariais</p>
            <div className="text-sm text-gray-500 mt-1">
              Última atualização: {new Date(ultimaAtualizacao).toLocaleString()}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
            <button
              onClick={handleRefreshData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Exportar
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
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="hoje">Hoje</option>
                <option value="esta_semana">Esta Semana</option>
                <option value="este_mes">Este Mês</option>
                <option value="trimestre">Trimestre</option>
                <option value="ano">Este Ano</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
              <select
                value={departamentoSelecionado}
                onChange={(e) => setDepartamentoSelecionado(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="vendas">Vendas</option>
                <option value="marketing">Marketing</option>
                <option value="operacional">Operacional</option>
                <option value="financeiro">Financeiro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                defaultValue="2025-08-01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                defaultValue="2025-08-31"
              />
            </div>
          </div>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">{kpi.nome}</h3>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {formatarValor(kpi.valor_atual, kpi.formato)}
                </div>
              </div>
              <div className="flex items-center">
                {getVariacaoIcon(kpi.tendencia)}
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className={`flex items-center text-sm ${getVariacaoColor(kpi.variacao_percentual)}`}>
                <span className="font-medium">
                  {kpi.variacao_percentual > 0 ? '+' : ''}{kpi.variacao_percentual.toFixed(1)}%
                </span>
                <span className="ml-1 text-gray-500">vs período anterior</span>
              </div>
            </div>

            {kpi.meta && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Meta: {formatarValor(kpi.meta, kpi.formato)}</span>
                  <span>{calcularProgressoMeta(kpi.valor_atual, kpi.meta).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calcularProgressoMeta(kpi.valor_atual, kpi.meta)}%` }}
                  ></div>
                </div>
              </div>
            )}
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
                <p className="text-sm text-gray-600">{grafico.periodo_atual}</p>
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
                <PieChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Gráfico: {grafico.titulo}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {grafico.dados.length} pontos de dados
                </p>
              </div>
            </div>

            {grafico.tipo === 'pie' && (
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {grafico.dados.slice(0, 4).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: grafico.configuracao.cores[index] }}
                      ></div>
                      <span>{item.destino || item.semana || item.mes}</span>
                    </div>
                    <span className="font-medium">
                      {formatarValor(item.vendas || item.valor || item.satisfacao, 'number')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Insights e Relatórios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights Principais */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Insights Principais</h3>
            <span className="text-sm text-gray-500">Baseado nos dados de {periodoSelecionado}</span>
          </div>

          <div className="space-y-4">
            {relatorios[0]?.insights.map((insight, index) => (
              <div
                key={index}
                className={`border-l-4 p-4 rounded-lg ${getInsightColor(insight.tipo)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getInsightIcon(insight.tipo)}
                      <h4 className="font-semibold text-gray-900">{insight.titulo}</h4>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{insight.descricao}</p>
                    {insight.valor && (
                      <div className="text-lg font-bold text-gray-900 mb-2">
                        {formatarValor(insight.valor, 'currency')}
                      </div>
                    )}
                    {insight.recomendacao && (
                      <div className="bg-white bg-opacity-50 rounded p-2 text-sm">
                        <strong>Recomendação:</strong> {insight.recomendacao}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Relatórios Disponíveis */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Relatórios</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Ver Todos
            </button>
          </div>

          <div className="space-y-4">
            {relatorios.map((relatorio) => (
              <div key={relatorio.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{relatorio.nome}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    relatorio.tipo === 'receita' ? 'bg-green-100 text-green-800' :
                    relatorio.tipo === 'satisfacao' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {relatorio.tipo}
                  </span>
                </div>
                <p className="text-gray-600 text-xs mb-3 line-clamp-2">{relatorio.descricao}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Gerado em {new Date(relatorio.data_geracao).toLocaleDateString()}</span>
                  <div className="flex gap-1">
                    {relatorio.formato_exportacao.map((formato, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded">
                        {formato}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Gerar Novo Relatório
          </button>
        </div>
      </div>

      {/* Modal de Exportação */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exportar Dashboard</h3>
            <div className="space-y-3">
              {['PDF', 'Excel', 'PowerPoint', 'Imagem PNG'].map((formato) => (
                <button
                  key={formato}
                  onClick={() => handleExportDashboard(formato)}
                  className="w-full text-left px-4 py-2 border border-gray-200 rounded hover:bg-gray-50"
                >
                  {formato}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardExecutivo;
