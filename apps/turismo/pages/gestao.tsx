import React, { useState } from 'react';
import {
    Users,
    Building,
    Settings,
    BarChart3,
    FileText,
    Shield,
    Plus,
    Download,
    Upload,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    AlertCircle,
    Clock,
    Star,
    TrendingUp,
    Activity,
    UserPlus,
    Building2,
    Cog,
    FileText as FileTextIcon,
    Database,
    UserCheck,
    X
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

export default function GestaoSimple() {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Estados para formulários
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        status: 'active'
    });

    const [newDepartmentForm, setNewDepartmentForm] = useState({
        name: '',
        description: '',
        manager: '',
        budget: '',
        status: 'active'
    });

    const [settingsForm, setSettingsForm] = useState({
        systemName: 'Onion RSV 360',
        theme: 'light',
        language: 'pt-BR',
        notifications: true,
        autoBackup: true
    });

    const [reportForm, setReportForm] = useState({
        type: 'users',
        period: 'month',
        format: 'pdf',
        includeCharts: true
    });

    const [exportForm, setExportForm] = useState({
        format: 'json',
        includeInactive: false,
        includeDetails: true,
        dateRange: 'all'
    });

    const [importForm, setImportForm] = useState({
        file: null,
        updateExisting: false,
        createMissing: true,
        validateData: true,
        createBackup: true
    });

    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statsCards = [
        {
            id: 1,
            title: 'Total de Usuários',
            value: '1,247',
            change: '+12%',
            changeType: 'positive',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            title: 'Departamentos',
            value: '8',
            change: '+1',
            changeType: 'positive',
            icon: Building,
            color: 'bg-green-500'
        },
        {
            id: 3,
            title: 'Configurações',
            value: '24',
            change: '+3',
            changeType: 'positive',
            icon: Settings,
            color: 'bg-purple-500'
        },
        {
            id: 4,
            title: 'Relatórios',
            value: '156',
            change: '+23',
            changeType: 'positive',
            icon: BarChart3,
            color: 'bg-orange-500'
        },
        {
            id: 5,
            title: 'Documentos',
            value: '2,847',
            change: '+156',
            changeType: 'positive',
            icon: FileText,
            color: 'bg-red-500'
        },
        {
            id: 6,
            title: 'Segurança',
            value: '98.5%',
            change: '+2.1%',
            changeType: 'positive',
            icon: Shield,
            color: 'bg-indigo-500'
        }
    ];

    // Handlers para funcionalidades
    const handleCardClick = (card: any) => {
        setSelectedItem(card);
        setModalType('stats-details');
        setShowModal(true);
    };

    const handleQuickAction = (action: any) => {
        setSelectedItem(action);
        setModalType(action.action);
        setShowModal(true);
        setFormErrors({});
    };

    const handleUserClick = (user: any) => {
        setSelectedItem(user);
        setModalType('user-details');
        setShowModal(true);
    };

    const handleDepartmentClick = (department: any) => {
        setSelectedItem(department);
        setModalType('department-details');
        setShowModal(true);
    };

    // Funções de validação
    const validateForm = (formType: string) => {
        const errors: any = {};
        let form: any;

        if (formType === 'user') {
            form = newUserForm;
            if (!form.name.trim()) errors.name = 'Nome é obrigatório';
            if (!form.email.trim()) errors.email = 'Email é obrigatório';
            else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email inválido';
            if (!form.role.trim()) errors.role = 'Cargo é obrigatório';
            if (!form.department.trim()) errors.department = 'Departamento é obrigatório';
        } else if (formType === 'department') {
            form = newDepartmentForm;
            if (!form.name.trim()) errors.name = 'Nome é obrigatório';
            if (!form.manager.trim()) errors.manager = 'Gerente é obrigatório';
            if (!form.budget.trim()) errors.budget = 'Orçamento é obrigatório';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Funções de submissão
    const handleSubmitUser = () => {
        if (validateForm('user')) {
            setIsSubmitting(true);
            // Simular envio
            setTimeout(() => {
                setIsSubmitting(false);
                setShowModal(false);
                setNewUserForm({ name: '', email: '', role: '', department: '', status: 'active' });
                alert('Usuário criado com sucesso!');
            }, 1000);
        }
    };

    const handleSubmitDepartment = () => {
        if (validateForm('department')) {
            setIsSubmitting(true);
            // Simular envio
            setTimeout(() => {
                setIsSubmitting(false);
                setShowModal(false);
                setNewDepartmentForm({ name: '', description: '', manager: '', budget: '', status: 'active' });
                alert('Departamento criado com sucesso!');
            }, 1000);
        }
    };

    const handleSubmitSettings = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowModal(false);
            alert('Configurações salvas com sucesso!');
        }, 1000);
    };

    const handleSubmitReport = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowModal(false);
            alert('Relatório gerado com sucesso!');
        }, 1000);
    };

    const handleSubmitExport = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowModal(false);
            alert('Dados exportados com sucesso!');
        }, 1000);
    };

    const handleSubmitImport = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowModal(false);
            alert('Dados importados com sucesso!');
        }, 1000);
    };

    // Funções de input
    const handleInputChange = (formType: string, field: string, value: any) => {
        if (formType === 'user') {
            setNewUserForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'department') {
            setNewDepartmentForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'settings') {
            setSettingsForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'report') {
            setReportForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'export') {
            setExportForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'import') {
            setImportForm(prev => ({ ...prev, [field]: value }));
        }
    };

    const quickActions = [
        {
            id: 1,
            title: 'Novo Usuário',
            description: 'Adicionar novo usuário ao sistema',
            icon: UserPlus,
            color: 'bg-blue-500',
            action: 'new-user'
        },
        {
            id: 2,
            title: 'Novo Departamento',
            description: 'Criar novo departamento',
            icon: Building2,
            color: 'bg-green-500',
            action: 'new-department'
        },
        {
            id: 3,
            title: 'Configurações',
            description: 'Gerenciar configurações do sistema',
            icon: Cog,
            color: 'bg-purple-500',
            action: 'settings'
        },
        {
            id: 4,
            title: 'Relatórios',
            description: 'Gerar relatórios de gestão',
            icon: FileTextIcon,
            color: 'bg-orange-500',
            action: 'reports'
        },
        {
            id: 5,
            title: 'Exportar Dados',
            description: 'Exportar dados do sistema',
            icon: Download,
            color: 'bg-teal-500',
            action: 'export'
        },
        {
            id: 6,
            title: 'Importar Dados',
            description: 'Importar dados para o sistema',
            icon: Upload,
            color: 'bg-pink-500',
            action: 'import'
        },
        {
            id: 7,
            title: 'Gerenciar Usuários',
            description: 'Editar e excluir usuários',
            icon: UserCheck,
            color: 'bg-yellow-500',
            action: 'manage-users'
        }
    ];

    const recentUsers = [
        {
            id: 1,
            name: 'João Silva',
            email: 'joao.silva@empresa.com',
            role: 'Gerente',
            department: 'Vendas',
            avatar: 'JS'
        },
        {
            id: 2,
            name: 'Maria Santos',
            email: 'maria.santos@empresa.com',
            role: 'Analista',
            department: 'Marketing',
            avatar: 'MS'
        },
        {
            id: 3,
            name: 'Pedro Costa',
            email: 'pedro.costa@empresa.com',
            role: 'Desenvolvedor',
            department: 'TI',
            avatar: 'PC'
        },
        {
            id: 4,
            name: 'Ana Oliveira',
            email: 'ana.oliveira@empresa.com',
            role: 'Coordenadora',
            department: 'RH',
            avatar: 'AO'
        }
    ];

    const departments = [
        {
            id: 1,
            name: 'Vendas',
            manager: 'João Silva',
            employees: 45,
            budget: 'R$ 500.000',
            color: 'bg-blue-500'
        },
        {
            id: 2,
            name: 'Marketing',
            manager: 'Maria Santos',
            employees: 32,
            budget: 'R$ 300.000',
            color: 'bg-green-500'
        },
        {
            id: 3,
            name: 'TI',
            manager: 'Pedro Costa',
            employees: 28,
            budget: 'R$ 400.000',
            color: 'bg-purple-500'
        },
        {
            id: 4,
            name: 'RH',
            manager: 'Ana Oliveira',
            employees: 15,
            budget: 'R$ 200.000',
            color: 'bg-red-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestão</h1>
                            <p className="mt-2 text-gray-600">Gerencie usuários, departamentos e configurações do sistema</p>
                        </div>
                        <NavigationButtons className="mt-2" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {statsCards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => handleCardClick(card)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                    <p className={`text-sm ${card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                        {card.change}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${card.color} text-white`}>
                                    <card.icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={() => handleQuickAction(action)}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
                            >
                                <div className={`inline-flex p-2 rounded-lg ${action.color} text-white mb-3`}>
                                    <action.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                                <p className="text-sm text-gray-600">{action.description}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Users and Departments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Users */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Usuários Recentes</h3>
                        </div>
                        <div className="p-6">
                            {recentUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{user.role}</p>
                                        <p className="text-sm text-gray-600">{user.department}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Departments */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Departamentos</h3>
                        </div>
                        <div className="p-6">
                            {departments.map((dept) => (
                                <div
                                    key={dept.id}
                                    onClick={() => handleDepartmentClick(dept)}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 ${dept.color} rounded-full flex items-center justify-center`}>
                                            <Building className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{dept.name}</p>
                                            <p className="text-sm text-gray-600">{dept.manager}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{dept.employees} funcionários</p>
                                        <p className="text-sm text-gray-600">{dept.budget}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Dinâmico */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Header do Modal */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-medium text-gray-900">
                                    {modalType === 'new-user' && 'Novo Usuário'}
                                    {modalType === 'new-department' && 'Novo Departamento'}
                                    {modalType === 'settings' && 'Configurações do Sistema'}
                                    {modalType === 'reports' && 'Gerar Relatório'}
                                    {modalType === 'export' && 'Exportar Dados'}
                                    {modalType === 'import' && 'Importar Dados'}
                                    {modalType === 'manage-users' && 'Gerenciar Usuários'}
                                    {modalType === 'stats-details' && `Detalhes de ${selectedItem?.title}`}
                                    {modalType === 'user-details' && 'Detalhes do Usuário'}
                                    {modalType === 'department-details' && 'Detalhes do Departamento'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Formulário - Novo Usuário */}
                            {modalType === 'new-user' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                                        <input
                                            type="text"
                                            value={newUserForm.name}
                                            onChange={(e) => handleInputChange('user', 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome completo"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={newUserForm.email}
                                            onChange={(e) => handleInputChange('user', 'email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="email@empresa.com"
                                        />
                                        {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                                        <input
                                            type="text"
                                            value={newUserForm.role}
                                            onChange={(e) => handleInputChange('user', 'role', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Gerente, Analista"
                                        />
                                        {formErrors.role && <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                        <select
                                            value={newUserForm.department}
                                            onChange={(e) => handleInputChange('user', 'department', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione um departamento</option>
                                            <option value="Vendas">Vendas</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="TI">TI</option>
                                            <option value="RH">RH</option>
                                        </select>
                                        {formErrors.department && <p className="text-red-500 text-sm mt-1">{formErrors.department}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={newUserForm.status}
                                            onChange={(e) => handleInputChange('user', 'status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitUser}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Criando...' : 'Criar Usuário'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Novo Departamento */}
                            {modalType === 'new-department' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Departamento</label>
                                        <input
                                            type="text"
                                            value={newDepartmentForm.name}
                                            onChange={(e) => handleInputChange('department', 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do departamento"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                        <textarea
                                            value={newDepartmentForm.description}
                                            onChange={(e) => handleInputChange('department', 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Descrição do departamento"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Gerente</label>
                                        <input
                                            type="text"
                                            value={newDepartmentForm.manager}
                                            onChange={(e) => handleInputChange('department', 'manager', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do gerente"
                                        />
                                        {formErrors.manager && <p className="text-red-500 text-sm mt-1">{formErrors.manager}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                                        <input
                                            type="text"
                                            value={newDepartmentForm.budget}
                                            onChange={(e) => handleInputChange('department', 'budget', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="R$ 0,00"
                                        />
                                        {formErrors.budget && <p className="text-red-500 text-sm mt-1">{formErrors.budget}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={newDepartmentForm.status}
                                            onChange={(e) => handleInputChange('department', 'status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Ativo</option>
                                            <option value="inactive">Inativo</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitDepartment}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Criando...' : 'Criar Departamento'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Configurações */}
                            {modalType === 'settings' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Sistema</label>
                                        <input
                                            type="text"
                                            value={settingsForm.systemName}
                                            onChange={(e) => handleInputChange('settings', 'systemName', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                                        <select
                                            value={settingsForm.theme}
                                            onChange={(e) => handleInputChange('settings', 'theme', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="light">Claro</option>
                                            <option value="dark">Escuro</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
                                        <select
                                            value={settingsForm.language}
                                            onChange={(e) => handleInputChange('settings', 'language', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pt-BR">Português</option>
                                            <option value="en-US">English</option>
                                            <option value="es-ES">Español</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.notifications}
                                            onChange={(e) => handleInputChange('settings', 'notifications', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Ativar notificações</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={settingsForm.autoBackup}
                                            onChange={(e) => handleInputChange('settings', 'autoBackup', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Backup automático</label>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitSettings}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Relatórios */}
                            {modalType === 'reports' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
                                        <select
                                            value={reportForm.type}
                                            onChange={(e) => handleInputChange('report', 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="users">Usuários</option>
                                            <option value="departments">Departamentos</option>
                                            <option value="activities">Atividades</option>
                                            <option value="performance">Performance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                                        <select
                                            value={reportForm.period}
                                            onChange={(e) => handleInputChange('report', 'period', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="week">Semana</option>
                                            <option value="month">Mês</option>
                                            <option value="quarter">Trimestre</option>
                                            <option value="year">Ano</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                                        <select
                                            value={reportForm.format}
                                            onChange={(e) => handleInputChange('report', 'format', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="pdf">PDF</option>
                                            <option value="excel">Excel</option>
                                            <option value="csv">CSV</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={reportForm.includeCharts}
                                            onChange={(e) => handleInputChange('report', 'includeCharts', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Incluir gráficos</label>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitReport}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Gerando...' : 'Gerar Relatório'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Exportar Dados */}
                            {modalType === 'export' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                                        <select
                                            value={exportForm.format}
                                            onChange={(e) => handleInputChange('export', 'format', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="json">JSON</option>
                                            <option value="csv">CSV</option>
                                            <option value="excel">Excel</option>
                                            <option value="pdf">PDF</option>
                                            <option value="xml">XML</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                                        <select
                                            value={exportForm.dateRange}
                                            onChange={(e) => handleInputChange('export', 'dateRange', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="all">Todos os dados</option>
                                            <option value="last_month">Último mês</option>
                                            <option value="last_quarter">Último trimestre</option>
                                            <option value="last_year">Último ano</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={exportForm.includeInactive}
                                            onChange={(e) => handleInputChange('export', 'includeInactive', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Incluir inativos</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={exportForm.includeDetails}
                                            onChange={(e) => handleInputChange('export', 'includeDetails', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Incluir detalhes completos</label>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitExport}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Exportando...' : 'Exportar Dados'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Importar Dados */}
                            {modalType === 'import' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo</label>
                                        <input
                                            type="file"
                                            onChange={(e) => handleInputChange('import', 'file', e.target.files?.[0])}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            accept=".json,.csv,.xlsx,.xml"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={importForm.updateExisting}
                                            onChange={(e) => handleInputChange('import', 'updateExisting', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Atualizar registros existentes</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={importForm.createMissing}
                                            onChange={(e) => handleInputChange('import', 'createMissing', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Criar registros ausentes</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={importForm.validateData}
                                            onChange={(e) => handleInputChange('import', 'validateData', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Validar dados antes da importação</label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={importForm.createBackup}
                                            onChange={(e) => handleInputChange('import', 'createBackup', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Criar backup antes da importação</label>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSubmitImport}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Importando...' : 'Importar Dados'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Gerenciar Usuários */}
                            {modalType === 'manage-users' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Usuários do Sistema</h4>
                                        <div className="space-y-2">
                                            {recentUsers.map((user) => (
                                                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-medium text-blue-600">{user.avatar}</span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{user.name}</p>
                                                            <p className="text-sm text-gray-600">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button className="p-1 text-blue-600 hover:text-blue-800">
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-1 text-green-600 hover:text-green-800">
                                                            <Edit className="h-4 w-4" />
                                                        </button>
                                                        <button className="p-1 text-red-600 hover:text-red-800">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button
                                            onClick={() => {
                                                setModalType('new-user');
                                                setSelectedItem({ title: 'Novo Usuário' });
                                            }}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                                        >
                                            Adicionar Usuário
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Detalhes de Estatísticas */}
                            {modalType === 'stats-details' && selectedItem && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Valor:</span>
                                        <span className="font-medium">{selectedItem.value}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Mudança:</span>
                                        <span className={`font-medium ${selectedItem.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                            {selectedItem.change}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className="font-medium text-green-600">Ativo</span>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Detalhes de Usuário */}
                            {modalType === 'user-details' && selectedItem && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="font-medium">{selectedItem.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{selectedItem.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Cargo:</span>
                                        <span className="font-medium">{selectedItem.role}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Departamento:</span>
                                        <span className="font-medium">{selectedItem.department}</span>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Detalhes de Departamento */}
                            {modalType === 'department-details' && selectedItem && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="font-medium">{selectedItem.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Gerente:</span>
                                        <span className="font-medium">{selectedItem.manager}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Funcionários:</span>
                                        <span className="font-medium">{selectedItem.employees}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Orçamento:</span>
                                        <span className="font-medium">{selectedItem.budget}</span>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                        >
                                            Fechar
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 