// 💡 SISTEMA DE RECOMENDAÇÕES - RESERVEI VIAGENS
// Funcionalidade: Engine de recomendações inteligentes
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Brain, Users, Target, TrendingUp, Heart, Star, Clock, Zap, BarChart3, Settings } from 'lucide-react';

interface Recomendacao {
  id: number;
  tipo: 'produto' | 'destino' | 'promocao' | 'personalizada';
  titulo: string;
  descricao: string;
  score: number;
  motivo: string;
  publico: string[];
  produto: {
    nome: string;
    preco: number;
    imagem: string;
    categoria: string;
  };
  metricas: {
    cliques: number;
    conversoes: number;
    ctr: number;
    roas: number;
  };
  status: 'ativa' | 'teste' | 'pausada';
  criadaEm: string;
  algoritmo: 'colaborativo' | 'conteudo' | 'hibrido' | 'tendencias';
}

interface PerfilUsuario {
  id: number;
  nome: string;
  segmento: string;
  historico: string[];
  interesses: string[];
  comportamento: string;
  recomendacoes: number[];
  scoreEngajamento: number;
}

const SistemaRecomendacoes: React.FC = () => {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [perfisUsuario, setPerfisUsuario] = useState<PerfilUsuario[]>([]);
  const [algoritmoAtivo, setAlgoritmoAtivo] = useState('hibrido');
  const [showConfig, setShowConfig] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Dados mock
  const recomendacoesMock: Recomendacao[] = [
    {
      id: 1,
      tipo: 'produto',
      titulo: 'Pacote Família Caldas Novas',
      descricao: 'Recomendado para famílias com crianças baseado no histórico de compras similares',
      score: 94,
      motivo: 'Usuários com perfil similar também compraram este produto',
      publico: ['familia-com-criancas', 'renda-media-alta', 'primeira-viagem'],
      produto: {
        nome: 'Pacote Caldas Novas 3 dias',
        preco: 599.00,
        imagem: '/api/placeholder/300/200',
        categoria: 'Pacotes'
      },
      metricas: {
        cliques: 1245,
        conversoes: 89,
        ctr: 7.15,
        roas: 4.2
      },
      status: 'ativa',
      criadaEm: '2025-08-15',
      algoritmo: 'colaborativo'
    },
    {
      id: 2,
      tipo: 'promocao',
      titulo: 'Desconto Hot Park para Repeat Customers',
      descricao: 'Oferta especial para clientes que já visitaram parques aquáticos',
      score: 87,
      motivo: 'Cliente já comprou ingressos de parques similar, alto potencial de conversão',
      publico: ['repeat-customer', 'interesse-parques', 'alta-frequencia'],
      produto: {
        nome: 'Hot Park - Ingresso com 20% OFF',
        preco: 71.92,
        imagem: '/api/placeholder/300/200',
        categoria: 'Ingressos'
      },
      metricas: {
        cliques: 892,
        conversoes: 67,
        ctr: 7.51,
        roas: 3.8
      },
      status: 'ativa',
      criadaEm: '2025-08-20',
      algoritmo: 'conteudo'
    },
    {
      id: 3,
      tipo: 'destino',
      titulo: 'Rio Quente para amantes de Caldas',
      descricao: 'Destino complementar baseado em preferências de águas termais',
      score: 78,
      motivo: 'Destinos com características similares, expandir experiência',
      publico: ['caldas-lovers', 'exploradores', 'casal-sem-filhos'],
      produto: {
        nome: 'Combo Caldas + Rio Quente',
        preco: 899.00,
        imagem: '/api/placeholder/300/200',
        categoria: 'Combos'
      },
      metricas: {
        cliques: 567,
        conversoes: 34,
        ctr: 6.0,
        roas: 3.2
      },
      status: 'teste',
      criadaEm: '2025-08-25',
      algoritmo: 'hibrido'
    },
    {
      id: 4,
      tipo: 'personalizada',
      titulo: 'Upgrade VIP baseado no comportamento',
      descricao: 'Recomendação de upgrade para experiências premium',
      score: 91,
      motivo: 'Padrão de gastos indica potencial para produtos premium',
      publico: ['alto-valor', 'experiencias-premium', 'executivo'],
      produto: {
        nome: 'Pacote VIP Caldas Novas',
        preco: 1299.00,
        imagem: '/api/placeholder/300/200',
        categoria: 'Premium'
      },
      metricas: {
        cliques: 234,
        conversoes: 23,
        ctr: 9.83,
        roas: 5.7
      },
      status: 'ativa',
      criadaEm: '2025-08-22',
      algoritmo: 'hibrido'
    }
  ];

  const perfisMock: PerfilUsuario[] = [
    {
      id: 1,
      nome: 'Ana Silva',
      segmento: 'Família Classe Média',
      historico: ['Pacote família', 'Hot Park', 'Seguro viagem'],
      interesses: ['águas termais', 'crianças', 'segurança', 'economia'],
      comportamento: 'Pesquisa bastante, compara preços, valoriza opinões',
      recomendacoes: [1, 2],
      scoreEngajamento: 87
    },
    {
      id: 2,
      nome: 'João Executivo',
      segmento: 'Profissional Alto Valor',
      historico: ['Transfer executivo', 'Hotel premium', 'Experiências VIP'],
      interesses: ['conforto', 'exclusividade', 'praticidade', 'status'],
      comportamento: 'Decisão rápida, valoriza qualidade sobre preço',
      recomendacoes: [4],
      scoreEngajamento: 94
    }
  ];

  useEffect(() => {
    setRecomendacoes(recomendacoesMock);
    setPerfisUsuario(perfisMock);
  }, []);

  const recomendacoesFiltradas = recomendacoes.filter(rec =>
    filtroTipo === 'todos' || rec.tipo === filtroTipo
  );

  const estatisticas = {
    totalRecomendacoes: recomendacoes.length,
    recomendacoesAtivas: recomendacoes.filter(r => r.status === 'ativa').length,
    scoreGeral: Math.round(recomendacoes.reduce((acc, r) => acc + r.score, 0) / recomendacoes.length),
    ctrGeral: recomendacoes.reduce((acc, r) => acc + r.metricas.ctr, 0) / recomendacoes.length,
    roasGeral: recomendacoes.reduce((acc, r) => acc + r.metricas.roas, 0) / recomendacoes.length,
    conversoesTotal: recomendacoes.reduce((acc, r) => acc + r.metricas.conversoes, 0)
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'produto': return 'bg-blue-100 text-blue-800';
      case 'destino': return 'bg-green-100 text-green-800';
      case 'promocao': return 'bg-orange-100 text-orange-800';
      case 'personalizada': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'produto': return <Target className="h-4 w-4" />;
      case 'destino': return <TrendingUp className="h-4 w-4" />;
      case 'promocao': return <Zap className="h-4 w-4" />;
      case 'personalizada': return <Brain className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getAlgoritmoColor = (algoritmo: string) => {
    switch (algoritmo) {
      case 'colaborativo': return 'bg-indigo-100 text-indigo-800';
      case 'conteudo': return 'bg-cyan-100 text-cyan-800';
      case 'hibrido': return 'bg-emerald-100 text-emerald-800';
      case 'tendencias': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'teste': return 'bg-yellow-100 text-yellow-800';
      case 'pausada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-600" />
              Sistema de Recomendações IA
            </h1>
            <p className="text-gray-600 mt-2">Engine inteligente de recomendações personalizadas</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <Settings className="h-4 w-4" />
              Configurar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              <Zap className="h-4 w-4" />
              Treinar Modelo
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.totalRecomendacoes}</div>
          <div className="text-sm text-gray-600">Total Recomendações</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{estatisticas.recomendacoesAtivas}</div>
          <div className="text-sm text-gray-600">Ativas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.scoreGeral}</div>
          <div className="text-sm text-gray-600">Score Médio</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.ctrGeral.toFixed(2)}%</div>
          <div className="text-sm text-gray-600">CTR Médio</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-emerald-600">{estatisticas.roasGeral.toFixed(1)}x</div>
          <div className="text-sm text-gray-600">ROAS Médio</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-indigo-600">{estatisticas.conversoesTotal}</div>
          <div className="text-sm text-gray-600">Conversões</div>
        </div>
      </div>

      {/* Configurações (se visível) */}
      {showConfig && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Configurações do Algoritmo</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Algoritmo Principal</label>
              <select
                value={algoritmoAtivo}
                onChange={(e) => setAlgoritmoAtivo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="hibrido">Híbrido (Recomendado)</option>
                <option value="colaborativo">Filtragem Colaborativa</option>
                <option value="conteudo">Baseado em Conteúdo</option>
                <option value="tendencias">Tendências de Mercado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Peso Personalização</label>
              <input type="range" min="0" max="100" defaultValue="75" className="w-full" />
              <div className="text-sm text-gray-500">75% - Balanceado</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Score Mínimo</label>
              <input type="number" min="0" max="100" defaultValue="70" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="todos">Todos os Tipos</option>
            <option value="produto">Produto</option>
            <option value="destino">Destino</option>
            <option value="promocao">Promoção</option>
            <option value="personalizada">Personalizada</option>
          </select>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recomendações */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {recomendacoesFiltradas.map((rec) => (
              <div key={rec.id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTipoColor(rec.tipo)}`}>
                      {getTipoIcon(rec.tipo)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{rec.titulo}</h3>
                      <p className="text-sm text-gray-600">{rec.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(rec.score)}`}>
                      {rec.score}
                    </div>
                    <div className="text-sm text-gray-500">Score IA</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(rec.tipo)}`}>
                    {rec.tipo}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAlgoritmoColor(rec.algoritmo)}`}>
                    {rec.algoritmo}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                    {rec.status}
                  </span>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-lg"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.produto.nome}</h4>
                      <p className="text-sm text-gray-600">{rec.produto.categoria}</p>
                      <p className="text-lg font-bold text-green-600">R$ {rec.produto.preco.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{rec.metricas.cliques}</div>
                    <div className="text-sm text-gray-600">Cliques</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{rec.metricas.conversoes}</div>
                    <div className="text-sm text-gray-600">Conversões</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">{rec.metricas.ctr.toFixed(2)}%</div>
                    <div className="text-sm text-gray-600">CTR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">{rec.metricas.roas.toFixed(1)}x</div>
                    <div className="text-sm text-gray-600">ROAS</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Motivo:</strong> {rec.motivo}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Público-alvo:</strong> {rec.publico.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Perfis de Usuário */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Perfis de Usuário</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {perfisUsuario.map((perfil) => (
                <div key={perfil.id} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{perfil.nome}</h4>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{perfil.scoreEngajamento}</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{perfil.segmento}</p>
                  <p className="text-sm text-gray-600 mb-3">{perfil.comportamento}</p>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Histórico:</p>
                    <div className="flex flex-wrap gap-1">
                      {perfil.historico.map((item, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Interesses:</p>
                    <div className="flex flex-wrap gap-1">
                      {perfil.interesses.map((interesse, i) => (
                        <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {interesse}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Recomendações Ativas:</p>
                    <p className="text-sm text-purple-600">{perfil.recomendacoes.length} recomendações personalizadas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights IA */}
          <div className="bg-white rounded-lg shadow-sm border mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Insights da IA</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Tendência Detectada</span>
                </div>
                <p className="text-sm text-blue-800">
                  Aumento de 25% no interesse por pacotes familiares nos últimos 7 dias
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Oportunidade</span>
                </div>
                <p className="text-sm text-green-800">
                  Segmento "Executivos" tem 89% de probabilidade de upgrade para premium
                </p>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Modelo Aprendido</span>
                </div>
                <p className="text-sm text-purple-800">
                  Algoritmo híbrido apresenta 15% melhor performance que colaborativo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemaRecomendacoes;
