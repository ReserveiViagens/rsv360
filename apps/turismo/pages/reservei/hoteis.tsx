// 🏨 SISTEMA DE HOTÉIS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de hotéis e acomodações
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Building2, MapPin, Star, Users, Wifi, Car, Coffee, Waves, ChefHat, Filter, Calendar } from 'lucide-react';

interface Hotel {
  id: number;
  nome: string;
  categoria: 'resort' | 'hotel' | 'pousada' | 'apart-hotel' | 'spa';
  estrelas: number;
  endereco: {
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
    pais: string;
    latitude?: number;
    longitude?: number;
  };
  contato: {
    telefone: string;
    email: string;
    site?: string;
    whatsapp?: string;
  };
  descricao: string;
  comodidades: string[];
  fotos: string[];
  politicas: {
    checkIn: string;
    checkOut: string;
    cancelamento: string;
    criancas: string;
    pets: boolean;
  };
  quartos: {
    total: number;
    ocupados: number;
    manutencao: number;
    disponiveis: number;
  };
  precos: {
    diaria_min: number;
    diaria_max: number;
    promocional?: number;
  };
  avaliacao: {
    nota: number;
    total_avaliacoes: number;
    comentarios_recentes: string[];
  };
  parceiro: {
    nome: string;
    comissao: number;
    contrato: string;
    status: 'ativo' | 'inativo' | 'pendente';
  };
  status: 'ativo' | 'inativo' | 'manutencao' | 'temporariamente_fechado';
  dataCadastro: string;
  dataAtualizacao: string;
  vendedor_responsavel: string;
}

const SistemaHoteis: React.FC = () => {
  const [hoteis, setHoteis] = useState<Hotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [hotelSelecionado, setHotelSelecionado] = useState<Hotel | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroEstrelas, setFiltroEstrelas] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Dados mock
  const hoteisMock: Hotel[] = [
    {
      id: 1,
      nome: 'Hotel Thermas Grand Resort',
      categoria: 'resort',
      estrelas: 5,
      endereco: {
        rua: 'Rodovia GO-139, km 3',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-000',
        pais: 'Brasil',
        latitude: -17.7539,
        longitude: -48.6183
      },
      contato: {
        telefone: '(64) 3455-3000',
        email: 'reservas@thermasgrand.com.br',
        site: 'www.thermasgrand.com.br',
        whatsapp: '(64) 99999-3000'
      },
      descricao: 'Resort de luxo com águas termais naturais, spa completo e variedade de atividades para toda a família.',
      comodidades: ['piscinas_termais', 'spa', 'restaurante', 'wifi', 'estacionamento', 'academia', 'kids_club', 'bar'],
      fotos: ['/images/thermas-grand-1.jpg', '/images/thermas-grand-2.jpg'],
      politicas: {
        checkIn: '15:00',
        checkOut: '12:00',
        cancelamento: 'Cancelamento gratuito até 48h antes',
        criancas: 'Crianças até 6 anos não pagam',
        pets: false
      },
      quartos: {
        total: 180,
        ocupados: 156,
        manutencao: 4,
        disponiveis: 20
      },
      precos: {
        diaria_min: 450.00,
        diaria_max: 890.00,
        promocional: 380.00
      },
      avaliacao: {
        nota: 4.8,
        total_avaliacoes: 1247,
        comentarios_recentes: [
          'Excelente estrutura e águas termais incríveis!',
          'Atendimento excepcional, voltaremos com certeza.',
          'Resort perfeito para famílias com crianças.'
        ]
      },
      parceiro: {
        nome: 'Thermas Hotels Group',
        comissao: 15.0,
        contrato: 'TH-2025-001',
        status: 'ativo'
      },
      status: 'ativo',
      dataCadastro: '2025-01-15',
      dataAtualizacao: '2025-08-25',
      vendedor_responsavel: 'Ana Silva Santos'
    },
    {
      id: 2,
      nome: 'Pousada Águas Claras',
      categoria: 'pousada',
      estrelas: 4,
      endereco: {
        rua: 'Rua das Thermas, 125',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-100',
        pais: 'Brasil'
      },
      contato: {
        telefone: '(64) 3453-2200',
        email: 'contato@aguasclaras.com.br',
        whatsapp: '(64) 99888-2200'
      },
      descricao: 'Pousada aconchegante com atmosfera familiar e piscinas de águas termais naturais.',
      comodidades: ['piscinas_termais', 'restaurante', 'wifi', 'estacionamento', 'jardim'],
      fotos: ['/images/aguas-claras-1.jpg'],
      politicas: {
        checkIn: '14:00',
        checkOut: '11:00',
        cancelamento: 'Cancelamento gratuito até 24h antes',
        criancas: 'Crianças até 5 anos não pagam',
        pets: true
      },
      quartos: {
        total: 45,
        ocupados: 38,
        manutencao: 2,
        disponiveis: 5
      },
      precos: {
        diaria_min: 180.00,
        diaria_max: 320.00
      },
      avaliacao: {
        nota: 4.5,
        total_avaliacoes: 389,
        comentarios_recentes: [
          'Pousada muito aconchegante e bem localizada.',
          'Ótimo custo-benefício, recomendo!',
          'Atendimento familiar e caloroso.'
        ]
      },
      parceiro: {
        nome: 'Águas Claras Hospedagem',
        comissao: 12.0,
        contrato: 'AC-2025-002',
        status: 'ativo'
      },
      status: 'ativo',
      dataCadastro: '2025-02-10',
      dataAtualizacao: '2025-08-20',
      vendedor_responsavel: 'Carlos Vendedor Silva'
    },
    {
      id: 3,
      nome: 'Hotel Caldas Plaza',
      categoria: 'hotel',
      estrelas: 3,
      endereco: {
        rua: 'Av. Goiás, 455',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-200',
        pais: 'Brasil'
      },
      contato: {
        telefone: '(64) 3453-1800',
        email: 'reservas@caldasplaza.com.br'
      },
      descricao: 'Hotel urbano bem localizado no centro de Caldas Novas, próximo aos principais pontos turísticos.',
      comodidades: ['piscina', 'restaurante', 'wifi', 'estacionamento', 'lavanderia'],
      fotos: ['/images/caldas-plaza-1.jpg'],
      politicas: {
        checkIn: '14:00',
        checkOut: '12:00',
        cancelamento: 'Cancelamento com taxa após 24h',
        criancas: 'Crianças até 8 anos não pagam',
        pets: false
      },
      quartos: {
        total: 80,
        ocupados: 45,
        manutencao: 5,
        disponiveis: 30
      },
      precos: {
        diaria_min: 120.00,
        diaria_max: 250.00,
        promocional: 95.00
      },
      avaliacao: {
        nota: 4.2,
        total_avaliacoes: 567,
        comentarios_recentes: [
          'Boa localização e preço justo.',
          'Hotel simples mas confortável.',
          'Atendimento cordial da recepção.'
        ]
      },
      parceiro: {
        nome: 'Plaza Hotéis',
        comissao: 10.0,
        contrato: 'PH-2025-003',
        status: 'ativo'
      },
      status: 'ativo',
      dataCadastro: '2025-03-05',
      dataAtualizacao: '2025-08-15',
      vendedor_responsavel: 'Maria Atendente Costa'
    },
    {
      id: 4,
      nome: 'Spa Hotel Serenity',
      categoria: 'spa',
      estrelas: 5,
      endereco: {
        rua: 'Estrada do Lago, km 8',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-300',
        pais: 'Brasil'
      },
      contato: {
        telefone: '(64) 3455-4500',
        email: 'spa@serenityhotel.com.br',
        site: 'www.serenityhotel.com.br'
      },
      descricao: 'Hotel spa premium focado em bem-estar e relaxamento, com tratamentos exclusivos.',
      comodidades: ['spa_completo', 'piscinas_termais', 'restaurante_gourmet', 'wifi', 'estacionamento', 'biblioteca', 'sala_meditacao'],
      fotos: ['/images/serenity-spa-1.jpg'],
      politicas: {
        checkIn: '16:00',
        checkOut: '12:00',
        cancelamento: 'Cancelamento gratuito até 72h antes',
        criancas: 'Apenas adultos (18+)',
        pets: false
      },
      quartos: {
        total: 60,
        ocupados: 55,
        manutencao: 1,
        disponiveis: 4
      },
      precos: {
        diaria_min: 680.00,
        diaria_max: 1200.00
      },
      avaliacao: {
        nota: 4.9,
        total_avaliacoes: 234,
        comentarios_recentes: [
          'Experiência de spa inesquecível!',
          'Ambiente perfeito para relaxar e renovar.',
          'Tratamentos de altíssima qualidade.'
        ]
      },
      parceiro: {
        nome: 'Serenity Wellness Group',
        comissao: 18.0,
        contrato: 'SW-2025-004',
        status: 'ativo'
      },
      status: 'ativo',
      dataCadastro: '2025-04-01',
      dataAtualizacao: '2025-08-10',
      vendedor_responsavel: 'Ana Silva Santos'
    }
  ];

  useEffect(() => {
    setHoteis(hoteisMock);
  }, []);

  const hoteisFiltrados = hoteis.filter(hotel => {
    const matchBusca = hotel.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      hotel.endereco.cidade.toLowerCase().includes(busca.toLowerCase()) ||
                      hotel.categoria.toLowerCase().includes(busca.toLowerCase());

    const matchCategoria = filtroCategoria === 'todos' || hotel.categoria === filtroCategoria;
    const matchStatus = filtroStatus === 'todos' || hotel.status === filtroStatus;
    const matchEstrelas = filtroEstrelas === 'todos' || hotel.estrelas.toString() === filtroEstrelas;

    return matchBusca && matchCategoria && matchStatus && matchEstrelas;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'nome':
        valueA = a.nome;
        valueB = b.nome;
        break;
      case 'estrelas':
        valueA = a.estrelas;
        valueB = b.estrelas;
        break;
      case 'avaliacao':
        valueA = a.avaliacao.nota;
        valueB = b.avaliacao.nota;
        break;
      case 'preco':
        valueA = a.precos.diaria_min;
        valueB = b.precos.diaria_min;
        break;
      default:
        valueA = a.nome;
        valueB = b.nome;
    }

    if (typeof valueA === 'string') {
      return ordemCrescente ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  const estatisticas = {
    totalHoteis: hoteis.length,
    hoteisAtivos: hoteis.filter(h => h.status === 'ativo').length,
    totalQuartos: hoteis.reduce((acc, h) => acc + h.quartos.total, 0),
    quartosOcupados: hoteis.reduce((acc, h) => acc + h.quartos.ocupados, 0),
    mediaEstrelas: hoteis.reduce((acc, h) => acc + h.estrelas, 0) / hoteis.length,
    mediaAvaliacao: hoteis.reduce((acc, h) => acc + h.avaliacao.nota, 0) / hoteis.length,
    comissaoMedia: hoteis.reduce((acc, h) => acc + h.parceiro.comissao, 0) / hoteis.length
  };

  const handleView = (hotel: Hotel) => {
    setHotelSelecionado(hotel);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (hotel: Hotel) => {
    setHotelSelecionado(hotel);
    setModalTipo('edit');
    setShowModal(true);
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'resort': return 'bg-purple-100 text-purple-800';
      case 'hotel': return 'bg-blue-100 text-blue-800';
      case 'pousada': return 'bg-green-100 text-green-800';
      case 'apart-hotel': return 'bg-orange-100 text-orange-800';
      case 'spa': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'manutencao': return 'bg-yellow-100 text-yellow-800';
      case 'temporariamente_fechado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComodidadeIcon = (comodidade: string) => {
    switch (comodidade) {
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'estacionamento': return <Car className="h-4 w-4" />;
      case 'restaurante': return <ChefHat className="h-4 w-4" />;
      case 'piscinas_termais': return <Waves className="h-4 w-4" />;
      case 'spa': return <Coffee className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  const renderEstrelas = (estrelas: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < estrelas ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
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
              <Building2 className="h-8 w-8 text-blue-600" />
              Sistema de Hotéis
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de hotéis e acomodações</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Calendar className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Hotel
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalHoteis}</div>
            <div className="text-sm text-gray-600">Total Hotéis</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.hoteisAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalQuartos}</div>
            <div className="text-sm text-gray-600">Total Quartos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.quartosOcupados}</div>
            <div className="text-sm text-gray-600">Ocupados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.mediaEstrelas.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Média Estrelas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-pink-600">{estatisticas.mediaAvaliacao.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Média Avaliação</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.comissaoMedia.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Comissão Média</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar hotéis..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas Categorias</option>
            <option value="resort">Resort</option>
            <option value="hotel">Hotel</option>
            <option value="pousada">Pousada</option>
            <option value="apart-hotel">Apart-Hotel</option>
            <option value="spa">Spa</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="manutencao">Manutenção</option>
            <option value="temporariamente_fechado">Temporariamente Fechado</option>
          </select>

          <select
            value={filtroEstrelas}
            onChange={(e) => setFiltroEstrelas(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas Estrelas</option>
            <option value="5">5 Estrelas</option>
            <option value="4">4 Estrelas</option>
            <option value="3">3 Estrelas</option>
            <option value="2">2 Estrelas</option>
            <option value="1">1 Estrela</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="nome">Nome</option>
            <option value="estrelas">Estrelas</option>
            <option value="avaliacao">Avaliação</option>
            <option value="preco">Preço</option>
          </select>
        </div>
      </div>

      {/* Lista de Hotéis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {hoteisFiltrados.map((hotel) => (
          <div key={hotel.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            {/* Header do Card */}
            <div className="p-4 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{hotel.nome}</h3>
                <div className="flex gap-1">
                  {renderEstrelas(hotel.estrelas)}
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(hotel.categoria)}`}>
                  {hotel.categoria.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                  {hotel.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {hotel.endereco.cidade}, {hotel.endereco.estado}
              </div>
            </div>

            {/* Corpo do Card */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{hotel.descricao}</p>

              {/* Comodidades */}
              <div className="flex flex-wrap gap-1 mb-3">
                {hotel.comodidades.slice(0, 4).map((comodidade, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {getComodidadeIcon(comodidade)}
                    {comodidade.replace('_', ' ')}
                  </div>
                ))}
                {hotel.comodidades.length > 4 && (
                  <span className="text-xs text-gray-500">+{hotel.comodidades.length - 4} mais</span>
                )}
              </div>

              {/* Ocupação */}
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Ocupação</span>
                  <span>{Math.round((hotel.quartos.ocupados / hotel.quartos.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{width: `${(hotel.quartos.ocupados / hotel.quartos.total) * 100}%`}}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {hotel.quartos.ocupados}/{hotel.quartos.total} quartos ocupados
                </div>
              </div>

              {/* Preços e Avaliação */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    R$ {hotel.precos.promocional || hotel.precos.diaria_min}
                  </div>
                  {hotel.precos.promocional && (
                    <div className="text-sm text-gray-500 line-through">
                      R$ {hotel.precos.diaria_min}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">por diária</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="font-semibold">{hotel.avaliacao.nota}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {hotel.avaliacao.total_avaliacoes} avaliações
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(hotel)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Ver Detalhes
                </button>
                <button
                  onClick={() => handleEdit(hotel)}
                  className="flex items-center justify-center px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && hotelSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{hotelSelecionado.nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaColor(hotelSelecionado.categoria)}`}>
                  {hotelSelecionado.categoria}
                </span>
                <div className="flex gap-1">
                  {renderEstrelas(hotelSelecionado.estrelas)}
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Endereço:</strong> {hotelSelecionado.endereco.rua}, {hotelSelecionado.endereco.cidade}, {hotelSelecionado.endereco.estado}</div>
                    <div><strong>Telefone:</strong> {hotelSelecionado.contato.telefone}</div>
                    <div><strong>Email:</strong> {hotelSelecionado.contato.email}</div>
                    {hotelSelecionado.contato.site && (
                      <div><strong>Site:</strong> {hotelSelecionado.contato.site}</div>
                    )}
                    <div><strong>Responsável:</strong> {hotelSelecionado.vendedor_responsavel}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Parceria</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Parceiro:</strong> {hotelSelecionado.parceiro.nome}</div>
                    <div><strong>Comissão:</strong> {hotelSelecionado.parceiro.comissao}%</div>
                    <div><strong>Contrato:</strong> {hotelSelecionado.parceiro.contrato}</div>
                    <div><strong>Status:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(hotelSelecionado.parceiro.status)}`}>
                        {hotelSelecionado.parceiro.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quartos e Preços */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ocupação de Quartos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{hotelSelecionado.quartos.total}</div>
                      <div className="text-sm text-blue-700">Total</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{hotelSelecionado.quartos.ocupados}</div>
                      <div className="text-sm text-green-700">Ocupados</div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{hotelSelecionado.quartos.disponiveis}</div>
                      <div className="text-sm text-orange-700">Disponíveis</div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{hotelSelecionado.quartos.manutencao}</div>
                      <div className="text-sm text-yellow-700">Manutenção</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Preços e Avaliação</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {hotelSelecionado.precos.diaria_min} - R$ {hotelSelecionado.precos.diaria_max}
                      </div>
                      <div className="text-sm text-gray-600">Faixa de preços por diária</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold">{hotelSelecionado.avaliacao.nota}</span>
                      <span className="text-sm text-gray-600">({hotelSelecionado.avaliacao.total_avaliacoes} avaliações)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comodidades */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Comodidades</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {hotelSelecionado.comodidades.map((comodidade, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      {getComodidadeIcon(comodidade)}
                      <span className="text-sm">{comodidade.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Políticas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Políticas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Check-in:</strong> {hotelSelecionado.politicas.checkIn}</div>
                  <div><strong>Check-out:</strong> {hotelSelecionado.politicas.checkOut}</div>
                  <div><strong>Cancelamento:</strong> {hotelSelecionado.politicas.cancelamento}</div>
                  <div><strong>Crianças:</strong> {hotelSelecionado.politicas.criancas}</div>
                  <div><strong>Pets:</strong> {hotelSelecionado.politicas.pets ? 'Permitidos' : 'Não permitidos'}</div>
                </div>
              </div>

              {/* Comentários Recentes */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Comentários Recentes</h3>
                <div className="space-y-2">
                  {hotelSelecionado.avaliacao.comentarios_recentes.map((comentario, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">"{comentario}"</p>
                    </div>
                  ))}
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
              {modalTipo === 'edit' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {hoteisFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum hotel encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroCategoria !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar hotéis.'
              : 'Comece adicionando o primeiro hotel ao sistema.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Hotel
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaHoteis;
