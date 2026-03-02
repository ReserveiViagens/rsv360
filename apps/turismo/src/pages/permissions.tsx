import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    Users, 
    Lock, 
    Unlock, 
    Eye, 
    EyeOff, 
    Check, 
    X, 
    Plus, 
    Edit, 
    Trash2, 
    Save, 
    Search, 
    Filter, 
    Download, 
    Upload, 
    RefreshCw, 
    AlertCircle, 
    Info, 
    Copy, 
    Key, 
    UserCheck, 
    UserX, 
    Settings, 
    Database, 
    FileText, 
    CreditCard, 
    Calendar, 
    Bell, 
    Globe, 
    Building
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

interface Permission {
    id: string;
    name: string;
    description: string;
    category: string;
    code: string;
    isActive: boolean;
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: string;
}

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [showNewRoleModal, setShowNewRoleModal] = useState(false);
    const [showEditRoleModal, setShowEditRoleModal] = useState(false);
    const [showUserPermissionsModal, setShowUserPermissionsModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [exportGenerating, setExportGenerating] = useState(false);
    
    // Estados para formulários
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDescription, setNewRoleDescription] = useState('');
    const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
    const [editRoleName, setEditRoleName] = useState('');
    const [editRoleDescription, setEditRoleDescription] = useState('');
    const [editRolePermissions, setEditRolePermissions] = useState<string[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Simular carregamento de dados
        const mockPermissions: Permission[] = [
            // Usuários
            { id: 'user_create', name: 'Criar Usuários', description: 'Permite criar novos usuários', category: 'usuarios', code: 'user:create', isActive: true },
            { id: 'user_read', name: 'Visualizar Usuários', description: 'Permite visualizar lista de usuários', category: 'usuarios', code: 'user:read', isActive: true },
            { id: 'user_update', name: 'Editar Usuários', description: 'Permite editar informações de usuários', category: 'usuarios', code: 'user:update', isActive: true },
            { id: 'user_delete', name: 'Excluir Usuários', description: 'Permite excluir usuários', category: 'usuarios', code: 'user:delete', isActive: true },
            { id: 'user_activate', name: 'Ativar/Desativar Usuários', description: 'Permite ativar ou desativar usuários', category: 'usuarios', code: 'user:activate', isActive: true },

            // Relatórios
            { id: 'report_create', name: 'Criar Relatórios', description: 'Permite criar novos relatórios', category: 'relatorios', code: 'report:create', isActive: true },
            { id: 'report_read', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios', category: 'relatorios', code: 'report:read', isActive: true },
            { id: 'report_update', name: 'Editar Relatórios', description: 'Permite editar relatórios existentes', category: 'relatorios', code: 'report:update', isActive: true },
            { id: 'report_delete', name: 'Excluir Relatórios', description: 'Permite excluir relatórios', category: 'relatorios', code: 'report:delete', isActive: true },
            { id: 'report_export', name: 'Exportar Relatórios', description: 'Permite exportar relatórios', category: 'relatorios', code: 'report:export', isActive: true },

            // Financeiro
            { id: 'finance_read', name: 'Visualizar Financeiro', description: 'Permite visualizar dados financeiros', category: 'financeiro', code: 'finance:read', isActive: true },
            { id: 'finance_update', name: 'Editar Financeiro', description: 'Permite editar dados financeiros', category: 'financeiro', code: 'finance:update', isActive: true },
            { id: 'finance_delete', name: 'Excluir Financeiro', description: 'Permite excluir dados financeiros', category: 'financeiro', code: 'finance:delete', isActive: true },
            { id: 'finance_export', name: 'Exportar Financeiro', description: 'Permite exportar dados financeiros', category: 'financeiro', code: 'finance:export', isActive: true },

            // Configurações
            { id: 'settings_read', name: 'Visualizar Configurações', description: 'Permite visualizar configurações do sistema', category: 'configuracoes', code: 'settings:read', isActive: true },
            { id: 'settings_update', name: 'Editar Configurações', description: 'Permite editar configurações do sistema', category: 'configuracoes', code: 'settings:update', isActive: true },
            { id: 'settings_backup', name: 'Backup Configurações', description: 'Permite criar backup das configurações', category: 'configuracoes', code: 'settings:backup', isActive: true },

            // Permissões
            { id: 'permission_read', name: 'Visualizar Permissões', description: 'Permite visualizar permissões', category: 'permissoes', code: 'permission:read', isActive: true },
            { id: 'permission_update', name: 'Editar Permissões', description: 'Permite editar permissões', category: 'permissoes', code: 'permission:update', isActive: true },
            { id: 'role_create', name: 'Criar Funções', description: 'Permite criar novas funções', category: 'permissoes', code: 'role:create', isActive: true },
            { id: 'role_update', name: 'Editar Funções', description: 'Permite editar funções existentes', category: 'permissoes', code: 'role:update', isActive: true },
            { id: 'role_delete', name: 'Excluir Funções', description: 'Permite excluir funções', category: 'permissoes', code: 'role:delete', isActive: true }
        ];

        const mockRoles: Role[] = [
            {
                id: 'admin',
                name: 'Administrador',
                description: 'Acesso completo ao sistema',
                permissions: ['user_create', 'user_read', 'user_update', 'user_delete', 'user_activate', 'report_create', 'report_read', 'report_update', 'report_delete', 'report_export', 'finance_read', 'finance_update', 'finance_delete', 'finance_export', 'settings_read', 'settings_update', 'settings_backup', 'permission_read', 'permission_update', 'role_create', 'role_update', 'role_delete'],
                isActive: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-15'
            },
            {
                id: 'manager',
                name: 'Gerente',
                description: 'Acesso de gerenciamento',
                permissions: ['user_read', 'user_update', 'report_create', 'report_read', 'report_update', 'report_export', 'finance_read', 'finance_export', 'settings_read'],
                isActive: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-10'
            },
            {
                id: 'user',
                name: 'Usuário',
                description: 'Acesso básico ao sistema',
                permissions: ['report_read', 'finance_read'],
                isActive: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-05'
            },
            {
                id: 'viewer',
                name: 'Visualizador',
                description: 'Apenas visualização',
                permissions: ['report_read'],
                isActive: true,
                createdAt: '2024-01-01',
                updatedAt: '2024-01-01'
            }
        ];

        const mockUsers: User[] = [
            {
                id: '1',
                name: 'João Silva',
                email: 'joao.silva@reserveiviagens.com',
                role: 'admin',
                isActive: true,
                lastLogin: '2024-01-15 10:30:00'
            },
            {
                id: '2',
                name: 'Maria Santos',
                email: 'maria.santos@reserveiviagens.com',
                role: 'manager',
                isActive: true,
                lastLogin: '2024-01-14 15:45:00'
            },
            {
                id: '3',
                name: 'Carlos Oliveira',
                email: 'carlos.oliveira@reserveiviagens.com',
                role: 'user',
                isActive: true,
                lastLogin: '2024-01-13 09:15:00'
            },
            {
                id: '4',
                name: 'Ana Costa',
                email: 'ana.costa@reserveiviagens.com',
                role: 'viewer',
                isActive: false,
                lastLogin: '2024-01-10 14:20:00'
            }
        ];

        setPermissions(mockPermissions);
        setRoles(mockRoles);
        setUsers(mockUsers);
    };

    const handlePermissionToggle = (permissionId: string) => {
        setPermissions(prev => prev.map(permission => 
            permission.id === permissionId 
                ? { ...permission, isActive: !permission.isActive }
                : permission
        ));
    };

    const handleRolePermissionToggle = (roleId: string, permissionId: string) => {
        setRoles(prev => prev.map(role => {
            if (role.id === roleId) {
                const hasPermission = role.permissions.includes(permissionId);
                const newPermissions = hasPermission
                    ? role.permissions.filter(p => p !== permissionId)
                    : [...role.permissions, permissionId];
                
                return { ...role, permissions: newPermissions };
            }
            return role;
        }));
    };

    const handleSaveRole = async (roleData: Partial<Role>) => {
        setSaving(true);
        
        // Simular salvamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (selectedRole) {
            // Editar função existente
            const updatedRole = {
                ...selectedRole,
                name: editRoleName || selectedRole.name,
                description: editRoleDescription || selectedRole.description,
                permissions: editRolePermissions.length > 0 ? editRolePermissions : selectedRole.permissions,
                updatedAt: new Date().toISOString().split('T')[0]
            };
            
            setRoles(prev => prev.map(role => 
                role.id === selectedRole.id ? updatedRole : role
            ));
            alert('Função atualizada com sucesso!');
        } else {
            // Criar nova função
            if (!newRoleName.trim()) {
                alert('Por favor, insira um nome para a função.');
                setSaving(false);
                return;
            }
            
            const newRole: Role = {
                id: `role_${Date.now()}`,
                name: newRoleName,
                description: newRoleDescription,
                permissions: newRolePermissions,
                isActive: true,
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };
            setRoles(prev => [...prev, newRole]);
            alert('Função criada com sucesso!');
        }
        
        // Limpar formulários
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions([]);
        setEditRoleName('');
        setEditRoleDescription('');
        setEditRolePermissions([]);
        
        setShowNewRoleModal(false);
        setShowEditRoleModal(false);
        setSelectedRole(null);
        setSaving(false);
    };

    const handleDeleteRole = (roleId: string) => {
        if (confirm('Tem certeza que deseja excluir esta função?')) {
            setRoles(prev => prev.filter(role => role.id !== roleId));
            alert('Função excluída com sucesso!');
        }
    };

    const handleExportPermissions = async () => {
        setExportGenerating(true);
        
        // Simular geração de relatório
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const filename = `relatorio-permissoes-${new Date().toISOString().split('T')[0]}.json`;
        const content = JSON.stringify({ permissions, roles, users }, null, 2);
        
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`Relatório exportado com sucesso: ${filename}`);
        setShowExportModal(false);
        setExportGenerating(false);
    };

    const getFilteredPermissions = () => {
        return permissions.filter(permission => {
            const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
            const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                permission.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    };

    const getPermissionCategories = () => {
        const categories = [...new Set(permissions.map(p => p.category))];
        return categories.map(category => ({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1),
            count: permissions.filter(p => p.category === category).length
        }));
    };

    const getRoleByName = (roleId: string) => {
        return roles.find(role => role.id === roleId);
    };

    const getPermissionByName = (permissionId: string) => {
        return permissions.find(permission => permission.id === permissionId);
    };

    const handleNewRolePermissionToggle = (permissionId: string) => {
        setNewRolePermissions(prev => 
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleEditRolePermissionToggle = (permissionId: string) => {
        setEditRolePermissions(prev => 
            prev.includes(permissionId)
                ? prev.filter(p => p !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleOpenEditModal = (role: Role) => {
        setSelectedRole(role);
        setEditRoleName(role.name);
        setEditRoleDescription(role.description);
        setEditRolePermissions([...role.permissions]);
        setShowEditRoleModal(true);
    };

    const handleOpenNewRoleModal = () => {
        setNewRoleName('');
        setNewRoleDescription('');
        setNewRolePermissions([]);
        setShowNewRoleModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavigationButtons />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Permissões</h1>
                            <p className="mt-2 text-gray-600">
                                Configure permissões, funções e acessos dos usuários
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </button>
                            <button
                                onClick={handleOpenNewRoleModal}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Nova Função
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar permissões..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="sm:w-64">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Todas as Categorias</option>
                                {getPermissionCategories().map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.count})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div 
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-blue-50 border-2 border-transparent hover:border-blue-200"
                        onClick={() => {
                            setSelectedCategory('all');
                            setSearchTerm('');
                            alert('Visualizando todas as permissões do sistema');
                        }}
                    >
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total de Permissões</p>
                                <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                                <p className="text-xs text-blue-600 mt-1">Clique para ver todas</p>
                            </div>
                        </div>
                    </div>
                    <div 
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-green-50 border-2 border-transparent hover:border-green-200"
                        onClick={() => {
                            alert('Visualizando funções ativas do sistema');
                        }}
                    >
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Funções Ativas</p>
                                <p className="text-2xl font-bold text-gray-900">{roles.filter(r => r.isActive).length}</p>
                                <p className="text-xs text-green-600 mt-1">Clique para gerenciar</p>
                            </div>
                        </div>
                    </div>
                    <div 
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-purple-50 border-2 border-transparent hover:border-purple-200"
                        onClick={() => {
                            alert('Visualizando usuários ativos do sistema');
                        }}
                    >
                        <div className="flex items-center">
                            <UserCheck className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                                <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.isActive).length}</p>
                                <p className="text-xs text-purple-600 mt-1">Clique para ver detalhes</p>
                            </div>
                        </div>
                    </div>
                    <div 
                        className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-all duration-200 hover:bg-red-50 border-2 border-transparent hover:border-red-200"
                        onClick={() => {
                            setSelectedCategory('all');
                            setSearchTerm('');
                            alert('Visualizando permissões ativas do sistema');
                        }}
                    >
                        <div className="flex items-center">
                            <Lock className="h-8 w-8 text-red-600" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Permissões Ativas</p>
                                <p className="text-2xl font-bold text-gray-900">{permissions.filter(p => p.isActive).length}</p>
                                <p className="text-xs text-red-600 mt-1">Clique para ver ativas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Permissões */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Permissões do Sistema</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {getFilteredPermissions().map(permission => (
                                    <div 
                                        key={permission.id} 
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                            alert(`Detalhes da permissão: ${permission.name}\nCódigo: ${permission.code}\nCategoria: ${permission.category}\nStatus: ${permission.isActive ? 'Ativa' : 'Inativa'}`);
                                        }}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center">
                                                <h3 className="text-lg font-medium text-gray-900">{permission.name}</h3>
                                                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                    {permission.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                            <p className="text-xs text-gray-500 mt-1">Categoria: {permission.category}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handlePermissionToggle(permission.id);
                                                }}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    permission.isActive 
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                }`}
                                            >
                                                {permission.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Funções */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Funções e Permissões</h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {roles.map(role => (
                                    <div 
                                        key={role.id} 
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                            alert(`Detalhes da função: ${role.name}\nDescrição: ${role.description}\nPermissões: ${role.permissions.length}\nStatus: ${role.isActive ? 'Ativa' : 'Inativa'}`);
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                                                <p className="text-sm text-gray-600">{role.description}</p>
                                                <p className="text-xs text-gray-500">
                                                    {role.permissions.length} permissões • Criado em {role.createdAt}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenEditModal(role);
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRole(role.id);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <h4 className="text-sm font-medium text-gray-700">Permissões:</h4>
                                            <div className="grid grid-cols-1 gap-2">
                                                {permissions.map(permission => (
                                                    <div 
                                                        key={permission.id} 
                                                        className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                            <p className="text-xs text-gray-600">{permission.description}</p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRolePermissionToggle(role.id, permission.id);
                                                            }}
                                                            className={`p-1 rounded transition-colors ${
                                                                role.permissions.includes(permission.id)
                                                                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                            }`}
                                                        >
                                                            {role.permissions.includes(permission.id) ? 
                                                                <Check className="h-3 w-3" /> : 
                                                                <X className="h-3 w-3" />
                                                            }
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Usuários */}
                <div className="mt-8 bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Usuários e Funções</h2>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Usuário
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Função
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Último Login
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(user => {
                                        const userRole = getRoleByName(user.role);
                                        return (
                                            <tr 
                                                key={user.id}
                                                className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                                onClick={() => {
                                                    alert(`Detalhes do usuário:\nNome: ${user.name}\nEmail: ${user.email}\nFunção: ${userRole?.name || 'N/A'}\nStatus: ${user.isActive ? 'Ativo' : 'Inativo'}\nÚltimo Login: ${user.lastLogin}`);
                                                }}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {userRole?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {userRole?.permissions.length || 0} permissões
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        user.isActive 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {user.isActive ? 'Ativo' : 'Inativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.lastLogin}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedRole(userRole || null);
                                                            setShowUserPermissionsModal(true);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    >
                                                        Ver Permissões
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Nova Função */}
            {showNewRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center mb-6">
                            <Plus className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">Nova Função</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Função *</label>
                                <input
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    placeholder="Ex: Gerente de Vendas"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={newRoleDescription}
                                    onChange={(e) => setNewRoleDescription(e.target.value)}
                                    placeholder="Descreva as responsabilidades desta função"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Permissões ({newRolePermissions.length} selecionadas)
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {permissions.map(permission => (
                                        <div key={permission.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={permission.id}
                                                checked={newRolePermissions.includes(permission.id)}
                                                onChange={() => handleNewRolePermissionToggle(permission.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={permission.id} className="ml-2 text-sm text-gray-900">
                                                {permission.name}
                                                <span className="text-gray-500 ml-1">({permission.code})</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowNewRoleModal(false);
                                    setNewRoleName('');
                                    setNewRoleDescription('');
                                    setNewRolePermissions([]);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSaveRole({})}
                                disabled={saving || !newRoleName.trim()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {saving ? 'Salvando...' : 'Criar Função'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Editar Função */}
            {showEditRoleModal && selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center mb-6">
                            <Edit className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">Editar Função: {selectedRole.name}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Função *</label>
                                <input
                                    type="text"
                                    value={editRoleName}
                                    onChange={(e) => setEditRoleName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={editRoleDescription}
                                    onChange={(e) => setEditRoleDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Permissões ({editRolePermissions.length} selecionadas)
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {permissions.map(permission => (
                                        <div key={permission.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`edit_${permission.id}`}
                                                checked={editRolePermissions.includes(permission.id)}
                                                onChange={() => handleEditRolePermissionToggle(permission.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`edit_${permission.id}`} className="ml-2 text-sm text-gray-900">
                                                {permission.name}
                                                <span className="text-gray-500 ml-1">({permission.code})</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowEditRoleModal(false);
                                    setSelectedRole(null);
                                    setEditRoleName('');
                                    setEditRoleDescription('');
                                    setEditRolePermissions([]);
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleSaveRole({})}
                                disabled={saving || !editRoleName.trim()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                )}
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Permissões do Usuário */}
            {showUserPermissionsModal && selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center mb-6">
                            <UserCheck className="h-6 w-6 text-blue-600 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">Permissões da Função: {selectedRole.name}</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-3">Permissões Ativas:</h4>
                                <div className="space-y-2">
                                    {selectedRole.permissions.map(permissionId => {
                                        const permission = getPermissionByName(permissionId);
                                        return permission ? (
                                            <div key={permission.id} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <Check className="h-4 w-4 text-green-600 mr-3" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                                                    <p className="text-xs text-gray-600">{permission.description}</p>
                                                    <p className="text-xs text-gray-500">Código: {permission.code}</p>
                                                </div>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => {
                                    setShowUserPermissionsModal(false);
                                    setSelectedRole(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Exportar */}
            {showExportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <Download className="h-6 w-6 text-purple-600 mr-3" />
                            <h3 className="text-lg font-semibold text-gray-900">Exportar Relatório</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Exportar relatório completo de permissões, funções e usuários?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleExportPermissions}
                                disabled={exportGenerating}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                            >
                                {exportGenerating ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-4 w-4 mr-2" />
                                )}
                                {exportGenerating ? 'Exportando...' : 'Exportar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 