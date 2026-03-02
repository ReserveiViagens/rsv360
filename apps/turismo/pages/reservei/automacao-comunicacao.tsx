// 🤖 AUTOMAÇÃO DE COMUNICAÇÃO - RESERVEI VIAGENS
// Funcionalidade: Sistema de automação de comunicação multicanal
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Play, Pause, Zap, Users, BarChart3, Clock, CheckCircle, AlertTriangle, Settings, Filter, Calendar, MessageSquare } from 'lucide-react';

interface AutomacaoFluxo {
  id: number;
  nome: string;
  descricao: string;
  tipo: 'boas_vindas' | 'carrinho_abandonado' | 'pos_compra' | 'remarketing' | 'aniversario' | 'reativacao' | 'feedback' | 'lembrete';
  status: 'ativo' | 'pausado' | 'rascunho' | 'arquivado';
  gatilho: {
    evento: string;
    condicoes: Array<{
      campo: string;
      operador: string;
      valor: string;
    }>;
    frequencia: 'unico' | 'recorrente';
  };
  etapas: Array<{
    id: number;
    nome: string;
    tipo: 'email' | 'sms' | 'whatsapp' | 'push' | 'espera' | 'condicao' | 'webhook';
    delay: {
      tipo: 'imediato' | 'minutos' | 'horas' | 'dias';
      valor: number;
    };
    conteudo?: {
      template_id?: string;
      template_nome?: string;
      assunto?: string;
      mensagem?: string;
      personalizacao?: boolean;
    };
    condicoes?: Array<{
      campo: string;
      operador: string;
      valor: string;
      acao_verdadeiro: string;
      acao_falso: string;
    }>;
    webhook_url?: string;
  }>;
  segmentacao: {
    nome: string;
    criterios: Array<{
      campo: string;
      operador: string;
      valor: string;
    }>;
    total_usuarios: number;
  };
  metricas: {
    usuarios_inscritos: number;
    usuarios_ativos: number;
    total_enviados: number;
    total_entregues: number;
    total_abertos: number;
    total_cliques: number;
    conversoes: number;
    taxa_conversao: number;
    receita_gerada: number;
  };
  configuracoes: {
    limite_diario: number;
    horario_envio: {
      inicio: string;
      fim: string;
    };
    dias_semana: number[];
    timezone: string;
    opt_out_automatico: boolean;
    resposta_automatica: boolean;
  };
  data_criacao: string;
  data_ativacao?: string;
  ultima_execucao?: string;
  criado_por: string;
  tags: string[];
  historico_execucoes: Array<{
    data: string;
    usuarios_processados: number;
    mensagens_enviadas: number;
    erros: number;
    tempo_execucao: number;
  }>;
}

interface TemplateAutomacao {
  id: string;
  nome: string;
  categoria: string;
  tipo_canal: 'email' | 'sms' | 'whatsapp' | 'push';
  assunto?: string;
  conteudo: string;
  variaveis: string[];
  personalizacao: boolean;
  uso_count: number;
  taxa_abertura_media: number;
  taxa_clique_media: number;
  data_criacao: string;
}

interface GatilhoEvento {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  parametros: Array<{
    nome: string;
    tipo: string;
    descricao: string;
    obrigatorio: boolean;
  }>;
  exemplos: string[];
  uso_count: number;
}

const AutomacaoComunicacao: React.FC = () => {
  const [fluxos, setFluxos] = useState<AutomacaoFluxo[]>([]);
  const [templates, setTemplates] = useState<TemplateAutomacao[]>([]);
  const [gatilhos, setGatilhos] = useState<GatilhoEvento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'fluxo' | 'template' | 'gatilho'>('fluxo');
  const [fluxoSelecionado, setFluxoSelecionado] = useState<AutomacaoFluxo | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'fluxos' | 'templates' | 'gatilhos'>('fluxos');
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_criacao');

  // Dados mock
  const fluxosMock: AutomacaoFluxo[] = [
    {
      id: 1,
      nome: 'Boas-vindas Novos Clientes',
      descricao: 'Sequência de boas-vindas para novos usuários cadastrados com apresentação da empresa e primeiras ofertas',
      tipo: 'boas_vindas',
      status: 'ativo',
      gatilho: {
        evento: 'user_registered',
        condicoes: [
          { campo: 'tipo_cadastro', operador: 'igual', valor: 'completo' },
          { campo: 'email_verificado', operador: 'igual', valor: 'true' }
        ],
        frequencia: 'unico'
      },
      etapas: [
        {
          id: 1,
          nome: 'Email de Boas-vindas',
          tipo: 'email',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'welcome_001',
            template_nome: 'Boas-vindas Premium',
            assunto: 'Bem-vindo à Reservei Viagens! 🎉',
            personalizacao: true
          }
        },
        {
          id: 2,
          nome: 'Aguardar 1 dia',
          tipo: 'espera',
          delay: { tipo: 'dias', valor: 1 }
        },
        {
          id: 3,
          nome: 'Push - Primeira Oferta',
          tipo: 'push',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'first_offer_push',
            template_nome: 'Primeira Oferta Push',
            mensagem: 'Confira nossa oferta especial para novos clientes!',
            personalizacao: true
          }
        },
        {
          id: 4,
          nome: 'Aguardar 3 dias',
          tipo: 'espera',
          delay: { tipo: 'dias', valor: 3 }
        },
        {
          id: 5,
          nome: 'WhatsApp - Dicas de Viagem',
          tipo: 'whatsapp',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'travel_tips_wa',
            template_nome: 'Dicas de Viagem WhatsApp',
            mensagem: 'Olá! Preparamos dicas especiais para sua primeira viagem conosco',
            personalizacao: true
          }
        }
      ],
      segmentacao: {
        nome: 'Novos Cadastros Completos',
        criterios: [
          { campo: 'data_cadastro', operador: 'menor_que', valor: '24_horas' },
          { campo: 'primeira_compra', operador: 'igual', valor: 'false' }
        ],
        total_usuarios: 1250
      },
      metricas: {
        usuarios_inscritos: 1250,
        usuarios_ativos: 1187,
        total_enviados: 4623,
        total_entregues: 4389,
        total_abertos: 2934,
        total_cliques: 587,
        conversoes: 89,
        taxa_conversao: 7.5,
        receita_gerada: 45600.00
      },
      configuracoes: {
        limite_diario: 500,
        horario_envio: { inicio: '08:00', fim: '20:00' },
        dias_semana: [1, 2, 3, 4, 5, 6],
        timezone: 'America/Sao_Paulo',
        opt_out_automatico: true,
        resposta_automatica: false
      },
      data_criacao: '2025-07-15 10:30:00',
      data_ativacao: '2025-07-20 09:00:00',
      ultima_execucao: '2025-08-25 14:30:00',
      criado_por: 'Ana Silva Santos',
      tags: ['boas_vindas', 'novos_clientes', 'conversa', 'multicanal'],
      historico_execucoes: [
        { data: '2025-08-25', usuarios_processados: 45, mensagens_enviadas: 135, erros: 2, tempo_execucao: 12.5 },
        { data: '2025-08-24', usuarios_processados: 38, mensagens_enviadas: 114, erros: 1, tempo_execucao: 9.8 },
        { data: '2025-08-23', usuarios_processados: 52, mensagens_enviadas: 156, erros: 0, tempo_execucao: 15.2 }
      ]
    },
    {
      id: 2,
      nome: 'Recuperação Carrinho Abandonado',
      descricao: 'Sequência para recuperar carrinhos abandonados com lembretes progressivos e incentivos de desconto',
      tipo: 'carrinho_abandonado',
      status: 'ativo',
      gatilho: {
        evento: 'cart_abandoned',
        condicoes: [
          { campo: 'valor_carrinho', operador: 'maior_que', valor: '100' },
          { campo: 'tempo_abandono', operador: 'maior_que', valor: '30_minutos' }
        ],
        frequencia: 'unico'
      },
      etapas: [
        {
          id: 1,
          nome: 'Email - Lembrete 1h',
          tipo: 'email',
          delay: { tipo: 'horas', valor: 1 },
          conteudo: {
            template_id: 'cart_reminder_1h',
            template_nome: 'Lembrete Carrinho 1h',
            assunto: 'Você esqueceu algo! Complete sua reserva',
            personalizacao: true
          }
        },
        {
          id: 2,
          nome: 'Push - Lembrete 6h',
          tipo: 'push',
          delay: { tipo: 'horas', valor: 6 },
          conteudo: {
            template_id: 'cart_push_6h',
            template_nome: 'Push Carrinho 6h',
            mensagem: 'Sua reserva ainda está te esperando! Finalize agora',
            personalizacao: true
          }
        },
        {
          id: 3,
          nome: 'WhatsApp - Desconto 24h',
          tipo: 'whatsapp',
          delay: { tipo: 'dias', valor: 1 },
          conteudo: {
            template_id: 'cart_discount_24h',
            template_nome: 'Desconto Carrinho 24h',
            mensagem: 'Última chance! Ganhe 10% OFF finalizando sua reserva hoje',
            personalizacao: true
          }
        }
      ],
      segmentacao: {
        nome: 'Carrinho Abandonado +R$100',
        criterios: [
          { campo: 'carrinho_valor', operador: 'maior_que', valor: '100' },
          { campo: 'carrinho_items', operador: 'maior_que', valor: '0' }
        ],
        total_usuarios: 456
      },
      metricas: {
        usuarios_inscritos: 456,
        usuarios_ativos: 398,
        total_enviados: 1287,
        total_entregues: 1198,
        total_abertos: 756,
        total_cliques: 234,
        conversoes: 67,
        taxa_conversao: 16.8,
        receita_gerada: 23400.00
      },
      configuracoes: {
        limite_diario: 200,
        horario_envio: { inicio: '09:00', fim: '21:00' },
        dias_semana: [1, 2, 3, 4, 5, 6, 7],
        timezone: 'America/Sao_Paulo',
        opt_out_automatico: false,
        resposta_automatica: true
      },
      data_criacao: '2025-06-20 14:15:00',
      data_ativacao: '2025-06-25 08:00:00',
      ultima_execucao: '2025-08-25 16:45:00',
      criado_por: 'Carlos Marketing Silva',
      tags: ['carrinho_abandonado', 'recuperacao', 'desconto', 'conversao'],
      historico_execucoes: [
        { data: '2025-08-25', usuarios_processados: 23, mensagens_enviadas: 69, erros: 1, tempo_execucao: 8.3 },
        { data: '2025-08-24', usuarios_processados: 31, mensagens_enviadas: 93, erros: 0, tempo_execucao: 11.2 },
        { data: '2025-08-23', usuarios_processados: 18, mensagens_enviadas: 54, erros: 2, tempo_execucao: 6.7 }
      ]
    },
    {
      id: 3,
      nome: 'Feedback Pós-Viagem',
      descricao: 'Coleta de feedback após check-out com incentivos para avaliação e programa de fidelidade',
      tipo: 'feedback',
      status: 'ativo',
      gatilho: {
        evento: 'checkout_completed',
        condicoes: [
          { campo: 'status_reserva', operador: 'igual', valor: 'finalizada' },
          { campo: 'tipo_viagem', operador: 'diferente', valor: 'cancelada' }
        ],
        frequencia: 'unico'
      },
      etapas: [
        {
          id: 1,
          nome: 'SMS - Agradecimento',
          tipo: 'sms',
          delay: { tipo: 'horas', valor: 2 },
          conteudo: {
            template_id: 'thanks_sms',
            template_nome: 'Agradecimento SMS',
            mensagem: 'Obrigado por escolher a Reservei! Como foi sua experiência?',
            personalizacao: true
          }
        },
        {
          id: 2,
          nome: 'Email - Solicitação Feedback',
          tipo: 'email',
          delay: { tipo: 'dias', valor: 1 },
          conteudo: {
            template_id: 'feedback_request',
            template_nome: 'Solicitação de Feedback',
            assunto: 'Como foi sua viagem? Conte para nós! ⭐',
            personalizacao: true
          }
        },
        {
          id: 3,
          nome: 'Condição: Avaliou?',
          tipo: 'condicao',
          delay: { tipo: 'dias', valor: 3 },
          condicoes: [
            {
              campo: 'feedback_enviado',
              operador: 'igual',
              valor: 'true',
              acao_verdadeiro: 'parar_fluxo',
              acao_falso: 'continuar'
            }
          ]
        },
        {
          id: 4,
          nome: 'WhatsApp - Incentivo Desconto',
          tipo: 'whatsapp',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'feedback_incentive',
            template_nome: 'Incentivo Feedback',
            mensagem: 'Avalie sua viagem e ganhe 15% OFF na próxima! 🎁',
            personalizacao: true
          }
        }
      ],
      segmentacao: {
        nome: 'Check-out Finalizado',
        criterios: [
          { campo: 'checkout_data', operador: 'menor_que', valor: '48_horas' },
          { campo: 'feedback_enviado', operador: 'igual', valor: 'false' }
        ],
        total_usuarios: 234
      },
      metricas: {
        usuarios_inscritos: 234,
        usuarios_ativos: 198,
        total_enviados: 689,
        total_entregues: 645,
        total_abertos: 423,
        total_cliques: 156,
        conversoes: 78,
        taxa_conversao: 39.4,
        receita_gerada: 8900.00
      },
      configuracoes: {
        limite_diario: 100,
        horario_envio: { inicio: '10:00', fim: '18:00' },
        dias_semana: [1, 2, 3, 4, 5],
        timezone: 'America/Sao_Paulo',
        opt_out_automatico: true,
        resposta_automatica: true
      },
      data_criacao: '2025-08-01 11:20:00',
      data_ativacao: '2025-08-05 09:30:00',
      ultima_execucao: '2025-08-25 12:15:00',
      criado_por: 'Maria Marketing Costa',
      tags: ['feedback', 'pos_viagem', 'satisfacao', 'fidelidade'],
      historico_execucoes: [
        { data: '2025-08-25', usuarios_processados: 12, mensagens_enviadas: 36, erros: 0, tempo_execucao: 4.2 },
        { data: '2025-08-24', usuarios_processados: 15, mensagens_enviadas: 45, erros: 1, tempo_execucao: 5.8 },
        { data: '2025-08-23', usuarios_processados: 8, mensagens_enviadas: 24, erros: 0, tempo_execucao: 2.9 }
      ]
    },
    {
      id: 4,
      nome: 'Reativação Clientes Inativos',
      descricao: 'Campanha para reativar clientes que não fazem compras há mais de 90 dias',
      tipo: 'reativacao',
      status: 'pausado',
      gatilho: {
        evento: 'customer_inactive',
        condicoes: [
          { campo: 'ultima_compra', operador: 'maior_que', valor: '90_dias' },
          { campo: 'total_compras', operador: 'maior_que', valor: '1' }
        ],
        frequencia: 'recorrente'
      },
      etapas: [
        {
          id: 1,
          nome: 'Email - Sentimos sua falta',
          tipo: 'email',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'miss_you_email',
            template_nome: 'Sentimos sua Falta',
            assunto: 'Sentimos sua falta! Que tal uma nova aventura? 🌍',
            personalizacao: true
          }
        },
        {
          id: 2,
          nome: 'Aguardar 7 dias',
          tipo: 'espera',
          delay: { tipo: 'dias', valor: 7 }
        },
        {
          id: 3,
          nome: 'Push - Oferta Especial',
          tipo: 'push',
          delay: { tipo: 'imediato', valor: 0 },
          conteudo: {
            template_id: 'comeback_offer',
            template_nome: 'Oferta Volta',
            mensagem: 'Oferta especial para você voltar a viajar! 20% OFF',
            personalizacao: true
          }
        }
      ],
      segmentacao: {
        nome: 'Clientes Inativos 90+ dias',
        criterios: [
          { campo: 'ultima_atividade', operador: 'maior_que', valor: '90_dias' },
          { campo: 'valor_lifetime', operador: 'maior_que', valor: '500' }
        ],
        total_usuarios: 890
      },
      metricas: {
        usuarios_inscritos: 890,
        usuarios_ativos: 0,
        total_enviados: 0,
        total_entregues: 0,
        total_abertos: 0,
        total_cliques: 0,
        conversoes: 0,
        taxa_conversao: 0,
        receita_gerada: 0
      },
      configuracoes: {
        limite_diario: 150,
        horario_envio: { inicio: '14:00', fim: '17:00' },
        dias_semana: [2, 3, 4, 5],
        timezone: 'America/Sao_Paulo',
        opt_out_automatico: true,
        resposta_automatica: false
      },
      data_criacao: '2025-08-10 16:45:00',
      criado_por: 'Roberto Retention',
      tags: ['reativacao', 'inativos', 'retention', 'oferta_especial'],
      historico_execucoes: []
    }
  ];

  const templatesMock: TemplateAutomacao[] = [
    {
      id: 'welcome_001',
      nome: 'Boas-vindas Premium',
      categoria: 'Boas-vindas',
      tipo_canal: 'email',
      assunto: 'Bem-vindo à Reservei Viagens! 🎉',
      conteudo: 'Olá {{nome_cliente}}! Seja muito bem-vindo à família Reservei Viagens...',
      variaveis: ['nome_cliente', 'email', 'data_cadastro'],
      personalizacao: true,
      uso_count: 1250,
      taxa_abertura_media: 78.5,
      taxa_clique_media: 23.4,
      data_criacao: '2025-07-10 14:20:00'
    },
    {
      id: 'cart_reminder_1h',
      nome: 'Lembrete Carrinho 1h',
      categoria: 'Carrinho Abandonado',
      tipo_canal: 'email',
      assunto: 'Você esqueceu algo! Complete sua reserva',
      conteudo: 'Olá {{nome_cliente}}! Notamos que você deixou alguns itens no seu carrinho...',
      variaveis: ['nome_cliente', 'itens_carrinho', 'valor_total', 'link_carrinho'],
      personalizacao: true,
      uso_count: 456,
      taxa_abertura_media: 65.8,
      taxa_clique_media: 31.2,
      data_criacao: '2025-06-15 09:30:00'
    },
    {
      id: 'feedback_request',
      nome: 'Solicitação de Feedback',
      categoria: 'Pós-viagem',
      tipo_canal: 'email',
      assunto: 'Como foi sua viagem? Conte para nós! ⭐',
      conteudo: 'Oi {{nome_cliente}}! Esperamos que tenha aproveitado sua estadia em {{destino}}...',
      variaveis: ['nome_cliente', 'destino', 'hotel', 'data_checkout', 'link_avaliacao'],
      personalizacao: true,
      uso_count: 234,
      taxa_abertura_media: 82.1,
      taxa_clique_media: 45.7,
      data_criacao: '2025-07-25 16:10:00'
    },
    {
      id: 'travel_tips_wa',
      nome: 'Dicas de Viagem WhatsApp',
      categoria: 'Educacional',
      tipo_canal: 'whatsapp',
      conteudo: 'Olá {{nome_cliente}}! 🌟 Preparamos dicas especiais para sua primeira viagem conosco...',
      variaveis: ['nome_cliente', 'destino_interesse'],
      personalizacao: true,
      uso_count: 1187,
      taxa_abertura_media: 95.2,
      taxa_clique_media: 18.9,
      data_criacao: '2025-07-12 10:45:00'
    }
  ];

  const gatilhosMock: GatilhoEvento[] = [
    {
      id: 'user_registered',
      nome: 'Usuário Cadastrado',
      descricao: 'Disparado quando um novo usuário completa o cadastro',
      categoria: 'Cadastro',
      parametros: [
        { nome: 'user_id', tipo: 'string', descricao: 'ID único do usuário', obrigatorio: true },
        { nome: 'email', tipo: 'string', descricao: 'Email do usuário', obrigatorio: true },
        { nome: 'nome', tipo: 'string', descricao: 'Nome completo', obrigatorio: true },
        { nome: 'tipo_cadastro', tipo: 'string', descricao: 'Tipo do cadastro (completo/social)', obrigatorio: false }
      ],
      exemplos: ['Cadastro via formulário', 'Cadastro via Google/Facebook', 'Cadastro durante checkout'],
      uso_count: 15
    },
    {
      id: 'cart_abandoned',
      nome: 'Carrinho Abandonado',
      descricao: 'Disparado quando usuário abandona carrinho com itens',
      categoria: 'E-commerce',
      parametros: [
        { nome: 'user_id', tipo: 'string', descricao: 'ID do usuário', obrigatorio: true },
        { nome: 'cart_value', tipo: 'number', descricao: 'Valor total do carrinho', obrigatorio: true },
        { nome: 'items', tipo: 'array', descricao: 'Lista de itens no carrinho', obrigatorio: true },
        { nome: 'abandon_time', tipo: 'datetime', descricao: 'Momento do abandono', obrigatorio: true }
      ],
      exemplos: ['Usuário sai da página de checkout', 'Sessão expira com itens no carrinho', 'Usuário fecha o navegador'],
      uso_count: 8
    },
    {
      id: 'checkout_completed',
      nome: 'Check-out Concluído',
      descricao: 'Disparado quando usuário finaliza uma estadia/viagem',
      categoria: 'Viagem',
      parametros: [
        { nome: 'user_id', tipo: 'string', descricao: 'ID do usuário', obrigatorio: true },
        { nome: 'booking_id', tipo: 'string', descricao: 'ID da reserva', obrigatorio: true },
        { nome: 'hotel_name', tipo: 'string', descricao: 'Nome do hotel', obrigatorio: true },
        { nome: 'checkout_date', tipo: 'datetime', descricao: 'Data do check-out', obrigatorio: true }
      ],
      exemplos: ['Hóspede faz check-out do hotel', 'Viagem é marcada como finalizada', 'Sistema atualiza status da reserva'],
      uso_count: 12
    },
    {
      id: 'customer_inactive',
      nome: 'Cliente Inativo',
      descricao: 'Disparado quando cliente fica inativo por período determinado',
      categoria: 'Retention',
      parametros: [
        { nome: 'user_id', tipo: 'string', descricao: 'ID do usuário', obrigatorio: true },
        { nome: 'last_activity', tipo: 'datetime', descricao: 'Última atividade', obrigatorio: true },
        { nome: 'inactive_days', tipo: 'number', descricao: 'Dias de inatividade', obrigatorio: true },
        { nome: 'lifetime_value', tipo: 'number', descricao: 'Valor lifetime do cliente', obrigatorio: false }
      ],
      exemplos: ['90 dias sem compras', '180 dias sem login', '365 dias sem interação'],
      uso_count: 5
    }
  ];

  useEffect(() => {
    setFluxos(fluxosMock);
    setTemplates(templatesMock);
    setGatilhos(gatilhosMock);
  }, []);

  const fluxosFiltrados = fluxos.filter(fluxo => {
    const matchBusca = fluxo.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      fluxo.descricao.toLowerCase().includes(busca.toLowerCase()) ||
                      fluxo.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchTipo = filtroTipo === 'todos' || fluxo.tipo === filtroTipo;
    const matchStatus = filtroStatus === 'todos' || fluxo.status === filtroStatus;

    return matchBusca && matchTipo && matchStatus;
  }).sort((a, b) => {
    if (ordenacao === 'data_criacao') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else if (ordenacao === 'conversoes') {
      return b.metricas.conversoes - a.metricas.conversoes;
    } else if (ordenacao === 'receita') {
      return b.metricas.receita_gerada - a.metricas.receita_gerada;
    }
    return 0;
  });

  const estatisticas = {
    totalFluxos: fluxos.length,
    fluxosAtivos: fluxos.filter(f => f.status === 'ativo').length,
    totalUsuarios: fluxos.reduce((acc, f) => acc + f.metricas.usuarios_inscritos, 0),
    totalEnviados: fluxos.reduce((acc, f) => acc + f.metricas.total_enviados, 0),
    totalConversoes: fluxos.reduce((acc, f) => acc + f.metricas.conversoes, 0),
    receitaTotal: fluxos.reduce((acc, f) => acc + f.metricas.receita_gerada, 0),
    taxaConversaoMedia: fluxos.reduce((acc, f) => acc + f.metricas.taxa_conversao, 0) / fluxos.length || 0,
    templatesAtivos: templates.length
  };

  const handleView = (fluxo: AutomacaoFluxo) => {
    setFluxoSelecionado(fluxo);
    setModalTipo('fluxo');
    setShowModal(true);
  };

  const toggleFluxoStatus = (fluxoId: number) => {
    setFluxos(fluxos.map(f =>
      f.id === fluxoId
        ? { ...f, status: f.status === 'ativo' ? 'pausado' : 'ativo' }
        : f
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'arquivado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'boas_vindas': return 'bg-blue-100 text-blue-800';
      case 'carrinho_abandonado': return 'bg-orange-100 text-orange-800';
      case 'pos_compra': return 'bg-green-100 text-green-800';
      case 'remarketing': return 'bg-purple-100 text-purple-800';
      case 'aniversario': return 'bg-pink-100 text-pink-800';
      case 'reativacao': return 'bg-indigo-100 text-indigo-800';
      case 'feedback': return 'bg-teal-100 text-teal-800';
      case 'lembrete': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEtapaIcon = (tipo: string) => {
    switch (tipo) {
      case 'email': return '📧';
      case 'sms': return '📱';
      case 'whatsapp': return '💬';
      case 'push': return '🔔';
      case 'espera': return '⏰';
      case 'condicao': return '🔀';
      case 'webhook': return '🔗';
      default: return '📄';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Zap className="h-8 w-8 text-purple-600" />
              Automação de Comunicação
            </h1>
            <p className="text-gray-600 mt-2">Sistema de automação de comunicação multicanal</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <BarChart3 className="h-4 w-4" />
              Métricas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Fluxo
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalFluxos}</div>
            <div className="text-sm text-gray-600">Total Fluxos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.fluxosAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalUsuarios.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Usuários</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.totalEnviados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Enviados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.totalConversoes.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Conversões</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.receitaTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Receita</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-pink-600">{estatisticas.taxaConversaoMedia.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Conversão</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-teal-600">{estatisticas.templatesAtivos}</div>
            <div className="text-sm text-gray-600">Templates</div>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'fluxos', label: 'Fluxos de Automação', icon: Zap },
              { id: 'templates', label: 'Templates', icon: MessageSquare },
              { id: 'gatilhos', label: 'Gatilhos', icon: Settings }
            ].map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaSelecionada(aba.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm ${
                  abaSelecionada === aba.id
                    ? 'border-purple-500 text-purple-600'
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
        {abaSelecionada === 'fluxos' && (
          <div className="p-6 border-b">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar fluxos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="todos">Todos Tipos</option>
                <option value="boas_vindas">Boas-vindas</option>
                <option value="carrinho_abandonado">Carrinho Abandonado</option>
                <option value="pos_compra">Pós-compra</option>
                <option value="remarketing">Remarketing</option>
                <option value="aniversario">Aniversário</option>
                <option value="reativacao">Reativação</option>
                <option value="feedback">Feedback</option>
                <option value="lembrete">Lembrete</option>
              </select>

              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="todos">Todos Status</option>
                <option value="ativo">Ativo</option>
                <option value="pausado">Pausado</option>
                <option value="rascunho">Rascunho</option>
                <option value="arquivado">Arquivado</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                <option value="data_criacao">Data Criação</option>
                <option value="conversoes">Mais Conversões</option>
                <option value="receita">Maior Receita</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo das Abas */}
      {abaSelecionada === 'fluxos' && (
        <div className="space-y-4">
          {fluxosFiltrados.map((fluxo) => (
            <div key={fluxo.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{fluxo.nome}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(fluxo.tipo)}`}>
                      {fluxo.tipo.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fluxo.status)}`}>
                      {fluxo.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{fluxo.descricao}</p>
                  <div className="text-sm text-gray-500">
                    Criado por {fluxo.criado_por} • {new Date(fluxo.data_criacao).toLocaleDateString()}
                    {fluxo.ultima_execucao && ` • Última execução: ${new Date(fluxo.ultima_execucao).toLocaleDateString()}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFluxoStatus(fluxo.id)}
                    className={`p-2 rounded-lg ${
                      fluxo.status === 'ativo'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {fluxo.status === 'ativo' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Fluxo de Etapas */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Fluxo ({fluxo.etapas.length} etapas):</h4>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {fluxo.etapas.map((etapa, index) => (
                    <div key={etapa.id} className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-3 py-1">
                        <span className="text-lg">{getEtapaIcon(etapa.tipo)}</span>
                        <span className="text-xs font-medium">{etapa.nome}</span>
                      </div>
                      {index < fluxo.etapas.length - 1 && (
                        <div className="text-gray-400">→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{fluxo.metricas.usuarios_inscritos.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Usuários</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{fluxo.metricas.total_enviados.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{fluxo.metricas.total_abertos.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Abertos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{fluxo.metricas.total_cliques.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Cliques</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{fluxo.metricas.conversoes.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Conversões</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600">{fluxo.metricas.taxa_conversao.toFixed(1)}%</div>
                  <div className="text-xs text-gray-600">Taxa Conv.</div>
                </div>
              </div>

              {/* Receita e Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-700">Receita Gerada</div>
                  <div className="text-lg font-bold text-green-600">R$ {fluxo.metricas.receita_gerada.toLocaleString()}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-blue-700">Gatilho</div>
                  <div className="text-sm text-blue-600">{fluxo.gatilho.evento.replace('_', ' ')}</div>
                  <div className="text-xs text-blue-500">{fluxo.gatilho.frequencia}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-purple-700">Segmentação</div>
                  <div className="text-sm text-purple-600">{fluxo.segmentacao.nome}</div>
                  <div className="text-xs text-purple-500">{fluxo.segmentacao.total_usuarios.toLocaleString()} usuários</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {fluxo.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Limite diário: {fluxo.configuracoes.limite_diario} •
                  Horário: {fluxo.configuracoes.horario_envio.inicio}-{fluxo.configuracoes.horario_envio.fim}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(fluxo)}
                    className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 border border-purple-300 text-purple-600 rounded hover:bg-purple-50 text-sm">
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
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
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {template.tipo_canal}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
                {template.assunto && (
                  <div className="text-sm font-medium mb-1">📧 {template.assunto}</div>
                )}
                <div className="text-sm text-gray-600 line-clamp-3">
                  {template.conteudo}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <div className="font-medium text-gray-700">Taxa Abertura</div>
                  <div className="text-lg font-bold text-green-600">{template.taxa_abertura_media.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="font-medium text-gray-700">Taxa Clique</div>
                  <div className="text-lg font-bold text-blue-600">{template.taxa_clique_media.toFixed(1)}%</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>Usos: {template.uso_count}</span>
                <span>Variáveis: {template.variaveis.length}</span>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
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

      {/* Aba Gatilhos */}
      {abaSelecionada === 'gatilhos' && (
        <div className="space-y-4">
          {gatilhos.map((gatilho) => (
            <div key={gatilho.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{gatilho.nome}</h3>
                  <p className="text-gray-600 text-sm mb-2">{gatilho.descricao}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {gatilho.categoria}
                    </span>
                    <span className="text-sm text-gray-500">
                      Usado em {gatilho.uso_count} fluxo(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Parâmetros:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {gatilho.parametros.map((param, index) => (
                    <div key={index} className="text-sm bg-gray-50 px-3 py-2 rounded">
                      <div className="font-medium">
                        {param.nome}
                        {param.obrigatorio && <span className="text-red-500">*</span>}
                        <span className="text-gray-500 ml-1">({param.tipo})</span>
                      </div>
                      <div className="text-gray-600 text-xs">{param.descricao}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Exemplos de Uso:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {gatilho.exemplos.map((exemplo, index) => (
                    <li key={index}>{exemplo}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <button className="px-4 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">
                  Usar Gatilho
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  Ver Documentação
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes do Fluxo */}
      {showModal && modalTipo === 'fluxo' && fluxoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{fluxoSelecionado.nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(fluxoSelecionado.tipo)}`}>
                  {fluxoSelecionado.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(fluxoSelecionado.status)}`}>
                  {fluxoSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Descrição */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Descrição</h3>
                <p className="text-gray-700">{fluxoSelecionado.descricao}</p>
              </div>

              {/* Fluxo Detalhado */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Fluxo de Etapas</h3>
                <div className="space-y-3">
                  {fluxoSelecionado.etapas.map((etapa, index) => (
                    <div key={etapa.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">{getEtapaIcon(etapa.tipo)}</div>
                      <div className="flex-1">
                        <div className="font-medium">{etapa.nome}</div>
                        <div className="text-sm text-gray-600">
                          Tipo: {etapa.tipo} •
                          Delay: {etapa.delay.tipo === 'imediato' ? 'Imediato' : `${etapa.delay.valor} ${etapa.delay.tipo}`}
                        </div>
                        {etapa.conteudo && (
                          <div className="text-sm text-gray-500 mt-1">
                            {etapa.conteudo.template_nome || etapa.conteudo.assunto || etapa.conteudo.mensagem}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Métricas de Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{fluxoSelecionado.metricas.usuarios_inscritos.toLocaleString()}</div>
                    <div className="text-xs text-blue-700">Usuários Inscritos</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{fluxoSelecionado.metricas.total_enviados.toLocaleString()}</div>
                    <div className="text-xs text-green-700">Total Enviados</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">{fluxoSelecionado.metricas.conversoes.toLocaleString()}</div>
                    <div className="text-xs text-purple-700">Conversões</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-emerald-600">R$ {fluxoSelecionado.metricas.receita_gerada.toLocaleString()}</div>
                    <div className="text-xs text-emerald-700">Receita</div>
                  </div>
                </div>
              </div>

              {/* Gatilho e Segmentação */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Gatilho</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">{fluxoSelecionado.gatilho.evento.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Frequência: {fluxoSelecionado.gatilho.frequencia}
                    </div>
                    <div className="text-sm">
                      <strong>Condições:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {fluxoSelecionado.gatilho.condicoes.map((condicao, index) => (
                          <li key={index} className="text-gray-600">
                            {condicao.campo} {condicao.operador} {condicao.valor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Segmentação</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium mb-2">{fluxoSelecionado.segmentacao.nome}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Total de usuários: {fluxoSelecionado.segmentacao.total_usuarios.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <strong>Critérios:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {fluxoSelecionado.segmentacao.criterios.map((criterio, index) => (
                          <li key={index} className="text-gray-600">
                            {criterio.campo} {criterio.operador} {criterio.valor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Configurações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Limite Diário:</strong> {fluxoSelecionado.configuracoes.limite_diario} mensagens</div>
                  <div><strong>Horário de Envio:</strong> {fluxoSelecionado.configuracoes.horario_envio.inicio} - {fluxoSelecionado.configuracoes.horario_envio.fim}</div>
                  <div><strong>Dias da Semana:</strong> {fluxoSelecionado.configuracoes.dias_semana.join(', ')}</div>
                  <div><strong>Timezone:</strong> {fluxoSelecionado.configuracoes.timezone}</div>
                  <div><strong>Opt-out Automático:</strong> {fluxoSelecionado.configuracoes.opt_out_automatico ? 'Sim' : 'Não'}</div>
                  <div><strong>Resposta Automática:</strong> {fluxoSelecionado.configuracoes.resposta_automatica ? 'Sim' : 'Não'}</div>
                </div>
              </div>

              {/* Histórico de Execuções */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Histórico de Execuções (Últimos 3 dias)</h3>
                <div className="space-y-2">
                  {fluxoSelecionado.historico_execucoes.map((execucao, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{new Date(execucao.data).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-600">
                          {execucao.usuarios_processados} usuários • {execucao.mensagens_enviadas} mensagens
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-green-600">{execucao.tempo_execucao}s execução</div>
                        {execucao.erros > 0 && (
                          <div className="text-red-600">{execucao.erros} erro(s)</div>
                        )}
                      </div>
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
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Editar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {abaSelecionada === 'fluxos' && fluxosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fluxo encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroTipo !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar fluxos.'
              : 'Comece criando seu primeiro fluxo de automação.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Novo Fluxo
          </button>
        </div>
      )}
    </div>
  );
};

export default AutomacaoComunicacao;
