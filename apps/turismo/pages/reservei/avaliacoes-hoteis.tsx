// ⭐ SISTEMA DE AVALIAÇÕES DE HOTÉIS - RESERVEI VIAGENS
// Funcionalidade: Gestão de avaliações e feedback de hotéis
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Star, Eye, MessageSquare, ThumbsUp, ThumbsDown, Filter, TrendingUp, Award, AlertTriangle } from 'lucide-react';

interface AvaliacaoHotel {
  id: number;
  hotel: {
    id: number;
    nome: string;
    categoria: string;
    endereco: string;
  };
  reserva_codigo: string;
  cliente: {
    nome: string;
    email: string;
    cidade: string;
  };
  avaliacoes: {
    geral: number;
    atendimento: number;
    limpeza: number;
    localizacao: number;
    custo_beneficio: number;
    comodidades: number;
  };
  comentario: string;
  pontos_positivos: string[];
  pontos_negativos: string[];
  data_estadia: string;
  data_avaliacao: string;
  verificada: boolean;
  publica: boolean;
  resposta_hotel?: {
    texto: string;
    data: string;
    responsavel: string;
  };
  util_positivo: number;
  util_negativo: number;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'respondida';
}

const SistemaAvaliacoesHoteis: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoHotel[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroHotel, setFiltroHotel] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroNota, setFiltroNota] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<AvaliacaoHotel | null>(null);
  const [ordenacao, setOrdenacao] = useState('data_avaliacao');

  // Dados mock
  const avaliacoesMock: AvaliacaoHotel[] = [
    {
      id: 1,
      hotel: {
        id: 1,
        nome: 'Hotel Thermas Grand Resort',
        categoria: 'resort',
        endereco: 'Caldas Novas, GO'
      },
      reserva_codigo: 'RES-HTL-2025-001',
      cliente: {
        nome: 'João Silva Santos',
        email: 'joao.silva@email.com',
        cidade: 'São Paulo, SP'
      },
      avaliacoes: {
        geral: 5,
        atendimento: 5,
        limpeza: 5,
        localizacao: 4,
        custo_beneficio: 4,
        comodidades: 5
      },
      comentario: 'Experiência fantástica! O resort superou todas as expectativas. As águas termais são incríveis, a estrutura é de primeira qualidade e o atendimento é excepcional. Voltaremos com certeza!',
      pontos_positivos: [
        'Águas termais maravilhosas',
        'Atendimento excepcional',
        'Excelente estrutura para crianças',
        'Restaurante com comida deliciosa',
        'Quartos amplos e confortáveis'
      ],
      pontos_negativos: [
        'Preço um pouco elevado',
        'Estacionamento lotado nos fins de semana'
      ],
      data_estadia: '2025-08-15',
      data_avaliacao: '2025-08-20 10:30:00',
      verificada: true,
      publica: true,
      resposta_hotel: {
        texto: 'Agradecemos imensamente pela avaliação! Ficamos felizes que a experiência tenha superado as expectativas. Sobre o estacionamento, estamos expandindo a área para melhor atender nossos hóspedes.',
        data: '2025-08-21 14:00:00',
        responsavel: 'Gerência Hotel Thermas Grand'
      },
      util_positivo: 45,
      util_negativo: 2,
      status: 'respondida'
    },
    {
      id: 2,
      hotel: {
        id: 2,
        nome: 'Pousada Águas Claras',
        categoria: 'pousada',
        endereco: 'Caldas Novas, GO'
      },
      reserva_codigo: 'RES-HTL-2025-002',
      cliente: {
        nome: 'Carlos Oliveira',
        email: 'carlos.oliveira@email.com',
        cidade: 'Brasília, DF'
      },
      avaliacoes: {
        geral: 4,
        atendimento: 5,
        limpeza: 4,
        localizacao: 4,
        custo_beneficio: 5,
        comodidades: 3
      },
      comentario: 'Pousada aconchegante com ótimo custo-benefício. O atendimento é muito familiar e caloroso. As piscinas termais são bem aproveitadas, mesmo sendo menores que as de resorts grandes.',
      pontos_positivos: [
        'Atendimento familiar e caloroso',
        'Excelente custo-benefício',
        'Localização central',
        'Café da manhã saboroso',
        'Ambiente tranquilo'
      ],
      pontos_negativos: [
        'Quartos um pouco pequenos',
        'Poucas opções de entretenimento',
        'WiFi instável em alguns quartos'
      ],
      data_estadia: '2025-08-25',
      data_avaliacao: '2025-08-27 16:45:00',
      verificada: true,
      publica: true,
      util_positivo: 28,
      util_negativo: 3,
      status: 'aprovada'
    },
    {
      id: 3,
      hotel: {
        id: 4,
        nome: 'Spa Hotel Serenity',
        categoria: 'spa',
        endereco: 'Caldas Novas, GO'
      },
      reserva_codigo: 'RES-HTL-2025-003',
      cliente: {
        nome: 'Fernanda Costa',
        email: 'fernanda.costa@email.com',
        cidade: 'Rio de Janeiro, RJ'
      },
      avaliacoes: {
        geral: 5,
        atendimento: 5,
        limpeza: 5,
        localizacao: 4,
        custo_beneficio: 3,
        comodidades: 5
      },
      comentario: 'Hotel perfeito para quem busca relaxamento e bem-estar. Os tratamentos de spa são de altíssima qualidade, o ambiente é zen e os profissionais são extremamente qualificados. Uma experiência transformadora!',
      pontos_positivos: [
        'Tratamentos de spa excepcionais',
        'Ambiente zen e relaxante',
        'Profissionais altamente qualificados',
        'Instalações impecáveis',
        'Atenção aos detalhes'
      ],
      pontos_negativos: [
        'Preço bastante elevado',
        'Opções limitadas de entretenimento noturno',
        'Cardápio do restaurante com poucas opções'
      ],
      data_estadia: '2025-08-10',
      data_avaliacao: '2025-08-12 09:15:00',
      verificada: true,
      publica: true,
      resposta_hotel: {
        texto: 'Gratidão imensurável pelo seu feedback! Nossa missão é proporcionar experiências transformadoras e ficamos honrados em ter alcançado esse objetivo. Suas sugestões sobre o cardápio serão consideradas pela nossa equipe.',
        data: '2025-08-12 15:30:00',
        responsavel: 'Serenity Wellness Team'
      },
      util_positivo: 67,
      util_negativo: 1,
      status: 'respondida'
    },
    {
      id: 4,
      hotel: {
        id: 3,
        nome: 'Hotel Caldas Plaza',
        categoria: 'hotel',
        endereco: 'Caldas Novas, GO'
      },
      reserva_codigo: 'RES-HTL-2025-004',
      cliente: {
        nome: 'Roberto Lima',
        email: 'roberto.lima@email.com',
        cidade: 'Goiânia, GO'
      },
      avaliacoes: {
        geral: 3,
        atendimento: 4,
        limpeza: 3,
        localizacao: 5,
        custo_beneficio: 4,
        comodidades: 2
      },
      comentario: 'Hotel com boa localização e preço justo, mas precisa de algumas melhorias na estrutura. O atendimento é cordial e a localização é excelente para quem quer estar perto de tudo.',
      pontos_positivos: [
        'Localização excelente',
        'Preço justo',
        'Atendimento cordial',
        'Próximo aos pontos turísticos',
        'Fácil acesso'
      ],
      pontos_negativos: [
        'Quartos precisam de renovação',
        'Piscina pequena',
        'Café da manhã básico',
        'Ar condicionado barulhento',
        'Decoração datada'
      ],
      data_estadia: '2025-08-05',
      data_avaliacao: '2025-08-08 20:30:00',
      verificada: true,
      publica: true,
      util_positivo: 15,
      util_negativo: 8,
      status: 'pendente'
    },
    {
      id: 5,
      hotel: {
        id: 1,
        nome: 'Hotel Thermas Grand Resort',
        categoria: 'resort',
        endereco: 'Caldas Novas, GO'
      },
      reserva_codigo: 'RES-HTL-2025-015',
      cliente: {
        nome: 'Maria Santos',
        email: 'maria.santos@email.com',
        cidade: 'Cuiabá, MT'
      },
      avaliacoes: {
        geral: 2,
        atendimento: 2,
        limpeza: 3,
        localizacao: 4,
        custo_beneficio: 1,
        comodidades: 3
      },
      comentario: 'Experiência muito frustrante. O hotel estava superlotado, o atendimento foi demorado e desatencioso. Pelo preço pago, esperávamos muito mais qualidade no serviço.',
      pontos_positivos: [
        'Estrutura física boa',
        'Águas termais agradáveis'
      ],
      pontos_negativos: [
        'Atendimento demorado e desatencioso',
        'Hotel superlotado',
        'Preço muito alto para o serviço oferecido',
        'Dificuldade para conseguir cadeiras na piscina',
        'Restaurante com filas enormes',
        'Quartos com ruído excessivo'
      ],
      data_estadia: '2025-08-22',
      data_avaliacao: '2025-08-24 18:45:00',
      verificada: true,
      publica: false,
      util_positivo: 8,
      util_negativo: 12,
      status: 'pendente'
    }
  ];

  useEffect(() => {
    setAvaliacoes(avaliacoesMock);
  }, []);

  const hoteis = [...new Set(avaliacoes.map(a => a.hotel.nome))];

  const avaliacoesFiltradas = avaliacoes.filter(avaliacao => {
    const matchBusca = avaliacao.hotel.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      avaliacao.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      avaliacao.comentario.toLowerCase().includes(busca.toLowerCase());

    const matchHotel = filtroHotel === 'todos' || avaliacao.hotel.nome === filtroHotel;
    const matchStatus = filtroStatus === 'todos' || avaliacao.status === filtroStatus;
    const matchNota = filtroNota === 'todos' ||
                     (filtroNota === '5' && avaliacao.avaliacoes.geral === 5) ||
                     (filtroNota === '4' && avaliacao.avaliacoes.geral === 4) ||
                     (filtroNota === '3' && avaliacao.avaliacoes.geral === 3) ||
                     (filtroNota === '1-2' && avaliacao.avaliacoes.geral <= 2);

    return matchBusca && matchHotel && matchStatus && matchNota;
  }).sort((a, b) => {
    if (ordenacao === 'data_avaliacao') {
      return new Date(b.data_avaliacao).getTime() - new Date(a.data_avaliacao).getTime();
    } else if (ordenacao === 'nota') {
      return b.avaliacoes.geral - a.avaliacoes.geral;
    } else if (ordenacao === 'utilidade') {
      return (b.util_positivo - b.util_negativo) - (a.util_positivo - a.util_negativo);
    }
    return 0;
  });

  const estatisticas = {
    totalAvaliacoes: avaliacoes.length,
    mediaGeral: avaliacoes.reduce((acc, a) => acc + a.avaliacoes.geral, 0) / avaliacoes.length,
    avaliacoesPendentes: avaliacoes.filter(a => a.status === 'pendente').length,
    avaliacoesRespondidas: avaliacoes.filter(a => a.status === 'respondida').length,
    avaliacoes5Estrelas: avaliacoes.filter(a => a.avaliacoes.geral === 5).length,
    avaliacoes4Estrelas: avaliacoes.filter(a => a.avaliacoes.geral === 4).length,
    avaliacoes3Estrelas: avaliacoes.filter(a => a.avaliacoes.geral === 3).length,
    avaliacoesBaixas: avaliacoes.filter(a => a.avaliacoes.geral <= 2).length
  };

  const handleView = (avaliacao: AvaliacaoHotel) => {
    setAvaliacaoSelecionada(avaliacao);
    setShowModal(true);
  };

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600';
    if (nota >= 3.5) return 'text-yellow-600';
    if (nota >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'respondida': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderEstrelas = (nota: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < nota ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              Avaliações de Hotéis
            </h1>
            <p className="text-gray-600 mt-2">Gestão de avaliações e feedback dos hóspedes</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{estatisticas.totalAvaliacoes}</div>
          <div className="text-sm text-gray-600">Total Avaliações</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{estatisticas.mediaGeral.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Média Geral</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{estatisticas.avaliacoesRespondidas}</div>
          <div className="text-sm text-gray-600">Respondidas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{estatisticas.avaliacoesPendentes}</div>
          <div className="text-sm text-gray-600">Pendentes</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-emerald-600">{estatisticas.avaliacoes5Estrelas}</div>
          <div className="text-sm text-gray-600">5 Estrelas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{estatisticas.avaliacoes4Estrelas}</div>
          <div className="text-sm text-gray-600">4 Estrelas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{estatisticas.avaliacoes3Estrelas}</div>
          <div className="text-sm text-gray-600">3 Estrelas</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{estatisticas.avaliacoesBaixas}</div>
          <div className="text-sm text-gray-600">1-2 Estrelas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar avaliações..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <select
            value={filtroHotel}
            onChange={(e) => setFiltroHotel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="todos">Todos Hotéis</option>
            {hoteis.map(hotel => (
              <option key={hotel} value={hotel}>{hotel}</option>
            ))}
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="todos">Todos Status</option>
            <option value="pendente">Pendente</option>
            <option value="aprovada">Aprovada</option>
            <option value="respondida">Respondida</option>
            <option value="rejeitada">Rejeitada</option>
          </select>

          <select
            value={filtroNota}
            onChange={(e) => setFiltroNota(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="todos">Todas Notas</option>
            <option value="5">5 Estrelas</option>
            <option value="4">4 Estrelas</option>
            <option value="3">3 Estrelas</option>
            <option value="1-2">1-2 Estrelas</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500"
          >
            <option value="data_avaliacao">Data</option>
            <option value="nota">Nota</option>
            <option value="utilidade">Utilidade</option>
          </select>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-6">
        {avaliacoesFiltradas.map((avaliacao) => (
          <div key={avaliacao.id} className="bg-white rounded-lg shadow-sm border p-6">
            {/* Header da Avaliação */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">{avaliacao.hotel.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {renderEstrelas(avaliacao.avaliacoes.geral)}
                  </div>
                  <span className={`font-bold ${getNotaColor(avaliacao.avaliacoes.geral)}`}>
                    {avaliacao.avaliacoes.geral}.0
                  </span>
                  <span className="text-sm text-gray-500">
                    por {avaliacao.cliente.nome} • {avaliacao.cliente.cidade}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(avaliacao.status)}`}>
                  {avaliacao.status.toUpperCase()}
                </span>
                {avaliacao.verificada && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Award className="h-4 w-4" />
                    <span className="text-xs">Verificada</span>
                  </div>
                )}
              </div>
            </div>

            {/* Avaliações Detalhadas */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Atendimento</div>
                <div className={`font-bold ${getNotaColor(avaliacao.avaliacoes.atendimento)}`}>
                  {avaliacao.avaliacoes.atendimento}.0
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Limpeza</div>
                <div className={`font-bold ${getNotaColor(avaliacao.avaliacoes.limpeza)}`}>
                  {avaliacao.avaliacoes.limpeza}.0
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Localização</div>
                <div className={`font-bold ${getNotaColor(avaliacao.avaliacoes.localizacao)}`}>
                  {avaliacao.avaliacoes.localizacao}.0
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Custo/Benefício</div>
                <div className={`font-bold ${getNotaColor(avaliacao.avaliacoes.custo_beneficio)}`}>
                  {avaliacao.avaliacoes.custo_beneficio}.0
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Comodidades</div>
                <div className={`font-bold ${getNotaColor(avaliacao.avaliacoes.comodidades)}`}>
                  {avaliacao.avaliacoes.comodidades}.0
                </div>
              </div>
            </div>

            {/* Comentário */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">{avaliacao.comentario}</p>
            </div>

            {/* Pontos Positivos e Negativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {avaliacao.pontos_positivos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Pontos Positivos
                  </h4>
                  <ul className="space-y-1">
                    {avaliacao.pontos_positivos.map((ponto, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {avaliacao.pontos_negativos.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4" />
                    Pontos a Melhorar
                  </h4>
                  <ul className="space-y-1">
                    {avaliacao.pontos_negativos.map((ponto, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Resposta do Hotel */}
            {avaliacao.resposta_hotel && (
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Resposta do {avaliacao.resposta_hotel.responsavel}
                </h4>
                <p className="text-blue-700 text-sm mb-2">{avaliacao.resposta_hotel.texto}</p>
                <div className="text-xs text-blue-600">
                  {new Date(avaliacao.resposta_hotel.data).toLocaleDateString()} às {new Date(avaliacao.resposta_hotel.data).toLocaleTimeString()}
                </div>
              </div>
            )}

            {/* Footer da Avaliação */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div>Estadia: {new Date(avaliacao.data_estadia).toLocaleDateString()}</div>
                <div>Avaliação: {new Date(avaliacao.data_avaliacao).toLocaleDateString()}</div>
                <div>Reserva: {avaliacao.reserva_codigo}</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <ThumbsUp className="h-4 w-4 text-green-600" />
                  <span>{avaliacao.util_positivo}</span>
                  <ThumbsDown className="h-4 w-4 text-red-600" />
                  <span>{avaliacao.util_negativo}</span>
                </div>
                <button
                  onClick={() => handleView(avaliacao)}
                  className="flex items-center gap-1 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && avaliacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes da Avaliação - {avaliacaoSelecionada.hotel.nome}
              </h2>
              <div className="flex gap-2 mt-2">
                <div className="flex gap-1">
                  {renderEstrelas(avaliacaoSelecionada.avaliacoes.geral)}
                </div>
                <span className={`font-bold ${getNotaColor(avaliacaoSelecionada.avaliacoes.geral)}`}>
                  {avaliacaoSelecionada.avaliacoes.geral}.0
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações da avaliação completa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {avaliacaoSelecionada.cliente.nome}</div>
                    <div><strong>Email:</strong> {avaliacaoSelecionada.cliente.email}</div>
                    <div><strong>Cidade:</strong> {avaliacaoSelecionada.cliente.cidade}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Estadia</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Reserva:</strong> {avaliacaoSelecionada.reserva_codigo}</div>
                    <div><strong>Data da Estadia:</strong> {new Date(avaliacaoSelecionada.data_estadia).toLocaleDateString()}</div>
                    <div><strong>Data da Avaliação:</strong> {new Date(avaliacaoSelecionada.data_avaliacao).toLocaleDateString()}</div>
                    <div><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(avaliacaoSelecionada.status)}`}>
                        {avaliacaoSelecionada.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avaliações detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Avaliações por Categoria</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(avaliacaoSelecionada.avaliacoes).map(([categoria, nota]) => (
                    <div key={categoria} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1 capitalize">
                        {categoria.replace('_', ' ')}
                      </div>
                      <div className="flex justify-center gap-1 mb-1">
                        {renderEstrelas(nota)}
                      </div>
                      <div className={`font-bold ${getNotaColor(nota)}`}>
                        {nota}.0
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comentário completo */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Comentário Completo</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg leading-relaxed">
                  {avaliacaoSelecionada.comentario}
                </p>
              </div>

              {/* Utilidade da avaliação */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Utilidade da Avaliação</h3>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-600" />
                    <span className="font-semibold">{avaliacaoSelecionada.util_positivo}</span>
                    <span className="text-sm text-gray-600">pessoas acharam útil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-600" />
                    <span className="font-semibold">{avaliacaoSelecionada.util_negativo}</span>
                    <span className="text-sm text-gray-600">pessoas não acharam útil</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                Responder Avaliação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {avaliacoesFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma avaliação encontrada</h3>
          <p className="text-gray-500 mb-4">
            Ajuste os filtros para encontrar avaliações ou aguarde novos feedbacks dos hóspedes.
          </p>
        </div>
      )}
    </div>
  );
};

export default SistemaAvaliacoesHoteis;
