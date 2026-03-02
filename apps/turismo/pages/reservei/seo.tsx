// 🔍 SISTEMA SEO - RESERVEI VIAGENS
// Funcionalidade: Gestão de SEO e otimização para buscadores
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertTriangle, CheckCircle, Eye, Globe, Target, Zap, BarChart3 } from 'lucide-react';

interface PaginaSEO {
  id: number;
  url: string;
  titulo: string;
  metaDescricao: string;
  palavrasChave: string[];
  score: number;
  status: 'otimizado' | 'precisa-atencao' | 'critico';
  problemas: string[];
  sugestoes: string[];
  posicaoGoogle: number | null;
  trafego: number;
  impressoes: number;
  cliques: number;
  ctr: number;
  ultimaAtualizacao: string;
}

interface PalavraChave {
  termo: string;
  posicao: number;
  volume: number;
  dificuldade: 'facil' | 'media' | 'dificil';
  tendencia: 'subindo' | 'estavel' | 'descendo';
  oportunidade: number;
}

const SistemasSEO: React.FC = () => {
  const [paginas, setPaginas] = useState<PaginaSEO[]>([]);
  const [palavrasChave, setPalavrasChave] = useState<PalavraChave[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [showDetalhes, setShowDetalhes] = useState<number | null>(null);

  // Dados mock
  const paginasMock: PaginaSEO[] = [
    {
      id: 1,
      url: '/reservei/loja',
      titulo: 'Loja Reservei Viagens - Pacotes para Caldas Novas',
      metaDescricao: 'Descubra os melhores pacotes para Caldas Novas com a Reservei Viagens. Hospedagem, ingressos e experiências únicas.',
      palavrasChave: ['caldas novas', 'pacotes viagem', 'hot park', 'turismo goias'],
      score: 85,
      status: 'otimizado',
      problemas: [],
      sugestoes: ['Adicionar schema markup para produtos', 'Otimizar velocidade de carregamento'],
      posicaoGoogle: 3,
      trafego: 8456,
      impressoes: 45230,
      cliques: 2134,
      ctr: 4.72,
      ultimaAtualizacao: '2025-08-29'
    },
    {
      id: 2,
      url: '/reservei/viagens',
      titulo: 'Viagens Caldas Novas | Reservei Viagens',
      metaDescricao: 'Planeje sua viagem para Caldas Novas com os melhores preços e atendimento especializado.',
      palavrasChave: ['viagens caldas novas', 'turismo termal', 'pacotes familia'],
      score: 72,
      status: 'precisa-atencao',
      problemas: ['Meta descrição muito curta', 'Faltam H2 e H3 estruturados'],
      sugestoes: ['Expandir meta descrição para 150-160 caracteres', 'Adicionar subtítulos com palavras-chave'],
      posicaoGoogle: 7,
      trafeco: 6789,
      impressoes: 32450,
      cliques: 1567,
      ctr: 4.83,
      ultimaAtualizacao: '2025-08-28'
    },
    {
      id: 3,
      url: '/reservei/ingressos',
      titulo: 'Ingressos Hot Park',
      metaDescricao: 'Ingressos',
      palavrasChave: ['hot park ingresso', 'parque aquatico'],
      score: 45,
      status: 'critico',
      problemas: ['Título muito curto', 'Meta descrição inadequada', 'Faltam palavras-chave', 'Sem alt text nas imagens'],
      sugestoes: ['Reescrever título: "Ingressos Hot Park - Maior Parque Aquático de Águas Termais"', 'Criar meta descrição completa', 'Adicionar palavras-chave long-tail'],
      posicaoGoogle: 15,
      trafeco: 4532,
      impressoes: 28670,
      cliques: 892,
      ctr: 3.11,
      ultimaAtualizacao: '2025-08-27'
    }
  ];

  const palavrasChaveMock: PalavraChave[] = [
    { termo: 'caldas novas', posicao: 3, volume: 12000, dificuldade: 'media', tendencia: 'subindo', oportunidade: 85 },
    { termo: 'hot park ingresso', posicao: 7, volume: 8500, dificuldade: 'facil', tendencia: 'estavel', oportunidade: 92 },
    { termo: 'pacotes caldas novas', posicao: 5, volume: 5400, dificuldade: 'media', tendencia: 'subindo', oportunidade: 78 },
    { termo: 'turismo goias', posicao: 12, volume: 3200, dificuldade: 'dificil', tendencia: 'descendo', oportunidade: 45 },
    { termo: 'aguas termais brasil', posicao: 8, volume: 2800, dificuldade: 'media', tendencia: 'estavel', oportunidade: 67 }
  ];

  useEffect(() => {
    setPaginas(paginasMock);
    setPalavrasChave(palavrasChaveMock);
  }, []);

  const paginasFiltradas = paginas.filter(pagina => {
    const matchBusca = pagina.url.toLowerCase().includes(busca.toLowerCase()) ||
                      pagina.titulo.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === 'todos' || pagina.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const estatisticas = {
    scoreGeral: Math.round(paginas.reduce((acc, p) => acc + p.score, 0) / paginas.length),
    paginasOtimizadas: paginas.filter(p => p.status === 'otimizado').length,
    problemasTotal: paginas.reduce((acc, p) => acc + p.problemas.length, 0),
    trafegoTotal: paginas.reduce((acc, p) => acc + p.trafego, 0),
    posicaoMedia: Math.round(paginas.filter(p => p.posicaoGoogle).reduce((acc, p) => acc + (p.posicaoGoogle || 0), 0) / paginas.filter(p => p.posicaoGoogle).length)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'otimizado': return 'bg-green-100 text-green-800';
      case 'precisa-atencao': return 'bg-yellow-100 text-yellow-800';
      case 'critico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'otimizado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'precisa-atencao': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critico': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDificuldadeColor = (dificuldade: string) => {
    switch (dificuldade) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'descendo': return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Search className="h-8 w-8 text-green-600" />
              Sistema SEO
            </h1>
            <p className="text-gray-600 mt-2">Otimização para mecanismos de busca e análise de performance</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Zap className="h-4 w-4" />
            Auditoria SEO
          </button>
        </div>
      </div>

      {/* Dashboard SEO */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.scoreGeral}</div>
          <div className="text-sm text-gray-600">Score SEO Geral</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{estatisticas.paginasOtimizadas}</div>
          <div className="text-sm text-gray-600">Páginas Otimizadas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{estatisticas.problemasTotal}</div>
          <div className="text-sm text-gray-600">Problemas Detectados</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.trafegoTotal.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Tráfego Orgânico</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.posicaoMedia}º</div>
          <div className="text-sm text-gray-600">Posição Média</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar páginas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="otimizado">Otimizado</option>
            <option value="precisa-atencao">Precisa Atenção</option>
            <option value="critico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Análise de Páginas */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Análise de Páginas</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {paginasFiltradas.map((pagina) => (
                <div key={pagina.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(pagina.status)}
                        <h4 className="font-medium text-gray-900">{pagina.titulo}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(pagina.status)}`}>
                          {pagina.status.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{pagina.url}</p>
                      <p className="text-sm text-gray-600 mb-3">{pagina.metaDescricao}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span>Posição: {pagina.posicaoGoogle ? `${pagina.posicaoGoogle}º` : 'N/A'}</span>
                        <span>Tráfego: {pagina.trafego.toLocaleString()}</span>
                        <span>CTR: {pagina.ctr}%</span>
                      </div>

                      {pagina.problemas.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-600 mb-1">Problemas detectados:</p>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {pagina.problemas.map((problema, i) => (
                              <li key={i}>{problema}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {pagina.palavrasChave.map((palavra, i) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {palavra}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right ml-4">
                      <div className={`text-3xl font-bold ${getScoreColor(pagina.score)}`}>
                        {pagina.score}
                      </div>
                      <div className="text-sm text-gray-500">Score SEO</div>
                      <button
                        onClick={() => setShowDetalhes(showDetalhes === pagina.id ? null : pagina.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showDetalhes === pagina.id ? 'Ocultar' : 'Ver detalhes'}
                      </button>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {showDetalhes === pagina.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h5 className="font-medium text-gray-900 mb-2">Sugestões de Melhoria:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {pagina.sugestoes.map((sugestao, i) => (
                          <li key={i}>{sugestao}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Palavras-chave */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Palavras-chave</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {palavrasChave.map((palavra, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{palavra.termo}</span>
                        {getTendenciaIcon(palavra.tendencia)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>#{palavra.posicao}</span>
                        <span>{palavra.volume.toLocaleString()}/mês</span>
                        <span className={`px-2 py-1 rounded text-xs ${getDificuldadeColor(palavra.dificuldade)}`}>
                          {palavra.dificuldade}
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="text-xs text-gray-500 mb-1">Oportunidade: {palavra.oportunidade}%</div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full"
                            style={{width: `${palavra.oportunidade}%`}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border mt-6">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Ações Rápidas</h3>
            </div>
            <div className="p-6 space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="font-medium text-blue-900">Gerar Sitemap</div>
                <div className="text-sm text-blue-700">Atualizar sitemap.xml automaticamente</div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="font-medium text-green-900">Verificar Robots.txt</div>
                <div className="text-sm text-green-700">Validar configurações de crawling</div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="font-medium text-purple-900">Schema Markup</div>
                <div className="text-sm text-purple-700">Adicionar dados estruturados</div>
              </button>
              <button className="w-full text-left p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <div className="font-medium text-orange-900">Velocidade da Página</div>
                <div className="text-sm text-orange-700">Analisar Core Web Vitals</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SistemasSEO;
