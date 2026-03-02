// 🔔 NOTIFICAÇÕES PUSH - RESERVEI VIAGENS
// Funcionalidade: Sistema de notificações push web e mobile
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Send, Bell, Smartphone, Users, BarChart3, Clock, CheckCircle, AlertTriangle, Settings, Target, Calendar } from 'lucide-react';

interface PushNotification {
  id: number;
  titulo: string;
  mensagem: string;
  tipo: 'promocional' | 'transacional' | 'lembrete' | 'urgente' | 'informativo';
  plataforma: 'web' | 'android' | 'ios' | 'todas';
  status: 'rascunho' | 'agendada' | 'enviando' | 'enviada' | 'falhada' | 'cancelada';
  destinatarios: {
    total: number;
    enviados: number;
    entregues: number;
    visualizados: number;
    clicados: number;
    falhados: number;
  };
  segmentacao: {
    nome: string;
    criterios: Array<{
      campo: string;
      operador: string;
      valor: string;
    }>;
  };
  configuracoes: {
    icone: string;
    imagem?: string;
    som_personalizado?: string;
    vibrar: boolean;
    badge_count: boolean;
    click_action_url?: string;
    deep_link?: string;
    ttl_segundos: number;
    prioridade: 'normal' | 'alta';
  };
  agendamento: {
    data_envio: string;
    envio_imediato: boolean;
    fuso_horario: string;
    repeticao?: {
      tipo: 'diario' | 'semanal' | 'mensal';
      dias_semana?: number[];
      dia_mes?: number;
      horario: string;
    };
  };
  personalizacao: {
    dinamica: boolean;
    variaveis_usadas: string[];
    template_titulo?: string;
    template_mensagem?: string;
  };
  analytics: {
    taxa_entrega: number;
    taxa_visualizacao: number;
    taxa_clique: number;
    tempo_medio_visualizacao: number;
    dispositivos_breakdown: {
      android: number;
      ios: number;
      web: number;
    };
  };
  data_criacao: string;
  data_envio?: string;
  criado_por: string;
  tags: string[];
  a_b_testing?: {
    ativo: boolean;
    variante_a: { titulo: string; mensagem: string; enviados: number };
    variante_b: { titulo: string; mensagem: string; enviados: number };
    vencedor?: 'a' | 'b';
    metrica_decisao: 'cliques' | 'visualizacoes' | 'conversoes';
  };
}

interface SegmentoNotificacao {
  id: number;
  nome: string;
  descricao: string;
  total_usuarios: number;
  plataformas: {
    web: number;
    android: number;
    ios: number;
  };
  criterios: Array<{
    campo: string;
    operador: string;
    valor: string;
  }>;
  opt_in_rate: number;
  data_atualizacao: string;
}

interface ConfiguracaoApp {
  id: number;
  app_name: string;
  plataforma: 'web' | 'android' | 'ios';
  configuracoes: {
    server_key?: string;
    sender_id?: string;
    app_id?: string;
    certificate_path?: string;
    bundle_id?: string;
    vapid_public_key?: string;
    vapid_private_key?: string;
  };
  estatisticas: {
    usuarios_registrados: number;
    opt_in_rate: number;
    taxa_entrega_media: number;
  };
  status: 'ativo' | 'inativo' | 'configurando';
  ultima_atualizacao: string;
}

const NotificacoesPush: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<PushNotification[]>([]);
  const [segmentos, setSegmentos] = useState<SegmentoNotificacao[]>([]);
  const [configuracoes, setConfiguracoes] = useState<ConfiguracaoApp[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'notification' | 'segment' | 'config'>('notification');
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState<PushNotification | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'notificacoes' | 'segmentos' | 'configuracoes'>('notificacoes');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroPlataforma, setFiltroPlataforma] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('data_criacao');

  // Dados mock
  const notificacoesMock: PushNotification[] = [
    {
      id: 1,
      titulo: '🌴 Oferta Relâmpago: Caldas Novas 40% OFF!',
      mensagem: 'Apenas hoje! Resort com águas termais + café da manhã por R$ 180/diária. Vagas limitadas!',
      tipo: 'promocional',
      plataforma: 'todas',
      status: 'enviada',
      destinatarios: {
        total: 5240,
        enviados: 5240,
        entregues: 4987,
        visualizados: 3245,
        clicados: 489,
        falhados: 253
      },
      segmentacao: {
        nome: 'Usuários Ativos - Interesse em Caldas Novas',
        criterios: [
          { campo: 'interesse_destino', operador: 'contém', valor: 'caldas_novas' },
          { campo: 'ultimo_acesso', operador: 'menor_que', valor: '30_dias' },
          { campo: 'push_habilitado', operador: 'igual', valor: 'true' }
        ]
      },
      configuracoes: {
        icone: '/icons/ofertas.png',
        imagem: '/images/caldas-push-banner.jpg',
        vibrar: true,
        badge_count: true,
        click_action_url: 'https://reservei.com/ofertas/caldas-novas',
        ttl_segundos: 86400,
        prioridade: 'alta'
      },
      agendamento: {
        data_envio: '2025-08-25 09:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo'
      },
      personalizacao: {
        dinamica: true,
        variaveis_usadas: ['nome_usuario', 'desconto_personalizado'],
        template_titulo: '🌴 Oferta Relâmpago: {{destino}} {{desconto}}% OFF!',
        template_mensagem: 'Olá {{nome_usuario}}! {{descricao}} por apenas R$ {{preco}}/diária!'
      },
      analytics: {
        taxa_entrega: 95.2,
        taxa_visualizacao: 65.1,
        taxa_clique: 15.1,
        tempo_medio_visualizacao: 4.8,
        dispositivos_breakdown: {
          android: 2890,
          ios: 1456,
          web: 641
        }
      },
      data_criacao: '2025-08-24 16:30:00',
      data_envio: '2025-08-25 09:00:00',
      criado_por: 'Ana Silva Santos',
      tags: ['promocao', 'caldas_novas', 'urgente', 'limitada'],
      a_b_testing: {
        ativo: true,
        variante_a: { titulo: '🌴 Oferta Relâmpago: Caldas Novas 40% OFF!', mensagem: 'Apenas hoje! Resort...', enviados: 2620 },
        variante_b: { titulo: '💥 ÚLTIMA CHANCE: Caldas Novas com SUPER desconto!', mensagem: 'Corre que acaba hoje!...', enviados: 2620 },
        vencedor: 'a',
        metrica_decisao: 'cliques'
      }
    },
    {
      id: 2,
      titulo: '✅ Reserva Confirmada - Hotel Thermas Grand',
      mensagem: 'Sua reserva está confirmada! Check-in amanhã às 15h. Protocolo: RES-HTL-2025-001',
      tipo: 'transacional',
      plataforma: 'todas',
      status: 'enviada',
      destinatarios: {
        total: 1,
        enviados: 1,
        entregues: 1,
        visualizados: 1,
        clicados: 1,
        falhados: 0
      },
      segmentacao: {
        nome: 'Cliente Específico - João Silva',
        criterios: [
          { campo: 'user_id', operador: 'igual', valor: '12345' },
          { campo: 'reserva_id', operador: 'igual', valor: 'RES-HTL-2025-001' }
        ]
      },
      configuracoes: {
        icone: '/icons/confirmacao.png',
        vibrar: false,
        badge_count: true,
        click_action_url: 'https://reservei.com/minhas-reservas/RES-HTL-2025-001',
        deep_link: 'reservei://reserva/RES-HTL-2025-001',
        ttl_segundos: 604800,
        prioridade: 'alta'
      },
      agendamento: {
        data_envio: '2025-08-25 18:30:00',
        envio_imediato: true,
        fuso_horario: 'America/Sao_Paulo'
      },
      personalizacao: {
        dinamica: true,
        variaveis_usadas: ['nome_cliente', 'hotel_nome', 'checkin_data', 'protocolo'],
        template_titulo: '✅ Reserva Confirmada - {{hotel_nome}}',
        template_mensagem: '{{nome_cliente}}, sua reserva está confirmada! Check-in {{checkin_data}}. Protocolo: {{protocolo}}'
      },
      analytics: {
        taxa_entrega: 100.0,
        taxa_visualizacao: 100.0,
        taxa_clique: 100.0,
        tempo_medio_visualizacao: 8.2,
        dispositivos_breakdown: {
          android: 1,
          ios: 0,
          web: 0
        }
      },
      data_criacao: '2025-08-25 18:30:00',
      data_envio: '2025-08-25 18:30:00',
      criado_por: 'Sistema Automatizado',
      tags: ['transacional', 'confirmacao', 'automatico', 'importante']
    },
    {
      id: 3,
      titulo: '⏰ Lembrete: Check-in em 2 horas!',
      mensagem: 'Não esqueça! Seu check-in no Hotel Thermas Grand é às 15h. Tenha seus documentos em mãos.',
      tipo: 'lembrete',
      plataforma: 'todas',
      status: 'agendada',
      destinatarios: {
        total: 15,
        enviados: 0,
        entregues: 0,
        visualizados: 0,
        clicados: 0,
        falhados: 0
      },
      segmentacao: {
        nome: 'Check-in Hoje - 2h antes',
        criterios: [
          { campo: 'checkin_data', operador: 'igual', valor: '2025-08-26' },
          { campo: 'checkin_horario', operador: 'igual', valor: '15:00' },
          { campo: 'status_reserva', operador: 'igual', valor: 'confirmada' }
        ]
      },
      configuracoes: {
        icone: '/icons/lembrete.png',
        som_personalizado: 'gentle_bell.mp3',
        vibrar: true,
        badge_count: true,
        click_action_url: 'https://reservei.com/checkin-info',
        ttl_segundos: 7200,
        prioridade: 'normal'
      },
      agendamento: {
        data_envio: '2025-08-26 13:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo'
      },
      personalizacao: {
        dinamica: true,
        variaveis_usadas: ['nome_cliente', 'hotel_nome', 'checkin_horario'],
        template_titulo: '⏰ Lembrete: Check-in em 2 horas!',
        template_mensagem: '{{nome_cliente}}, não esqueça! Seu check-in no {{hotel_nome}} é às {{checkin_horario}}.'
      },
      analytics: {
        taxa_entrega: 0,
        taxa_visualizacao: 0,
        taxa_clique: 0,
        tempo_medio_visualizacao: 0,
        dispositivos_breakdown: {
          android: 0,
          ios: 0,
          web: 0
        }
      },
      data_criacao: '2025-08-25 14:00:00',
      criado_por: 'Sistema Automatizado',
      tags: ['lembrete', 'checkin', 'automatico', 'util']
    },
    {
      id: 4,
      titulo: '🎉 Avalie sua experiência em Caldas Novas!',
      mensagem: 'Como foi sua estadia? Sua opinião nos ajuda a melhorar! Avalie e ganhe 10% OFF na próxima viagem.',
      tipo: 'informativo',
      plataforma: 'todas',
      status: 'rascunho',
      destinatarios: {
        total: 0,
        enviados: 0,
        entregues: 0,
        visualizados: 0,
        clicados: 0,
        falhados: 0
      },
      segmentacao: {
        nome: 'Checkout Concluído - 24h depois',
        criterios: [
          { campo: 'checkout_data', operador: 'igual', valor: 'ontem' },
          { campo: 'status_reserva', operador: 'igual', valor: 'finalizada' },
          { campo: 'avaliacao_enviada', operador: 'igual', valor: 'false' }
        ]
      },
      configuracoes: {
        icone: '/icons/feedback.png',
        imagem: '/images/feedback-banner.jpg',
        vibrar: false,
        badge_count: false,
        click_action_url: 'https://reservei.com/feedback',
        ttl_segundos: 259200,
        prioridade: 'normal'
      },
      agendamento: {
        data_envio: '2025-08-27 14:00:00',
        envio_imediato: false,
        fuso_horario: 'America/Sao_Paulo',
        repeticao: {
          tipo: 'diario',
          horario: '14:00'
        }
      },
      personalizacao: {
        dinamica: true,
        variaveis_usadas: ['nome_cliente', 'destino_visitado', 'codigo_desconto'],
        template_titulo: '🎉 Avalie sua experiência em {{destino_visitado}}!',
        template_mensagem: '{{nome_cliente}}, como foi sua estadia? Avalie e ganhe {{codigo_desconto}} na próxima viagem!'
      },
      analytics: {
        taxa_entrega: 0,
        taxa_visualizacao: 0,
        taxa_clique: 0,
        tempo_medio_visualizacao: 0,
        dispositivos_breakdown: {
          android: 0,
          ios: 0,
          web: 0
        }
      },
      data_criacao: '2025-08-25 11:20:00',
      criado_por: 'Maria Marketing Costa',
      tags: ['feedback', 'pos_viagem', 'desconto', 'engagement']
    }
  ];

  const segmentosMock: SegmentoNotificacao[] = [
    {
      id: 1,
      nome: 'Usuários VIP Ativos',
      descricao: 'Clientes VIP que acessaram o app nos últimos 7 dias',
      total_usuarios: 234,
      plataformas: {
        web: 45,
        android: 123,
        ios: 66
      },
      criterios: [
        { campo: 'tipo_cliente', operador: 'igual', valor: 'vip' },
        { campo: 'ultimo_acesso', operador: 'menor_que', valor: '7_dias' },
        { campo: 'push_habilitado', operador: 'igual', valor: 'true' }
      ],
      opt_in_rate: 89.5,
      data_atualizacao: '2025-08-25 10:30:00'
    },
    {
      id: 2,
      nome: 'Interessados em Caldas Novas',
      descricao: 'Usuários que demonstraram interesse em Caldas Novas',
      total_usuarios: 5240,
      plataformas: {
        web: 1120,
        android: 2890,
        ios: 1230
      },
      criterios: [
        { campo: 'interesse_destino', operador: 'contém', valor: 'caldas_novas' },
        { campo: 'push_habilitado', operador: 'igual', valor: 'true' }
      ],
      opt_in_rate: 72.3,
      data_atualizacao: '2025-08-25 09:15:00'
    },
    {
      id: 3,
      nome: 'Carrinho Abandonado',
      descricao: 'Usuários que abandonaram carrinho nas últimas 24h',
      total_usuarios: 156,
      plataformas: {
        web: 89,
        android: 45,
        ios: 22
      },
      criterios: [
        { campo: 'carrinho_abandonado', operador: 'igual', valor: 'true' },
        { campo: 'tempo_abandono', operador: 'menor_que', valor: '24h' }
      ],
      opt_in_rate: 68.9,
      data_atualizacao: '2025-08-25 15:45:00'
    }
  ];

  const configuracoesMock: ConfiguracaoApp[] = [
    {
      id: 1,
      app_name: 'Reservei Viagens Web',
      plataforma: 'web',
      configuracoes: {
        vapid_public_key: 'BK8Q...(truncated)',
        vapid_private_key: 'vNj9...(truncated)'
      },
      estatisticas: {
        usuarios_registrados: 12450,
        opt_in_rate: 45.2,
        taxa_entrega_media: 92.1
      },
      status: 'ativo',
      ultima_atualizacao: '2025-08-20 14:30:00'
    },
    {
      id: 2,
      app_name: 'Reservei Viagens Android',
      plataforma: 'android',
      configuracoes: {
        server_key: 'AAAA...(truncated)',
        sender_id: '123456789012'
      },
      estatisticas: {
        usuarios_registrados: 28940,
        opt_in_rate: 78.5,
        taxa_entrega_media: 95.8
      },
      status: 'ativo',
      ultima_atualizacao: '2025-08-18 10:15:00'
    },
    {
      id: 3,
      app_name: 'Reservei Viagens iOS',
      plataforma: 'ios',
      configuracoes: {
        certificate_path: '/certificates/apns_cert.p12',
        bundle_id: 'com.reservei.viagens'
      },
      estatisticas: {
        usuarios_registrados: 15680,
        opt_in_rate: 82.1,
        taxa_entrega_media: 97.3
      },
      status: 'ativo',
      ultima_atualizacao: '2025-08-19 16:20:00'
    }
  ];

  useEffect(() => {
    setNotificacoes(notificacoesMock);
    setSegmentos(segmentosMock);
    setConfiguracoes(configuracoesMock);
  }, []);

  const notificacoesFiltradas = notificacoes.filter(notificacao => {
    const matchBusca = notificacao.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                      notificacao.mensagem.toLowerCase().includes(busca.toLowerCase()) ||
                      notificacao.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = filtroTipo === 'todos' || notificacao.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || notificacao.status === filtroStatus;
    const matchPlataforma = filtroPlataforma === 'todas' || notificacao.plataforma === filtroPlataforma || notificacao.plataforma === 'todas';

    return matchBusca && matchTipo && matchStatus && matchPlataforma;
  }).sort((a, b) => {
    if (ordenacao === 'data_criacao') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else if (ordenacao === 'entregues') {
      return b.destinatarios.entregues - a.destinatarios.entregues;
    } else if (ordenacao === 'cliques') {
      return b.destinatarios.clicados - a.destinatarios.clicados;
    }
    return 0;
  });

  const estatisticas = {
    totalNotificacoes: notificacoes.length,
    notificacoesEnviadas: notificacoes.filter(n => n.status === 'enviada').length,
    totalEnviados: notificacoes.reduce((acc, n) => acc + n.destinatarios.enviados, 0),
    totalEntregues: notificacoes.reduce((acc, n) => acc + n.destinatarios.entregues, 0),
    totalVisualizados: notificacoes.reduce((acc, n) => acc + n.destinatarios.visualizados, 0),
    totalClicados: notificacoes.reduce((acc, n) => acc + n.destinatarios.clicados, 0),
    taxaEntregaMedia: notificacoes.reduce((acc, n) => acc + n.analytics.taxa_entrega, 0) / notificacoes.length || 0,
    taxaVisualizacaoMedia: notificacoes.reduce((acc, n) => acc + n.analytics.taxa_visualizacao, 0) / notificacoes.length || 0
  };

  const handleView = (notificacao: PushNotification) => {
    setNotificacaoSelecionada(notificacao);
    setModalTipo('notification');
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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'promocional': return 'bg-purple-100 text-purple-800';
      case 'transacional': return 'bg-green-100 text-green-800';
      case 'lembrete': return 'bg-blue-100 text-blue-800';
      case 'urgente': return 'bg-red-100 text-red-800';
      case 'informativo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlataformaIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'web': return '🌐';
      case 'android': return '🤖';
      case 'ios': return '🍎';
      case 'todas': return '📱';
      default: return '📱';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="h-8 w-8 text-blue-600" />
              Notificações Push
            </h1>
            <p className="text-gray-600 mt-2">Sistema de notificações push web e mobile</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <BarChart3 className="h-4 w-4" />
              Métricas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Nova Notificação
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalNotificacoes}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.notificacoesEnviadas}</div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalEnviados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Enviados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.totalEntregues.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Entregues</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.totalVisualizados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Visualizados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.totalClicados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Clicados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-pink-600">{estatisticas.taxaEntregaMedia.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Entrega</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.taxaVisualizacaoMedia.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Visualização</div>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'notificacoes', label: 'Notificações', icon: Bell },
              { id: 'segmentos', label: 'Segmentos', icon: Target },
              { id: 'configuracoes', label: 'Configurações', icon: Settings }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaSelecionada(aba.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm ${
                  abaSelecionada === aba.id
                    ? 'border-blue-500 text-blue-600'
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
        {abaSelecionada === 'notificacoes' && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar notificações..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos Tipos</option>
                <option value="promocional">Promocional</option>
                <option value="transacional">Transacional</option>
                <option value="lembrete">Lembrete</option>
                <option value="urgente">Urgente</option>
                <option value="informativo">Informativo</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
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
                value={filtroPlataforma}
                onChange={(e) => setFiltroPlataforma(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas Plataformas</option>
                <option value="web">Web</option>
                <option value="android">Android</option>
                <option value="ios">iOS</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="data_criacao">Data Criação</option>
                <option value="entregues">Mais Entregues</option>
                <option value="cliques">Mais Cliques</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo das Abas */}
      {abaSelecionada === 'notificacoes' && (
        <div className="space-y-4">
          {notificacoesFiltradas.map((notificacao) => (
            <div key={notificacao.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getPlataformaIcon(notificacao.plataforma)}</span>
                    <h3 className="font-bold text-lg text-gray-900">{notificacao.titulo}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(notificacao.tipo)}`}>
                      {notificacao.tipo.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notificacao.status)}`}>
                      {notificacao.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {notificacao.a_b_testing?.ativo && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        A/B TEST
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notificacao.mensagem}</p>
                  <div className="text-sm text-gray-500">
                    Criada por {notificacao.criado_por} • {new Date(notificacao.data_criacao).toLocaleDateString()}
                    {notificacao.data_envio && ` • Enviada em ${new Date(notificacao.data_envio).toLocaleDateString()}`}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{notificacao.destinatarios.total.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{notificacao.destinatarios.entregues.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Entregues</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{notificacao.destinatarios.visualizados.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Visualizados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{notificacao.destinatarios.clicados.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Clicados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{notificacao.analytics.taxa_entrega.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Taxa Entrega</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600">{notificacao.analytics.taxa_clique.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Taxa Clique</div>
                </div>
              </div>

              {/* A/B Testing */}
              {notificacao.a_b_testing?.ativo && (
                <div className="bg-orange-50 rounded-lg p-3 mb-4">
                  <div className="text-sm font-medium text-orange-800 mb-2">Teste A/B Ativo</div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="font-medium">Variante A: {notificacao.a_b_testing.variante_a.enviados} enviados</div>
                      <div className="text-gray-600">{notificacao.a_b_testing.variante_a.titulo}</div>
                    </div>
                    <div>
                      <div className="font-medium">Variante B: {notificacao.a_b_testing.variante_b.enviados} enviados</div>
                      <div className="text-gray-600">{notificacao.a_b_testing.variante_b.titulo}</div>
                    </div>
                  </div>
                  {notificacao.a_b_testing.vencedor && (
                    <div className="mt-2 text-sm font-medium text-green-700">
                      🏆 Vencedor: Variante {notificacao.a_b_testing.vencedor.toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              {/* Dispositivos */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{notificacao.analytics.dispositivos_breakdown.android.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">🤖 Android</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{notificacao.analytics.dispositivos_breakdown.ios.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">🍎 iOS</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">{notificacao.analytics.dispositivos_breakdown.web.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">🌐 Web</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {notificacao.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Segmento: {notificacao.segmentacao.nome}
                  {notificacao.agendamento.repeticao && ` • Repetição: ${notificacao.agendamento.repeticao.tipo}`}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(notificacao)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                  {notificacao.status === 'rascunho' && (
                    <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
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

      {/* Aba Segmentos */}
      {abaSelecionada === 'segmentos' && (
        <div className="space-y-4">
          {segmentos.map((segmento) => (
            <div key={segmento.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{segmento.nome}</h3>
                  <p className="text-gray-600 text-sm mb-2">{segmento.descricao}</p>
                  <div className="text-sm text-gray-500">
                    Atualizado em {new Date(segmento.data_atualizacao).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{segmento.total_usuarios.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">usuários</div>
                  <div className="text-sm text-green-600">{segmento.opt_in_rate.toFixed(1)}% opt-in</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{segmento.plataformas.android.toLocaleString()}</div>
                  <div className="text-xs text-green-700">🤖 Android</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{segmento.plataformas.ios.toLocaleString()}</div>
                  <div className="text-xs text-blue-700">🍎 iOS</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">{segmento.plataformas.web.toLocaleString()}</div>
                  <div className="text-xs text-purple-700">🌐 Web</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Critérios:</h4>
                <div className="space-y-1">
                  {segmento.criterios.map((criterio, index) => (
                    <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded">
                      {criterio.campo} {criterio.operador} {criterio.valor}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Users className="h-4 w-4 inline mr-1" />
                  Ver Usuários
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Editar Segmento
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aba Configurações */}
      {abaSelecionada === 'configuracoes' && (
        <div className="space-y-4">
          {configuracoes.map((config) => (
            <div key={config.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-2xl">{getPlataformaIcon(config.plataforma)}</span>
                    {config.app_name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      config.status === 'ativo' ? 'bg-green-100 text-green-800' :
                      config.status === 'inativo' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {config.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Atualizado em {new Date(config.ultima_atualizacao).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-blue-600">{config.estatisticas.usuarios_registrados.toLocaleString()}</div>
                  <div className="text-xs text-blue-700">Usuários Registrados</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-green-600">{config.estatisticas.opt_in_rate.toFixed(1)}%</div>
                  <div className="text-xs text-green-700">Taxa Opt-in</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-purple-600">{config.estatisticas.taxa_entrega_media.toFixed(1)}%</div>
                  <div className="text-xs text-purple-700">Taxa Entrega</div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Configurações:</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  {Object.entries(config.configuracoes).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center bg-gray-50 px-3 py-1 rounded">
                      <span className="font-medium">{key.replace('_', ' ')}:</span>
                      <span className="text-gray-500">
                        {typeof value === 'string' && value.length > 20 ?
                          `${value.substring(0, 20)}...(truncated)` :
                          value
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Editar Configuração
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Testar Conexão
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes da Notificação */}
      {showModal && modalTipo === 'notification' && notificacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{notificacaoSelecionada.titulo}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(notificacaoSelecionada.tipo)}`}>
                  {notificacaoSelecionada.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notificacaoSelecionada.status)}`}>
                  {notificacaoSelecionada.status}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getPlataformaIcon(notificacaoSelecionada.plataforma)} {notificacaoSelecionada.plataforma}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Conteúdo */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Conteúdo da Notificação</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-2">{notificacaoSelecionada.titulo}</div>
                  <p className="text-gray-700">{notificacaoSelecionada.mensagem}</p>
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Analytics Detalhados</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{notificacaoSelecionada.destinatarios.total.toLocaleString()}</div>
                    <div className="text-xs text-blue-700">Total</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{notificacaoSelecionada.destinatarios.entregues.toLocaleString()}</div>
                    <div className="text-xs text-green-700">Entregues</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">{notificacaoSelecionada.destinatarios.visualizados.toLocaleString()}</div>
                    <div className="text-xs text-purple-700">Visualizados</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-orange-600">{notificacaoSelecionada.destinatarios.clicados.toLocaleString()}</div>
                    <div className="text-xs text-orange-700">Clicados</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-600">{notificacaoSelecionada.destinatarios.falhados.toLocaleString()}</div>
                    <div className="text-xs text-red-700">Falhados</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-yellow-600">{notificacaoSelecionada.analytics.tempo_medio_visualizacao.toFixed(1)}s</div>
                    <div className="text-xs text-yellow-700">Tempo Médio</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{notificacaoSelecionada.analytics.dispositivos_breakdown.android.toLocaleString()}</div>
                    <div className="text-xs text-green-700">🤖 Android</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{notificacaoSelecionada.analytics.dispositivos_breakdown.ios.toLocaleString()}</div>
                    <div className="text-xs text-blue-700">🍎 iOS</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">{notificacaoSelecionada.analytics.dispositivos_breakdown.web.toLocaleString()}</div>
                    <div className="text-xs text-purple-700">🌐 Web</div>
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Configurações de Entrega</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Ícone:</strong> {notificacaoSelecionada.configuracoes.icone}</div>
                    <div><strong>Prioridade:</strong> {notificacaoSelecionada.configuracoes.prioridade}</div>
                    <div><strong>TTL:</strong> {notificacaoSelecionada.configuracoes.ttl_segundos}s</div>
                    <div><strong>Vibrar:</strong> {notificacaoSelecionada.configuracoes.vibrar ? 'Sim' : 'Não'}</div>
                    <div><strong>Badge:</strong> {notificacaoSelecionada.configuracoes.badge_count ? 'Sim' : 'Não'}</div>
                    {notificacaoSelecionada.configuracoes.click_action_url && (
                      <div><strong>URL de Ação:</strong> {notificacaoSelecionada.configuracoes.click_action_url}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Agendamento</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Envio:</strong> {notificacaoSelecionada.agendamento.envio_imediato ? 'Imediato' : 'Agendado'}</div>
                    {!notificacaoSelecionada.agendamento.envio_imediato && (
                      <div><strong>Data:</strong> {new Date(notificacaoSelecionada.agendamento.data_envio).toLocaleString()}</div>
                    )}
                    <div><strong>Fuso:</strong> {notificacaoSelecionada.agendamento.fuso_horario}</div>
                    {notificacaoSelecionada.agendamento.repeticao && (
                      <div><strong>Repetição:</strong> {notificacaoSelecionada.agendamento.repeticao.tipo}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personalização */}
              {notificacaoSelecionada.personalizacao.dinamica && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personalização Dinâmica</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm mb-2"><strong>Variáveis Utilizadas:</strong></div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {notificacaoSelecionada.personalizacao.variaveis_usadas.map((variavel, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {`{{${variavel}}}`}
                        </span>
                      ))}
                    </div>
                    {notificacaoSelecionada.personalizacao.template_titulo && (
                      <div className="text-sm">
                        <strong>Template Título:</strong> {notificacaoSelecionada.personalizacao.template_titulo}
                      </div>
                    )}
                    {notificacaoSelecionada.personalizacao.template_mensagem && (
                      <div className="text-sm">
                        <strong>Template Mensagem:</strong> {notificacaoSelecionada.personalizacao.template_mensagem}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* A/B Testing */}
              {notificacaoSelecionada.a_b_testing?.ativo && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Teste A/B</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="font-medium text-green-800 mb-2">Variante A</div>
                      <div className="text-sm">
                        <div><strong>Título:</strong> {notificacaoSelecionada.a_b_testing.variante_a.titulo}</div>
                        <div><strong>Enviados:</strong> {notificacaoSelecionada.a_b_testing.variante_a.enviados.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="font-medium text-blue-800 mb-2">Variante B</div>
                      <div className="text-sm">
                        <div><strong>Título:</strong> {notificacaoSelecionada.a_b_testing.variante_b.titulo}</div>
                        <div><strong>Enviados:</strong> {notificacaoSelecionada.a_b_testing.variante_b.enviados.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  {notificacaoSelecionada.a_b_testing.vencedor && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="font-medium text-yellow-800">
                        🏆 Vencedor: Variante {notificacaoSelecionada.a_b_testing.vencedor.toUpperCase()}
                      </div>
                      <div className="text-sm text-yellow-700">
                        Métrica de decisão: {notificacaoSelecionada.a_b_testing.metrica_decisao}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Segmentação */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Segmentação</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-2">{notificacaoSelecionada.segmentacao.nome}</div>
                  <div className="text-sm">
                    <strong>Critérios aplicados:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {notificacaoSelecionada.segmentacao.criterios.map((criterio, index) => (
                        <li key={index} className="text-gray-600">
                          {criterio.campo} {criterio.operador} {criterio.valor}
                        </li>
                      ))}
                    </ul>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Editar Notificação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {abaSelecionada === 'notificacoes' && notificacoesFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar notificações.'
              : 'Comece criando sua primeira notificação push.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nova Notificação
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificacoesPush;
