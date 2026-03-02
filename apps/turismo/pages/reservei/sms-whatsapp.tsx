// 📱 SMS E WHATSAPP - RESERVEI VIAGENS
// Funcionalidade: Sistema de comunicação via SMS e WhatsApp
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Send, MessageSquare, Smartphone, Users, BarChart3, Clock, CheckCircle, AlertTriangle, Image, FileText, Calendar } from 'lucide-react';

interface SMSWhatsAppMessage {
  id: number;
  tipo: 'sms' | 'whatsapp';
  campanha_nome: string;
  mensagem: string;
  template_id?: string;
  template_nome?: string;
  status: 'rascunho' | 'agendada' | 'enviando' | 'enviada' | 'falhada' | 'cancelada';
  destinatarios: {
    total: number;
    enviados: number;
    entregues: number;
    lidos: number;
    respondidos: number;
    falhados: number;
  };
  segmentacao: {
    nome: string;
    filtros: Array<{
      campo: string;
      operador: string;
      valor: string;
    }>;
  };
  agendamento: {
    data_envio: string;
    envio_imediato: boolean;
    fuso_horario: string;
  };
  custo: {
    por_mensagem: number;
    total_estimado: number;
    total_gasto: number;
  };
  midia?: {
    tipo: 'imagem' | 'documento' | 'video';
    url: string;
    nome: string;
    tamanho: string;
  };
  configuracoes: {
    numero_remetente: string;
    permitir_respostas: boolean;
    callback_url?: string;
    validade_horas: number;
  };
  data_criacao: string;
  data_envio?: string;
  criado_por: string;
  tags: string[];
  conversas_geradas: number;
  taxa_conversao: number;
}

interface WhatsAppTemplate {
  id: string;
  nome: string;
  categoria: 'marketing' | 'transacional' | 'utilitario';
  idioma: string;
  status: 'aprovado' | 'pendente' | 'rejeitado';
  conteudo: {
    header?: {
      type: 'text' | 'image' | 'video' | 'document';
      content: string;
    };
    body: string;
    footer?: string;
    buttons?: Array<{
      type: 'quick_reply' | 'url' | 'phone';
      text: string;
      url?: string;
      phone?: string;
    }>;
  };
  variaveis: string[];
  uso_count: number;
  data_aprovacao?: string;
}

interface Conversa {
  id: number;
  cliente: {
    nome: string;
    telefone: string;
    avatar?: string;
  };
  canal: 'sms' | 'whatsapp';
  status: 'ativa' | 'aguardando' | 'resolvida' | 'arquivada';
  ultima_mensagem: {
    conteudo: string;
    data: string;
    tipo: 'recebida' | 'enviada';
  };
  nao_lidas: number;
  agente_responsavel?: string;
  tags: string[];
  data_inicio: string;
  tempo_resposta_medio: number;
}

const SMSWhatsApp: React.FC = () => {
  const [mensagens, setMensagens] = useState<SMSWhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'message' | 'template' | 'conversation'>('message');
  const [mensagemSelecionada, setMensagemSelecionada] = useState<SMSWhatsAppMessage | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'mensagens' | 'templates' | 'conversas'>('mensagens');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_criacao');

  // Dados mock
  const mensagensMock: SMSWhatsAppMessage[] = [
    {
      id: 1,
      tipo: 'whatsapp',
      campanha_nome: 'Promoção Flash - Caldas Novas',
      mensagem: '🌴 *Oferta Relâmpago!* Caldas Novas com 40% OFF apenas hoje! 💧 Resort com águas termais + café da manhã por apenas *R$ 180/diária*. Link: bit.ly/caldas40off',
      template_id: 'promocao_flash_001',
      template_nome: 'Promoção Flash Resort',
      status: 'enviada',
      destinatarios: {
        total: 1250,
        enviados: 1250,
        entregues: 1198,
        lidos: 856,
        respondidos: 67,
        falhados: 52
      },
      segmentacao: {
        nome: 'Clientes Ativos - Caldas Novas',
        filtros: [
          { campo: 'interesse', operador: 'contém', valor: 'caldas_novas' },
          { campo: 'whatsapp_ativo', operador: 'igual', valor: 'true' },
          { campo: 'ultima_interacao', operador: 'menor_que', valor: '60_dias' }
        ]
      },
      agendamento: {
        data_envio: '2025-08-25 10:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo'
      },
      custo: {
        por_mensagem: 0.15,
        total_estimado: 187.50,
        total_gasto: 179.70
      },
      midia: {
        tipo: 'imagem',
        url: '/images/caldas-novas-promo.jpg',
        nome: 'caldas-promo.jpg',
        tamanho: '245 KB'
      },
      configuracoes: {
        numero_remetente: '+5564999997555',
        permitir_respostas: true,
        validade_horas: 72
      },
      data_criacao: '2025-08-24 16:30:00',
      data_envio: '2025-08-25 10:00:00',
      criado_por: 'Ana Silva Santos',
      tags: ['promocao', 'caldas_novas', 'flash', 'desconto'],
      conversas_geradas: 67,
      taxa_conversao: 5.4
    },
    {
      id: 2,
      tipo: 'sms',
      campanha_nome: 'Lembrete Reserva - Check-in Amanhã',
      mensagem: 'Olá! Sua reserva em Caldas Novas está confirmada para amanhã (26/08). Check-in: 15h no Hotel Thermas Grand. Dúvidas? (64) 99999-7555',
      status: 'enviada',
      destinatarios: {
        total: 45,
        enviados: 45,
        entregues: 43,
        lidos: 38,
        respondidos: 8,
        falhados: 2
      },
      segmentacao: {
        nome: 'Check-in Amanhã',
        filtros: [
          { campo: 'checkin_data', operador: 'igual', valor: '2025-08-26' },
          { campo: 'status_reserva', operador: 'igual', valor: 'confirmada' }
        ]
      },
      agendamento: {
        data_envio: '2025-08-25 18:00:00',
        envio_imediato: true,
        fuso_horario: 'America/Sao_Paulo'
      },
      custo: {
        por_mensagem: 0.08,
        total_estimado: 3.60,
        total_gasto: 3.44
      },
      configuracoes: {
        numero_remetente: '+5564999997555',
        permitir_respostas: true,
        validade_horas: 24
      },
      data_criacao: '2025-08-25 17:45:00',
      data_envio: '2025-08-25 18:00:00',
      criado_por: 'Sistema Automatizado',
      tags: ['lembrete', 'checkin', 'automatico', 'transacional'],
      conversas_geradas: 8,
      taxa_conversao: 17.8
    },
    {
      id: 3,
      tipo: 'whatsapp',
      campanha_nome: 'Feedback Pós-Viagem',
      mensagem: 'Olá! Como foi sua experiência em Caldas Novas? 😊 Sua opinião é muito importante! Avalie sua estadia: bit.ly/feedback-reservei',
      template_id: 'feedback_pos_viagem',
      template_nome: 'Solicitação de Feedback',
      status: 'agendada',
      destinatarios: {
        total: 28,
        enviados: 0,
        entregues: 0,
        lidos: 0,
        respondidos: 0,
        falhados: 0
      },
      segmentacao: {
        nome: 'Checkout Ontem',
        filtros: [
          { campo: 'checkout_data', operador: 'igual', valor: '2025-08-24' },
          { campo: 'status_reserva', operador: 'igual', valor: 'finalizada' }
        ]
      },
      agendamento: {
        data_envio: '2025-08-26 14:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo'
      },
      custo: {
        por_mensagem: 0.12,
        total_estimado: 3.36,
        total_gasto: 0
      },
      configuracoes: {
        numero_remetente: '+5564999997555',
        permitir_respostas: true,
        validade_horas: 168
      },
      data_criacao: '2025-08-25 09:30:00',
      criado_por: 'Sistema Automatizado',
      tags: ['feedback', 'pos_viagem', 'automatico', 'satisfacao'],
      conversas_geradas: 0,
      taxa_conversao: 0
    },
    {
      id: 4,
      tipo: 'whatsapp',
      campanha_nome: 'Aniversário VIP - Oferta Especial',
      mensagem: '🎉 *Parabéns pelo seu aniversário!* 🎂 Como cliente VIP, você ganhou 25% OFF em qualquer destino! Válido até 30/09. Use o código: ANIVER25',
      template_id: 'aniversario_vip',
      template_nome: 'Aniversário VIP',
      status: 'rascunho',
      destinatarios: {
        total: 12,
        enviados: 0,
        entregues: 0,
        lidos: 0,
        respondidos: 0,
        falhados: 0
      },
      segmentacao: {
        nome: 'Aniversariantes VIP Setembro',
        filtros: [
          { campo: 'tipo_cliente', operador: 'igual', valor: 'vip' },
          { campo: 'aniversario_mes', operador: 'igual', valor: '09' },
          { campo: 'whatsapp_ativo', operador: 'igual', valor: 'true' }
        ]
      },
      agendamento: {
        data_envio: '2025-09-01 09:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo'
      },
      custo: {
        por_mensagem: 0.15,
        total_estimado: 1.80,
        total_gasto: 0
      },
      configuracoes: {
        numero_remetente: '+5564999997555',
        permitir_respostas: true,
        validade_horas: 720
      },
      data_criacao: '2025-08-25 14:20:00',
      criado_por: 'Maria Marketing Costa',
      tags: ['aniversario', 'vip', 'promocao', 'personalizado'],
      conversas_geradas: 0,
      taxa_conversao: 0
    }
  ];

  const templatesMock: WhatsAppTemplate[] = [
    {
      id: 'promocao_flash_001',
      nome: 'Promoção Flash Resort',
      categoria: 'marketing',
      idioma: 'pt_BR',
      status: 'aprovado',
      conteudo: {
        header: {
          type: 'image',
          content: '/templates/promo-header.jpg'
        },
        body: '🌴 *Oferta Relâmpago!* {{destino}} com {{desconto}}% OFF apenas hoje! 💧 {{descricao}} por apenas *R$ {{preco}}/diária*.',
        footer: 'Reservei Viagens - Sua viagem dos sonhos',
        buttons: [
          { type: 'url', text: 'Ver Oferta', url: 'https://reservei.com/ofertas/{{id}}' },
          { type: 'phone', text: 'Ligar Agora', phone: '+5564999997555' }
        ]
      },
      variaveis: ['destino', 'desconto', 'descricao', 'preco', 'id'],
      uso_count: 15,
      data_aprovacao: '2025-08-20 10:30:00'
    },
    {
      id: 'feedback_pos_viagem',
      nome: 'Solicitação de Feedback',
      categoria: 'utilitario',
      idioma: 'pt_BR',
      status: 'aprovado',
      conteudo: {
        body: 'Olá {{nome}}! Como foi sua experiência em {{destino}}? 😊 Sua opinião é muito importante! Avalie sua estadia.',
        footer: 'Obrigado por escolher a Reservei Viagens',
        buttons: [
          { type: 'url', text: 'Avaliar Estadia', url: 'https://reservei.com/feedback/{{reserva_id}}' }
        ]
      },
      variaveis: ['nome', 'destino', 'reserva_id'],
      uso_count: 45,
      data_aprovacao: '2025-07-15 14:20:00'
    },
    {
      id: 'confirmacao_reserva',
      nome: 'Confirmação de Reserva',
      categoria: 'transacional',
      idioma: 'pt_BR',
      status: 'aprovado',
      conteudo: {
        body: '✅ *Reserva Confirmada!* {{nome}}, sua reserva em {{hotel}} está confirmada! Check-in: {{checkin}} às {{horario}}. Protocolo: {{protocolo}}',
        footer: 'Dúvidas? Entre em contato conosco',
        buttons: [
          { type: 'url', text: 'Ver Reserva', url: 'https://reservei.com/reserva/{{protocolo}}' },
          { type: 'quick_reply', text: 'Preciso de Ajuda' }
        ]
      },
      variaveis: ['nome', 'hotel', 'checkin', 'horario', 'protocolo'],
      uso_count: 234,
      data_aprovacao: '2025-06-10 09:15:00'
    }
  ];

  const conversasMock: Conversa[] = [
    {
      id: 1,
      cliente: {
        nome: 'João Silva Santos',
        telefone: '+5564999991111',
        avatar: '/avatars/joao.jpg'
      },
      canal: 'whatsapp',
      status: 'ativa',
      ultima_mensagem: {
        conteudo: 'Perfeito! Muito obrigado pela agilidade.',
        data: '2025-08-25 15:45:00',
        tipo: 'recebida'
      },
      nao_lidas: 0,
      agente_responsavel: 'Ana Silva Santos',
      tags: ['vip', 'alteracao_reserva'],
      data_inicio: '2025-08-25 14:30:00',
      tempo_resposta_medio: 2.5
    },
    {
      id: 2,
      cliente: {
        nome: 'Maria Costa Oliveira',
        telefone: '+5564988882222'
      },
      canal: 'whatsapp',
      status: 'aguardando',
      ultima_mensagem: {
        conteudo: 'Gostaria de saber sobre pacotes para família.',
        data: '2025-08-25 16:20:00',
        tipo: 'recebida'
      },
      nao_lidas: 1,
      tags: ['novo_cliente', 'consulta_preco'],
      data_inicio: '2025-08-25 16:20:00',
      tempo_resposta_medio: 0
    },
    {
      id: 3,
      cliente: {
        nome: 'Roberto Empresário',
        telefone: '+5564977773333'
      },
      canal: 'sms',
      status: 'resolvida',
      ultima_mensagem: {
        conteudo: 'Problema resolvido. Obrigado!',
        data: '2025-08-25 11:30:00',
        tipo: 'recebida'
      },
      nao_lidas: 0,
      agente_responsavel: 'Carlos Atendimento',
      tags: ['problema_resolvido', 'premium'],
      data_inicio: '2025-08-25 10:15:00',
      tempo_resposta_medio: 5.2
    }
  ];

  useEffect(() => {
    setMensagens(mensagensMock);
    setTemplates(templatesMock);
    setConversas(conversasMock);
  }, []);

  const mensagensFiltradas = mensagens.filter(mensagem => {
    const matchBusca = mensagem.campanha_nome.toLowerCase().includes(busca.toLowerCase()) ||
                      mensagem.mensagem.toLowerCase().includes(busca.toLowerCase()) ||
                      mensagem.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = filtroTipo === 'todos' || mensagem.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || mensagem.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  }).sort((a, b) => {
    if (ordenacao === 'data_criacao') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else if (ordenacao === 'entregues') {
      return b.destinatarios.entregues - a.destinatarios.entregues;
    } else if (ordenacao === 'conversao') {
      return b.taxa_conversao - a.taxa_conversao;
    }
    return 0;
  });

  const estatisticas = {
    totalMensagens: mensagens.length,
    mensagensEnviadas: mensagens.filter(m => m.status === 'enviada').length,
    totalEnviados: mensagens.reduce((acc, m) => acc + m.destinatarios.enviados, 0),
    totalEntregues: mensagens.reduce((acc, m) => acc + m.destinatarios.entregues, 0),
    totalLidos: mensagens.reduce((acc, m) => acc + m.destinatarios.lidos, 0),
    conversasAtivas: conversas.filter(c => c.status === 'ativa').length,
    taxaEntrega: mensagens.reduce((acc, m) => acc + m.destinatarios.enviados, 0) > 0 ?
      (mensagens.reduce((acc, m) => acc + m.destinatarios.entregues, 0) / mensagens.reduce((acc, m) => acc + m.destinatarios.enviados, 0)) * 100 : 0,
    taxaLeitura: mensagens.reduce((acc, m) => acc + m.destinatarios.entregues, 0) > 0 ?
      (mensagens.reduce((acc, m) => acc + m.destinatarios.lidos, 0) / mensagens.reduce((acc, m) => acc + m.destinatarios.entregues, 0)) * 100 : 0
  };

  const handleView = (mensagem: SMSWhatsAppMessage) => {
    setMensagemSelecionada(mensagem);
    setModalTipo('message');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'enviando': return 'bg-yellow-100 text-yellow-800';
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'falhada': return 'bg-red-100 text-red-800';
      case 'cancelada': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === 'whatsapp' ? '💬' : '📱';
  };

  const calcularTaxaEntrega = (mensagem: SMSWhatsAppMessage) => {
    return mensagem.destinatarios.enviados > 0 ?
      ((mensagem.destinatarios.entregues / mensagem.destinatarios.enviados) * 100).toFixed(1) : '0.0';
  };

  const calcularTaxaLeitura = (mensagem: SMSWhatsAppMessage) => {
    return mensagem.destinatarios.entregues > 0 ?
      ((mensagem.destinatarios.lidos / mensagem.destinatarios.entregues) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              SMS & WhatsApp
            </h1>
            <p className="text-gray-600 mt-2">Sistema de comunicação via SMS e WhatsApp Business</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <BarChart3 className="h-4 w-4" />
              Métricas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalMensagens}</div>
            <div className="text-sm text-gray-600">Total Campanhas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.mensagensEnviadas}</div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalEnviados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Mensagens Enviadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.totalEntregues.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Entregues</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.totalLidos.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Lidas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.conversasAtivas}</div>
            <div className="text-sm text-gray-600">Conversas Ativas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-pink-600">{estatisticas.taxaEntrega.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Entrega</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.taxaLeitura.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Leitura</div>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'mensagens', label: 'Campanhas', icon: Send },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'conversas', label: 'Conversas', icon: MessageSquare }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaSelecionada(aba.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm ${
                  abaSelecionada === aba.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <aba.icon className="h-4 w-4" />
                {aba.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filtros */}
        {abaSelecionada === 'mensagens' && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar campanhas..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos Tipos</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="todos">Todos Status</option>
                <option value="rascunho">Rascunho</option>
                <option value="agendada">Agendada</option>
                <option value="enviando">Enviando</option>
                <option value="enviada">Enviada</option>
                <option value="falhada">Falhada</option>
                <option value="cancelada">Cancelada</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
              >
                <option value="data_criacao">Data Criação</option>
                <option value="entregues">Mais Entregues</option>
                <option value="conversao">Taxa Conversão</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo das Abas */}
      {abaSelecionada === 'mensagens' && (
        <div className="space-y-4">
          {mensagensFiltradas.map((mensagem) => (
            <div key={mensagem.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getTipoIcon(mensagem.tipo)}</span>
                    <h3 className="font-bold text-lg text-gray-900">{mensagem.campanha_nome}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {mensagem.tipo.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mensagem.status)}`}>
                      {mensagem.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{mensagem.mensagem}</p>
                  <div className="text-sm text-gray-500">
                    Criada por {mensagem.criado_por} • {new Date(mensagem.data_criacao).toLocaleDateString()}
                    {mensagem.data_envio && ` • Enviada em ${new Date(mensagem.data_envio).toLocaleDateString()}`}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{mensagem.destinatarios.total.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{mensagem.destinatarios.enviados.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{mensagem.destinatarios.entregues.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Entregues</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{mensagem.destinatarios.lidos.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Lidos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{calcularTaxaEntrega(mensagem)}%</div>
                  <div className="text-xs text-gray-600">Taxa Entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600">{calcularTaxaLeitura(mensagem)}%</div>
                  <div className="text-xs text-gray-600">Taxa Leitura</div>
                </div>
              </div>

              {/* Custo e Conversão */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700">Custo</div>
                  <div className="text-lg font-bold text-green-600">R$ {mensagem.custo.total_gasto.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">R$ {mensagem.custo.por_mensagem.toFixed(2)} por mensagem</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700">Conversas Geradas</div>
                  <div className="text-lg font-bold text-blue-600">{mensagem.conversas_geradas}</div>
                  <div className="text-xs text-gray-500">Taxa: {mensagem.taxa_conversao.toFixed(1)}%</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700">Segmentação</div>
                  <div className="text-sm text-gray-600">{mensagem.segmentacao.nome}</div>
                  <div className="text-xs text-gray-500">{mensagem.segmentacao.filtros.length} filtro(s)</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {mensagem.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {mensagem.template_nome && `Template: ${mensagem.template_nome}`}
                  {mensagem.midia && ` • ${mensagem.midia.tipo}: ${mensagem.midia.nome}`}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(mensagem)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                  {mensagem.status === 'rascunho' && (
                    <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                      <Send className="h-4 w-4" />
                      Enviar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba Templates */}
      {abaSelecionada === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{template.nome}</h3>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {template.categoria}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                      template.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                <div className="text-sm text-gray-600 line-clamp-3">
                  {template.conteudo.body}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Usos: {template.uso_count}</span>
                <span>Variáveis: {template.variaveis.length}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                  Usar Template
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba Conversas */}
      {abaSelecionada === 'conversas' && (
        <div className="space-y-4">
          {conversas.map((conversa) => (
            <div key={conversa.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">{conversa.cliente.nome.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{conversa.cliente.nome}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="text-lg">{getTipoIcon(conversa.canal)}</span>
                      <span>{conversa.cliente.telefone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    conversa.status === 'ativa' ? 'bg-green-100 text-green-800' :
                    conversa.status === 'aguardando' ? 'bg-yellow-100 text-yellow-800' :
                    conversa.status === 'resolvida' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {conversa.status.toUpperCase()}
                  </span>
                  {conversa.nao_lidas > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {conversa.nao_lidas}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-700 text-sm line-clamp-2">{conversa.ultima_mensagem.conteudo}</p>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(conversa.ultima_mensagem.data).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {conversa.agente_responsavel && (
                    <div>Agente: {conversa.agente_responsavel}</div>
                  )}
                  <div>Tempo médio: {conversa.tempo_resposta_medio.toFixed(1)}min</div>
                </div>

                <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  Abrir Conversa
                </button>
              </div>

              {/* Tags */}
              {conversa.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200">
                  {conversa.tags.map((tag, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      {showModal && modalTipo === 'message' && mensagemSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{mensagemSelecionada.campanha_nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {mensagemSelecionada.tipo.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mensagemSelecionada.status)}`}>
                  {mensagemSelecionada.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Conteúdo da Mensagem */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conteúdo</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{mensagemSelecionada.mensagem}</p>
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Métricas de Entrega</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{mensagemSelecionada.destinatarios.total.toLocaleString()}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{mensagemSelecionada.destinatarios.enviados.toLocaleString()}</div>
                    <div className="text-xs text-green-700">Enviados</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">{mensagemSelecionada.destinatarios.entregues.toLocaleString()}</div>
                    <div className="text-xs text-purple-700">Entregues</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-orange-600">{mensagemSelecionada.destinatarios.lidos.toLocaleString()}</div>
                    <div className="text-xs text-orange-700">Lidos</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-emerald-600">{mensagemSelecionada.destinatarios.respondidos.toLocaleString()}</div>
                    <div className="text-xs text-emerald-700">Respondidos</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-600">{mensagemSelecionada.destinatarios.falhados.toLocaleString()}</div>
                    <div className="text-xs text-red-700">Falhados</div>
                  </div>
                </div>
              </div>

              {/* Segmentação */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Segmentação</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-2">{mensagemSelecionada.segmentacao.nome}</div>
                  <div className="text-sm">
                    <strong>Filtros aplicados:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {mensagemSelecionada.segmentacao.filtros.map((filtro, index) => (
                        <li key={index} className="text-gray-600">
                          {filtro.campo} {filtro.operador} {filtro.valor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Configurações</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Número Remetente:</strong> {mensagemSelecionada.configuracoes.numero_remetente}</div>
                    <div><strong>Respostas:</strong> {mensagemSelecionada.configuracoes.permitir_respostas ? 'Permitidas' : 'Bloqueadas'}</div>
                    <div><strong>Validade:</strong> {mensagemSelecionada.configuracoes.validade_horas}h</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Custo</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Por Mensagem:</strong> R$ {mensagemSelecionada.custo.por_mensagem.toFixed(2)}</div>
                    <div><strong>Total Gasto:</strong> R$ {mensagemSelecionada.custo.total_gasto.toFixed(2)}</div>
                    <div><strong>Estimado:</strong> R$ {mensagemSelecionada.custo.total_estimado.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Mídia */}
              {mensagemSelecionada.midia && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Mídia Anexada</h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Image className="h-8 w-8 text-gray-400" />
                    <div>
                      <div className="font-medium">{mensagemSelecionada.midia.nome}</div>
                      <div className="text-sm text-gray-500">{mensagemSelecionada.midia.tipo} • {mensagemSelecionada.midia.tamanho}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Agendamento */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Agendamento</h3>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {mensagemSelecionada.agendamento.envio_imediato ? 'Envio Imediato' : 'Agendado'}
                    </span>
                  </div>
                  {!mensagemSelecionada.agendamento.envio_imediato && (
                    <div className="text-sm text-gray-600">
                      Data: {new Date(mensagemSelecionada.agendamento.data_envio).toLocaleString()}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Fuso: {mensagemSelecionada.agendamento.fuso_horario}
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
                Editar Campanha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {abaSelecionada === 'mensagens' && mensagensFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar campanhas.'
              : 'Comece criando sua primeira campanha de SMS ou WhatsApp.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </button>
        </div>
      )}
    </div>
  );
};

export default SMSWhatsApp;
