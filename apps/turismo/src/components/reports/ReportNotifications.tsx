import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, Settings, Check, X, Clock, AlertCircle } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  trigger: 'completion' | 'failure' | 'schedule' | 'threshold';
  enabled: boolean;
  conditions: {
    reportTypes?: string[];
    users?: string[];
    schedule?: string;
    threshold?: { metric: string; value: number; operator: '>' | '<' | '=' };
  };
  recipients: string[];
  template?: string;
}

interface ReportNotificationsProps {
  className?: string;
}

const ReportNotifications: React.FC<ReportNotificationsProps> = ({ className = '' }) => {
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRule, setNewRule] = useState<Partial<NotificationRule>>({
    name: '',
    type: 'email',
    trigger: 'completion',
    enabled: true,
    conditions: {},
    recipients: []
  });

  // Mock data - substitua por chamada real à API
  useEffect(() => {
    const mockRules: NotificationRule[] = [
      {
        id: '1',
        name: 'Relatórios de Vendas Concluídos',
        type: 'email',
        trigger: 'completion',
        enabled: true,
        conditions: {
          reportTypes: ['vendas'],
          users: ['admin', 'gerente-vendas']
        },
        recipients: ['admin@empresa.com', 'vendas@empresa.com'],
        template: 'default-completion'
      },
      {
        id: '2',
        name: 'Falhas em Relatórios Críticos',
        type: 'push',
        trigger: 'failure',
        enabled: true,
        conditions: {
          reportTypes: ['vendas', 'financeiro']
        },
        recipients: ['admin@empresa.com'],
        template: 'error-alert'
      },
      {
        id: '3',
        name: 'Relatório Semanal - Segunda-feira',
        type: 'email',
        trigger: 'schedule',
        enabled: false,
        conditions: {
          schedule: '0 9 * * 1' // Segunda-feira às 9h
        },
        recipients: ['equipe@empresa.com'],
        template: 'weekly-summary'
      }
    ];

    setRules(mockRules);
  }, []);

  const toggleRule = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const deleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const addRule = () => {
    if (!newRule.name || !newRule.recipients?.length) return;

    const rule: NotificationRule = {
      id: Math.random().toString(36).substring(2, 15),
      name: newRule.name,
      type: newRule.type || 'email',
      trigger: newRule.trigger || 'completion',
      enabled: newRule.enabled || true,
      conditions: newRule.conditions || {},
      recipients: newRule.recipients || []
    };

    setRules(prev => [...prev, rule]);
    setNewRule({
      name: '',
      type: 'email',
      trigger: 'completion',
      enabled: true,
      conditions: {},
      recipients: []
    });
    setShowCreateForm(false);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      sms: <Smartphone className="w-4 h-4" />,
      push: <Bell className="w-4 h-4" />,
      'in-app': <AlertCircle className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Bell className="w-4 h-4" />;
  };

  const getTriggerBadge = (trigger: string) => {
    const triggers = {
      completion: { color: 'bg-green-100 text-green-800', label: 'Conclusão' },
      failure: { color: 'bg-red-100 text-red-800', label: 'Falha' },
      schedule: { color: 'bg-blue-100 text-blue-800', label: 'Agendado' },
      threshold: { color: 'bg-yellow-100 text-yellow-800', label: 'Limite' }
    };

    const config = triggers[trigger as keyof typeof triggers];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Notificações de Relatórios</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Nova Regra
          </button>
        </div>
        <p className="text-gray-600">Configure quando e como receber notificações sobre relatórios</p>
      </div>

      {/* Formulário de Criação */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Nova Regra de Notificação</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Regra</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newRule.name || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Relatórios de vendas concluídos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Notificação</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newRule.type || 'email'}
                onChange={(e) => setNewRule(prev => ({ ...prev, type: e.target.value as 'email' | 'sms' | 'push' | 'in-app' }))}
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="push">Push Notification</option>
                <option value="in-app">In-App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newRule.trigger || 'completion'}
                onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value as 'completion' | 'failure' | 'schedule' | 'threshold' }))}
              >
                <option value="completion">Relatório Concluído</option>
                <option value="failure">Falha no Relatório</option>
                <option value="schedule">Agendamento</option>
                <option value="threshold">Limite Atingido</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destinatários (separados por vírgula)</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={newRule.recipients?.join(', ') || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, recipients: e.target.value.split(',').map(email => email.trim()) }))}
                placeholder="email1@empresa.com, email2@empresa.com"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={addRule}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Regra
            </button>
          </div>
        </div>
      )}

      {/* Lista de Regras */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma regra de notificação configurada</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Regra
            </button>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${rule.enabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    {getTypeIcon(rule.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {getTriggerBadge(rule.trigger)}
                      <span className="text-sm text-gray-500">
                        {rule.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={rule.enabled}
                      onChange={() => toggleRule(rule.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir regra"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  <strong>Destinatários:</strong> {rule.recipients.join(', ')}
                </p>
                {rule.conditions.reportTypes && (
                  <p className="mb-2">
                    <strong>Tipos de Relatório:</strong> {rule.conditions.reportTypes.join(', ')}
                  </p>
                )}
                {rule.conditions.schedule && (
                  <p className="mb-2">
                    <strong>Agendamento:</strong> {rule.conditions.schedule}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReportNotifications;
