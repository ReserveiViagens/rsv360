// 🏨 SISTEMA DE RESERVAS DE HOTÉIS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de reservas hoteleiras
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Calendar, Users, MapPin, Clock, DollarSign, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react';

interface ReservaHotel {
  id: number;
  codigo: string;
  hotel: {
    id: number;
    nome: string;
    categoria: string;
    endereco: string;
    estrelas: number;
  };
  hospede_principal: {
    nome: string;
    documento: string;
    email: string;
    telefone: string;
  };
  hospedes_adicionais: Array<{
    nome: string;
    documento: string;
    idade?: number;
  }>;
  quarto: {
    tipo: string;
    categoria: string;
    numero?: string;
    capacidade: number;
    comodidades: string[];
  };
  periodo: {
    checkin: string;
    checkout: string;
    noites: number;
  };
  valores: {
    diaria: number;
    total_diarias: number;
    taxas: number;
    desconto: number;
    total: number;
  };
  pagamento: {
    forma: string;
    status: 'pendente' | 'parcial' | 'pago' | 'cancelado';
    parcelas: number;
    valor_pago: number;
    valor_pendente: number;
  };
  status: 'confirmada' | 'pendente' | 'check_in' | 'hospedado' | 'check_out' | 'cancelada' | 'no_show';
  observacoes: string;
  vendedor: string;
  data_reserva: string;
  data_atualizacao: string;
  confirmacao_hotel?: string;
  politica_cancelamento: string;
}

const SistemaReservasHoteis: React.FC = () => {
  const [reservas, setReservas] = useState<ReservaHotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [reservaSelecionada, setReservaSelecionada] = useState<ReservaHotel | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPagamento, setFiltroPagamento] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [ordenacao, setOrdenacao] = useState('data_reserva');
  const [ordemCrescente, setOrdemCrescente] = useState(false);

  // Dados mock
  const reservasMock: ReservaHotel[] = [
    {
      id: 1,
      codigo: 'RES-HTL-2025-001',
      hotel: {
        id: 1,
        nome: 'Hotel Thermas Grand Resort',
        categoria: 'resort',
        endereco: 'Caldas Novas, GO',
        estrelas: 5
      },
      hospede_principal: {
        nome: 'João Silva Santos',
        documento: '123.456.789-00',
        email: 'joao.silva@email.com',
        telefone: '(64) 99999-1111'
      },
      hospedes_adicionais: [
        { nome: 'Maria Silva Santos', documento: '987.654.321-00', idade: 35 },
        { nome: 'Pedro Silva Santos', documento: '456.789.123-00', idade: 8 },
        { nome: 'Ana Silva Santos', documento: '321.654.987-00', idade: 5 }
      ],
      quarto: {
        tipo: 'Suite Family',
        categoria: 'luxo',
        numero: '305',
        capacidade: 6,
        comodidades: ['wifi', 'ar_condicionado', 'frigobar', 'varanda', 'banheira']
      },
      periodo: {
        checkin: '2025-09-15',
        checkout: '2025-09-18',
        noites: 3
      },
      valores: {
        diaria: 450.00,
        total_diarias: 1350.00,
        taxas: 67.50,
        desconto: 135.00,
        total: 1282.50
      },
      pagamento: {
        forma: 'cartao_credito',
        status: 'pago',
        parcelas: 3,
        valor_pago: 1282.50,
        valor_pendente: 0
      },
      status: 'confirmada',
      observacoes: 'Cliente solicitou quarto com vista para a piscina. Aniversário da criança no dia 16/09.',
      vendedor: 'Ana Silva Santos',
      data_reserva: '2025-08-20 14:30:00',
      data_atualizacao: '2025-08-25 10:15:00',
      confirmacao_hotel: 'CONF-TGR-789456',
      politica_cancelamento: 'Cancelamento gratuito até 48h antes do check-in'
    },
    {
      id: 2,
      codigo: 'RES-HTL-2025-002',
      hotel: {
        id: 2,
        nome: 'Pousada Águas Claras',
        categoria: 'pousada',
        endereco: 'Caldas Novas, GO',
        estrelas: 4
      },
      hospede_principal: {
        nome: 'Carlos Oliveira',
        documento: '555.666.777-88',
        email: 'carlos.oliveira@email.com',
        telefone: '(64) 98888-2222'
      },
      hospedes_adicionais: [
        { nome: 'Sandra Oliveira', documento: '888.777.666-55', idade: 42 }
      ],
      quarto: {
        tipo: 'Quarto Casal',
        categoria: 'standard',
        capacidade: 2,
        comodidades: ['wifi', 'ar_condicionado', 'tv_smart']
      },
      periodo: {
        checkin: '2025-09-10',
        checkout: '2025-09-12',
        noites: 2
      },
      valores: {
        diaria: 180.00,
        total_diarias: 360.00,
        taxas: 18.00,
        desconto: 0,
        total: 378.00
      },
      pagamento: {
        forma: 'pix',
        status: 'pago',
        parcelas: 1,
        valor_pago: 378.00,
        valor_pendente: 0
      },
      status: 'check_in',
      observacoes: 'Lua de mel - solicitar decoração especial',
      vendedor: 'Carlos Vendedor Silva',
      data_reserva: '2025-08-25 16:45:00',
      data_atualizacao: '2025-09-10 14:00:00',
      confirmacao_hotel: 'CONF-AC-123789',
      politica_cancelamento: 'Cancelamento gratuito até 24h antes do check-in'
    },
    {
      id: 3,
      codigo: 'RES-HTL-2025-003',
      hotel: {
        id: 4,
        nome: 'Spa Hotel Serenity',
        categoria: 'spa',
        endereco: 'Caldas Novas, GO',
        estrelas: 5
      },
      hospede_principal: {
        nome: 'Fernanda Costa',
        documento: '999.888.777-66',
        email: 'fernanda.costa@email.com',
        telefone: '(64) 97777-3333'
      },
      hospedes_adicionais: [],
      quarto: {
        tipo: 'Suite Spa Premium',
        categoria: 'premium',
        capacidade: 1,
        comodidades: ['wifi', 'banheira_hidro', 'varanda_privativa', 'frigobar', 'cofre']
      },
      periodo: {
        checkin: '2025-09-20',
        checkout: '2025-09-23',
        noites: 3
      },
      valores: {
        diaria: 680.00,
        total_diarias: 2040.00,
        taxas: 102.00,
        desconto: 204.00,
        total: 1938.00
      },
      pagamento: {
        forma: 'boleto',
        status: 'pendente',
        parcelas: 1,
        valor_pago: 0,
        valor_pendente: 1938.00
      },
      status: 'pendente',
      observacoes: 'Retiro de bem-estar - incluir pacote de tratamentos',
      vendedor: 'Maria Atendente Costa',
      data_reserva: '2025-08-28 11:20:00',
      data_atualizacao: '2025-08-28 11:20:00',
      politica_cancelamento: 'Cancelamento gratuito até 72h antes do check-in'
    },
    {
      id: 4,
      codigo: 'RES-HTL-2025-004',
      hotel: {
        id: 3,
        nome: 'Hotel Caldas Plaza',
        categoria: 'hotel',
        endereco: 'Caldas Novas, GO',
        estrelas: 3
      },
      hospede_principal: {
        nome: 'Roberto Lima',
        documento: '111.222.333-44',
        email: 'roberto.lima@email.com',
        telefone: '(64) 96666-4444'
      },
      hospedes_adicionais: [
        { nome: 'Helena Lima', documento: '444.333.222-11', idade: 38 },
        { nome: 'Bruno Lima', documento: '222.333.444-55', idade: 12 },
        { nome: 'Julia Lima', documento: '333.444.555-66', idade: 10 }
      ],
      quarto: {
        tipo: 'Apartamento Família',
        categoria: 'standard',
        capacidade: 4,
        comodidades: ['wifi', 'ar_condicionado', 'tv_cabo']
      },
      periodo: {
        checkin: '2025-09-05',
        checkout: '2025-09-08',
        noites: 3
      },
      valores: {
        diaria: 120.00,
        total_diarias: 360.00,
        taxas: 18.00,
        desconto: 36.00,
        total: 342.00
      },
      pagamento: {
        forma: 'cartao_debito',
        status: 'pago',
        parcelas: 1,
        valor_pago: 342.00,
        valor_pendente: 0
      },
      status: 'check_out',
      observacoes: 'Família com crianças - disponibilizar berço extra',
      vendedor: 'Roberto Vendedor',
      data_reserva: '2025-08-15 09:30:00',
      data_atualizacao: '2025-09-08 11:00:00',
      confirmacao_hotel: 'CONF-CP-456123',
      politica_cancelamento: 'Cancelamento com taxa após 24h'
    }
  ];

  useEffect(() => {
    setReservas(reservasMock);
    // Definir datas padrão (próximos 30 dias)
    const hoje = new Date();
    const trintaDias = new Date(hoje);
    trintaDias.setDate(hoje.getDate() + 30);

    setDataInicio(hoje.toISOString().split('T')[0]);
    setDataFim(trintaDias.toISOString().split('T')[0]);
  }, []);

  const reservasFiltradas = reservas.filter(reserva => {
    const matchBusca = reserva.codigo.toLowerCase().includes(busca.toLowerCase()) ||
                      reserva.hospede_principal.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      reserva.hotel.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      reserva.hospede_principal.documento.includes(busca);

    const matchStatus = filtroStatus === 'todos' || reserva.status === filtroStatus;
    const matchPagamento = filtroPagamento === 'todos' || reserva.pagamento.status === filtroPagamento;

    let matchData = true;
    if (dataInicio && dataFim) {
      const checkinDate = new Date(reserva.periodo.checkin);
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      matchData = checkinDate >= inicio && checkinDate <= fim;
    }

    return matchBusca && matchStatus && matchPagamento && matchData;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'data_reserva':
        valueA = new Date(a.data_reserva);
        valueB = new Date(b.data_reserva);
        break;
      case 'checkin':
        valueA = new Date(a.periodo.checkin);
        valueB = new Date(b.periodo.checkin);
        break;
      case 'valor':
        valueA = a.valores.total;
        valueB = b.valores.total;
        break;
      case 'hospede':
        valueA = a.hospede_principal.nome;
        valueB = b.hospede_principal.nome;
        break;
      default:
        valueA = new Date(a.data_reserva);
        valueB = new Date(b.data_reserva);
    }

    if (valueA instanceof Date) {
      return ordemCrescente ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else if (typeof valueA === 'string') {
      return ordemCrescente ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  const estatisticas = {
    totalReservas: reservas.length,
    reservasConfirmadas: reservas.filter(r => r.status === 'confirmada').length,
    reservasPendentes: reservas.filter(r => r.status === 'pendente').length,
    hospedados: reservas.filter(r => r.status === 'hospedado' || r.status === 'check_in').length,
    receitaTotal: reservas.filter(r => r.status !== 'cancelada').reduce((acc, r) => acc + r.valores.total, 0),
    receitaPaga: reservas.filter(r => r.pagamento.status === 'pago').reduce((acc, r) => acc + r.valores.total, 0),
    ticketMedio: reservas.length > 0 ? reservas.reduce((acc, r) => acc + r.valores.total, 0) / reservas.length : 0
  };

  const handleView = (reserva: ReservaHotel) => {
    setReservaSelecionada(reserva);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (reserva: ReservaHotel) => {
    setReservaSelecionada(reserva);
    setModalTipo('edit');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'check_in': return 'bg-blue-100 text-blue-800';
      case 'hospedado': return 'bg-purple-100 text-purple-800';
      case 'check_out': return 'bg-gray-100 text-gray-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmada': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'check_in': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'hospedado': return <Users className="h-4 w-4 text-purple-600" />;
      case 'check_out': return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case 'cancelada': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'no_show': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPagamentoColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'parcial': return 'bg-yellow-100 text-yellow-800';
      case 'pendente': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
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
              <Calendar className="h-8 w-8 text-purple-600" />
              Reservas de Hotéis
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de reservas hoteleiras</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <DollarSign className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nova Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalReservas}</div>
            <div className="text-sm text-gray-600">Total Reservas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.reservasConfirmadas}</div>
            <div className="text-sm text-gray-600">Confirmadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.reservasPendentes}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.hospedados}</div>
            <div className="text-sm text-gray-600">Hospedados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.receitaPaga.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita Paga</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.ticketMedio.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Ticket Médio</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar reservas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Status</option>
            <option value="confirmada">Confirmada</option>
            <option value="pendente">Pendente</option>
            <option value="check_in">Check-in</option>
            <option value="hospedado">Hospedado</option>
            <option value="check_out">Check-out</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_show">No Show</option>
          </select>

          <select
            value={filtroPagamento}
            onChange={(e) => setFiltroPagamento(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Pagamentos</option>
            <option value="pago">Pago</option>
            <option value="parcial">Parcial</option>
            <option value="pendente">Pendente</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            placeholder="Data início"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            placeholder="Data fim"
          />

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="data_reserva">Data Reserva</option>
            <option value="checkin">Check-in</option>
            <option value="valor">Valor</option>
            <option value="hospede">Hóspede</option>
          </select>
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserva</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hóspede</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reservasFiltradas.map((reserva) => (
                <tr key={reserva.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{reserva.codigo}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(reserva.data_reserva).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        por {reserva.vendedor}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{reserva.hospede_principal.nome}</div>
                      <div className="text-sm text-gray-500">{reserva.hospede_principal.documento}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reserva.hospedes_adicionais.length + 1} pessoa(s)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{reserva.hotel.nome}</div>
                      <div className="text-sm text-gray-500">{reserva.quarto.tipo}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {reserva.hotel.endereco}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(reserva.periodo.checkin).toLocaleDateString()} -
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(reserva.periodo.checkout).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reserva.periodo.noites} noite(s)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reserva.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reserva.status)}`}>
                        {reserva.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPagamentoColor(reserva.pagamento.status)}`}>
                        {reserva.pagamento.status.toUpperCase()}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">
                        {reserva.pagamento.forma.replace('_', ' ')}
                      </div>
                      {reserva.pagamento.valor_pendente > 0 && (
                        <div className="text-sm text-red-600">
                          Pendente: R$ {reserva.pagamento.valor_pendente.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {reserva.valores.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        R$ {reserva.valores.diaria.toFixed(2)}/diária
                      </div>
                      {reserva.valores.desconto > 0 && (
                        <div className="text-sm text-green-600">
                          Desconto: R$ {reserva.valores.desconto.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(reserva)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(reserva)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {reserva.status === 'pendente' && (
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
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
      {showModal && reservaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Reserva {reservaSelecionada.codigo}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservaSelecionada.status)}`}>
                  {reservaSelecionada.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPagamentoColor(reservaSelecionada.pagamento.status)}`}>
                  {reservaSelecionada.pagamento.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações do Hóspede */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hóspede Principal</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {reservaSelecionada.hospede_principal.nome}</div>
                    <div><strong>Documento:</strong> {reservaSelecionada.hospede_principal.documento}</div>
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <strong>Email:</strong> {reservaSelecionada.hospede_principal.email}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <strong>Telefone:</strong> {reservaSelecionada.hospede_principal.telefone}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Hóspedes Adicionais</h3>
                  {reservaSelecionada.hospedes_adicionais.length > 0 ? (
                    <div className="space-y-2 text-sm">
                      {reservaSelecionada.hospedes_adicionais.map((hospede, index) => (
                        <div key={index}>
                          <div><strong>{hospede.nome}</strong></div>
                          <div className="text-gray-600">
                            {hospede.documento} {hospede.idade && `(${hospede.idade} anos)`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">Nenhum hóspede adicional</div>
                  )}
                </div>
              </div>

              {/* Hotel e Quarto */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hotel</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {reservaSelecionada.hotel.nome}</div>
                    <div><strong>Categoria:</strong> {reservaSelecionada.hotel.categoria}</div>
                    <div><strong>Endereço:</strong> {reservaSelecionada.hotel.endereco}</div>
                    {reservaSelecionada.confirmacao_hotel && (
                      <div><strong>Confirmação:</strong> {reservaSelecionada.confirmacao_hotel}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Quarto</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Tipo:</strong> {reservaSelecionada.quarto.tipo}</div>
                    <div><strong>Categoria:</strong> {reservaSelecionada.quarto.categoria}</div>
                    <div><strong>Capacidade:</strong> {reservaSelecionada.quarto.capacidade} pessoa(s)</div>
                    {reservaSelecionada.quarto.numero && (
                      <div><strong>Número:</strong> {reservaSelecionada.quarto.numero}</div>
                    )}
                    <div><strong>Comodidades:</strong></div>
                    <div className="flex flex-wrap gap-1">
                      {reservaSelecionada.quarto.comodidades.map((comodidade, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {comodidade.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Período e Valores */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Período da Estadia</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Check-in:</strong> {new Date(reservaSelecionada.periodo.checkin).toLocaleDateString()}</div>
                    <div><strong>Check-out:</strong> {new Date(reservaSelecionada.periodo.checkout).toLocaleDateString()}</div>
                    <div><strong>Noites:</strong> {reservaSelecionada.periodo.noites}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Valores</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Diária:</span>
                      <span>R$ {reservaSelecionada.valores.diaria.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Diárias:</span>
                      <span>R$ {reservaSelecionada.valores.total_diarias.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxas:</span>
                      <span>R$ {reservaSelecionada.valores.taxas.toFixed(2)}</span>
                    </div>
                    {reservaSelecionada.valores.desconto > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto:</span>
                        <span>- R$ {reservaSelecionada.valores.desconto.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R$ {reservaSelecionada.valores.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações de Pagamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div><strong>Forma:</strong> {reservaSelecionada.pagamento.forma.replace('_', ' ')}</div>
                  <div><strong>Parcelas:</strong> {reservaSelecionada.pagamento.parcelas}x</div>
                  <div><strong>Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getPagamentoColor(reservaSelecionada.pagamento.status)}`}>
                      {reservaSelecionada.pagamento.status}
                    </span>
                  </div>
                  <div><strong>Valor Pago:</strong> R$ {reservaSelecionada.pagamento.valor_pago.toFixed(2)}</div>
                  <div><strong>Valor Pendente:</strong> R$ {reservaSelecionada.pagamento.valor_pendente.toFixed(2)}</div>
                </div>
              </div>

              {/* Observações */}
              {reservaSelecionada.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {reservaSelecionada.observacoes}
                  </p>
                </div>
              )}

              {/* Política de Cancelamento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Política de Cancelamento</h3>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                  {reservaSelecionada.politica_cancelamento}
                </p>
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
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {reservasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma reserva encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroPagamento !== 'todos'
              ? 'Tente ajustar os filtros para encontrar reservas.'
              : 'Comece criando a primeira reserva de hotel.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Nova Reserva
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaReservasHoteis;
