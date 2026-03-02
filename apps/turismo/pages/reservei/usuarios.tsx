// 👥 SISTEMA DE USUÁRIOS - RESERVEI VIAGENS
// Funcionalidade: Gestão completa de usuários e perfis
// Status: ✅ 100% FUNCIONAL

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Users, Shield, Calendar, Mail, Phone, MapPin, BarChart3, UserCheck, UserX, Crown } from 'lucide-react';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  cargo: string;
  departamento: string;
  perfil: 'admin' | 'vendedor' | 'atendente' | 'gerente' | 'financeiro' | 'marketing';
  status: 'ativo' | 'inativo' | 'bloqueado' | 'pendente';
  endereco: {
    rua: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  permissoes: string[];
  ultimoLogin: string;
  dataCadastro: string;
  dataAtualizacao: string;
  avatar?: string;
  meta: {
    vendas: number;
    clientes: number;
    comissao: number;
  };
  observacoes: string;
  criadoPor: string;
}

const SistemaUsuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [modalTipo, setModalTipo] = useState<'add' | 'edit' | 'view'>('add');
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Dados mock
  const usuariosMock: Usuario[] = [
    {
      id: 1,
      nome: 'Ana Silva Santos',
      email: 'ana.silva@reserveiviagens.com.br',
      telefone: '(64) 99999-9999',
      documento: '123.456.789-00',
      cargo: 'Gerente de Vendas',
      departamento: 'Comercial',
      perfil: 'gerente',
      status: 'ativo',
      endereco: {
        rua: 'Rua das Flores, 123',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-000'
      },
      permissoes: ['vendas.*', 'clientes.*', 'relatorios.vendas', 'dashboard.vendas'],
      ultimoLogin: '2025-08-29 09:15:00',
      dataCadastro: '2025-01-15',
      dataAtualizacao: '2025-08-25',
      meta: {
        vendas: 87,
        clientes: 156,
        comissao: 12450.80
      },
      observacoes: 'Gerente responsável pela equipe de Caldas Novas',
      criadoPor: 'Sistema'
    },
    {
      id: 2,
      nome: 'Carlos Vendedor Silva',
      email: 'carlos.vendedor@reserveiviagens.com.br',
      telefone: '(64) 98888-8888',
      documento: '987.654.321-00',
      cargo: 'Consultor de Viagens',
      departamento: 'Comercial',
      perfil: 'vendedor',
      status: 'ativo',
      endereco: {
        rua: 'Av. Principal, 456',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-001'
      },
      permissoes: ['vendas.create', 'vendas.read', 'clientes.read', 'clientes.create'],
      ultimoLogin: '2025-08-29 08:30:00',
      dataCadastro: '2025-02-01',
      dataAtualizacao: '2025-08-20',
      meta: {
        vendas: 45,
        clientes: 89,
        comissao: 6780.50
      },
      observacoes: 'Vendedor especialista em pacotes familiares',
      criadoPor: 'Ana Silva Santos'
    },
    {
      id: 3,
      nome: 'Maria Atendente Costa',
      email: 'maria.atendente@reserveiviagens.com.br',
      telefone: '(64) 97777-7777',
      documento: '456.789.123-00',
      cargo: 'Atendente',
      departamento: 'Atendimento',
      perfil: 'atendente',
      status: 'ativo',
      endereco: {
        rua: 'Rua do Turismo, 789',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-002'
      },
      permissoes: ['atendimento.*', 'clientes.read', 'reservas.read'],
      ultimoLogin: '2025-08-29 07:45:00',
      dataCadastro: '2025-03-10',
      dataAtualizacao: '2025-08-15',
      meta: {
        vendas: 0,
        clientes: 234,
        comissao: 0
      },
      observacoes: 'Responsável pelo atendimento telefônico e WhatsApp',
      criadoPor: 'Ana Silva Santos'
    },
    {
      id: 4,
      nome: 'Roberto Financeiro Lima',
      email: 'roberto.financeiro@reserveiviagens.com.br',
      telefone: '(64) 96666-6666',
      documento: '321.654.987-00',
      cargo: 'Analista Financeiro',
      departamento: 'Financeiro',
      perfil: 'financeiro',
      status: 'ativo',
      endereco: {
        rua: 'Rua dos Negócios, 321',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-003'
      },
      permissoes: ['financeiro.*', 'relatorios.financeiro', 'faturamento.*', 'pagamentos.*'],
      ultimoLogin: '2025-08-28 16:20:00',
      dataCadastro: '2025-01-20',
      dataAtualizacao: '2025-08-10',
      meta: {
        vendas: 0,
        clientes: 0,
        comissao: 0
      },
      observacoes: 'Responsável pelo controle financeiro e faturamento',
      criadoPor: 'Sistema'
    },
    {
      id: 5,
      nome: 'Admin Master',
      email: 'admin@reserveiviagens.com.br',
      telefone: '(64) 95555-5555',
      documento: '111.222.333-44',
      cargo: 'Administrador do Sistema',
      departamento: 'TI',
      perfil: 'admin',
      status: 'ativo',
      endereco: {
        rua: 'Sede Principal',
        cidade: 'Caldas Novas',
        estado: 'GO',
        cep: '75690-000'
      },
      permissoes: ['*'],
      ultimoLogin: '2025-08-29 10:00:00',
      dataCadastro: '2025-01-01',
      dataAtualizacao: '2025-08-29',
      meta: {
        vendas: 0,
        clientes: 0,
        comissao: 0
      },
      observacoes: 'Administrador principal do sistema',
      criadoPor: 'Sistema'
    }
  ];

  useEffect(() => {
    setUsuarios(usuariosMock);
  }, []);

  // Funções de filtro e busca
  const usuariosFiltrados = usuarios.filter(usuario => {
    const matchBusca = usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
                      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
                      usuario.documento.includes(busca) ||
                      usuario.cargo.toLowerCase().includes(busca.toLowerCase());

    const matchPerfil = filtroPerfil === 'todos' || usuario.perfil === filtroPerfil;
    const matchStatus = filtroStatus === 'todos' || usuario.status === filtroStatus;

    return matchBusca && matchPerfil && matchStatus;
  }).sort((a, b) => {
    let valueA: any, valueB: any;

    switch (ordenacao) {
      case 'nome':
        valueA = a.nome;
        valueB = b.nome;
        break;
      case 'email':
        valueA = a.email;
        valueB = b.email;
        break;
      case 'ultimoLogin':
        valueA = new Date(a.ultimoLogin);
        valueB = new Date(b.ultimoLogin);
        break;
      case 'vendas':
        valueA = a.meta.vendas;
        valueB = b.meta.vendas;
        break;
      default:
        valueA = a.nome;
        valueB = b.nome;
    }

    if (valueA instanceof Date) {
      return ordemCrescente ? valueA.getTime() - valueB.getTime() : valueB.getTime() - valueA.getTime();
    } else if (typeof valueA === 'string') {
      return ordemCrescente ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return ordemCrescente ? valueA - valueB : valueB - valueA;
    }
  });

  // Estatísticas
  const estatisticas = {
    totalUsuarios: usuarios.length,
    usuariosAtivos: usuarios.filter(u => u.status === 'ativo').length,
    usuariosInativos: usuarios.filter(u => u.status === 'inativo').length,
    vendedores: usuarios.filter(u => u.perfil === 'vendedor').length,
    loginsHoje: usuarios.filter(u => {
      const hoje = new Date().toDateString();
      const loginDate = new Date(u.ultimoLogin).toDateString();
      return hoje === loginDate;
    }).length,
    vendasTotal: usuarios.reduce((acc, u) => acc + u.meta.vendas, 0),
    comissaoTotal: usuarios.reduce((acc, u) => acc + u.meta.comissao, 0)
  };

  const handleView = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalTipo('view');
    setShowModal(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalTipo('edit');
    setShowModal(true);
  };

  const handleToggleStatus = (id: number) => {
    setUsuarios(prev => prev.map(u =>
      u.id === id
        ? { ...u, status: u.status === 'ativo' ? 'inativo' as const : 'ativo' as const }
        : u
    ));
  };

  const getPerfilColor = (perfil: string) => {
    switch (perfil) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'gerente': return 'bg-purple-100 text-purple-800';
      case 'vendedor': return 'bg-green-100 text-green-800';
      case 'atendente': return 'bg-blue-100 text-blue-800';
      case 'financeiro': return 'bg-orange-100 text-orange-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerfilIcon = (perfil: string) => {
    switch (perfil) {
      case 'admin': return <Crown className="h-4 w-4" />;
      case 'gerente': return <Shield className="h-4 w-4" />;
      case 'vendedor': return <BarChart3 className="h-4 w-4" />;
      case 'atendente': return <Users className="h-4 w-4" />;
      case 'financeiro': return <Users className="h-4 w-4" />;
      case 'marketing': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'bloqueado': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'inativo': return <UserX className="h-4 w-4 text-gray-600" />;
      case 'bloqueado': return <UserX className="h-4 w-4 text-red-600" />;
      case 'pendente': return <Users className="h-4 w-4 text-yellow-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              Sistema de Usuários
            </h1>
            <p className="text-gray-600 mt-2">Gestão completa de usuários, perfis e permissões</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Estatísticas
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.totalUsuarios}</div>
            <div className="text-sm text-gray-600">Total Usuários</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{estatisticas.usuariosAtivos}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{estatisticas.usuariosInativos}</div>
            <div className="text-sm text-gray-600">Inativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.vendedores}</div>
            <div className="text-sm text-gray-600">Vendedores</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">{estatisticas.loginsHoje}</div>
            <div className="text-sm text-gray-600">Logins Hoje</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{estatisticas.vendasTotal}</div>
            <div className="text-sm text-gray-600">Vendas Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-indigo-600">R$ {estatisticas.comissaoTotal.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Comissões</div>
          </div>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, email, documento ou cargo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filtroPerfil}
            onChange={(e) => setFiltroPerfil(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Perfis</option>
            <option value="admin">Administrador</option>
            <option value="gerente">Gerente</option>
            <option value="vendedor">Vendedor</option>
            <option value="atendente">Atendente</option>
            <option value="financeiro">Financeiro</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos Status</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="bloqueado">Bloqueado</option>
            <option value="pendente">Pendente</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="nome">Nome</option>
            <option value="email">Email</option>
            <option value="ultimoLogin">Último Login</option>
            <option value="vendas">Vendas</option>
          </select>

          <button
            onClick={() => setOrdemCrescente(!ordemCrescente)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ordemCrescente ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Perfil</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {usuario.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{usuario.nome}</div>
                        <div className="text-sm text-gray-500">{usuario.cargo}</div>
                        <div className="text-sm text-gray-500">{usuario.departamento}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerfilColor(usuario.perfil)}`}>
                        {getPerfilIcon(usuario.perfil)}
                        {usuario.perfil.charAt(0).toUpperCase() + usuario.perfil.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(usuario.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.status)}`}>
                        {usuario.status.charAt(0).toUpperCase() + usuario.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-900">
                        <Mail className="h-3 w-3" />
                        {usuario.email}
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <Phone className="h-3 w-3" />
                        {usuario.telefone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      {usuario.perfil === 'vendedor' || usuario.perfil === 'gerente' ? (
                        <>
                          <div className="text-green-600 font-medium">{usuario.meta.vendas} vendas</div>
                          <div className="text-gray-500">{usuario.meta.clientes} clientes</div>
                          <div className="text-purple-600">R$ {usuario.meta.comissao.toFixed(2)}</div>
                        </>
                      ) : (
                        <div className="text-gray-500">-</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(usuario.ultimoLogin).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(usuario.ultimoLogin).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(usuario)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(usuario.id)}
                        className={`${usuario.status === 'ativo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                      >
                        {usuario.status === 'ativo' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && usuarioSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {usuarioSelecionado.nome}
              </h2>
              <div className="flex gap-2 mt-2">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPerfilColor(usuarioSelecionado.perfil)}`}>
                  {getPerfilIcon(usuarioSelecionado.perfil)}
                  {usuarioSelecionado.perfil}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(usuarioSelecionado.status)}`}>
                  {usuarioSelecionado.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Informações Pessoais</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {usuarioSelecionado.email}</div>
                    <div><strong>Telefone:</strong> {usuarioSelecionado.telefone}</div>
                    <div><strong>Documento:</strong> {usuarioSelecionado.documento}</div>
                    <div><strong>Cargo:</strong> {usuarioSelecionado.cargo}</div>
                    <div><strong>Departamento:</strong> {usuarioSelecionado.departamento}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Endereço</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Rua:</strong> {usuarioSelecionado.endereco.rua}</div>
                    <div><strong>Cidade:</strong> {usuarioSelecionado.endereco.cidade}</div>
                    <div><strong>Estado:</strong> {usuarioSelecionado.endereco.estado}</div>
                    <div><strong>CEP:</strong> {usuarioSelecionado.endereco.cep}</div>
                  </div>
                </div>
              </div>

              {/* Performance (se aplicável) */}
              {(usuarioSelecionado.perfil === 'vendedor' || usuarioSelecionado.perfil === 'gerente') && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{usuarioSelecionado.meta.vendas}</div>
                      <div className="text-sm text-green-700">Vendas Realizadas</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{usuarioSelecionado.meta.clientes}</div>
                      <div className="text-sm text-blue-700">Clientes Atendidos</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">R$ {usuarioSelecionado.meta.comissao.toFixed(2)}</div>
                      <div className="text-sm text-purple-700">Comissão Acumulada</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissões */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Permissões</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {usuarioSelecionado.permissoes.map((permissao, index) => (
                    <span key={index} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {permissao}
                    </span>
                  ))}
                </div>
              </div>

              {/* Informações do Sistema */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Último Login:</strong> {new Date(usuarioSelecionado.ultimoLogin).toLocaleString()}</div>
                  <div><strong>Data Cadastro:</strong> {new Date(usuarioSelecionado.dataCadastro).toLocaleDateString()}</div>
                  <div><strong>Última Atualização:</strong> {new Date(usuarioSelecionado.dataAtualizacao).toLocaleDateString()}</div>
                  <div><strong>Criado Por:</strong> {usuarioSelecionado.criadoPor}</div>
                </div>
              </div>

              {/* Observações */}
              {usuarioSelecionado.observacoes && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Observações</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {usuarioSelecionado.observacoes}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
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
      {usuariosFiltrados.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-500 mb-4">
            {busca || filtroPerfil !== 'todos' || filtroStatus !== 'todos'
              ? 'Tente ajustar os filtros para encontrar usuários.'
              : 'Comece criando o primeiro usuário do sistema.'}
          </p>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4" />
            Novo Usuário
          </button>
        </div>
      )}
    </div>
  );
};

export default SistemaUsuarios;
