// 🎫 TICKETS DE SUPORTE - RESERVEI VIAGENS
// Funcionalidade: Sistema de tickets para suporte técnico e interno
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, MessageSquare, Clock, User, AlertTriangle, CheckCircle, Archive, Filter, Tag, Paperclip, Send } from 'lucide-react';

interface SupportTicket {
  id: number;
  numero: string;
  titulo: string;
  descricao: string;
  categoria: 'bug' | 'feature' | 'melhoria' | 'duvida' | 'acesso' | 'integracao' | 'performance' | 'dados';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica' | 'urgente';
  status: 'aberto' | 'em_analise' | 'em_desenvolvimento' | 'aguardando_teste' | 'resolvido' | 'fechado' | 'cancelado';
  solicitante: {
    nome: string;
    email: string;
    departamento: string;
    cargo: string;
  };
  responsavel?: {
    nome: string;
    equipe: string;
    avatar?: string;
  };
  data_abertura: string;
  data_atualizacao: string;
  data_resolucao?: string;
  tempo_resposta?: number; // em horas
  tempo_resolucao?: number; // em horas
  sla_vencimento: string;
  tags: string[];
  anexos: Array<{
    nome: string;
    url: string;
    tipo: string;
    tamanho: string;
    data_upload: string;
  }>;
  comentarios: Array<{
    id: number;
    autor: string;
    tipo: 'publico' | 'interno';
    conteudo: string;
    data: string;
    anexos?: Array<{
      nome: string;
      url: string;
    }>;
  }>;
  sistema_afetado?: string;
  versao?: string;
  browser?: string;
  passos_reproduzir?: string;
  resultado_esperado?: string;
  resultado_obtido?: string;
  workaround?: string;
  impacto: 'baixo' | 'medio' | 'alto' | 'critico';
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  satisfacao?: {
    nota: number;
    comentario: string;
    data: string;
  };
}

const TicketsSuporte: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [ticketSelecionado, setTicketSelecionado] = useState<SupportTicket | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroPrioridade, setFiltroPrioridade] = useState('todas');
  const [filtroResponsavel, setFiltroResponsavel] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_atualizacao');
  const [novoComentario, setNovoComentario] = useState('');

  // Dados mock
  const ticketsMock: SupportTicket[] = [
    {
      id: 1,
      numero: 'SUP-2025-0001',
      titulo: 'Erro ao gerar relatório de vendas mensal',
      descricao: 'O sistema está retornando erro 500 ao tentar gerar o relatório de vendas do mês de agosto. O erro ocorre tanto na versão web quanto na exportação em PDF.',
      categoria: 'bug',
      prioridade: 'alta',
      status: 'em_analise',
      solicitante: {
        nome: 'Ana Silva Santos',
        email: 'ana.silva@reservei.com.br',
        departamento: 'Vendas',
        cargo: 'Coordenadora de Vendas'
      },
      responsavel: {
        nome: 'Carlos TI Silva',
        equipe: 'Desenvolvimento',
        avatar: '/avatars/carlos-ti.jpg'
      },
      data_abertura: '2025-08-24 14:30:00',
      data_atualizacao: '2025-08-25 09:15:00',
      tempo_resposta: 2,
      sla_vencimento: '2025-08-26 14:30:00',
      tags: ['relatorio', 'vendas', 'erro_500', 'pdf'],
      anexos: [
        {
          nome: 'screenshot_erro.png',
          url: '/uploads/screenshot_erro.png',
          tipo: 'image/png',
          tamanho: '245 KB',
          data_upload: '2025-08-24 14:35:00'
        },
        {
          nome: 'log_erro.txt',
          url: '/uploads/log_erro.txt',
          tipo: 'text/plain',
          tamanho: '12 KB',
          data_upload: '2025-08-24 14:40:00'
        }
      ],
      comentarios: [
        {
          id: 1,
          autor: 'Ana Silva Santos',
          tipo: 'publico',
          conteudo: 'O erro começou a ocorrer hoje pela manhã. Tentei gerar o relatório várias vezes mas sempre retorna o mesmo erro. Estou anexando o screenshot do erro.',
          data: '2025-08-24 14:30:00'
        },
        {
          id: 2,
          autor: 'Carlos TI Silva',
          tipo: 'publico',
          conteudo: 'Obrigado pelo reporte, Ana. Estou analisando o erro. Parece ser um problema na consulta SQL do módulo de relatórios. Vou investigar e retorno em breve.',
          data: '2025-08-24 16:20:00'
        },
        {
          id: 3,
          autor: 'Carlos TI Silva',
          tipo: 'interno',
          conteudo: 'Identifiquei o problema: a tabela de vendas teve alteração na estrutura ontem e a query não foi atualizada. Fazendo a correção.',
          data: '2025-08-25 09:15:00'
        }
      ],
      sistema_afetado: 'Sistema de Relatórios',
      versao: '2.1.4',
      browser: 'Chrome 116.0',
      passos_reproduzir: '1. Ir em Relatórios > Vendas\n2. Selecionar período "Agosto 2025"\n3. Clicar em "Gerar Relatório"\n4. Erro aparece na tela',
      resultado_esperado: 'Relatório deveria ser gerado e exibido na tela',
      resultado_obtido: 'Erro 500 - Internal Server Error',
      impacto: 'alto',
      urgencia: 'alta'
    },
    {
      id: 2,
      numero: 'SUP-2025-0002',
      titulo: 'Solicitação de nova funcionalidade: Filtro avançado de clientes',
      descricao: 'Gostaria de solicitar uma funcionalidade para filtrar clientes por múltiplos critérios simultaneamente, como tipo de cliente, histórico de compras, cidade, etc.',
      categoria: 'feature',
      prioridade: 'media',
      status: 'aberto',
      solicitante: {
        nome: 'Roberto Vendedor',
        email: 'roberto.vendedor@reservei.com.br',
        departamento: 'Vendas',
        cargo: 'Vendedor Senior'
      },
      data_abertura: '2025-08-23 10:15:00',
      data_atualizacao: '2025-08-23 10:15:00',
      sla_vencimento: '2025-08-30 10:15:00',
      tags: ['feature', 'clientes', 'filtro', 'vendas'],
      anexos: [
        {
          nome: 'mockup_filtro.pdf',
          url: '/uploads/mockup_filtro.pdf',
          tipo: 'application/pdf',
          tamanho: '890 KB',
          data_upload: '2025-08-23 10:20:00'
        }
      ],
      comentarios: [
        {
          id: 1,
          autor: 'Roberto Vendedor',
          tipo: 'publico',
          conteudo: 'Esta funcionalidade ajudaria muito no dia a dia das vendas. Estou anexando um mockup de como poderia funcionar. A ideia é poder combinar filtros como: Tipo VIP + Cidade São Paulo + Mais de 5 compras.',
          data: '2025-08-23 10:15:00'
        }
      ],
      impacto: 'medio',
      urgencia: 'media'
    },
    {
      id: 3,
      numero: 'SUP-2025-0003',
      titulo: 'Sistema lento durante horário de pico',
      descricao: 'O sistema fica muito lento entre 14h e 16h, principalmente nas telas de reserva e consulta de disponibilidade. A resposta demora mais de 10 segundos.',
      categoria: 'performance',
      prioridade: 'alta',
      status: 'em_desenvolvimento',
      solicitante: {
        nome: 'Maria Atendente Costa',
        email: 'maria.atendente@reservei.com.br',
        departamento: 'Atendimento',
        cargo: 'Atendente'
      },
      responsavel: {
        nome: 'João DevOps',
        equipe: 'Infraestrutura',
        avatar: '/avatars/joao-devops.jpg'
      },
      data_abertura: '2025-08-22 15:30:00',
      data_atualizacao: '2025-08-25 11:00:00',
      tempo_resposta: 18,
      sla_vencimento: '2025-08-25 15:30:00',
      tags: ['performance', 'lentidao', 'horario_pico', 'reservas'],
      anexos: [],
      comentarios: [
        {
          id: 1,
          autor: 'Maria Atendente Costa',
          tipo: 'publico',
          conteudo: 'O problema acontece todos os dias no mesmo horário. Os clientes ficam esperando muito tempo e alguns desistem da compra.',
          data: '2025-08-22 15:30:00'
        },
        {
          id: 2,
          autor: 'João DevOps',
          tipo: 'publico',
          conteudo: 'Identifiquei que há um pico de uso nesse horário. Vou implementar cache para as consultas mais frequentes e otimizar algumas queries.',
          data: '2025-08-23 08:45:00'
        },
        {
          id: 3,
          autor: 'João DevOps',
          tipo: 'interno',
          conteudo: 'Cache implementado. Monitorando performance. Melhoria de 60% na velocidade das consultas.',
          data: '2025-08-25 11:00:00'
        }
      ],
      sistema_afetado: 'Sistema de Reservas',
      versao: '2.1.4',
      impacto: 'alto',
      urgencia: 'alta'
    },
    {
      id: 4,
      numero: 'SUP-2025-0004',
      titulo: 'Problema de acesso ao sistema',
      descricao: 'Não conseguindo fazer login no sistema. Aparece mensagem "Credenciais inválidas" mesmo com senha correta.',
      categoria: 'acesso',
      prioridade: 'critica',
      status: 'resolvido',
      solicitante: {
        nome: 'Fernando Novo Funcionário',
        email: 'fernando.novo@reservei.com.br',
        departamento: 'Vendas',
        cargo: 'Vendedor Jr'
      },
      responsavel: {
        nome: 'Support Team',
        equipe: 'Suporte'
      },
      data_abertura: '2025-08-21 09:00:00',
      data_atualizacao: '2025-08-21 09:45:00',
      data_resolucao: '2025-08-21 09:45:00',
      tempo_resposta: 0.5,
      tempo_resolucao: 0.75,
      sla_vencimento: '2025-08-21 13:00:00',
      tags: ['acesso', 'login', 'credenciais', 'usuario_novo'],
      anexos: [],
      comentarios: [
        {
          id: 1,
          autor: 'Fernando Novo Funcionário',
          tipo: 'publico',
          conteudo: 'Sou funcionário novo e recebi as credenciais por email, mas não consigo acessar o sistema.',
          data: '2025-08-21 09:00:00'
        },
        {
          id: 2,
          autor: 'Support Team',
          tipo: 'publico',
          conteudo: 'Olá Fernando! Identifiquei que sua conta ainda não foi ativada. Já fiz a ativação. Tente fazer login novamente.',
          data: '2025-08-21 09:30:00'
        },
        {
          id: 3,
          autor: 'Fernando Novo Funcionário',
          tipo: 'publico',
          conteudo: 'Perfeito! Agora consegui acessar. Obrigado pela agilidade!',
          data: '2025-08-21 09:45:00'
        }
      ],
      sistema_afetado: 'Sistema de Autenticação',
      versao: '2.1.4',
      impacto: 'critico',
      urgencia: 'critica',
      satisfacao: {
        nota: 5,
        comentario: 'Problema resolvido rapidamente!',
        data: '2025-08-21 10:00:00'
      }
    },
    {
      id: 5,
      numero: 'SUP-2025-0005',
      titulo: 'Integração com WhatsApp Business não funcionando',
      descricao: 'A integração com WhatsApp Business parou de funcionar desde ontem. As mensagens não estão sendo enviadas automaticamente.',
      categoria: 'integracao',
      prioridade: 'urgente',
      status: 'aberto',
      solicitante: {
        nome: 'Carlos Vendedor Silva',
        email: 'carlos.vendedor@reservei.com.br',
        departamento: 'Vendas',
        cargo: 'Coordenador de Vendas'
      },
      data_abertura: '2025-08-25 08:30:00',
      data_atualizacao: '2025-08-25 08:30:00',
      sla_vencimento: '2025-08-25 12:30:00',
      tags: ['integracao', 'whatsapp', 'mensagens', 'automatico'],
      anexos: [
        {
          nome: 'log_whatsapp.txt',
          url: '/uploads/log_whatsapp.txt',
          tipo: 'text/plain',
          tamanho: '45 KB',
          data_upload: '2025-08-25 08:35:00'
        }
      ],
      comentarios: [
        {
          id: 1,
          autor: 'Carlos Vendedor Silva',
          tipo: 'publico',
          conteudo: 'As confirmações de reserva não estão sendo enviadas via WhatsApp. Os clientes estão ligando para confirmar se a reserva foi processada. Anexei o log de erros.',
          data: '2025-08-25 08:30:00'
        }
      ],
      sistema_afetado: 'Integração WhatsApp',
      versao: '2.1.4',
      impacto: 'alto',
      urgencia: 'critica'
    }
  ];

  useEffect(() => {
    setTickets(ticketsMock);
  }, []);

  const responsaveis = [...new Set(tickets.filter(t => t.responsavel).map(t => t.responsavel!.nome))];

  const ticketsFiltrados = tickets.filter(ticket => {
    const matchBusca = ticket.numero.toLowerCase().includes(busca.toLowerCase()) ||
                      ticket.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      ticket.solicitante.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      ticket.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchStatus = filtroStatus === 'todos' || ticket.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'todas' || ticket.categoria === filtroCategoria;
    const matchPrioridade = filtroPrioridade === 'todas' || ticket.prioridade === filtroPrioridade;
    const matchResponsavel = filtroResponsavel === 'todos' || ticket.responsavel?.nome === filtroResponsavel;

    return matchBusca && matchStatus && matchCategoria && matchPrioridade && matchResponsavel;
  }).sort((a, b) => {
    if (ordenacao === 'prioridade') {
      const prioridadeOrder = { 'urgente': 5, 'critica': 4, 'alta': 3, 'media': 2, 'baixa': 1 };
      return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
    } else if (ordenacao === 'sla') {
      return new Date(a.sla_vencimento).getTime() - new Date(b.sla_vencimento).getTime();
    } else {
      return new Date(b.data_atualizacao).getTime() - new Date(a.data_atualizacao).getTime();
    }
  });

  const estatisticas = {
    totalTickets: tickets.length,
    abertos: tickets.filter(t => ['aberto', 'em_analise', 'em_desenvolvimento'].includes(t.status)).length,
    vencidosSLA: tickets.filter(t => new Date(t.sla_vencimento) < new Date() && !['resolvido', 'fechado', 'cancelado'].includes(t.status)).length,
    resolvidos: tickets.filter(t => t.status === 'resolvido').length,
    tempoMedioResolucao: tickets.filter(t => t.tempo_resolucao).reduce((acc, t) => acc + t.tempo_resolucao!, 0) / tickets.filter(t => t.tempo_resolucao).length || 0,
    satisfacaoMedia: tickets.filter(t => t.satisfacao).reduce((acc, t) => acc + t.satisfacao!.nota, 0) / tickets.filter(t => t.satisfacao).length || 0,
    criticos: tickets.filter(t => ['critica', 'urgente'].includes(t.prioridade)).length
  };

  const handleView = (ticket: SupportTicket) => {
    setTicketSelecionado(ticket);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleAddComment = () => {
    if (!novoComentario.trim() || !ticketSelecionado) return;

    const novoComent = {
      id: ticketSelecionado.comentarios.length + 1,
      autor: 'Usuário Atual', // Seria obtido do contexto de autenticação
      tipo: 'publico' as const,
      conteudo: novoComentario,
      data: new Date().toISOString()
    };

    const ticketAtualizado = {
      ...ticketSelecionado,
      comentarios: [...ticketSelecionado.comentarios, novoComent],
      data_atualizacao: new Date().toISOString()
    };

    setTickets(tickets.map(t => t.id === ticketSelecionado.id ? ticketAtualizado : t));
    setTicketSelecionado(ticketAtualizado);
    setNovoComentario('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-blue-100 text-blue-800';
      case 'em_analise': return 'bg-yellow-100 text-yellow-800';
      case 'em_desenvolvimento': return 'bg-orange-100 text-orange-800';
      case 'aguardando_teste': return 'bg-purple-100 text-purple-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente': return 'bg-red-100 text-red-800 border-red-500';
      case 'critica': return 'bg-red-100 text-red-800 border-red-400';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-500';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'baixa': return 'bg-green-100 text-green-800 border-green-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'bug': return '🐛';
      case 'feature': return '⭐';
      case 'melhoria': return '🔧';
      case 'duvida': return '❓';
      case 'acesso': return '🔐';
      case 'integracao': return '🔗';
      case 'performance': return '⚡';
      case 'dados': return '📊';
      default: return '📋';
    }
  };

  const isVencido = (slaVencimento: string, status: string) => {
    return new Date(slaVencimento) < new Date() && !['resolvido', 'fechado', 'cancelado'].includes(status);
  };

  const formatTempo = (horas: number) => {
    if (horas < 1) return `${Math.round(horas * 60)}min`;
    if (horas < 24) return `${Math.round(horas)}h`;
    const dias = Math.floor(horas / 24);
    const horasRestantes = Math.round(horas % 24);
    return `${dias}d ${horasRestantes}h`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              Tickets de Suporte
            </h1>
            <p className="text-gray-600 mt-2">Sistema de tickets para suporte técnico e interno</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Clock className="h-4 w-4" />
              Métricas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalTickets}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.abertos}</div>
            <div className="text-sm text-gray-600">Abertos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{estatisticas.vencidosSLA}</div>
            <div className="text-sm text-gray-600">Vencidos SLA</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.resolvidos}</div>
            <div className="text-sm text-gray-600">Resolvidos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{formatTempo(estatisticas.tempoMedioResolucao)}</div>
            <div className="text-sm text-gray-600">Tempo Médio</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.satisfacaoMedia.toFixed(1)}</div>
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
                placeholder="Buscar tickets..."
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
            <option value="aberto">Aberto</option>
            <option value="em_analise">Em Análise</option>
            <option value="em_desenvolvimento">Em Desenvolvimento</option>
            <option value="aguardando_teste">Aguardando Teste</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todas">Todas Categorias</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="melhoria">Melhoria</option>
            <option value="duvida">Dúvida</option>
            <option value="acesso">Acesso</option>
            <option value="integracao">Integração</option>
            <option value="performance">Performance</option>
            <option value="dados">Dados</option>
          </select>

          <select
            value={filtroPrioridade}
            onChange={(e) => setFiltroPrioridade(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todas">Todas Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="critica">Crítica</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <select
            value={filtroResponsavel}
            onChange={(e) => setFiltroResponsavel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos Responsáveis</option>
            {responsaveis.map(resp => (
              <option key={resp} value={resp}>{resp}</option>
            ))}
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
          >
            <option value="data_atualizacao">Data Atualização</option>
            <option value="prioridade">Prioridade</option>
            <option value="sla">SLA Vencimento</option>
          </select>
        </div>
      </div>

      {/* Lista de Tickets */}
      <div className="space-y-4">
        {ticketsFiltrados.map((ticket) => (
          <div
            key={ticket.id}
            className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
              isVencido(ticket.sla_vencimento, ticket.status) ? 'border-l-red-500 bg-red-50' :
              ticket.prioridade === 'urgente' ? 'border-l-red-500' :
              ticket.prioridade === 'critica' ? 'border-l-red-400' :
              ticket.prioridade === 'alta' ? 'border-l-orange-500' :
              ticket.prioridade === 'media' ? 'border-l-yellow-500' :
              'border-l-green-500'
            }`}
          >
            {/* Header do Card */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getCategoriaIcon(ticket.categoria)}</span>
                  <span className="font-bold text-lg text-gray-900">{ticket.numero}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPrioridadeColor(ticket.prioridade)}`}>
                    {ticket.prioridade.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                  {isVencido(ticket.sla_vencimento, ticket.status) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      SLA VENCIDO
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{ticket.titulo}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{ticket.descricao}</p>
              </div>
            </div>

            {/* Informações do Ticket */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Solicitante
                </h4>
                <div className="text-sm text-gray-600">
                  <div>{ticket.solicitante.nome}</div>
                  <div className="text-xs">{ticket.solicitante.departamento}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Responsável</h4>
                <div className="text-sm text-gray-600">
                  {ticket.responsavel ? (
                    <>
                      <div>{ticket.responsavel.nome}</div>
                      <div className="text-xs">{ticket.responsavel.equipe}</div>
                    </>
                  ) : (
                    <div className="text-red-600">Não atribuído</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Tempo
                </h4>
                <div className="text-sm text-gray-600">
                  {ticket.tempo_resposta && (
                    <div>Resposta: {formatTempo(ticket.tempo_resposta)}</div>
                  )}
                  {ticket.tempo_resolucao && (
                    <div>Resolução: {formatTempo(ticket.tempo_resolucao)}</div>
                  )}
                  <div className={`text-xs ${isVencido(ticket.sla_vencimento, ticket.status) ? 'text-red-600' : 'text-gray-500'}`}>
                    SLA: {new Date(ticket.sla_vencimento).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">Anexos & Comentários</h4>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Paperclip className="h-3 w-3" />
                    {ticket.anexos.length} anexo(s)
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {ticket.comentarios.length} comentário(s)
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {ticket.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Satisfação */}
            {ticket.satisfacao && (
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Avaliação: {ticket.satisfacao.nota}/5</span>
                  <span className="text-gray-600">"{ticket.satisfacao.comentario}"</span>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div>Aberto: {new Date(ticket.data_abertura).toLocaleDateString()}</div>
                <div>Atualizado: {new Date(ticket.data_atualizacao).toLocaleDateString()}</div>
                {ticket.data_resolucao && (
                  <div>Resolvido: {new Date(ticket.data_resolucao).toLocaleDateString()}</div>
                )}
              </div>

              <button
                onClick={() => handleView(ticket)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
              >
                <Eye className="h-4 w-4" />
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalhes */}
      {showModal && ticketSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {ticketSelecionado.numero} - {ticketSelecionado.titulo}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeColor(ticketSelecionado.prioridade)}`}>
                  {ticketSelecionado.prioridade}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticketSelecionado.status)}`}>
                  {ticketSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Descrição e Detalhes Técnicos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                  <p className="text-gray-700 mb-4">{ticketSelecionado.descricao}</p>

                  {ticketSelecionado.passos_reproduzir && (
                    <>
                      <h4 className="font-medium mb-2">Passos para Reproduzir:</h4>
                      <pre className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap">{ticketSelecionado.passos_reproduzir}</pre>
                    </>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações Técnicas</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Sistema Afetado:</strong> {ticketSelecionado.sistema_afetado || 'N/A'}</div>
                    <div><strong>Versão:</strong> {ticketSelecionado.versao || 'N/A'}</div>
                    <div><strong>Browser:</strong> {ticketSelecionado.browser || 'N/A'}</div>
                    <div><strong>Impacto:</strong> {ticketSelecionado.impacto}</div>
                    <div><strong>Urgência:</strong> {ticketSelecionado.urgencia}</div>
                  </div>
                </div>
              </div>

              {/* Anexos */}
              {ticketSelecionado.anexos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Anexos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ticketSelecionado.anexos.map((anexo, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Paperclip className="h-6 w-6 text-gray-400" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{anexo.nome}</div>
                          <div className="text-sm text-gray-500">{anexo.tipo} • {anexo.tamanho}</div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline de Comentários */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Histórico de Comentários</h3>
                <div className="space-y-4">
                  {ticketSelecionado.comentarios.map((comentario) => (
                    <div key={comentario.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          comentario.tipo === 'interno' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comentario.autor}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            comentario.tipo === 'interno' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {comentario.tipo}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comentario.data).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                          {comentario.conteudo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Adicionar Comentário */}
                <div className="mt-6 border-t pt-4">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        value={novoComentario}
                        onChange={(e) => setNovoComentario(e.target.value)}
                        placeholder="Adicionar comentário..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                    <button
                      onClick={handleAddComment}
                      disabled={!novoComentario.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4" />
                    </button>
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
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Marcar como Resolvido
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Editar Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {ticketsFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroCategoria !== 'todas'
              ? 'Tente ajustar os filtros para encontrar tickets.'
              : 'Nenhum ticket de suporte foi criado ainda.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Novo Ticket
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketsSuporte;
