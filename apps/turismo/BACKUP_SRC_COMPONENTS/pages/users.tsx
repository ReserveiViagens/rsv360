import React, { useState, useEffect } from 'react';
import { 
    Users, 
    UserPlus, 
    UserX, 
    Search, 
    Filter, 
    Download, 
    Upload, 
    RefreshCw, 
    Save, 
    X, 
    Check, 
    Eye, 
    EyeOff, 
    Lock, 
    Unlock, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Clock, 
    Shield, 
    AlertCircle, 
    Info, 
    Copy, 
    Key, 
    UserCheck, 
    Settings, 
    Database, 
    FileText, 
    CreditCard, 
    Bell, 
    Globe, 
    Building,
    Edit
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    isActive: boolean;
    isVerified: boolean;
    lastLogin: string;
    createdAt: string;
    permissions: string[];
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
}

interface Department {
    id: string;
    name: string;
    description: string;
    manager: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        // Simular carregamento de dados
        const mockUsers: User[] = [
            {
                id: '1',
                name: 'João Silva',
                email: 'joao.silva@reserveiviagens.com',
                phone: '(11) 99999-9999',
                role: 'admin',
                department: 'TI',
                isActive: true,
                isVerified: true,
                lastLogin: '2024-01-15 10:30:00',
                createdAt: '2024-01-01',
                permissions: ['user_create', 'user_read', 'user_update', 'user_delete', 'report_create', 'report_read', 'finance_read']
            },
            {
                id: '2',
                name: 'Maria Santos',
                email: 'maria.santos@reserveiviagens.com',
                phone: '(11) 88888-8888',
                role: 'manager',
                department: 'Vendas',
                isActive: true,
                isVerified: true,
                lastLogin: '2024-01-14 15:45:00',
                createdAt: '2024-01-05',
                permissions: ['user_read', 'report_create', 'report_read', 'finance_read']
            }
        ];

        const mockRoles: Role[] = [
            {
                id: 'admin',
                name: 'Administrador',
                description: 'Acesso completo ao sistema',
                permissions: ['user_create', 'user_read', 'user_update', 'user_delete', 'report_create', 'report_read', 'report_update', 'report_delete', 'finance_read', 'finance_update', 'finance_delete']
            },
            {
                id: 'manager',
                name: 'Gerente',
                description: 'Acesso de gerenciamento',
                permissions: ['user_read', 'user_update', 'report_create', 'report_read', 'report_update', 'finance_read', 'finance_update']
            }
        ];

        const mockDepartments: Department[] = [
            {
                id: 'ti',
                name: 'Tecnologia da Informação',
                description: 'Departamento de TI',
                manager: 'João Silva'
            },
            {
                id: 'vendas',
                name: 'Vendas',
                description: 'Departamento de Vendas',
                manager: 'Maria Santos'
            }
        ];

        setUsers(mockUsers);
        setRoles(mockRoles);
        setDepartments(mockDepartments);
    };

    const getRoleByName = (roleId: string) => {
        return roles.find(role => role.id === roleId);
    };

    const getDepartmentByName = (departmentId: string) => {
        return departments.find(dept => dept.id === departmentId);
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    const getVerificationColor = (isVerified: boolean) => {
        return isVerified 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
                            <p className="mt-2 text-gray-600">
                                Gerencie usuários, funções e permissões do sistema
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                <Download className="h-4 w-4 mr-2" />
                                Exportar
                            </button>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Novo Usuário
                            </button>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Usuários do Sistema</h2>
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
                                            Departamento
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
                                        const userDepartment = getDepartmentByName(user.department);
                                        return (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                            <div className="text-xs text-gray-400">{user.phone}</div>
                                                        </div>
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
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {userDepartment?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {userDepartment?.manager || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="space-y-1">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                                                            {user.isActive ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerificationColor(user.isVerified)}`}>
                                                            {user.isVerified ? 'Verificado' : 'Pendente'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.lastLogin || 'Nunca'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button className="text-blue-600 hover:text-blue-900">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-green-600 hover:text-green-900">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900">
                                                            <UserX className="h-4 w-4" />
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
                </div>
            </div>
        </div>
    );
} 