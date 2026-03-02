'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  Crown,
  Key,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  Activity,
  Award,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  Save,
  Plus,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'agent' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  department: string;
  hired_date: string;
  last_login: string;
  permissions: string[];
  avatar?: string;
  location?: string;
  commission_rate?: number;
  target_monthly?: number;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  color: string;
  level: number;
  is_system_role: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  is_dangerous: boolean;
}

const MOCK_PERMISSIONS: Permission[] = [
  // Reservas
  { id: 'bookings.view', name: 'Visualizar Reservas', description: 'Ver lista de reservas', category: 'reservas', is_dangerous: false },
  { id: 'bookings.create', name: 'Criar Reservas', description: 'Criar novas reservas', category: 'reservas', is_dangerous: false },
  { id: 'bookings.edit', name: 'Editar Reservas', description: 'Modificar reservas existentes', category: 'reservas', is_dangerous: false },
  { id: 'bookings.delete', name: 'Deletar Reservas', description: 'Remover reservas do sistema', category: 'reservas', is_dangerous: true },
  { id: 'bookings.cancel', name: 'Cancelar Reservas', description: 'Cancelar reservas de clientes', category: 'reservas', is_dangerous: false },

  // Clientes
  { id: 'customers.view', name: 'Visualizar Clientes', description: 'Ver dados de clientes', category: 'clientes', is_dangerous: false },
  { id: 'customers.create', name: 'Criar Clientes', description: 'Cadastrar novos clientes', category: 'clientes', is_dangerous: false },
  { id: 'customers.edit', name: 'Editar Clientes', description: 'Modificar dados de clientes', category: 'clientes', is_dangerous: false },
  { id: 'customers.delete', name: 'Deletar Clientes', description: 'Remover clientes', category: 'clientes', is_dangerous: true },

  // Pagamentos
  { id: 'payments.view', name: 'Visualizar Pagamentos', description: 'Ver transações financeiras', category: 'pagamentos', is_dangerous: false },
  { id: 'payments.process', name: 'Processar Pagamentos', description: 'Executar transações', category: 'pagamentos', is_dangerous: false },
  { id: 'payments.refund', name: 'Processar Reembolsos', description: 'Executar reembolsos', category: 'pagamentos', is_dangerous: true },

  // Relatórios
  { id: 'reports.view', name: 'Visualizar Relatórios', description: 'Acessar relatórios', category: 'relatorios', is_dangerous: false },
  { id: 'reports.export', name: 'Exportar Relatórios', description: 'Fazer download de relatórios', category: 'relatorios', is_dangerous: false },

  // Sistema
  { id: 'system.settings', name: 'Configurações do Sistema', description: 'Acessar configurações', category: 'sistema', is_dangerous: true },
  { id: 'system.users', name: 'Gerenciar Usuários', description: 'Criar/editar usuários', category: 'sistema', is_dangerous: true },
  { id: 'system.backup', name: 'Backup do Sistema', description: 'Fazer backup/restore', category: 'sistema', is_dangerous: true },
  { id: 'system.logs', name: 'Visualizar Logs', description: 'Acessar logs do sistema', category: 'sistema', is_dangerous: false }
];

const MOCK_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'admin',
    display_name: 'Administrador',
    description: 'Acesso total ao sistema',
    permissions: MOCK_PERMISSIONS.map(p => p.id),
    color: '#DC2626',
    level: 100,
    is_system_role: true
  },
  {
    id: 'manager',
    name: 'manager',
    display_name: 'Gerente',
    description: 'Gerenciamento de equipes e operações',
    permissions: MOCK_PERMISSIONS.filter(p => !p.is_dangerous || p.category !== 'sistema').map(p => p.id),
    color: '#7C3AED',
    level: 80,
    is_system_role: true
  },
  {
    id: 'agent',
    name: 'agent',
    display_name: 'Agente',
    description: 'Vendas e atendimento ao cliente',
    permissions: MOCK_PERMISSIONS.filter(p => ['reservas', 'clientes', 'pagamentos'].includes(p.category) && !p.is_dangerous).map(p => p.id),
    color: '#059669',
    level: 50,
    is_system_role: true
  },
  {
    id: 'user',
    name: 'user',
    display_name: 'Usuário',
    description: 'Acesso básico de leitura',
    permissions: MOCK_PERMISSIONS.filter(p => p.name.includes('Visualizar')).map(p => p.id),
    color: '#6B7280',
    level: 10,
    is_system_role: true
  }
];

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@reserveiviagens.com.br',
    phone: '(64) 99999-9999',
    role: 'admin',
    status: 'active',
    department: 'Administração',
    hired_date: '2023-01-15',
    last_login: '2025-01-08 14:30:00',
    permissions: MOCK_ROLES.find(r => r.id === 'admin')?.permissions || [],
    location: 'Caldas Novas, GO',
    commission_rate: 15,
    target_monthly: 50000,
    created_at: '2023-01-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@reserveiviagens.com.br',
    phone: '(64) 98888-8888',
    role: 'manager',
    status: 'active',
    department: 'Vendas',
    hired_date: '2023-03-20',
    last_login: '2025-01-08 12:15:00',
    permissions: MOCK_ROLES.find(r => r.id === 'manager')?.permissions || [],
    location: 'Caldas Novas, GO',
    commission_rate: 12,
    target_monthly: 40000,
    created_at: '2023-03-20'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@reserveiviagens.com.br',
    phone: '(64) 97777-7777',
    role: 'agent',
    status: 'active',
    department: 'Atendimento',
    hired_date: '2023-06-10',
    last_login: '2025-01-08 16:45:00',
    permissions: MOCK_ROLES.find(r => r.id === 'agent')?.permissions || [],
    location: 'Cuiabá, MT',
    commission_rate: 10,
    target_monthly: 25000,
    created_at: '2023-06-10'
  }
];

export default function ConfiguracoesUsuarios() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [permissions] = useState<Permission[]>(MOCK_PERMISSIONS);
  const [activeTab, setActiveTab] = useState('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || '#6B7280';
  };

  const getRoleDisplayName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.display_name || roleId;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };

    const labels = {
      active: 'Ativo',
      inactive: 'Inativo',
      suspended: 'Suspenso'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const handleCreateUser = () => {
    const newUser: User = {
      id: Date.now().toString(),
      name: '',
      email: '',
      phone: '',
      role: 'user',
      status: 'active',
      department: '',
      hired_date: new Date().toISOString().split('T')[0],
      last_login: '',
      permissions: MOCK_ROLES.find(r => r.id === 'user')?.permissions || [],
      created_at: new Date().toISOString().split('T')[0]
    };

    setSelectedUser(newUser);
    setIsEditing(true);
  };

  const handleSaveUser = () => {
    if (!selectedUser) return;

    if (selectedUser.id && users.find(u => u.id === selectedUser.id)) {
      // Atualizar usuário existente
      setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    } else {
      // Criar novo usuário
      setUsers([...users, { ...selectedUser, id: Date.now().toString() }]);
    }

    setIsEditing(false);
    setSelectedUser(null);
    alert('Usuário salvo com sucesso!');
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    }
  };

  const handleCreateRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: '',
      display_name: '',
      description: '',
      permissions: [],
      color: '#6B7280',
      level: 0,
      is_system_role: false
    };

    setSelectedRole(newRole);
  };

  const handleSaveRole = () => {
    if (!selectedRole) return;

    if (selectedRole.id && roles.find(r => r.id === selectedRole.id)) {
      setRoles(roles.map(r => r.id === selectedRole.id ? selectedRole : r));
    } else {
      setRoles([...roles, { ...selectedRole, id: Date.now().toString() }]);
    }

    setSelectedRole(null);
    alert('Role salvo com sucesso!');
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.is_system_role) {
      alert('Não é possível deletar roles do sistema.');
      return;
    }

    if (confirm('Tem certeza que deseja deletar este role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
    }
  };

  const updateUserField = (field: string, value: any) => {
    if (!selectedUser) return;

    let updatedUser = { ...selectedUser, [field]: value };

    // Atualizar permissões quando o role mudar
    if (field === 'role') {
      const role = roles.find(r => r.id === value);
      updatedUser.permissions = role?.permissions || [];
    }

    setSelectedUser(updatedUser);
  };

  const updateRoleField = (field: string, value: any) => {
    if (!selectedRole) return;
    setSelectedRole({ ...selectedRole, [field]: value });
  };

  const togglePermission = (permissionId: string) => {
    if (!selectedRole) return;

    const permissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter(p => p !== permissionId)
      : [...selectedRole.permissions, permissionId];

    setSelectedRole({ ...selectedRole, permissions });
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👥 Configurações de Usuários RSV 360
            </h1>
            <p className="text-gray-600">
              Gerencie usuários, roles e permissões do sistema
            </p>
          </div>

          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Roles Disponíveis</p>
                  <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Permissões</p>
                  <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principal */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Crown className="h-4 w-4 mr-2" />
              Roles & Permissões
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              Permissões Detalhadas
            </TabsTrigger>
          </TabsList>

          {/* Lista de Usuários */}
          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista e Filtros */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle>Usuários do Sistema</CardTitle>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar usuários..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48"
                          />
                        </div>

                        <Select value={filterRole} onValueChange={setFilterRole}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os Roles</SelectItem>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.display_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredUsers.map(user => (
                        <div
                          key={user.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedUser?.id === user.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge style={{ backgroundColor: getRoleColor(user.role), color: 'white' }}>
                                    {getRoleDisplayName(user.role)}
                                  </Badge>
                                  {getStatusBadge(user.status)}
                                </div>
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUser(user);
                                  setIsEditing(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteUser(user.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          Nenhum usuário encontrado com os filtros aplicados.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes/Edição do Usuário */}
              <div className="lg:col-span-1">
                {selectedUser ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>
                          {isEditing ? 'Editar Usuário' : 'Detalhes do Usuário'}
                        </CardTitle>
                        {!isEditing && (
                          <Button
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isEditing ? (
                        // Formulário de Edição
                        <>
                          <div>
                            <Label htmlFor="name">Nome</Label>
                            <Input
                              id="name"
                              value={selectedUser.name}
                              onChange={(e) => updateUserField('name', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={selectedUser.email}
                              onChange={(e) => updateUserField('email', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                              id="phone"
                              value={selectedUser.phone}
                              onChange={(e) => updateUserField('phone', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Select value={selectedUser.role} onValueChange={(value) => updateUserField('role', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map(role => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.display_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={selectedUser.status} onValueChange={(value) => updateUserField('status', value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Ativo</SelectItem>
                                <SelectItem value="inactive">Inativo</SelectItem>
                                <SelectItem value="suspended">Suspenso</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="department">Departamento</Label>
                            <Input
                              id="department"
                              value={selectedUser.department}
                              onChange={(e) => updateUserField('department', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="location">Localização</Label>
                            <Input
                              id="location"
                              value={selectedUser.location || ''}
                              onChange={(e) => updateUserField('location', e.target.value)}
                            />
                          </div>

                          <div>
                            <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
                            <Input
                              id="commission_rate"
                              type="number"
                              min="0"
                              max="100"
                              value={selectedUser.commission_rate || 0}
                              onChange={(e) => updateUserField('commission_rate', parseFloat(e.target.value))}
                            />
                          </div>

                          <div>
                            <Label htmlFor="target_monthly">Meta Mensal (R$)</Label>
                            <Input
                              id="target_monthly"
                              type="number"
                              min="0"
                              value={selectedUser.target_monthly || 0}
                              onChange={(e) => updateUserField('target_monthly', parseFloat(e.target.value))}
                            />
                          </div>

                          <div className="flex space-x-2 pt-4">
                            <Button onClick={handleSaveUser} className="flex-1">
                              <Save className="h-4 w-4 mr-2" />
                              Salvar
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditing(false);
                                if (!selectedUser.id) {
                                  setSelectedUser(null);
                                }
                              }}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        // Visualização de Detalhes
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedUser.email}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedUser.phone}</span>
                            </div>

                            {selectedUser.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{selectedUser.location}</span>
                              </div>
                            )}

                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Contratado em {selectedUser.hired_date}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">Último login: {selectedUser.last_login || 'Nunca'}</span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">Performance</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Comissão:</span>
                                <span>{selectedUser.commission_rate || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Meta Mensal:</span>
                                <span>R$ {selectedUser.target_monthly?.toLocaleString() || 0}</span>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">Permissões</h5>
                            <div className="text-sm text-gray-600">
                              {selectedUser.permissions.length} permissões ativas
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione um usuário para ver os detalhes
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Roles e Permissões */}
          <TabsContent value="roles">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista de Roles */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Roles do Sistema</CardTitle>
                    <Button onClick={handleCreateRole}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Role
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {roles.map(role => (
                      <div
                        key={role.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRole?.id === role.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedRole(role)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{role.display_name}</h4>
                              <Badge style={{ backgroundColor: role.color, color: 'white' }}>
                                Nível {role.level}
                              </Badge>
                              {role.is_system_role && (
                                <Badge variant="outline">Sistema</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{role.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {role.permissions.length} permissões
                            </p>
                          </div>

                          {!role.is_system_role && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteRole(role.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Editor de Role */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedRole ? (selectedRole.id ? 'Editar Role' : 'Novo Role') : 'Detalhes do Role'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRole ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role_display_name">Nome de Exibição</Label>
                        <Input
                          id="role_display_name"
                          value={selectedRole.display_name}
                          onChange={(e) => updateRoleField('display_name', e.target.value)}
                          disabled={selectedRole.is_system_role}
                        />
                      </div>

                      <div>
                        <Label htmlFor="role_description">Descrição</Label>
                        <Textarea
                          id="role_description"
                          value={selectedRole.description}
                          onChange={(e) => updateRoleField('description', e.target.value)}
                          disabled={selectedRole.is_system_role}
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role_color">Cor</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="role_color"
                              type="color"
                              value={selectedRole.color}
                              onChange={(e) => updateRoleField('color', e.target.value)}
                              disabled={selectedRole.is_system_role}
                              className="w-16"
                            />
                            <Input
                              value={selectedRole.color}
                              onChange={(e) => updateRoleField('color', e.target.value)}
                              disabled={selectedRole.is_system_role}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="role_level">Nível (0-100)</Label>
                          <Input
                            id="role_level"
                            type="number"
                            min="0"
                            max="100"
                            value={selectedRole.level}
                            onChange={(e) => updateRoleField('level', parseInt(e.target.value))}
                            disabled={selectedRole.is_system_role}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-semibold">Permissões</Label>
                        <div className="mt-2 space-y-4 max-h-64 overflow-y-auto">
                          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                            <div key={category} className="border rounded p-3">
                              <h5 className="font-medium mb-2 capitalize">{category}</h5>
                              <div className="space-y-2">
                                {categoryPermissions.map(permission => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={permission.id}
                                      checked={selectedRole.permissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      disabled={selectedRole.is_system_role}
                                    />
                                    <Label htmlFor={permission.id} className="text-sm flex-1">
                                      {permission.name}
                                      {permission.is_dangerous && (
                                        <AlertTriangle className="h-3 w-3 text-red-500 inline ml-1" />
                                      )}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!selectedRole.is_system_role && (
                        <div className="flex space-x-2 pt-4">
                          <Button onClick={handleSaveRole} className="flex-1">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Role
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSelectedRole(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Selecione um role para ver os detalhes
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Permissões Detalhadas */}
          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Todas as Permissões do Sistema</CardTitle>
                <CardDescription>
                  Lista completa de permissões organizadas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-4 capitalize flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        {category}
                        <Badge variant="outline" className="ml-2">
                          {categoryPermissions.length} permissões
                        </Badge>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoryPermissions.map(permission => (
                          <div key={permission.id} className="p-3 bg-gray-50 rounded border">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm">{permission.name}</h4>
                              {permission.is_dangerous && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600">{permission.description}</p>
                            <code className="text-xs bg-gray-200 px-1 rounded mt-1 block">
                              {permission.id}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
