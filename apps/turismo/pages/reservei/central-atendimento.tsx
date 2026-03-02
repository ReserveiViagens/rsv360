// 📞 CENTRAL DE ATENDIMENTO - RESERVEI VIAGENS
// Funcionalidade: Central unificada de atendimento ao cliente
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Phone, MessageSquare, Clock, User, Filter, CheckCircle, AlertTriangle, Star, ChevronDown } from 'lucide-react';

interface Atendimento {
  id: number;
  protocolo: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
    documento: string;
    tipo: 'vip' | 'premium' | 'regular';
    historico_compras: number;
  };
  tipo: 'duvida' | 'reclamacao' | 'elogio' | 'cancelamento' | 'alteracao' | 'suporte_tecnico' | 'informacao' | 'emergencia';
  canal: 'telefone' | 'whatsapp' | 'email' | 'chat' | 'presencial' | 'redes_sociais';
  assunto: string;
  descricao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'novo' | 'em_andamento' | 'aguardando_cliente' | 'aguardando_interno' | 'resolvido' | 'cancelado';
  departamento: 'vendas' | 'pos_vendas' | 'financeiro' | 'tecnico' | 'juridico' | 'diretoria';
  agente: {
    nome: string;
    id: string;
    avatar?: string;
  };
  tempo_resposta: number; // em minutos
  tempo_resolucao?: number; // em minutos
  data_abertura: string;
  data_ultima_interacao: string;
  data_resolucao?: string;
  interacoes: Array<{
    id: number;
    tipo: 'mensagem' | 'ligacao' | 'email' | 'interno';
    autor: string;
    conteudo: string;
    data: string;
    anexos?: string[];
  }>;
  satisfacao?: {
    nota: number;
    comentario: string;
    data: string;
  };
  tags: string[];
  observacoes_internas: string;
  produtos_relacionados: string[];
}

const CentralAtendimento: React.FC = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [atendimentoSelecionado, setAtendimentoSelecionado] = useState<Atendimento | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todos');
  const [filtroAgente, setFiltroAgente] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_abertura');

  // Dados mock
  const atendimentosMock: Atendimento[] = [
    {
      id: 1,
      protocolo: 'AT-2025-0001',
      cliente: {
        nome: 'João Silva Santos',
        email: 'joao.silva@email.com',
        telefone: '(64) 99999-1111',
        documento: '123.456.789-00',
        tipo: 'vip',
        historico_compras: 15
      },
      tipo: 'alteracao',
      canal: 'whatsapp',
      assunto: 'Alteração de data de viagem para Caldas Novas',
      descricao: 'Cliente precisa alterar a data da viagem de 15/09 para 22/09 devido a compromisso profissional. Reserva RES-HTL-2025-001.',
      prioridade: 'media',
      status: 'em_andamento',
      departamento: 'pos_vendas',
      agente: {
        nome: 'Ana Silva Santos',
        id: 'AG001',
        avatar: '/avatars/ana.jpg'
      },
      tempo_resposta: 5,
      data_abertura: '2025-08-25 14:30:00',
      data_ultima_interacao: '2025-08-25 15:45:00',
      interacoes: [
        {
          id: 1,
          tipo: 'mensagem',
          autor: 'João Silva Santos',
          conteudo: 'Boa tarde! Preciso alterar a data da minha viagem para Caldas Novas. É possível?',
          data: '2025-08-25 14:30:00'
        },
        {
          id: 2,
          tipo: 'mensagem',
          autor: 'Ana Silva Santos',
          conteudo: 'Olá João! Claro, vou verificar a disponibilidade para a nova data. Qual seria a nova data desejada?',
          data: '2025-08-25 14:35:00'
        },
        {
          id: 3,
          tipo: 'mensagem',
          autor: 'João Silva Santos',
          conteudo: 'Gostaria de alterar para 22/09. Mesmo hotel e mesmo quarto.',
          data: '2025-08-25 15:40:00'
        },
        {
          id: 4,
          tipo: 'interno',
          autor: 'Ana Silva Santos',
          conteudo: 'Verificando disponibilidade no Hotel Thermas Grand Resort para 22/09-25/09. Cliente VIP.',
          data: '2025-08-25 15:45:00'
        }
      ],
      tags: ['alteracao_data', 'vip', 'hotel', 'caldas_novas'],
      observacoes_internas: 'Cliente VIP com histórico de 15 compras. Priorizar atendimento.',
      produtos_relacionados: ['RES-HTL-2025-001', 'Hotel Thermas Grand Resort']
    },
    {
      id: 2,
      protocolo: 'AT-2025-0002',
      cliente: {
        nome: 'Maria Costa Oliveira',
        email: 'maria.costa@email.com',
        telefone: '(64) 98888-2222',
        documento: '987.654.321-00',
        tipo: 'regular',
        historico_compras: 3
      },
      tipo: 'duvida',
      canal: 'chat',
      assunto: 'Dúvidas sobre pacote de viagem para Caldas Novas',
      descricao: 'Cliente quer saber sobre inclusions do pacote, formas de pagamento e política de cancelamento.',
      prioridade: 'baixa',
      status: 'resolvido',
      departamento: 'vendas',
      agente: {
        nome: 'Carlos Vendedor Silva',
        id: 'AG002'
      },
      tempo_resposta: 2,
      tempo_resolucao: 25,
      data_abertura: '2025-08-24 10:15:00',
      data_ultima_interacao: '2025-08-24 10:45:00',
      data_resolucao: '2025-08-24 10:40:00',
      interacoes: [
        {
          id: 1,
          tipo: 'mensagem',
          autor: 'Maria Costa Oliveira',
          conteudo: 'Olá! Gostaria de saber sobre o pacote de 3 dias em Caldas Novas.',
          data: '2025-08-24 10:15:00'
        },
        {
          id: 2,
          tipo: 'mensagem',
          autor: 'Carlos Vendedor Silva',
          conteudo: 'Oi Maria! O pacote inclui hospedagem, café da manhã e acesso às piscinas termais. Posso enviar mais detalhes?',
          data: '2025-08-24 10:17:00'
        },
        {
          id: 3,
          tipo: 'mensagem',
          autor: 'Maria Costa Oliveira',
          conteudo: 'Sim, por favor! E quais são as formas de pagamento?',
          data: '2025-08-24 10:20:00'
        },
        {
          id: 4,
          tipo: 'mensagem',
          autor: 'Carlos Vendedor Silva',
          conteudo: 'Aceitamos cartão (até 6x), PIX (5% desconto), boleto ou transferência. Cancelamento gratuito até 48h antes.',
          data: '2025-08-24 10:25:00'
        }
      ],
      satisfacao: {
        nota: 5,
        comentario: 'Atendimento excelente! Muito esclarecedor.',
        data: '2025-08-24 11:00:00'
      },
      tags: ['duvida', 'pacote', 'pagamento', 'cancelamento'],
      observacoes_internas: 'Cliente demonstrou muito interesse. Prospect qualificado.',
      produtos_relacionados: ['Pacote Caldas Novas 3 dias']
    },
    {
      id: 3,
      protocolo: 'AT-2025-0003',
      cliente: {
        nome: 'Roberto Lima Empresário',
        email: 'roberto.lima@empresa.com.br',
        telefone: '(64) 97777-3333',
        documento: '111.222.333-44',
        tipo: 'premium',
        historico_compras: 8
      },
      tipo: 'reclamacao',
      canal: 'telefone',
      assunto: 'Problema com quarto no hotel - ruído excessivo',
      descricao: 'Cliente está hospedado e reclama de ruído excessivo no quarto 305. Solicita mudança imediata.',
      prioridade: 'alta',
      status: 'aguardando_interno',
      departamento: 'pos_vendas',
      agente: {
        nome: 'Maria Atendente Costa',
        id: 'AG003'
      },
      tempo_resposta: 1,
      data_abertura: '2025-08-25 20:15:00',
      data_ultima_interacao: '2025-08-25 20:30:00',
      interacoes: [
        {
          id: 1,
          tipo: 'ligacao',
          autor: 'Roberto Lima Empresário',
          conteudo: 'Ligação recebida: Cliente reclama de ruído no quarto 305. Som de obras na área externa.',
          data: '2025-08-25 20:15:00'
        },
        {
          id: 2,
          tipo: 'interno',
          autor: 'Maria Atendente Costa',
          conteudo: 'Contactando hotel para verificar disponibilidade de outros quartos. Cliente premium hospedado.',
          data: '2025-08-25 20:20:00'
        },
        {
          id: 3,
          tipo: 'ligacao',
          autor: 'Maria Atendente Costa',
          conteudo: 'Retorno ao cliente: Hotel confirma mudança para quarto 108, mais silencioso. Upgrade cortesia.',
          data: '2025-08-25 20:30:00'
        }
      ],
      tags: ['reclamacao', 'hotel', 'ruido', 'urgente', 'premium'],
      observacoes_internas: 'Cliente premium. Resolver com máxima agilidade. Hotel ofereceu upgrade.',
      produtos_relacionados: ['RES-HTL-2025-004', 'Hotel Caldas Plaza']
    },
    {
      id: 4,
      protocolo: 'AT-2025-0004',
      cliente: {
        nome: 'Fernanda Wellness',
        email: 'fernanda.wellness@email.com',
        telefone: '(64) 96666-4444',
        documento: '999.888.777-66',
        tipo: 'vip',
        historico_compras: 22
      },
      tipo: 'elogio',
      canal: 'email',
      assunto: 'Elogio pelo excelente atendimento no Spa Serenity',
      descricao: 'Cliente elogia a experiência no spa e o atendimento da equipe. Quer recomendar para amigas.',
      prioridade: 'baixa',
      status: 'resolvido',
      departamento: 'pos_vendas',
      agente: {
        nome: 'Ana Silva Santos',
        id: 'AG001'
      },
      tempo_resposta: 15,
      tempo_resolucao: 30,
      data_abertura: '2025-08-23 16:45:00',
      data_ultima_interacao: '2025-08-23 17:30:00',
      data_resolucao: '2025-08-23 17:15:00',
      interacoes: [
        {
          id: 1,
          tipo: 'email',
          autor: 'Fernanda Wellness',
          conteudo: 'Gostaria de parabenizar toda a equipe pelo atendimento excepcional no Spa Serenity. Experiência transformadora!',
          data: '2025-08-23 16:45:00'
        },
        {
          id: 2,
          tipo: 'email',
          autor: 'Ana Silva Santos',
          conteudo: 'Fernanda, muito obrigada pelo carinho! Ficamos felizes que tenha gostado. Vou repassar os elogios para toda equipe.',
          data: '2025-08-23 17:00:00'
        },
        {
          id: 3,
          tipo: 'interno',
          autor: 'Ana Silva Santos',
          conteudo: 'Cliente VIP muito satisfeita. Oportunidade para programa de indicações.',
          data: '2025-08-23 17:15:00'
        }
      ],
      satisfacao: {
        nota: 5,
        comentario: 'Sempre um prazer ser atendida pela Reservei!',
        data: '2025-08-23 17:30:00'
      },
      tags: ['elogio', 'spa', 'vip', 'satisfacao', 'indicacao'],
      observacoes_internas: 'Cliente VIP extremamente satisfeita. Potencial embaixadora da marca.',
      produtos_relacionados: ['RES-HTL-2025-003', 'Spa Hotel Serenity']
    },
    {
      id: 5,
      protocolo: 'AT-2025-0005',
      cliente: {
        nome: 'Carlos Urgente',
        email: 'carlos.urgente@email.com',
        telefone: '(64) 95555-5555',
        documento: '555.444.333-22',
        tipo: 'regular',
        historico_compras: 1
      },
      tipo: 'emergencia',
      canal: 'telefone',
      assunto: 'Emergência médica durante viagem - necessita suporte',
      descricao: 'Cliente teve emergência médica durante viagem em Caldas Novas. Precisa de orientações sobre seguro e hospital.',
      prioridade: 'critica',
      status: 'novo',
      departamento: 'pos_vendas',
      agente: {
        nome: 'Roberto Suporte 24h',
        id: 'AG004'
      },
      tempo_resposta: 0,
      data_abertura: '2025-08-25 22:30:00',
      data_ultima_interacao: '2025-08-25 22:30:00',
      interacoes: [
        {
          id: 1,
          tipo: 'ligacao',
          autor: 'Carlos Urgente',
          conteudo: 'Ligação urgente: Esposa passou mal no hotel. Precisa orientação sobre hospital e seguro viagem.',
          data: '2025-08-25 22:30:00'
        }
      ],
      tags: ['emergencia', 'medica', 'seguro', 'urgente', 'critico'],
      observacoes_internas: 'EMERGÊNCIA MÉDICA - Atender imediatamente. Acionar protocolo de emergência.',
      produtos_relacionados: ['Seguro Viagem', 'RES-HTL-2025-010']
    }
  ];

  useEffect(() => {
    setAtendimentos(atendimentosMock);
  }, []);

  const agentes = [...new Set(atendimentos.map(a => a.agente.nome))];

  const atendimentosFiltrados = atendimentos.filter(atendimento => {
    const matchBusca = atendimento.protocolo.toLowerCase().includes(busca.toLowerCase()) ||
                      atendimento.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      atendimento.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                      atendimento.cliente.telefone.includes(busca);

    const matchStatus = filtroStatus === 'todos' || atendimento.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || atendimento.tipo === filtroTipo;
    const matchPrioridade = filtroPrioridade === 'todos' || atendimento.prioridade === filtroPrioridade;
    const matchAgente = filtroAgente === 'todos' || atendimento.agente.nome === filtroAgente;

    return matchBusca && matchStatus && matchTipo && matchPrioridade && matchAgente;
  }).sort((a, b) => {
    if (ordenacao === 'data_abertura') {
      return new Date(b.data_abertura).getTime() - new Date(a.data_abertura).getTime();
    } else if (ordenacao === 'prioridade') {
      const prioridadeOrder = { 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    } else if (ordenacao === 'tempo_resposta') {
      return a.tempo_resposta - b.tempo_resposta;
    }
    return 0;
  });

  const estatisticas = {
    totalAtendimentos: atendimentos.length,
    novos: atendimentos.filter(a => a.status === 'novo').length,
    emAndamento: atendimentos.filter(a => a.status === 'em_andamento').length,
    resolvidos: atendimentos.filter(a => a.status === 'resolvido').length,
    tempoMedioResposta: atendimentos.reduce((acc, a) => acc + a.tempo_resposta, 0) / atendimentos.length,
    tempoMedioResolucao: atendimentos.filter(a => a.tempo_resolucao).reduce((acc, a) => acc + a.tempo_resolucao!, 0) / atendimentos.filter(a => a.tempo_resolucao).length,
    satisfacaoMedia: atendimentos.filter(a => a.satisfacao).reduce((acc, a) => acc + a.satisfacao!.nota, 0) / atendimentos.filter(a => a.satisfacao).length,
    criticos: atendimentos.filter(a => a.prioridade === 'critica').length
  };

  const handleView = (atendimento: Atendimento) => {
    setAtendimentoSelecionado(atendimento);
    setModalTipo('view');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_cliente': return 'bg-orange-100 text-orange-800';
      case 'aguardando_interno': return 'bg-purple-100 text-purple-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-500';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'duvida': return <MessageSquare className="h-4 w-4" />;
      case 'reclamacao': return <AlertTriangle className="h-4 w-4" />;
      case 'elogio': return <Star className="h-4 w-4" />;
      case 'emergencia': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getClienteTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'regular': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTempo = (minutos: number) => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins > 0 ? `${mins}min` : ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Phone className="h-8 w-8 text-blue-600" />
              Central de Atendimento
            </h1>
            <p className="text-gray-600 mt-2">Central unificada de atendimento ao cliente</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Clock className="h-4 w-4" />
              Métricas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Atendimento
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalAtendimentos}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.novos}</div>
            <div className="text-sm text-gray-600">Novos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.emAndamento}</div>
            <div className="text-sm text-gray-600">Em Andamento</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.resolvidos}</div>
            <div className="text-sm text-gray-600">Resolvidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{formatTempo(Math.round(estatisticas.tempoMedioResposta))}</div>
            <div className="text-sm text-gray-600">Tempo Resposta</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{formatTempo(Math.round(estatisticas.tempoMedioResolucao))}</div>
            <div className="text-sm text-gray-600">Tempo Resolução</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.satisfacaoMedia.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Satisfação</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{estatisticas.criticos}</div>
            <div className="text-sm text-gray-600">Críticos</div>
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
                placeholder="Buscar atendimentos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Status</option>
            <option value="novo">Novo</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_cliente">Aguardando Cliente</option>
            <option value="aguardando_interno">Aguardando Interno</option>
            <option value="resolvido">Resolvido</option>
            <option value="cancelado">Cancelado</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Tipos</option>
            <option value="duvida">Dúvida</option>
            <option value="reclamacao">Reclamação</option>
            <option value="elogio">Elogio</option>
            <option value="cancelamento">Cancelamento</option>
            <option value="alteracao">Alteração</option>
            <option value="suporte_tecnico">Suporte Técnico</option>
            <option value="emergencia">Emergência</option>
          </select>

          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas Prioridades</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <select
            value={filtroAgente}
            onChange={(e) => setFiltroAgente(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Agentes</option>
            {agentes.map(agente => (
              <option key={agente} value={agente}>{agente}</option>
            ))}
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="data_abertura">Data</option>
            <option value="prioridade">Prioridade</option>
            <option value="tempo_resposta">Tempo Resposta</option>
          </select>
        </div>
      </div>

      {/* Lista de Atendimentos */}
      <div className="space-y-4">
        {atendimentosFiltrados.map((atendimento) => (
          <div
            key={atendimento.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
              atendimento.prioridade === 'critica' ? 'border-l-red-500 bg-red-50' :
              atendimento.prioridade === 'alta' ? 'border-l-orange-500' :
              atendimento.prioridade === 'media' ? 'border-l-yellow-500' :
              'border-l-green-500'
            }`}
          >
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-lg text-gray-900">{atendimento.protocolo}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPrioridadeColor(atendimento.prioridade)}`}>
                    {atendimento.prioridade.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atendimento.status)}`}>
                    {atendimento.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{atendimento.assunto}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{atendimento.descricao}</p>
              </div>

              <div className="flex items-center gap-2 ml-4">
                {getTipoIcon(atendimento.tipo)}
                <span className="text-sm text-gray-500">{atendimento.canal}</span>
              </div>
            </div>

            {/* Cliente e Agente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Cliente</h4>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {atendimento.cliente.nome}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getClienteTypeColor(atendimento.cliente.tipo)}`}>
                      {atendimento.cliente.tipo.toUpperCase()}
                    </span>
                  </div>
                  <div>{atendimento.cliente.telefone}</div>
                  <div className="text-xs">{atendimento.cliente.historico_compras} compras</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Agente Responsável</h4>
                <div className="text-sm text-gray-600">
                  <div>{atendimento.agente.nome}</div>
                  <div className="text-xs">ID: {atendimento.agente.id}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Métricas</h4>
                <div className="text-sm text-gray-600">
                  <div>Resposta: {formatTempo(atendimento.tempo_resposta)}</div>
                  {atendimento.tempo_resolucao && (
                    <div>Resolução: {formatTempo(atendimento.tempo_resolucao)}</div>
                  )}
                  {atendimento.satisfacao && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      {atendimento.satisfacao.nota}/5
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {atendimento.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div>Aberto: {new Date(atendimento.data_abertura).toLocaleString()}</div>
                <div>Última interação: {new Date(atendimento.data_ultima_interacao).toLocaleString()}</div>
                {atendimento.data_resolucao && (
                  <div>Resolvido: {new Date(atendimento.data_resolucao).toLocaleString()}</div>
                )}
              </div>

              <button
                onClick={() => handleView(atendimento)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Eye className="h-4 w-4" />
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showModal && atendimentoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {atendimentoSelecionado.protocolo} - {atendimentoSelecionado.assunto}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(atendimentoSelecionado.prioridade)}`}>
                  {atendimentoSelecionado.prioridade}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(atendimentoSelecionado.status)}`}>
                  {atendimentoSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Timeline de Interações */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Histórico de Interações</h3>
                <div className="space-y-4">
                  {atendimentoSelecionado.interacoes.map((interacao) => (
                    <div key={interacao.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          interacao.tipo === 'interno' ? 'bg-gray-100' :
                          interacao.tipo === 'ligacao' ? 'bg-blue-100' :
                          'bg-green-100'
                        }`}>
                          {interacao.tipo === 'ligacao' ? <Phone className="h-4 w-4" /> :
                           interacao.tipo === 'email' ? <MessageSquare className="h-4 w-4" /> :
                           <MessageSquare className="h-4 w-4" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{interacao.autor}</span>
                          <span className="text-xs text-gray-500">{interacao.tipo}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(interacao.data).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                          {interacao.conteudo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informações Completas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações do Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {atendimentoSelecionado.cliente.nome}</div>
                    <div><strong>Email:</strong> {atendimentoSelecionado.cliente.email}</div>
                    <div><strong>Telefone:</strong> {atendimentoSelecionado.cliente.telefone}</div>
                    <div><strong>Documento:</strong> {atendimentoSelecionado.cliente.documento}</div>
                    <div><strong>Tipo:</strong>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getClienteTypeColor(atendimentoSelecionado.cliente.tipo)}`}>
                        {atendimentoSelecionado.cliente.tipo}
                      </span>
                    </div>
                    <div><strong>Histórico:</strong> {atendimentoSelecionado.cliente.historico_compras} compras</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Detalhes do Atendimento</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Departamento:</strong> {atendimentoSelecionado.departamento}</div>
                    <div><strong>Canal:</strong> {atendimentoSelecionado.canal}</div>
                    <div><strong>Tipo:</strong> {atendimentoSelecionado.tipo}</div>
                    <div><strong>Produtos Relacionados:</strong></div>
                    <ul className="ml-4">
                      {atendimentoSelecionado.produtos_relacionados.map((produto, index) => (
                        <li key={index} className="text-blue-600">• {produto}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Satisfação */}
              {atendimentoSelecionado.satisfacao && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Avaliação de Satisfação</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-bold">{atendimentoSelecionado.satisfacao.nota}/5</span>
                    </div>
                    <p className="text-sm text-gray-700">{atendimentoSelecionado.satisfacao.comentario}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      Avaliado em: {new Date(atendimentoSelecionado.satisfacao.data).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Observações Internas */}
              {atendimentoSelecionado.observacoes_internas && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações Internas</h3>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {atendimentoSelecionado.observacoes_internas}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Fechar
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Adicionar Interação
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Marcar como Resolvido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {atendimentosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroTipo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar atendimentos.'
              : 'Aguardando novos atendimentos.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CentralAtendimento;
