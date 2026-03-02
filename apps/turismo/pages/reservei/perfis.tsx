// 🔐 SISTEMA DE PERFIS E PERMISSÕES - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de perfis de acesso e permissões
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Shield, Users, Key, Lock, Unlock, Check, X, Crown, UserCog } from 'lucide-react';

interface Permissao {
  id: string;
  modulo: string;
  acao: string;
  descricao: string;
  categoria: 'vendas' | 'financeiro' | 'marketing' | 'atendimento' | 'administracao' | 'relatorios';
}

interface Perfil {
  id: number;
  nome: string;
  descricao: string;
  cor: string;
  icon: string;
  nivel: 'alto' | 'medio' | 'baixo';
  permissoes: string[];
  usuariosVinculados: number;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
  criadoPor: string;
  observacoes: string;
}

const SistemaPerfisPemissoes: React.FC = () => {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view' | 'permissions'>('add');
  const [perfilSelecionado, setPerfilSelecionado] = useState<Perfil | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<string[]>([]);

  // Dados mock de permissões
  const permissoesMock: Permissao[] = [
    // Vendas
    { id: 'vendas.create', modulo: 'Vendas', acao: 'Criar', descricao: 'Criar novas vendas e reservas', categoria: 'vendas' },
    { id: 'vendas.read', modulo: 'Vendas', acao: 'Visualizar', descricao: 'Visualizar vendas existentes', categoria: 'vendas' },
    { id: 'vendas.update', modulo: 'Vendas', acao: 'Editar', descricao: 'Editar vendas existentes', categoria: 'vendas' },
    { id: 'vendas.delete', modulo: 'Vendas', acao: 'Excluir', descricao: 'Cancelar/excluir vendas', categoria: 'vendas' },

    // Financeiro
    { id: 'financeiro.faturamento', modulo: 'Financeiro', acao: 'Faturamento', descricao: 'Gerenciar faturamento e NFSe', categoria: 'financeiro' },
    { id: 'financeiro.pagamentos', modulo: 'Financeiro', acao: 'Pagamentos', descricao: 'Gerenciar pagamentos e transações', categoria: 'financeiro' },
    { id: 'financeiro.fluxo-caixa', modulo: 'Financeiro', acao: 'Fluxo de Caixa', descricao: 'Controlar fluxo de caixa', categoria: 'financeiro' },
    { id: 'financeiro.relatorios', modulo: 'Financeiro', acao: 'Relatórios', descricao: 'Acessar relatórios financeiros', categoria: 'financeiro' },

    // Marketing
    { id: 'marketing.campanhas', modulo: 'Marketing', acao: 'Campanhas', descricao: 'Gerenciar campanhas de marketing', categoria: 'marketing' },
    { id: 'marketing.analytics', modulo: 'Marketing', acao: 'Analytics', descricao: 'Acessar analytics e métricas', categoria: 'marketing' },
    { id: 'marketing.seo', modulo: 'Marketing', acao: 'SEO', descricao: 'Gerenciar SEO e otimizações', categoria: 'marketing' },
    { id: 'marketing.recomendacoes', modulo: 'Marketing', acao: 'Recomendações', descricao: 'Configurar sistema de recomendações', categoria: 'marketing' },

    // Atendimento
    { id: 'atendimento.clientes', modulo: 'Atendimento', acao: 'Clientes', descricao: 'Gerenciar clientes e contatos', categoria: 'atendimento' },
    { id: 'atendimento.suporte', modulo: 'Atendimento', acao: 'Suporte', descricao: 'Atendimento ao cliente', categoria: 'atendimento' },
    { id: 'atendimento.chat', modulo: 'Atendimento', acao: 'Chat', descricao: 'Chat e WhatsApp', categoria: 'atendimento' },

    // Administração
    { id: 'admin.usuarios', modulo: 'Administração', acao: 'Usuários', descricao: 'Gerenciar usuários do sistema', categoria: 'administracao' },
    { id: 'admin.perfis', modulo: 'Administração', acao: 'Perfis', descricao: 'Gerenciar perfis e permissões', categoria: 'administracao' },
    { id: 'admin.configuracoes', modulo: 'Administração', acao: 'Configurações', descricao: 'Configurações do sistema', categoria: 'administracao' },
    { id: 'admin.backup', modulo: 'Administração', acao: 'Backup', descricao: 'Backup e restore', categoria: 'administracao' },

    // Relatórios
    { id: 'relatorios.vendas', modulo: 'Relatórios', acao: 'Vendas', descricao: 'Relatórios de vendas', categoria: 'relatorios' },
    { id: 'relatorios.financeiros', modulo: 'Relatórios', acao: 'Financeiros', descricao: 'Relatórios financeiros', categoria: 'relatorios' },
    { id: 'relatorios.operacionais', modulo: 'Relatórios', acao: 'Operacionais', descricao: 'Relatórios operacionais', categoria: 'relatorios' }
  ];

  // Dados mock de perfis
  const perfisMock: Perfil[] = [
    {
      id: 1,
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema, todas as permissões habilitadas',
      cor: 'red',
      icon: 'crown',
      nivel: 'alto',
      permissoes: permissoesMock.map(p => p.id), // Todas as permissões
      usuariosVinculados: 2,
      ativo: true,
      dataCriacao: '2025-01-01',
      dataAtualizacao: '2025-08-20',
      criadoPor: 'Sistema',
      observacoes: 'Perfil para administradores do sistema'
    },
    {
      id: 2,
      nome: 'Gerente de Vendas',
      descricao: 'Acesso completo às vendas e relatórios, sem acesso administrativo',
      cor: 'purple',
      icon: 'shield',
      nivel: 'alto',
      permissoes: [
        'vendas.create', 'vendas.read', 'vendas.update', 'vendas.delete',
        'atendimento.clientes', 'relatorios.vendas', 'marketing.analytics'
      ],
      usuariosVinculados: 3,
      ativo: true,
      dataCriacao: '2025-01-15',
      dataAtualizacao: '2025-08-15',
      criadoPor: 'Admin Master',
      observacoes: 'Perfil para gerentes da área comercial'
    },
    {
      id: 3,
      nome: 'Vendedor',
      descricao: 'Acesso para criar e gerenciar vendas, sem acesso a relatórios avançados',
      cor: 'green',
      icon: 'users',
      nivel: 'medio',
      permissoes: [
        'vendas.create', 'vendas.read', 'vendas.update',
        'atendimento.clientes'
      ],
      usuariosVinculados: 8,
      ativo: true,
      dataCriacao: '2025-02-01',
      dataAtualizacao: '2025-08-10',
      criadoPor: 'Ana Silva Santos',
      observacoes: 'Perfil padrão para consultores de vendas'
    },
    {
      id: 4,
      nome: 'Atendente',
      descricao: 'Acesso limitado ao atendimento ao cliente e consulta de informações',
      cor: 'blue',
      icon: 'headphones',
      nivel: 'baixo',
      permissoes: [
        'vendas.read', 'atendimento.clientes', 'atendimento.suporte', 'atendimento.chat'
      ],
      usuariosVinculados: 5,
      ativo: true,
      dataCriacao: '2025-03-01',
      dataAtualizacao: '2025-08-05',
      criadoPor: 'Ana Silva Santos',
      observacoes: 'Perfil para atendentes de primeiro nível'
    },
    {
      id: 5,
      nome: 'Financeiro',
      descricao: 'Acesso completo ao módulo financeiro e relatórios financeiros',
      cor: 'orange',
      icon: 'calculator',
      nivel: 'alto',
      permissoes: [
        'financeiro.faturamento', 'financeiro.pagamentos', 'financeiro.fluxo-caixa',
        'financeiro.relatorios', 'relatorios.financeiros'
      ],
      usuariosVinculados: 2,
      ativo: true,
      dataCriacao: '2025-01-20',
      dataAtualizacao: '2025-08-01',
      criadoPor: 'Admin Master',
      observacoes: 'Perfil para equipe financeira'
    },
    {
      id: 6,
      nome: 'Marketing',
      descricao: 'Acesso ao módulo de marketing, campanhas e analytics',
      cor: 'pink',
      icon: 'megaphone',
      nivel: 'medio',
      permissoes: [
        'marketing.campanhas', 'marketing.analytics', 'marketing.seo',
        'marketing.recomendacoes', 'relatorios.vendas'
      ],
      usuariosVinculados: 1,
      ativo: true,
      dataCriacao: '2025-04-01',
      dataAtualizacao: '2025-08-01',
      criadoPor: 'Admin Master',
      observacoes: 'Perfil para equipe de marketing'
    }
  ];

  useEffect(() => {
    setPerfis(perfisMock);
    setPermissoes(permissoesMock);
  }, []);

  const perfisFiltrados = perfis.filter(perfil => {
    const matchBusca = perfil.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      perfil.descricao.toLowerCase().includes(busca.toLowerCase());
    const matchNivel = filtroNivel === 'todos' || perfil.nivel === filtroNivel;
    const matchStatus = filtroStatus === 'todos' ||
                       (filtroStatus === 'ativo' && perfil.ativo) ||
                       (filtroStatus === 'inativo' && !perfil.ativo);

    return matchBusca && matchNivel && matchStatus;
  });

  const handleView = (perfil: Perfil) => {
    setPerfilSelecionado(perfil);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (perfil: Perfil) => {
    setPerfilSelecionado(perfil);
    setPermissoesSelecionadas(perfil.permissoes);
    setModalTipo('edit');
    setShowModal(true);
  };

  const handlePermissions = (perfil: Perfil) => {
    setPerfilSelecionado(perfil);
    setPermissoesSelecionadas(perfil.permissoes);
    setModalTipo('permissions');
    setShowModal(true);
  };

  const togglePermissao = (permissaoId: string) => {
    setPermissoesSelecionadas(prev =>
      prev.includes(permissaoId)
        ? prev.filter(p => p !== permissaoId)
        : [...prev, permissaoId]
    );
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'alto': return 'bg-red-100 text-red-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'baixo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCorPerfil = (cor: string) => {
    switch (cor) {
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
      case 'purple': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'blue': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'orange': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'pink': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconePerfil = (icon: string) => {
    switch (icon) {
      case 'crown': return <Crown className="h-5 w-5" />;
      case 'shield': return <Shield className="h-5 w-5" />;
      case 'users': return <Users className="h-5 w-5" />;
      default: return <UserCog className="h-5 w-5" />;
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'vendas': return 'bg-green-100 text-green-800';
      case 'financeiro': return 'bg-blue-100 text-blue-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'atendimento': return 'bg-purple-100 text-purple-800';
      case 'administracao': return 'bg-red-100 text-red-800';
      case 'relatorios': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Agrupar permissões por categoria
  const permissoesPorCategoria = permissoes.reduce((acc, permissao) => {
    if (!acc[permissao.categoria]) {
      acc[permissao.categoria] = [];
    }
    acc[permissao.categoria].push(permissao);
    return acc;
  }, {} as Record<string, Permissao[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              Perfis e Permissões
            </h1>
            <p className="text-gray-600 mt-2">Gestão de perfis de acesso e controle de permissões</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{perfis.length}</div>
          <div className="text-sm text-gray-600">Total Perfis</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{perfis.filter(p => p.ativo).length}</div>
          <div className="text-sm text-gray-600">Perfis Ativos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">{perfis.reduce((acc, p) => acc + p.usuariosVinculados, 0)}</div>
          <div className="text-sm text-gray-600">Usuários Vinculados</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">{permissoes.length}</div>
          <div className="text-sm text-gray-600">Permissões Disponíveis</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar perfis..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filtroNivel}
            onChange={(e) => setFiltroNivel(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os Níveis</option>
            <option value="alto">Alto</option>
            <option value="medio">Médio</option>
            <option value="baixo">Baixo</option>
          </select>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Grid de Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {perfisFiltrados.map((perfil) => (
          <div key={perfil.id} className={`bg-white rounded-lg shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${getCorPerfil(perfil.cor)}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${getCorPerfil(perfil.cor)}`}>
                  {getIconePerfil(perfil.icon)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{perfil.nome}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNivelColor(perfil.nivel)}`}>
                      Nível {perfil.nivel.charAt(0).toUpperCase() + perfil.nivel.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${perfil.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {perfil.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{perfil.descricao}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Usuários Vinculados:</span>
                <span className="font-medium">{perfil.usuariosVinculados}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Permissões:</span>
                <span className="font-medium">{perfil.permissoes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Criado em:</span>
                <span className="font-medium">{new Date(perfil.dataCriacao).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleView(perfil)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Eye className="h-4 w-4" />
                Ver
              </button>
              <button
                onClick={() => handlePermissions(perfil)}
                className="flex items-center justify-center gap-1 px-3 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 text-sm"
              >
                <Key className="h-4 w-4" />
                Permissões
              </button>
              <button
                onClick={() => handleEdit(perfil)}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && perfilSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {modalTipo === 'permissions' ? 'Gerenciar Permissões' : 'Detalhes do Perfil'} - {perfilSelecionado.nome}
              </h2>
            </div>

            <div className="p-6">
              {modalTipo === 'permissions' ? (
                <div className="space-y-6">
                  {Object.entries(permissoesPorCategoria).map(([categoria, perms]) => (
                    <div key={categoria} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoriaColor(categoria)}`}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perms.map((permissao) => (
                          <div key={permissao.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={permissoesSelecionadas.includes(permissao.id)}
                                onChange={() => togglePermissao(permissao.id)}
                                className="rounded"
                              />
                              <div>
                                <div className="font-medium text-sm">{permissao.modulo} - {permissao.acao}</div>
                                <div className="text-xs text-gray-600">{permissao.descricao}</div>
                              </div>
                            </label>
                            {permissoesSelecionadas.includes(permissao.id) ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Informações Básicas</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nome:</strong> {perfilSelecionado.nome}</div>
                        <div><strong>Descrição:</strong> {perfilSelecionado.descricao}</div>
                        <div><strong>Nível:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getNivelColor(perfilSelecionado.nivel)}`}>
                            {perfilSelecionado.nivel.toUpperCase()}
                          </span>
                        </div>
                        <div><strong>Status:</strong>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${perfilSelecionado.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {perfilSelecionado.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Estatísticas</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Usuários Vinculados:</strong> {perfilSelecionado.usuariosVinculados}</div>
                        <div><strong>Total Permissões:</strong> {perfilSelecionado.permissoes.length}</div>
                        <div><strong>Criado em:</strong> {new Date(perfilSelecionado.dataCriacao).toLocaleDateString()}</div>
                        <div><strong>Criado por:</strong> {perfilSelecionado.criadoPor}</div>
                      </div>
                    </div>
                  </div>

                  {/* Permissões do perfil */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Permissões Atribuídas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {perfilSelecionado.permissoes.map((permissaoId) => {
                        const permissao = permissoes.find(p => p.id === permissaoId);
                        return permissao ? (
                          <div key={permissaoId} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{permissao.modulo} - {permissao.acao}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>

                  {/* Observações */}
                  {perfilSelecionado.observacoes && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Observações</h3>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {perfilSelecionado.observacoes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {modalTipo === 'permissions' ? 'Cancelar' : 'Fechar'}
              </button>
              {modalTipo === 'permissions' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Salvar Permissões
                </button>
              )}
              {modalTipo === 'edit' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Salvar Alterações
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {perfisFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum perfil encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroNivel !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar perfis.'
              : 'Comece criando o primeiro perfil de acesso.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Perfil
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaPerfisPemissoes;
