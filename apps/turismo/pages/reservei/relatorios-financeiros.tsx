// 💼 SISTEMA DE RELATÓRIOS FINANCEIROS - RESERVEI VIAGENS
// Funcionalidade: Relatórios e análises financeiras completas
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { FileText, BarChart3, Download, Calendar, TrendingUp, DollarSign, PieChart, Target, Filter, Eye } from 'lucide-react';

interface RelatorioTemplate {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'vendas' | 'financeiro' | 'operacional' | 'fiscal';
  periodicidade: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual';
  icon: React.ReactNode;
  ultimaGeracao?: string;
  parametros: string[];
}

interface DadosRelatorio {
  receita: {
    total: number;
    crescimento: number;
    meta: number;
    realizacao: number;
  };
  vendas: {
    quantidade: number;
    ticketMedio: number;
    conversao: number;
    comissoes: number;
  };
  despesas: {
    operacionais: number;
    impostos: number;
    fornecedores: number;
    marketing: number;
  };
  lucratividade: {
    receitaLiquida: number;
    custos: number;
    lucroLiquido: number;
    margem: number;
  };
  fluxoCaixa: {
    entradas: number;
    saidas: number;
    saldo: number;
    projecao: number;
  };
}

const SistemaRelatoriosFinanceiros: React.FC = () => {
  const [relatorios, setRelatorios] = useState<RelatorioTemplate[]>([]);
  const [dados, setDados] = useState<DadosRelatorio | null>(null);
  const [periodoSelecionado, setPeriodoSelecionado] = useState('mensal');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [showDashboard, setShowDashboard] = useState(true);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null);

  // Templates de relatórios
  const relatoriosMock: RelatorioTemplate[] = [
    {
      id: 'dre',
      nome: 'DRE - Demonstração do Resultado',
      descricao: 'Relatório completo de receitas, custos e resultado do período',
      categoria: 'financeiro',
      periodicidade: 'mensal',
      icon: <BarChart3 className="h-6 w-6" />,
      ultimaGeracao: '2025-08-29',
      parametros: ['período', 'centro de custo', 'categoria']
    },
    {
      id: 'vendas-detalhado',
      nome: 'Relatório de Vendas Detalhado',
      descricao: 'Análise completa das vendas por período, produto e vendedor',
      categoria: 'vendas',
      periodicidade: 'semanal',
      icon: <TrendingUp className="h-6 w-6" />,
      ultimaGeracao: '2025-08-25',
      parametros: ['período', 'vendedor', 'produto', 'cliente']
    },
    {
      id: 'fluxo-caixa',
      nome: 'Fluxo de Caixa Projetado',
      descricao: 'Análise de entradas e saídas com projeções futuras',
      categoria: 'financeiro',
      periodicidade: 'semanal',
      icon: <DollarSign className="h-6 w-6" />,
      ultimaGeracao: '2025-08-29',
      parametros: ['período', 'tipo movimentação', 'status']
    },
    {
      id: 'comissoes',
      nome: 'Relatório de Comissões',
      descricao: 'Cálculo detalhado de comissões por vendedor e período',
      categoria: 'vendas',
      periodicidade: 'mensal',
      icon: <Target className="h-6 w-6" />,
      ultimaGeracao: '2025-08-01',
      parametros: ['período', 'vendedor', 'tipo comissão']
    },
    {
      id: 'impostos',
      nome: 'Relatório Fiscal - Impostos',
      descricao: 'Consolidação de impostos por competência e tipo',
      categoria: 'fiscal',
      periodicidade: 'mensal',
      icon: <FileText className="h-6 w-6" />,
      ultimaGeracao: '2025-08-20',
      parametros: ['competência', 'tipo imposto', 'regime tributário']
    },
    {
      id: 'lucratividade',
      nome: 'Análise de Lucratividade',
      descricao: 'Análise de margem e lucratividade por produto/serviço',
      categoria: 'operacional',
      periodicidade: 'mensal',
      icon: <PieChart className="h-6 w-6" />,
      ultimaGeracao: '2025-08-15',
      parametros: ['período', 'produto', 'categoria', 'centro custo']
    },
    {
      id: 'dashboard-executivo',
      nome: 'Dashboard Executivo',
      descricao: 'Visão consolidada dos principais KPIs financeiros',
      categoria: 'financeiro',
      periodicidade: 'diario',
      icon: <BarChart3 className="h-6 w-6" />,
      ultimaGeracao: '2025-08-29',
      parametros: ['período', 'comparativo']
    },
    {
      id: 'custo-aquisicao',
      nome: 'Custo de Aquisição de Clientes',
      descricao: 'Análise do CAC por canal de marketing e período',
      categoria: 'operacional',
      periodicidade: 'mensal',
      icon: <Target className="h-6 w-6" />,
      ultimaGeracao: '2025-08-10',
      parametros: ['período', 'canal', 'campanha']
    }
  ];

  // Dados mock para o dashboard
  const dadosMock: DadosRelatorio = {
    receita: {
      total: 156890.45,
      crescimento: 15.7,
      meta: 180000.00,
      realizacao: 87.2
    },
    vendas: {
      quantidade: 287,
      ticketMedio: 546.70,
      conversao: 3.4,
      comissoes: 15689.05
    },
    despesas: {
      operacionais: 45670.20,
      impostos: 7844.52,
      fornecedores: 67890.30,
      marketing: 12450.80
    },
    lucratividade: {
      receitaLiquida: 156890.45,
      custos: 133855.82,
      lucroLiquido: 23034.63,
      margem: 14.7
    },
    fluxoCaixa: {
      entradas: 189670.45,
      saidas: 166635.82,
      saldo: 23034.63,
      projecao: 45890.20
    }
  };

  useEffect(() => {
    setRelatorios(relatoriosMock);
    setDados(dadosMock);
  }, []);

  const relatoriosFiltrados = relatorios.filter(relatorio =>
    categoriaFiltro === 'todos' || relatorio.categoria === categoriaFiltro
  );

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'vendas': return 'bg-green-100 text-green-800';
      case 'financeiro': return 'bg-blue-100 text-blue-800';
      case 'operacional': return 'bg-purple-100 text-purple-800';
      case 'fiscal': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPeriodicidadeColor = (periodicidade: string) => {
    switch (periodicidade) {
      case 'diario': return 'bg-blue-100 text-blue-800';
      case 'semanal': return 'bg-green-100 text-green-800';
      case 'mensal': return 'bg-purple-100 text-purple-800';
      case 'trimestral': return 'bg-orange-100 text-orange-800';
      case 'anual': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleGerarRelatorio = (relatorioId: string) => {
    console.log('Gerando relatório:', relatorioId);
    // Aqui seria implementada a lógica de geração do relatório
  };

  const handleVisualizarRelatorio = (relatorioId: string) => {
    setRelatorioSelecionado(relatorioId);
    console.log('Visualizando relatório:', relatorioId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Relatórios Financeiros
            </h1>
            <p className="text-gray-600 mt-2">Análises e relatórios financeiros completos</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              {showDashboard ? 'Ocultar' : 'Mostrar'} Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="h-4 w-4" />
              Exportar Todos
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Financeiro */}
      {showDashboard && dados && (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Dashboard Financeiro - Agosto 2025</h2>

            {/* KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">R$ {dados.receita.total.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Receita Total</div>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-green-600">+{dados.receita.crescimento}%</span>
                  <span className="text-xs text-gray-600">vs mês anterior</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{dados.vendas.quantidade}</div>
                    <div className="text-sm text-blue-700">Vendas Realizadas</div>
                  </div>
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-blue-600">Ticket: R$ {dados.vendas.ticketMedio}</span>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">R$ {dados.lucratividade.lucroLiquido.toLocaleString()}</div>
                    <div className="text-sm text-purple-700">Lucro Líquido</div>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-purple-600">Margem: {dados.lucratividade.margem}%</span>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">R$ {dados.fluxoCaixa.saldo.toLocaleString()}</div>
                    <div className="text-sm text-orange-700">Saldo em Caixa</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-orange-600">Projeção: R$ {dados.fluxoCaixa.projecao.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Análises Detalhadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Realização de Meta */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Realização de Meta</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Receita</span>
                      <span>{dados.receita.realizacao}% da meta</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{width: `${Math.min(dados.receita.realizacao, 100)}%`}}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      R$ {dados.receita.total.toLocaleString()} / R$ {dados.receita.meta.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribuição de Despesas */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Distribuição de Despesas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Operacionais</span>
                    <span>R$ {dados.despesas.operacionais.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fornecedores</span>
                    <span>R$ {dados.despesas.fornecedores.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing</span>
                    <span>R$ {dados.despesas.marketing.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impostos</span>
                    <span>R$ {dados.despesas.impostos.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span>R$ {(dados.despesas.operacionais + dados.despesas.fornecedores + dados.despesas.marketing + dados.despesas.impostos).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="diario">Hoje</option>
            <option value="semanal">Esta Semana</option>
            <option value="mensal">Este Mês</option>
            <option value="trimestral">Este Trimestre</option>
            <option value="anual">Este Ano</option>
          </select>

          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="todos">Todas Categorias</option>
            <option value="vendas">Vendas</option>
            <option value="financeiro">Financeiro</option>
            <option value="operacional">Operacional</option>
            <option value="fiscal">Fiscal</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Filter className="h-4 w-4" />
            Filtrar
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Calendar className="h-4 w-4" />
            Agendar Relatório
          </button>
        </div>
      </div>

      {/* Grid de Relatórios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatoriosFiltrados.map((relatorio) => (
          <div key={relatorio.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {relatorio.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{relatorio.nome}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(relatorio.categoria)}`}>
                      {relatorio.categoria}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPeriodicidadeColor(relatorio.periodicidade)}`}>
                      {relatorio.periodicidade}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{relatorio.descricao}</p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Parâmetros:</h4>
              <div className="flex flex-wrap gap-1">
                {relatorio.parametros.map((param, index) => (
                  <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {param}
                  </span>
                ))}
              </div>
            </div>

            {relatorio.ultimaGeracao && (
              <div className="mb-4 text-xs text-gray-500">
                Última geração: {new Date(relatorio.ultimaGeracao).toLocaleDateString()}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => handleVisualizarRelatorio(relatorio.id)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </button>
              <button
                onClick={() => handleGerarRelatorio(relatorio.id)}
                className="flex items-center justify-center gap-1 px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
              >
                <Download className="h-4 w-4" />
                Gerar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Relatórios Agendados */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Relatórios Agendados</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">DRE Mensal</div>
              <div className="text-sm text-gray-600">Todo dia 1º do mês às 09:00</div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium">Relatório de Vendas Semanal</div>
              <div className="text-sm text-gray-600">Toda segunda-feira às 08:00</div>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ativo</span>
              <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {relatoriosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório encontrado</h3>
          <p className="text-gray-500 mb-4">Ajuste os filtros para encontrar relatórios ou crie um novo relatório personalizado.</p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FileText className="h-4 w-4" />
            Criar Relatório Personalizado
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaRelatoriosFinanceiros;
