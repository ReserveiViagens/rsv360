import React, { useState } from 'react';
import { 
    Zap, 
    Play, 
    Pause, 
    Settings, 
    Clock, 
    Calendar,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Activity,
    Database,
    Cpu,
    Workflow,
    Bot,
    Smartphone,
    Monitor,
    Server,
    Cloud,
    Shield,
    BarChart3,
    FileText,
    Users,
    Building,
    Plus,
    Edit,
    Trash2,
    Eye,
    X,
    RefreshCw
} from 'lucide-react';
import NavigationButtons from '../components/NavigationButtons';

export default function Automacao() {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // Estados para formulários
    const [newWorkflowForm, setNewWorkflowForm] = useState({
        name: '',
        description: '',
        trigger: '',
        actions: '',
        status: 'active'
    });

    const [newTriggerForm, setNewTriggerForm] = useState({
        name: '',
        type: '',
        condition: '',
        schedule: '',
        status: 'active'
    });

    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const statsCards = [
        {
            id: 1,
            title: 'Workflows Ativos',
            value: '24',
            change: '+3',
            changeType: 'positive',
            icon: Workflow,
            color: 'bg-blue-500'
        },
        {
            id: 2,
            title: 'Triggers Configurados',
            value: '156',
            change: '+12',
            changeType: 'positive',
            icon: Zap,
            color: 'bg-green-500'
        },
        {
            id: 3,
            title: 'Execuções Hoje',
            value: '1,847',
            change: '+23%',
            changeType: 'positive',
            icon: Activity,
            color: 'bg-purple-500'
        },
        {
            id: 4,
            title: 'Taxa de Sucesso',
            value: '98.5%',
            change: '+1.2%',
            changeType: 'positive',
            icon: CheckCircle,
            color: 'bg-orange-500'
        },
        {
            id: 5,
            title: 'Tempo Médio',
            value: '2.3s',
            change: '-0.5s',
            changeType: 'positive',
            icon: Clock,
            color: 'bg-red-500'
        },
        {
            id: 6,
            title: 'Dispositivos',
            value: '89',
            change: '+5',
            changeType: 'positive',
            icon: Smartphone,
            color: 'bg-indigo-500'
        }
    ];

    const quickActions = [
        {
            id: 1,
            title: 'Novo Workflow',
            description: 'Criar novo workflow de automação',
            icon: Workflow,
            color: 'bg-blue-500',
            action: 'new-workflow'
        },
        {
            id: 2,
            title: 'Novo Trigger',
            description: 'Configurar novo trigger',
            icon: Zap,
            color: 'bg-green-500',
            action: 'new-trigger'
        },
        {
            id: 3,
            title: 'Configurações',
            description: 'Gerenciar configurações de automação',
            icon: Settings,
            color: 'bg-purple-500',
            action: 'settings'
        },
        {
            id: 4,
            title: 'Monitoramento',
            description: 'Monitorar execuções em tempo real',
            icon: Monitor,
            color: 'bg-orange-500',
            action: 'monitoring'
        },
        {
            id: 5,
            title: 'Relatórios',
            description: 'Gerar relatórios de automação',
            icon: BarChart3,
            color: 'bg-teal-500',
            action: 'reports'
        },
        {
            id: 6,
            title: 'Dispositivos',
            description: 'Gerenciar dispositivos conectados',
            icon: Smartphone,
            color: 'bg-pink-500',
            action: 'devices'
        },
        {
            id: 7,
            title: 'Integrações',
            description: 'Configurar integrações externas',
            icon: Cloud,
            color: 'bg-yellow-500',
            action: 'integrations'
        }
    ];

    const recentWorkflows = [
        {
            id: 1,
            name: 'Backup Automático',
            status: 'active',
            lastRun: '2 min atrás',
            successRate: '99.2%',
            icon: Database
        },
        {
            id: 2,
            name: 'Notificações',
            status: 'active',
            lastRun: '5 min atrás',
            successRate: '98.7%',
            icon: AlertCircle
        },
        {
            id: 3,
            name: 'Sincronização',
            status: 'paused',
            lastRun: '1 hora atrás',
            successRate: '95.1%',
            icon: RefreshCw
        },
        {
            id: 4,
            name: 'Relatórios Diários',
            status: 'active',
            lastRun: '2 horas atrás',
            successRate: '100%',
            icon: FileText
        }
    ];

    const activeTriggers = [
        {
            id: 1,
            name: 'Novo Usuário',
            type: 'Event',
            frequency: 'Instant',
            status: 'active',
            icon: Users
        },
        {
            id: 2,
            name: 'Backup Diário',
            type: 'Schedule',
            frequency: 'Daily',
            status: 'active',
            icon: Calendar
        },
        {
            id: 3,
            name: 'Limpeza Semanal',
            type: 'Schedule',
            frequency: 'Weekly',
            status: 'active',
            icon: Trash2
        },
        {
            id: 4,
            name: 'Monitoramento',
            type: 'Condition',
            frequency: 'Continuous',
            status: 'active',
            icon: Monitor
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

    const handleWorkflowClick = (workflow: any) => {
        setSelectedItem(workflow);
        setModalType('workflow-details');
        setShowModal(true);
    };

    const handleTriggerClick = (trigger: any) => {
        setSelectedItem(trigger);
        setModalType('trigger-details');
        setShowModal(true);
    };

    // Funções de validação
    const validateForm = (formType: string) => {
        const errors: any = {};
        let form: any;

        if (formType === 'workflow') {
            form = newWorkflowForm;
            if (!form.name.trim()) errors.name = 'Nome é obrigatório';
            if (!form.description.trim()) errors.description = 'Descrição é obrigatória';
            if (!form.trigger.trim()) errors.trigger = 'Trigger é obrigatório';
        } else if (formType === 'trigger') {
            form = newTriggerForm;
            if (!form.name.trim()) errors.name = 'Nome é obrigatório';
            if (!form.type.trim()) errors.type = 'Tipo é obrigatório';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Funções de submissão
    const handleSubmitWorkflow = () => {
        if (validateForm('workflow')) {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setShowModal(false);
                setNewWorkflowForm({ name: '', description: '', trigger: '', actions: '', status: 'active' });
                alert('Workflow criado com sucesso!');
            }, 1000);
        }
    };

    const handleSubmitTrigger = () => {
        if (validateForm('trigger')) {
            setIsSubmitting(true);
            setTimeout(() => {
                setIsSubmitting(false);
                setShowModal(false);
                setNewTriggerForm({ name: '', type: '', condition: '', schedule: '', status: 'active' });
                alert('Trigger criado com sucesso!');
            }, 1000);
        }
    };

    // Funções de input
    const handleInputChange = (formType: string, field: string, value: any) => {
        if (formType === 'workflow') {
            setNewWorkflowForm(prev => ({ ...prev, [field]: value }));
        } else if (formType === 'trigger') {
            setNewTriggerForm(prev => ({ ...prev, [field]: value }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Automação</h1>
                            <p className="mt-2 text-gray-600">Gerencie workflows, triggers e automações do sistema</p>
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

                {/* Recent Workflows and Active Triggers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Workflows */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Workflows Recentes</h3>
                        </div>
                        <div className="p-6">
                            {recentWorkflows.map((workflow) => (
                                <div
                                    key={workflow.id}
                                    onClick={() => handleWorkflowClick(workflow)}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <workflow.icon className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{workflow.name}</p>
                                            <p className="text-sm text-gray-600">Última execução: {workflow.lastRun}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${workflow.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {workflow.status === 'active' ? 'Ativo' : 'Pausado'}
                                        </p>
                                        <p className="text-sm text-gray-600">{workflow.successRate}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Active Triggers */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Triggers Ativos</h3>
                        </div>
                        <div className="p-6">
                            {activeTriggers.map((trigger) => (
                                <div
                                    key={trigger.id}
                                    onClick={() => handleTriggerClick(trigger)}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <trigger.icon className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{trigger.name}</p>
                                            <p className="text-sm text-gray-600">{trigger.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-green-600">Ativo</p>
                                        <p className="text-sm text-gray-600">{trigger.frequency}</p>
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
                                    {modalType === 'new-workflow' && 'Novo Workflow'}
                                    {modalType === 'new-trigger' && 'Novo Trigger'}
                                    {modalType === 'settings' && 'Configurações de Automação'}
                                    {modalType === 'monitoring' && 'Monitoramento'}
                                    {modalType === 'reports' && 'Relatórios de Automação'}
                                    {modalType === 'devices' && 'Dispositivos'}
                                    {modalType === 'integrations' && 'Integrações'}
                                    {modalType === 'stats-details' && `Detalhes de ${selectedItem?.title}`}
                                    {modalType === 'workflow-details' && 'Detalhes do Workflow'}
                                    {modalType === 'trigger-details' && 'Detalhes do Trigger'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            {/* Formulário - Novo Workflow */}
                            {modalType === 'new-workflow' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Workflow</label>
                                        <input
                                            type="text"
                                            value={newWorkflowForm.name}
                                            onChange={(e) => handleInputChange('workflow', 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do workflow"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                        <textarea
                                            value={newWorkflowForm.description}
                                            onChange={(e) => handleInputChange('workflow', 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Descrição do workflow"
                                        />
                                        {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                                        <select
                                            value={newWorkflowForm.trigger}
                                            onChange={(e) => handleInputChange('workflow', 'trigger', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione um trigger</option>
                                            <option value="new-user">Novo Usuário</option>
                                            <option value="backup-daily">Backup Diário</option>
                                            <option value="cleanup-weekly">Limpeza Semanal</option>
                                            <option value="monitoring">Monitoramento</option>
                                        </select>
                                        {formErrors.trigger && <p className="text-red-500 text-sm mt-1">{formErrors.trigger}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ações</label>
                                        <textarea
                                            value={newWorkflowForm.actions}
                                            onChange={(e) => handleInputChange('workflow', 'actions', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={3}
                                            placeholder="Ações do workflow"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={newWorkflowForm.status}
                                            onChange={(e) => handleInputChange('workflow', 'status', e.target.value)}
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
                                            onClick={handleSubmitWorkflow}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Criando...' : 'Criar Workflow'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Formulário - Novo Trigger */}
                            {modalType === 'new-trigger' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Trigger</label>
                                        <input
                                            type="text"
                                            value={newTriggerForm.name}
                                            onChange={(e) => handleInputChange('trigger', 'name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Nome do trigger"
                                        />
                                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                        <select
                                            value={newTriggerForm.type}
                                            onChange={(e) => handleInputChange('trigger', 'type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Selecione o tipo</option>
                                            <option value="event">Evento</option>
                                            <option value="schedule">Agendamento</option>
                                            <option value="condition">Condição</option>
                                        </select>
                                        {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Condição</label>
                                        <input
                                            type="text"
                                            value={newTriggerForm.condition}
                                            onChange={(e) => handleInputChange('trigger', 'condition', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Condição do trigger"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Agendamento</label>
                                        <input
                                            type="text"
                                            value={newTriggerForm.schedule}
                                            onChange={(e) => handleInputChange('trigger', 'schedule', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Cron expression"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={newTriggerForm.status}
                                            onChange={(e) => handleInputChange('trigger', 'status', e.target.value)}
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
                                            onClick={handleSubmitTrigger}
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Criando...' : 'Criar Trigger'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Configurações */}
                            {modalType === 'settings' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Configurações de Automação</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Execução Paralela</span>
                                                <span className="font-medium text-green-600">Ativado</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Timeout Padrão</span>
                                                <span className="font-medium">30 segundos</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Retry Automático</span>
                                                <span className="font-medium text-green-600">Ativado</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Logs Detalhados</span>
                                                <span className="font-medium text-green-600">Ativado</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                                            Salvar Configurações
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Monitoramento */}
                            {modalType === 'monitoring' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Monitoramento em Tempo Real</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Workflows Ativos</span>
                                                <span className="font-medium text-green-600">24</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Execuções/Minuto</span>
                                                <span className="font-medium">156</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Taxa de Sucesso</span>
                                                <span className="font-medium text-green-600">98.5%</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Erros (24h)</span>
                                                <span className="font-medium text-red-600">3</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700">
                                            Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Relatórios */}
                            {modalType === 'reports' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Relatórios de Automação</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Execuções (7 dias)</span>
                                                <span className="font-medium">12,847</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Tempo Médio</span>
                                                <span className="font-medium">2.3s</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Economia de Tempo</span>
                                                <span className="font-medium text-green-600">127h</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Workflows Criados</span>
                                                <span className="font-medium">24</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                                            Gerar Relatório
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Dispositivos */}
                            {modalType === 'devices' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Dispositivos Conectados</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Servidores</span>
                                                <span className="font-medium">12</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Dispositivos IoT</span>
                                                <span className="font-medium">45</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Mobile</span>
                                                <span className="font-medium">32</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Online</span>
                                                <span className="font-medium text-green-600">89</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
                                            Gerenciar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Integrações */}
                            {modalType === 'integrations' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Integrações Externas</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">APIs Conectadas</span>
                                                <span className="font-medium">8</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Webhooks</span>
                                                <span className="font-medium">15</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Sistemas</span>
                                                <span className="font-medium">6</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Status</span>
                                                <span className="font-medium text-green-600">Todas Ativas</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                        >
                                            Fechar
                                        </button>
                                        <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                            Configurar
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

                            {/* Detalhes de Workflow */}
                            {modalType === 'workflow-details' && selectedItem && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="font-medium">{selectedItem.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`font-medium ${selectedItem.status === 'active' ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedItem.status === 'active' ? 'Ativo' : 'Pausado'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Última Execução:</span>
                                        <span className="font-medium">{selectedItem.lastRun}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Taxa de Sucesso:</span>
                                        <span className="font-medium">{selectedItem.successRate}</span>
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

                            {/* Detalhes de Trigger */}
                            {modalType === 'trigger-details' && selectedItem && (
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nome:</span>
                                        <span className="font-medium">{selectedItem.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tipo:</span>
                                        <span className="font-medium">{selectedItem.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Frequência:</span>
                                        <span className="font-medium">{selectedItem.frequency}</span>
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 