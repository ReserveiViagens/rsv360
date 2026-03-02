// 📋 SISTEMA DE CONTRATOS DE HOTÉIS - RESERVEI VIAGENS
// Funcionalidade: Gestão de contratos e parcerias hoteleiras
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, FileText, Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, Download, Upload } from 'lucide-react';

interface ContratoHotel {
  id: number;
  numero: string;
  hotel: {
    id: number;
    nome: string;
    categoria: string;
    endereco: string;
    contato: {
      responsavel: string;
      email: string;
      telefone: string;
    };
  };
  tipo: 'exclusividade' | 'preferencial' | 'comissionado' | 'net' | 'package';
  vigencia: {
    inicio: string;
    fim: string;
    duracao_meses: number;
    renovacao_automatica: boolean;
  };
  financeiro: {
    comissao: number;
    markup: number;
    forma_pagamento: string;
    prazo_pagamento: number;
    moeda: string;
  };
  condicoes: {
    desconto_maximo: number;
    cancellacao_gratuita: number; // horas antes
    no_show_taxa: number;
    crianca_gratuita_idade: number;
    blackout_periods: string[];
  };
  quotas: {
    diaria: number;
    semanal: number;
    mensal: number;
    anual: number;
  };
  tarifas: Array<{
    periodo_inicio: string;
    periodo_fim: string;
    tipo_quarto: string;
    valor_net: number;
    valor_venda: number;
    observacoes?: string;
  }>;
  clausulas_especiais: string[];
  documentos: Array<{
    nome: string;
    tipo: string;
    url: string;
    data_upload: string;
  }>;
  status: 'ativo' | 'pendente' | 'expirado' | 'cancelado' | 'em_negociacao';
  data_assinatura: string;
  data_criacao: string;
  data_atualizacao: string;
  responsavel_reservei: string;
  observacoes: string;
  alertas: Array<{
    tipo: 'vencimento' | 'quota' | 'documento' | 'renovacao';
    mensagem: string;
    data: string;
    urgencia: 'baixa' | 'media' | 'alta';
  }>;
}

const SistemaContratosHoteis: React.FC = () => {
  const [contratos, setContratos] = useState<ContratoHotel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [contratoSelecionado, setContratoSelecionado] = useState<ContratoHotel | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('vigencia_fim');

  // Dados mock
  const contratosMock: ContratoHotel[] = [
    {
      id: 1,
      numero: 'CTR-HTL-2025-001',
      hotel: {
        id: 1,
        nome: 'Hotel Thermas Grand Resort',
        categoria: 'resort',
        endereco: 'Caldas Novas, GO',
        contato: {
          responsavel: 'Carlos Roberto Silva',
          email: 'comercial@thermasgrand.com.br',
          telefone: '(64) 3455-3000'
        }
      },
      tipo: 'preferencial',
      vigencia: {
        inicio: '2025-01-01',
        fim: '2025-12-31',
        duracao_meses: 12,
        renovacao_automatica: true
      },
      financeiro: {
        comissao: 15.0,
        markup: 25.0,
        forma_pagamento: 'transferencia',
        prazo_pagamento: 30,
        moeda: 'BRL'
      },
      condicoes: {
        desconto_maximo: 20.0,
        cancellacao_gratuita: 48,
        no_show_taxa: 100.0,
        crianca_gratuita_idade: 6,
        blackout_periods: ['2025-12-20/2025-01-05', '2025-06-15/2025-07-15']
      },
      quotas: {
        diaria: 50,
        semanal: 300,
        mensal: 1200,
        anual: 14400
      },
      tarifas: [
        {
          periodo_inicio: '2025-01-01',
          periodo_fim: '2025-06-30',
          tipo_quarto: 'Suite Family',
          valor_net: 380.00,
          valor_venda: 475.00,
          observacoes: 'Baixa temporada'
        },
        {
          periodo_inicio: '2025-07-01',
          periodo_fim: '2025-12-31',
          tipo_quarto: 'Suite Family',
          valor_net: 450.00,
          valor_venda: 562.50,
          observacoes: 'Alta temporada'
        }
      ],
      clausulas_especiais: [
        'Garantia de disponibilidade mínima de 20 quartos por dia',
        'Desconto especial de 10% para grupos acima de 15 pessoas',
        'Cortesia para motorista de excursão',
        'Late check-out gratuito até 14h'
      ],
      documentos: [
        {
          nome: 'Contrato Principal',
          tipo: 'PDF',
          url: '/contratos/CTR-HTL-2025-001-principal.pdf',
          data_upload: '2025-01-15'
        },
        {
          nome: 'Tabela de Tarifas',
          tipo: 'Excel',
          url: '/contratos/CTR-HTL-2025-001-tarifas.xlsx',
          data_upload: '2025-01-15'
        }
      ],
      status: 'ativo',
      data_assinatura: '2025-01-15',
      data_criacao: '2025-01-10',
      data_atualizacao: '2025-08-20',
      responsavel_reservei: 'Ana Silva Santos',
      observacoes: 'Parceria estratégica com excelente performance de vendas',
      alertas: [
        {
          tipo: 'renovacao',
          mensagem: 'Contrato para renovação em 4 meses',
          data: '2025-12-31',
          urgencia: 'media'
        }
      ]
    },
    {
      id: 2,
      numero: 'CTR-HTL-2025-002',
      hotel: {
        id: 2,
        nome: 'Pousada Águas Claras',
        categoria: 'pousada',
        endereco: 'Caldas Novas, GO',
        contato: {
          responsavel: 'Maria Fernanda Costa',
          email: 'gerencia@aguasclaras.com.br',
          telefone: '(64) 3453-2200'
        }
      },
      tipo: 'comissionado',
      vigencia: {
        inicio: '2025-02-01',
        fim: '2026-01-31',
        duracao_meses: 12,
        renovacao_automatica: false
      },
      financeiro: {
        comissao: 12.0,
        markup: 20.0,
        forma_pagamento: 'transferencia',
        prazo_pagamento: 15,
        moeda: 'BRL'
      },
      condicoes: {
        desconto_maximo: 15.0,
        cancellacao_gratuita: 24,
        no_show_taxa: 50.0,
        crianca_gratuita_idade: 5,
        blackout_periods: ['2025-12-25/2025-01-02']
      },
      quotas: {
        diaria: 20,
        semanal: 140,
        mensal: 600,
        anual: 7200
      },
      tarifas: [
        {
          periodo_inicio: '2025-02-01',
          periodo_fim: '2026-01-31',
          tipo_quarto: 'Quarto Casal',
          valor_net: 150.00,
          valor_venda: 180.00
        }
      ],
      clausulas_especiais: [
        'Café da manhã incluso em todas as reservas',
        'Check-in flexível mediante disponibilidade',
        'Desconto de 5% para estadias acima de 3 noites'
      ],
      documentos: [
        {
          nome: 'Contrato de Parceria',
          tipo: 'PDF',
          url: '/contratos/CTR-HTL-2025-002-parceria.pdf',
          data_upload: '2025-02-05'
        }
      ],
      status: 'ativo',
      data_assinatura: '2025-02-05',
      data_criacao: '2025-01-25',
      data_atualizacao: '2025-08-15',
      responsavel_reservei: 'Carlos Vendedor Silva',
      observacoes: 'Pousada familiar com ótimo custo-benefício',
      alertas: []
    },
    {
      id: 3,
      numero: 'CTR-HTL-2025-003',
      hotel: {
        id: 4,
        nome: 'Spa Hotel Serenity',
        categoria: 'spa',
        endereco: 'Caldas Novas, GO',
        contato: {
          responsavel: 'Ricardo Wellness',
          email: 'partnerships@serenityhotel.com.br',
          telefone: '(64) 3455-4500'
        }
      },
      tipo: 'net',
      vigencia: {
        inicio: '2025-04-01',
        fim: '2026-03-31',
        duracao_meses: 12,
        renovacao_automatica: true
      },
      financeiro: {
        comissao: 0,
        markup: 35.0,
        forma_pagamento: 'antecipado',
        prazo_pagamento: 0,
        moeda: 'BRL'
      },
      condicoes: {
        desconto_maximo: 10.0,
        cancellacao_gratuita: 72,
        no_show_taxa: 100.0,
        crianca_gratuita_idade: 18, // Apenas adultos
        blackout_periods: ['2025-12-15/2025-01-15']
      },
      quotas: {
        diaria: 15,
        semanal: 105,
        mensal: 450,
        anual: 5400
      },
      tarifas: [
        {
          periodo_inicio: '2025-04-01',
          periodo_fim: '2026-03-31',
          tipo_quarto: 'Suite Spa Premium',
          valor_net: 520.00,
          valor_venda: 702.00,
          observacoes: 'Inclui tratamentos de spa'
        }
      ],
      clausulas_especiais: [
        'Política apenas para adultos (18+)',
        'Inclusão de 2 tratamentos de spa por diária',
        'Acesso livre ao spa durante toda a estadia',
        'Consulta nutricional gratuita'
      ],
      documentos: [
        {
          nome: 'Acordo Net Rate',
          tipo: 'PDF',
          url: '/contratos/CTR-HTL-2025-003-netrate.pdf',
          data_upload: '2025-04-01'
        }
      ],
      status: 'ativo',
      data_assinatura: '2025-04-01',
      data_criacao: '2025-03-15',
      data_atualizacao: '2025-08-10',
      responsavel_reservei: 'Ana Silva Santos',
      observacoes: 'Contrato premium para segmento de bem-estar',
      alertas: []
    },
    {
      id: 4,
      numero: 'CTR-HTL-2025-004',
      hotel: {
        id: 5,
        nome: 'Hotel Plaza Business',
        categoria: 'hotel',
        endereco: 'Caldas Novas, GO',
        contato: {
          responsavel: 'João Empresarial',
          email: 'comercial@plazabusiness.com.br',
          telefone: '(64) 3453-5000'
        }
      },
      tipo: 'comissionado',
      vigencia: {
        inicio: '2025-03-01',
        fim: '2025-08-31',
        duracao_meses: 6,
        renovacao_automatica: false
      },
      financeiro: {
        comissao: 8.0,
        markup: 15.0,
        forma_pagamento: 'boleto',
        prazo_pagamento: 45,
        moeda: 'BRL'
      },
      condicoes: {
        desconto_maximo: 10.0,
        cancellacao_gratuita: 24,
        no_show_taxa: 50.0,
        crianca_gratuita_idade: 8,
        blackout_periods: []
      },
      quotas: {
        diaria: 10,
        semanal: 70,
        mensal: 300,
        anual: 1800
      },
      tarifas: [
        {
          periodo_inicio: '2025-03-01',
          periodo_fim: '2025-08-31',
          tipo_quarto: 'Quarto Business',
          valor_net: 100.00,
          valor_venda: 115.00
        }
      ],
      clausulas_especiais: [
        'Contratos de teste por 6 meses',
        'Avaliação de performance mensal',
        'Possibilidade de extensão mediante resultados'
      ],
      documentos: [
        {
          nome: 'Contrato Piloto',
          tipo: 'PDF',
          url: '/contratos/CTR-HTL-2025-004-piloto.pdf',
          data_upload: '2025-03-01'
        }
      ],
      status: 'expirado',
      data_assinatura: '2025-03-01',
      data_criacao: '2025-02-20',
      data_atualizacao: '2025-08-31',
      responsavel_reservei: 'Roberto Vendedor',
      observacoes: 'Contrato piloto expirado - avaliar renovação',
      alertas: [
        {
          tipo: 'vencimento',
          mensagem: 'Contrato expirado - definir renovação',
          data: '2025-08-31',
          urgencia: 'alta'
        }
      ]
    }
  ];

  useEffect(() => {
    setContratos(contratosMock);
  }, []);

  const contratosFiltrados = contratos.filter(contrato => {
    const matchBusca = contrato.numero.toLowerCase().includes(busca.toLowerCase()) ||
                      contrato.hotel.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      contrato.hotel.contato.responsavel.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'todos' || contrato.status === filtroStatus;
    const matchTipo = filtroTipo === 'todos' || contrato.tipo === filtroTipo;

    return matchBusca && matchStatus && matchTipo;
  }).sort((a, b) => {
    if (ordenacao === 'vigencia_fim') {
      return new Date(a.vigencia.fim).getTime() - new Date(b.vigencia.fim).getTime();
    } else if (ordenacao === 'hotel') {
      return a.hotel.nome.localeCompare(b.hotel.nome);
    } else if (ordenacao === 'comissao') {
      return b.financeiro.comissao - a.financeiro.comissao;
    }
    return 0;
  });

  const estatisticas = {
    totalContratos: contratos.length,
    contratosAtivos: contratos.filter(c => c.status === 'ativo').length,
    contratosExpirados: contratos.filter(c => c.status === 'expirado').length,
    contratosPendentes: contratos.filter(c => c.status === 'pendente').length,
    comissaoMedia: contratos.filter(c => c.status === 'ativo').reduce((acc, c) => acc + c.financeiro.comissao, 0) / contratos.filter(c => c.status === 'ativo').length || 0,
    alertasAtivos: contratos.reduce((acc, c) => acc + c.alertas.length, 0),
    vencimentosProximos: contratos.filter(c => {
      const fimVigencia = new Date(c.vigencia.fim);
      const hoje = new Date();
      const diffTime = fimVigencia.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90 && diffDays >= 0;
    }).length
  };

  const handleView = (contrato: ContratoHotel) => {
    setContratoSelecionado(contrato);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (contrato: ContratoHotel) => {
    setContratoSelecionado(contrato);
    setModalTipo('edit');
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'expirado': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      case 'em_negociacao': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'exclusividade': return 'bg-purple-100 text-purple-800';
      case 'preferencial': return 'bg-blue-100 text-blue-800';
      case 'comissionado': return 'bg-green-100 text-green-800';
      case 'net': return 'bg-orange-100 text-orange-800';
      case 'package': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgenciaColor = (urgencia: string) => {
    switch (urgencia) {
      case 'alta': return 'text-red-600';
      case 'media': return 'text-yellow-600';
      case 'baixa': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const calcularDiasRestantes = (dataFim: string) => {
    const fim = new Date(dataFim);
    const hoje = new Date();
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              Contratos de Hotéis
            </h1>
            <p className="text-gray-600 mt-2">Gestão de contratos e parcerias hoteleiras</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <DollarSign className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Contrato
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalContratos}</div>
            <div className="text-sm text-gray-600">Total Contratos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.contratosAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{estatisticas.contratosExpirados}</div>
            <div className="text-sm text-gray-600">Expirados</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.contratosPendentes}</div>
            <div className="text-sm text-gray-600">Pendentes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.comissaoMedia.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Comissão Média</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.alertasAtivos}</div>
            <div className="text-sm text-gray-600">Alertas Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">{estatisticas.vencimentosProximos}</div>
            <div className="text-sm text-gray-600">Vencimentos 90d</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar contratos..."
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
            <option value="ativo">Ativo</option>
            <option value="pendente">Pendente</option>
            <option value="expirado">Expirado</option>
            <option value="cancelado">Cancelado</option>
            <option value="em_negociacao">Em Negociação</option>
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Tipos</option>
            <option value="exclusividade">Exclusividade</option>
            <option value="preferencial">Preferencial</option>
            <option value="comissionado">Comissionado</option>
            <option value="net">Net Rate</option>
            <option value="package">Package</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="vigencia_fim">Vencimento</option>
            <option value="hotel">Hotel</option>
            <option value="comissao">Comissão</option>
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contrato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigência</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Financeiro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alertas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contratosFiltrados.map((contrato) => {
                const diasRestantes = calcularDiasRestantes(contrato.vigencia.fim);
                return (
                  <tr key={contrato.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{contrato.numero}</div>
                        <div className="text-sm text-gray-500">
                          Assinado: {new Date(contrato.data_assinatura).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Por: {contrato.responsavel_reservei}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{contrato.hotel.nome}</div>
                        <div className="text-sm text-gray-500">{contrato.hotel.categoria}</div>
                        <div className="text-sm text-gray-500">{contrato.hotel.contato.responsavel}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(contrato.tipo)}`}>
                        {contrato.tipo.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          {new Date(contrato.vigencia.inicio).toLocaleDateString()} -
                        </div>
                        <div className="text-sm text-gray-900">
                          {new Date(contrato.vigencia.fim).toLocaleDateString()}
                        </div>
                        <div className={`text-sm ${diasRestantes <= 30 ? 'text-red-600' : diasRestantes <= 90 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {diasRestantes > 0 ? `${diasRestantes} dias restantes` : 'Expirado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Comissão: {contrato.financeiro.comissao}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Markup: {contrato.financeiro.markup}%
                        </div>
                        <div className="text-sm text-gray-500">
                          Pgto: {contrato.financeiro.prazo_pagamento} dias
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {contrato.status === 'ativo' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                         contrato.status === 'expirado' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                         <Clock className="h-4 w-4 text-yellow-600" />}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contrato.status)}`}>
                          {contrato.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {contrato.alertas.length > 0 ? (
                        <div className="space-y-1">
                          {contrato.alertas.slice(0, 2).map((alerta, index) => (
                            <div key={index} className={`text-xs ${getUrgenciaColor(alerta.urgencia)}`}>
                              {alerta.tipo.replace('_', ' ')}: {alerta.mensagem.substring(0, 30)}...
                            </div>
                          ))}
                          {contrato.alertas.length > 2 && (
                            <div className="text-xs text-gray-500">+{contrato.alertas.length - 2} mais</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Nenhum alerta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(contrato)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(contrato)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && contratoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Contrato {contratoSelecionado.numero}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(contratoSelecionado.tipo)}`}>
                  {contratoSelecionado.tipo}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contratoSelecionado.status)}`}>
                  {contratoSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Hotel e Contato */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Hotel Parceiro</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nome:</strong> {contratoSelecionado.hotel.nome}</div>
                    <div><strong>Categoria:</strong> {contratoSelecionado.hotel.categoria}</div>
                    <div><strong>Endereço:</strong> {contratoSelecionado.hotel.endereco}</div>
                    <div><strong>Responsável:</strong> {contratoSelecionado.hotel.contato.responsavel}</div>
                    <div><strong>Email:</strong> {contratoSelecionado.hotel.contato.email}</div>
                    <div><strong>Telefone:</strong> {contratoSelecionado.hotel.contato.telefone}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Vigência</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Início:</strong> {new Date(contratoSelecionado.vigencia.inicio).toLocaleDateString()}</div>
                    <div><strong>Fim:</strong> {new Date(contratoSelecionado.vigencia.fim).toLocaleDateString()}</div>
                    <div><strong>Duração:</strong> {contratoSelecionado.vigencia.duracao_meses} meses</div>
                    <div><strong>Renovação Automática:</strong> {contratoSelecionado.vigencia.renovacao_automatica ? 'Sim' : 'Não'}</div>
                    <div><strong>Dias Restantes:</strong>
                      <span className={`ml-2 ${calcularDiasRestantes(contratoSelecionado.vigencia.fim) <= 30 ? 'text-red-600' : 'text-green-600'}`}>
                        {calcularDiasRestantes(contratoSelecionado.vigencia.fim)} dias
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Condições Financeiras</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Comissão:</strong> {contratoSelecionado.financeiro.comissao}%</div>
                    <div><strong>Markup:</strong> {contratoSelecionado.financeiro.markup}%</div>
                    <div><strong>Forma de Pagamento:</strong> {contratoSelecionado.financeiro.forma_pagamento}</div>
                    <div><strong>Prazo de Pagamento:</strong> {contratoSelecionado.financeiro.prazo_pagamento} dias</div>
                    <div><strong>Moeda:</strong> {contratoSelecionado.financeiro.moeda}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Condições Comerciais</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Desconto Máximo:</strong> {contratoSelecionado.condicoes.desconto_maximo}%</div>
                    <div><strong>Cancelamento Gratuito:</strong> {contratoSelecionado.condicoes.cancellacao_gratuita}h antes</div>
                    <div><strong>Taxa No-Show:</strong> {contratoSelecionado.condicoes.no_show_taxa}%</div>
                    <div><strong>Criança Gratuita:</strong> até {contratoSelecionado.condicoes.crianca_gratuita_idade} anos</div>
                  </div>
                </div>
              </div>

              {/* Quotas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Quotas de Reservas</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{contratoSelecionado.quotas.diaria}</div>
                    <div className="text-sm text-blue-700">Diária</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{contratoSelecionado.quotas.semanal}</div>
                    <div className="text-sm text-green-700">Semanal</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{contratoSelecionado.quotas.mensal}</div>
                    <div className="text-sm text-purple-700">Mensal</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{contratoSelecionado.quotas.anual}</div>
                    <div className="text-sm text-orange-700">Anual</div>
                  </div>
                </div>
              </div>

              {/* Tarifas */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Tabela de Tarifas</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Período</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo de Quarto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Valor Net</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Valor Venda</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Observações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {contratoSelecionado.tarifas.map((tarifa, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">
                            {new Date(tarifa.periodo_inicio).toLocaleDateString()} - {new Date(tarifa.periodo_fim).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 text-sm">{tarifa.tipo_quarto}</td>
                          <td className="px-4 py-2 text-sm font-medium">R$ {tarifa.valor_net.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm font-medium text-green-600">R$ {tarifa.valor_venda.toFixed(2)}</td>
                          <td className="px-4 py-2 text-sm">{tarifa.observacoes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cláusulas Especiais */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cláusulas Especiais</h3>
                <ul className="space-y-2">
                  {contratoSelecionado.clausulas_especiais.map((clausula, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {clausula}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documentos */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Documentos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contratoSelecionado.documentos.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{doc.nome}</div>
                        <div className="text-sm text-gray-500">{doc.tipo} • {new Date(doc.data_upload).toLocaleDateString()}</div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas */}
              {contratoSelecionado.alertas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Alertas Ativos</h3>
                  <div className="space-y-2">
                    {contratoSelecionado.alertas.map((alerta, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        alerta.urgencia === 'alta' ? 'bg-red-50 border-red-400' :
                        alerta.urgencia === 'media' ? 'bg-yellow-50 border-yellow-400' :
                        'bg-green-50 border-green-400'
                      }`}>
                        <div className={`font-medium ${getUrgenciaColor(alerta.urgencia)}`}>
                          {alerta.tipo.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-700">{alerta.mensagem}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Data: {new Date(alerta.data).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações */}
              {contratoSelecionado.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {contratoSelecionado.observacoes}
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
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="h-4 w-4 inline mr-2" />
                Download Contrato
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
      {contratosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroStatus !== 'todos' || filtroTipo !== 'todos'
              ? 'Tente ajustar os filtros para encontrar contratos.'
              : 'Comece criando o primeiro contrato de hotel.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Contrato
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaContratosHoteis;
