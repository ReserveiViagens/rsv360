'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  role: 'admin' | 'manager' | 'user';
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
}

interface UserFilters {
  search: string;
  role: string;
  status: string;
  company: string;
}

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: '',
    role: '',
    status: '',
    company: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'João',
        lastName: 'Silva',
        email: 'joao.silva@rsv.com',
        phone: '(11) 99999-9999',
        company: 'RSV Viagens',
        role: 'admin',
        isActive: true,
        lastLogin: new Date(),
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        avatar: '/avatars/joao.jpg'
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@rsv.com',
        phone: '(11) 88888-8888',
        company: 'RSV Viagens',
        role: 'manager',
        isActive: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date(),
        avatar: '/avatars/maria.jpg'
      },
      {
        id: '3',
        firstName: 'Pedro',
        lastName: 'Oliveira',
        email: 'pedro.oliveira@rsv.com',
        phone: '(11) 77777-7777',
        company: 'RSV Viagens',
        role: 'user',
        isActive: false,
        lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date('2024-03-10'),
        updatedAt: new Date(),
        avatar: '/avatars/pedro.jpg'
      }
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
    setLoading(false);
  }, []);

  // Filtrar usuários
  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.company.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(user => user.isActive);
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(user => !user.isActive);
      }
    }

    if (filters.company) {
      filtered = filtered.filter(user => user.company === filters.company);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isActive: !user.isActive }
        : user
    ));
  };

  const deleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const bulkActivate = () => {
    setUsers(prev => prev.map(user => 
      selectedUsers.includes(user.id) 
        ? { ...user, isActive: true }
        : user
    ));
    setSelectedUsers([]);
  };

  const bulkDeactivate = () => {
    setUsers(prev => prev.map(user => 
      selectedUsers.includes(user.id) 
        ? { ...user, isActive: false }
        : user
    ));
    setSelectedUsers([]);
  };

  const bulkDelete = () => {
    if (confirm(`Tem certeza que deseja excluir ${selectedUsers.length} usuários?`)) {
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
      setSelectedUsers([]);
    }
  };

  const exportUsers = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'Empresa', 'Função', 'Status', 'Último Login'],
      ...filteredUsers.map(user => [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone,
        user.company,
        user.role,
        user.isActive ? 'Ativo' : 'Inativo',
        user.lastLogin.toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      user: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return variants[role as keyof typeof variants] || variants.user;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestão de Usuários
          </CardTitle>
          <CardDescription>
            Gerencie todos os usuários do sistema, suas permissões e status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <select
              title="Filtrar por função"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as funções</option>
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="user">Usuário</option>
            </select>

            <select
              title="Filtrar por status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Mais Filtros
            </Button>
          </div>

          {/* Ações em Lote */}
          {selectedUsers.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={bulkActivate}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ativar
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkDeactivate}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Desativar
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tabela de Usuários */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3">
                    <input
                      type="checkbox"
                      title="Selecionar todos os usuários"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-3 font-medium">Usuário</th>
                  <th className="text-left p-3 font-medium">Contato</th>
                  <th className="text-left p-3 font-medium">Empresa</th>
                  <th className="text-left p-3 font-medium">Função</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Último Login</th>
                  <th className="text-left p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                         <td className="p-3">
                       <input
                         type="checkbox"
                         title={`Selecionar usuário ${user.firstName} ${user.lastName}`}
                         checked={selectedUsers.includes(user.id)}
                         onChange={() => handleUserSelection(user.id)}
                         className="rounded border-gray-300"
                       />
                     </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{user.company}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getRoleBadge(user.role)}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'manager' ? 'Gerente' : 'Usuário'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(user.isActive)}
                        <span className={cn(
                          "text-sm",
                          user.isActive ? "text-green-600" : "text-red-600"
                        )}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {user.lastLogin.toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.isActive ? "text-orange-600" : "text-green-600"}
                        >
                          {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação e Ações */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Mostrando {filteredUsers.length} de {users.length} usuários
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={exportUsers}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Usuário
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
