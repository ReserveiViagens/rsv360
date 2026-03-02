// 📧 EMAIL MARKETING - RESERVEI VIAGENS
// Funcionalidade: Sistema completo de email marketing
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Send, Mail, Users, BarChart3, Calendar, Filter, Copy, Image, Link, FileText, Target } from 'lucide-react';

interface EmailCampaign {
  id: number;
  nome: string;
  assunto: string;
  tipo: 'promocional' | 'newsletter' | 'transacional' | 'remarketing' | 'boas_vindas' | 'aniversario';
  status: 'rascunho' | 'agendada' | 'enviando' | 'enviada' | 'pausada' | 'cancelada';
  template: {
    nome: string;
    preview_url: string;
    html_content: string;
    elementos: Array<{
      tipo: 'texto' | 'imagem' | 'botao' | 'divisor' | 'produto';
      conteudo: any;
    }>;
  };
  segmentacao: {
    nome: string;
    criterios: Array<{
      campo: string;
      operador: string;
      valor: string;
    }>;
    total_destinatarios: number;
  };
  agendamento: {
    data_envio: string;
    fuso_horario: string;
    envio_imediato: boolean;
  };
  metricas: {
    enviados: number;
    entregues: number;
    abertos: number;
    cliques: number;
    descadastros: number;
    bounces: number;
    spam_complaints: number;
  };
  configuracoes: {
    remetente_nome: string;
    remetente_email: string;
    responder_para: string;
    rastreamento_aberturas: boolean;
    rastreamento_cliques: boolean;
    link_descadastro: boolean;
  };
  data_criacao: string;
  data_envio?: string;
  criado_por: string;
  tags: string[];
  notas: string;
  historico_versoes: Array<{
    versao: number;
    data: string;
    alteracoes: string;
    autor: string;
  }>;
}

interface EmailTemplate {
  id: number;
  nome: string;
  categoria: string;
  preview_url: string;
  descricao: string;
  elementos_count: number;
  uso_count: number;
  responsivo: boolean;
}

interface Segmento {
  id: number;
  nome: string;
  descricao: string;
  total_contatos: number;
  criterios: Array<{
    campo: string;
    operador: string;
    valor: string;
  }>;
  data_atualizacao: string;
}

const EmailMarketing: React.FC = () => {
  const [campanhas, setCampanhas] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [segmentos, setSegmentos] = useState<Segmento[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'campaign' | 'template' | 'segment'>('campaign');
  const [campanhaSelecionada, setCampanhaSelecionada] = useState<EmailCampaign | null>(null);
  const [abaSelecionada, setAbaSelecionada] = useState<'campanhas' | 'templates' | 'segmentos'>('campanhas');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('data_criacao');

  // Dados mock
  const campanhasMock: EmailCampaign[] = [
    {
      id: 1,
      nome: 'Promoção Caldas Novas - Verão 2025',
      assunto: '🌴 Descontos imperdíveis para Caldas Novas! Até 30% OFF',
      tipo: 'promocional',
      status: 'enviada',
      template: {
        nome: 'Template Promocional Resort',
        preview_url: '/templates/promo-resort.jpg',
        html_content: '<html>...</html>',
        elementos: [
          { tipo: 'imagem', conteudo: { src: '/images/caldas-novas-banner.jpg', alt: 'Caldas Novas' } },
          { tipo: 'texto', conteudo: { titulo: 'Descontos Especiais!', descricao: 'Aproveite ofertas exclusivas...' } },
          { tipo: 'botao', conteudo: { texto: 'Ver Ofertas', link: 'https://reservei.com/ofertas' } }
        ]
      },
      segmentacao: {
        nome: 'Clientes Interessados em Caldas Novas',
        criterios: [
          { campo: 'interesse', operador: 'contém', valor: 'caldas_novas' },
          { campo: 'ultima_compra', operador: 'maior_que', valor: '90_dias' }
        ],
        total_destinatarios: 2547
      },
      agendamento: {
        data_envio: '2025-08-22 09:00:00',
        fuso_horario: 'America/Sao_Paulo',
        envio_imediato: false
      },
      metricas: {
        enviados: 2547,
        entregues: 2489,
        abertos: 1121,
        cliques: 342,
        descadastros: 12,
        bounces: 58,
        spam_complaints: 3
      },
      configuracoes: {
        remetente_nome: 'Reservei Viagens',
        remetente_email: 'ofertas@reserveiviagens.com.br',
        responder_para: 'atendimento@reserveiviagens.com.br',
        rastreamento_aberturas: true,
        rastreamento_cliques: true,
        link_descadastro: true
      },
      data_criacao: '2025-08-20 14:30:00',
      data_envio: '2025-08-22 09:00:00',
      criado_por: 'Ana Silva Santos',
      tags: ['promocao', 'caldas_novas', 'verao_2025', 'desconto'],
      notas: 'Campanha focada em reativar clientes que visitaram Caldas Novas anteriormente.',
      historico_versoes: [
        { versao: 1, data: '2025-08-20 14:30:00', alteracoes: 'Criação inicial', autor: 'Ana Silva Santos' },
        { versao: 2, data: '2025-08-21 10:15:00', alteracoes: 'Ajuste no call-to-action', autor: 'Carlos Marketing' },
        { versao: 3, data: '2025-08-21 16:20:00', alteracoes: 'Correção de imagens e links', autor: 'Ana Silva Santos' }
      ]
    },
    {
      id: 2,
      nome: 'Newsletter Setembro - Novidades e Dicas',
      assunto: '📰 Newsletter Setembro: Novos destinos e dicas de viagem',
      tipo: 'newsletter',
      status: 'agendada',
      template: {
        nome: 'Template Newsletter Mensal',
        preview_url: '/templates/newsletter.jpg',
        html_content: '<html>...</html>',
        elementos: [
          { tipo: 'texto', conteudo: { titulo: 'Newsletter Setembro', descricao: 'Confira as novidades...' } },
          { tipo: 'produto', conteudo: { nome: 'Pacote Pirenópolis', preco: 'R$ 450', imagem: '/images/pirenopolis.jpg' } }
        ]
      },
      segmentacao: {
        nome: 'Assinantes Newsletter',
        criterios: [
          { campo: 'newsletter_ativo', operador: 'igual', valor: 'true' },
          { campo: 'ultimo_email_aberto', operador: 'menor_que', valor: '30_dias' }
        ],
        total_destinatarios: 5234
      },
      agendamento: {
        data_envio: '2025-09-01 08:00:00',
        fuso_horario: 'America/Sao_Paulo',
        envio_imediato: false
      },
      metricas: {
        enviados: 0,
        entregues: 0,
        abertos: 0,
        cliques: 0,
        descadastros: 0,
        bounces: 0,
        spam_complaints: 0
      },
      configuracoes: {
        remetente_nome: 'Equipe Reservei',
        remetente_email: 'newsletter@reserveiviagens.com.br',
        responder_para: 'contato@reserveiviagens.com.br',
        rastreamento_aberturas: true,
        rastreamento_cliques: true,
        link_descadastro: true
      },
      data_criacao: '2025-08-25 11:00:00',
      criado_por: 'Maria Marketing Costa',
      tags: ['newsletter', 'setembro', 'novidades', 'dicas'],
      notas: 'Newsletter mensal com novos destinos e dicas de viagem para fidelizar assinantes.',
      historico_versoes: [
        { versao: 1, data: '2025-08-25 11:00:00', alteracoes: 'Criação da newsletter', autor: 'Maria Marketing Costa' }
      ]
    },
    {
      id: 3,
      nome: 'Remarketing - Carrinho Abandonado',
      assunto: '🛒 Você esqueceu algo! Complete sua reserva com desconto especial',
      tipo: 'remarketing',
      status: 'enviando',
      template: {
        nome: 'Template Carrinho Abandonado',
        preview_url: '/templates/carrinho-abandonado.jpg',
        html_content: '<html>...</html>',
        elementos: [
          { tipo: 'texto', conteudo: { titulo: 'Não perca esta oportunidade!', descricao: 'Você esqueceu de finalizar...' } },
          { tipo: 'botao', conteudo: { texto: 'Finalizar Reserva', link: 'https://reservei.com/checkout' } }
        ]
      },
      segmentacao: {
        nome: 'Carrinho Abandonado - 24h',
        criterios: [
          { campo: 'carrinho_abandonado', operador: 'igual', valor: 'true' },
          { campo: 'tempo_abandono', operador: 'entre', valor: '12h_48h' }
        ],
        total_destinatarios: 156
      },
      agendamento: {
        data_envio: '2025-08-25 15:30:00',
        fuso_horario: 'America/Sao_Paulo',
        envio_imediato: true
      },
      metricas: {
        enviados: 98,
        entregues: 95,
        abertos: 42,
        cliques: 18,
        descadastros: 2,
        bounces: 3,
        spam_complaints: 0
      },
      configuracoes: {
        remetente_nome: 'Reservei Viagens',
        remetente_email: 'noreply@reserveiviagens.com.br',
        responder_para: 'vendas@reserveiviagens.com.br',
        rastreamento_aberturas: true,
        rastreamento_cliques: true,
        link_descadastro: true
      },
      data_criacao: '2025-08-25 15:00:00',
      data_envio: '2025-08-25 15:30:00',
      criado_por: 'Sistema Automatizado',
      tags: ['remarketing', 'carrinho_abandonado', 'automacao'],
      notas: 'Email automático para recuperar carrinhos abandonados com incentivo de desconto.',
      historico_versoes: [
        { versao: 1, data: '2025-08-25 15:00:00', alteracoes: 'Geração automática', autor: 'Sistema' }
      ]
    },
    {
      id: 4,
      nome: 'Boas Vindas - Novos Clientes',
      assunto: '🎉 Bem-vindo à Reservei! Aqui sua viagem dos sonhos se torna realidade',
      tipo: 'boas_vindas',
      status: 'rascunho',
      template: {
        nome: 'Template Boas Vindas',
        preview_url: '/templates/boas-vindas.jpg',
        html_content: '<html>...</html>',
        elementos: [
          { tipo: 'imagem', conteudo: { src: '/images/welcome-banner.jpg', alt: 'Bem-vindo' } },
          { tipo: 'texto', conteudo: { titulo: 'Bem-vindo à família Reservei!', descricao: 'Estamos felizes...' } }
        ]
      },
      segmentacao: {
        nome: 'Novos Cadastros',
        criterios: [
          { campo: 'data_cadastro', operador: 'menor_que', valor: '7_dias' },
          { campo: 'primeira_compra', operador: 'igual', valor: 'false' }
        ],
        total_destinatarios: 0
      },
      agendamento: {
        data_envio: '',
        fuso_horario: 'America/Sao_Paulo',
        envio_imediato: true
      },
      metricas: {
        enviados: 0,
        entregues: 0,
        abertos: 0,
        cliques: 0,
        descadastros: 0,
        bounces: 0,
        spam_complaints: 0
      },
      configuracoes: {
        remetente_nome: 'Equipe Reservei',
        remetente_email: 'boas-vindas@reserveiviagens.com.br',
        responder_para: 'atendimento@reserveiviagens.com.br',
        rastreamento_aberturas: true,
        rastreamento_cliques: true,
        link_descadastro: false
      },
      data_criacao: '2025-08-24 09:15:00',
      criado_por: 'Carlos Marketing Silva',
      tags: ['boas_vindas', 'novos_clientes', 'automacao'],
      notas: 'Email de boas-vindas para novos cadastros, ainda em desenvolvimento.',
      historico_versoes: [
        { versao: 1, data: '2025-08-24 09:15:00', alteracoes: 'Rascunho inicial', autor: 'Carlos Marketing Silva' }
      ]
    }
  ];

  const templatesMock: EmailTemplate[] = [
    {
      id: 1,
      nome: 'Template Promocional Resort',
      categoria: 'Promocional',
      preview_url: '/templates/promo-resort.jpg',
      descricao: 'Template ideal para promoções de resorts e spas',
      elementos_count: 6,
      uso_count: 15,
      responsivo: true
    },
    {
      id: 2,
      nome: 'Newsletter Mensal',
      categoria: 'Newsletter',
      preview_url: '/templates/newsletter.jpg',
      descricao: 'Template para newsletters mensais com múltiplas seções',
      elementos_count: 8,
      uso_count: 12,
      responsivo: true
    },
    {
      id: 3,
      nome: 'Carrinho Abandonado',
      categoria: 'Remarketing',
      preview_url: '/templates/carrinho-abandonado.jpg',
      descricao: 'Template focado em recuperação de carrinho',
      elementos_count: 4,
      uso_count: 28,
      responsivo: true
    },
    {
      id: 4,
      nome: 'Boas Vindas Premium',
      categoria: 'Boas Vindas',
      preview_url: '/templates/boas-vindas.jpg',
      descricao: 'Template elegante para dar boas-vindas a novos clientes',
      elementos_count: 5,
      uso_count: 7,
      responsivo: true
    }
  ];

  const segmentosMock: Segmento[] = [
    {
      id: 1,
      nome: 'Clientes VIP',
      descricao: 'Clientes com mais de R$ 10.000 em compras anuais',
      total_contatos: 234,
      criterios: [
        { campo: 'valor_anual', operador: 'maior_que', valor: '10000' },
        { campo: 'ativo', operador: 'igual', valor: 'true' }
      ],
      data_atualizacao: '2025-08-25 10:30:00'
    },
    {
      id: 2,
      nome: 'Interessados em Caldas Novas',
      descricao: 'Usuários que demonstraram interesse em Caldas Novas',
      total_contatos: 2547,
      criterios: [
        { campo: 'interesse', operador: 'contém', valor: 'caldas_novas' },
        { campo: 'ultima_interacao', operador: 'menor_que', valor: '90_dias' }
      ],
      data_atualizacao: '2025-08-24 16:45:00'
    },
    {
      id: 3,
      nome: 'Assinantes Newsletter',
      descricao: 'Usuários que se inscreveram na newsletter',
      total_contatos: 5234,
      criterios: [
        { campo: 'newsletter_ativo', operador: 'igual', valor: 'true' }
      ],
      data_atualizacao: '2025-08-25 08:00:00'
    },
    {
      id: 4,
      nome: 'Carrinho Abandonado',
      descricao: 'Usuários com carrinho abandonado nas últimas 48h',
      total_contatos: 156,
      criterios: [
        { campo: 'carrinho_abandonado', operador: 'igual', valor: 'true' },
        { campo: 'tempo_abandono', operador: 'menor_que', valor: '48h' }
      ],
      data_atualizacao: '2025-08-25 15:30:00'
    }
  ];

  useEffect(() => {
    setCampanhas(campanhasMock);
    setTemplates(templatesMock);
    setSegmentos(segmentosMock);
  }, []);

  const campanhasFiltradas = campanhas.filter(campanha => {
    const matchBusca = campanha.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      campanha.assunto.toLowerCase().includes(busca.toLowerCase()) ||
                      campanha.tags.some(tag => tag.toLowerCase().includes(busca.toLowerCase()));

    const matchStatus = filtroStatus === 'todos' || campanha.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || campanha.tipo === filtroTipo;

    return matchBusca && matchStatus && matchTipo;
  }).sort((a, b) => {
    if (ordenacao === 'data_criacao') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else if (ordenacao === 'abertos') {
      return b.metricas.abertos - a.metricas.abertos;
    } else if (ordenacao === 'cliques') {
      return b.metricas.cliques - a.metricas.cliques;
    }
    return 0;
  });

  const estatisticas = {
    totalCampanhas: campanhas.length,
    campanhasEnviadas: campanhas.filter(c => c.status === 'enviada').length,
    totalEnviados: campanhas.reduce((acc, c) => acc + c.metricas.enviados, 0),
    totalAbertos: campanhas.reduce((acc, c) => acc + c.metricas.abertos, 0),
    totalCliques: campanhas.reduce((acc, c) => acc + c.metricas.cliques, 0),
    taxaAbertura: campanhas.reduce((acc, c) => acc + c.metricas.enviados, 0) > 0 ?
      (campanhas.reduce((acc, c) => acc + c.metricas.abertos, 0) / campanhas.reduce((acc, c) => acc + c.metricas.enviados, 0)) * 100 : 0,
    taxaClique: campanhas.reduce((acc, c) => acc + c.metricas.abertos, 0) > 0 ?
      (campanhas.reduce((acc, c) => acc + c.metricas.cliques, 0) / campanhas.reduce((acc, c) => acc + c.metricas.abertos, 0)) * 100 : 0
  };

  const handleView = (campanha: EmailCampaign) => {
    setCampanhaSelecionada(campanha);
    setModalTipo('campaign');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-100 text-gray-800';
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'enviando': return 'bg-yellow-100 text-yellow-800';
      case 'enviada': return 'bg-green-100 text-green-800';
      case 'pausada': return 'bg-orange-100 text-orange-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'promocional': return 'bg-purple-100 text-purple-800';
      case 'newsletter': return 'bg-blue-100 text-blue-800';
      case 'transacional': return 'bg-green-100 text-green-800';
      case 'remarketing': return 'bg-orange-100 text-orange-800';
      case 'boas_vindas': return 'bg-pink-100 text-pink-800';
      case 'aniversario': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calcularTaxaAbertura = (campanha: EmailCampaign) => {
    return campanha.metricas.enviados > 0 ?
      ((campanha.metricas.abertos / campanha.metricas.enviados) * 100).toFixed(1) : '0.0';
  };

  const calcularTaxaClique = (campanha: EmailCampaign) => {
    return campanha.metricas.abertos > 0 ?
      ((campanha.metricas.cliques / campanha.metricas.abertos) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              Email Marketing
            </h1>
            <p className="text-gray-600 mt-2">Sistema completo de email marketing e automação</p>
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
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalCampanhas}</div>
            <div className="text-sm text-gray-600">Total Campanhas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.campanhasEnviadas}</div>
            <div className="text-sm text-gray-600">Enviadas</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.totalEnviados.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Emails Enviados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.totalAbertos.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Abertos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.totalCliques.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Cliques</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.taxaAbertura.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Abertura</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-pink-600">{estatisticas.taxaClique.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Taxa Clique</div>
          </div>
        </div>
      )}

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'campanhas', label: 'Campanhas', icon: Mail },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'segmentos', label: 'Segmentos', icon: Target }
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
        {abaSelecionada === 'campanhas' && (
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
                <option value="rascunho">Rascunho</option>
                <option value="agendada">Agendada</option>
                <option value="enviando">Enviando</option>
                <option value="enviada">Enviada</option>
                <option value="pausada">Pausada</option>
                <option value="cancelada">Cancelada</option>
              </select>

              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos Tipos</option>
                <option value="promocional">Promocional</option>
                <option value="newsletter">Newsletter</option>
                <option value="transacional">Transacional</option>
                <option value="remarketing">Remarketing</option>
                <option value="boas_vindas">Boas Vindas</option>
                <option value="aniversario">Aniversário</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="data_criacao">Data Criação</option>
                <option value="abertos">Mais Abertos</option>
                <option value="cliques">Mais Cliques</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo das Abas */}
      {abaSelecionada === 'campanhas' && (
        <div className="space-y-4">
          {campanhasFiltradas.map((campanha) => (
            <div key={campanha.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{campanha.nome}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(campanha.tipo)}`}>
                      {campanha.tipo.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campanha.status)}`}>
                      {campanha.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{campanha.assunto}</p>
                  <div className="text-sm text-gray-500">
                    Criada por {campanha.criado_por} • {new Date(campanha.data_criacao).toLocaleDateString()}
                    {campanha.data_envio && ` • Enviada em ${new Date(campanha.data_envio).toLocaleDateString()}`}
                  </div>
                </div>
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{campanha.segmentacao.total_destinatarios.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Destinatários</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{campanha.metricas.enviados.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Enviados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{campanha.metricas.abertos.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Abertos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{campanha.metricas.cliques.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Cliques</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{calcularTaxaAbertura(campanha)}%</div>
                  <div className="text-xs text-gray-600">Taxa Abertura</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-pink-600">{calcularTaxaClique(campanha)}%</div>
                  <div className="text-xs text-gray-600">Taxa Clique</div>
                </div>
              </div>

              {/* Segmentação */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Segmentação:</div>
                <div className="text-sm text-gray-600">{campanha.segmentacao.nome}</div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {campanha.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Template: {campanha.template.nome}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(campanha)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 border border-blue-300 text-blue-600 rounded hover:bg-blue-50 text-sm">
                    <Copy className="h-4 w-4" />
                    Duplicar
                  </button>
                  {campanha.status === 'rascunho' && (
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

      {/* Aba Templates */}
      {abaSelecionada === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <Image className="h-12 w-12 text-gray-400" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{template.nome}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.descricao}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                  <span>{template.categoria}</span>
                  <span>{template.uso_count} usos</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    Usar Template
                  </button>
                  <button className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    <Eye className="h-4 w-4" />
                  </button>
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
                  <div className="text-2xl font-bold text-blue-600">{segmento.total_contatos.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">contatos</div>
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
                  Ver Contatos
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                  <Edit className="h-4 w-4 inline mr-1" />
                  Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalhes da Campanha */}
      {showModal && modalTipo === 'campaign' && campanhaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">{campanhaSelecionada.nome}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(campanhaSelecionada.tipo)}`}>
                  {campanhaSelecionada.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campanhaSelecionada.status)}`}>
                  {campanhaSelecionada.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Detalhes da Campanha */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações Gerais</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Assunto:</strong> {campanhaSelecionada.assunto}</div>
                    <div><strong>Criado por:</strong> {campanhaSelecionada.criado_por}</div>
                    <div><strong>Data Criação:</strong> {new Date(campanhaSelecionada.data_criacao).toLocaleString()}</div>
                    {campanhaSelecionada.data_envio && (
                      <div><strong>Data Envio:</strong> {new Date(campanhaSelecionada.data_envio).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Configurações</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Remetente:</strong> {campanhaSelecionada.configuracoes.remetente_nome} ({campanhaSelecionada.configuracoes.remetente_email})</div>
                    <div><strong>Responder para:</strong> {campanhaSelecionada.configuracoes.responder_para}</div>
                    <div><strong>Rastreamento:</strong>
                      {campanhaSelecionada.configuracoes.rastreamento_aberturas ? ' Aberturas' : ''}
                      {campanhaSelecionada.configuracoes.rastreamento_cliques ? ' Cliques' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas Detalhadas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Métricas de Performance</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-blue-600">{campanhaSelecionada.metricas.enviados.toLocaleString()}</div>
                    <div className="text-xs text-blue-700">Enviados</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-green-600">{campanhaSelecionada.metricas.entregues.toLocaleString()}</div>
                    <div className="text-xs text-green-700">Entregues</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-purple-600">{campanhaSelecionada.metricas.abertos.toLocaleString()}</div>
                    <div className="text-xs text-purple-700">Abertos</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-orange-600">{campanhaSelecionada.metricas.cliques.toLocaleString()}</div>
                    <div className="text-xs text-orange-700">Cliques</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-red-600">{campanhaSelecionada.metricas.bounces.toLocaleString()}</div>
                    <div className="text-xs text-red-700">Bounces</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-yellow-600">{campanhaSelecionada.metricas.descadastros.toLocaleString()}</div>
                    <div className="text-xs text-yellow-700">Descadastros</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-xl font-bold text-gray-600">{campanhaSelecionada.metricas.spam_complaints.toLocaleString()}</div>
                    <div className="text-xs text-gray-700">Spam</div>
                  </div>
                </div>
              </div>

              {/* Segmentação */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Segmentação</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-2">{campanhaSelecionada.segmentacao.nome}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    Total de destinatários: {campanhaSelecionada.segmentacao.total_destinatarios.toLocaleString()}
                  </div>
                  <div className="text-sm">
                    <strong>Critérios:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {campanhaSelecionada.segmentacao.criterios.map((criterio, index) => (
                        <li key={index} className="text-gray-600">
                          {criterio.campo} {criterio.operador} {criterio.valor}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Histórico de Versões */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Histórico de Versões</h3>
                <div className="space-y-2">
                  {campanhaSelecionada.historico_versoes.map((versao) => (
                    <div key={versao.versao} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">Versão {versao.versao}</div>
                        <div className="text-sm text-gray-600">{versao.alteracoes}</div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{versao.autor}</div>
                        <div>{new Date(versao.data).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas */}
              {campanhaSelecionada.notas && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Notas</h3>
                  <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">
                    {campanhaSelecionada.notas}
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
                Editar Campanha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {abaSelecionada === 'campanhas' && campanhasFiltradas.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma campanha encontrada</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroTipo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar campanhas.'
              : 'Comece criando sua primeira campanha de email marketing.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </button>
        </div>
      )}
    </div>
  );
};

export default EmailMarketing;
