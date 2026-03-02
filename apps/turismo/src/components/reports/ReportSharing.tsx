import React, { useState } from 'react';
import { Share2, Mail, Link, Users, Calendar, Lock, Globe } from 'lucide-react';

interface SharePermission {
  id: string;
  type: 'user' | 'group' | 'public';
  name: string;
  email?: string;
  permission: 'view' | 'download' | 'edit';
  expiresAt?: Date;
}

interface ReportSharingProps {
  reportId?: string;
  reportName?: string;
  className?: string;
  onShare?: (permissions: SharePermission[]) => void;
}

const ReportSharing: React.FC<ReportSharingProps> = ({ 
  reportId = '1',
  reportName = 'Relatório de Vendas',
  className = '',
  onShare
}) => {
  const [shareUrl, setShareUrl] = useState('');
  const [permissions, setPermissions] = useState<SharePermission[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [newShareEmail, setNewShareEmail] = useState('');
  const [newSharePermission, setNewSharePermission] = useState<'view' | 'download' | 'edit'>('view');
  const [expirationDays, setExpirationDays] = useState<number>(7);

  const generateShareUrl = () => {
    const baseUrl = window.location.origin;
    const token = Math.random().toString(36).substring(2, 15);
    const url = `${baseUrl}/shared-reports/${reportId}?token=${token}`;
    setShareUrl(url);
  };

  const addUserPermission = () => {
    if (!newShareEmail) return;

    const newPermission: SharePermission = {
      id: Math.random().toString(36).substring(2, 15),
      type: 'user',
      name: newShareEmail.split('@')[0],
      email: newShareEmail,
      permission: newSharePermission,
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
    };

    setPermissions(prev => [...prev, newPermission]);
    setNewShareEmail('');
  };

  const removePermission = (permissionId: string) => {
    setPermissions(prev => prev.filter(p => p.id !== permissionId));
  };

  const updatePermission = (permissionId: string, newPermissionLevel: 'view' | 'download' | 'edit') => {
    setPermissions(prev => 
      prev.map(p => 
        p.id === permissionId 
          ? { ...p, permission: newPermissionLevel }
          : p
      )
    );
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aqui você pode adicionar uma notificação de sucesso
      console.log('Link copiado!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const sendEmailInvite = (permission: SharePermission) => {
    if (!permission.email) return;
    
    const subject = `Compartilhamento: ${reportName}`;
    const body = `Olá,\n\nVocê foi convidado(a) para acessar o relatório "${reportName}".\n\nAcesse através do link: ${shareUrl}\n\nPermissões: ${permission.permission}\nExpira em: ${permission.expiresAt?.toLocaleDateString('pt-BR')}\n\nAtenciosamente,\nEquipe RSV`;
    
    const mailtoUrl = `mailto:${permission.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const getPermissionBadge = (permission: string) => {
    const configs = {
      view: { color: 'bg-blue-100 text-blue-800', label: 'Visualizar' },
      download: { color: 'bg-green-100 text-green-800', label: 'Download' },
      edit: { color: 'bg-purple-100 text-purple-800', label: 'Editar' }
    };
    
    const config = configs[permission as keyof typeof configs];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Compartilhar Relatório</h3>
        <p className="text-gray-600">Compartilhe "{reportName}" com outros usuários</p>
      </div>

      {/* Configurações de Visibilidade */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Configurações de Visibilidade</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Acesso Público</p>
                <p className="text-sm text-gray-500">Qualquer pessoa com o link pode acessar</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {isPublic && (
            <div className="ml-8 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  placeholder="Clique em 'Gerar Link' para criar um link de compartilhamento"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
                <button
                  onClick={generateShareUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Gerar Link
                </button>
                {shareUrl && (
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Link className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Adicionar Usuários */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Compartilhar com Usuários</h4>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Digite o email do usuário"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newShareEmail}
              onChange={(e) => setNewShareEmail(e.target.value)}
            />
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newSharePermission}
              onChange={(e) => setNewSharePermission(e.target.value as 'view' | 'download' | 'edit')}
            >
              <option value="view">Visualizar</option>
              <option value="download">Download</option>
              <option value="edit">Editar</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
            >
              <option value={1}>1 dia</option>
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
              <option value={90}>90 dias</option>
              <option value={365}>1 ano</option>
            </select>
            <button
              onClick={addUserPermission}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Permissões */}
      {permissions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Usuários com Acesso</h4>
          
          <div className="space-y-3">
            {permissions.map((permission) => (
              <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{permission.name}</p>
                    <p className="text-sm text-gray-500">{permission.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={permission.permission}
                    onChange={(e) => updatePermission(permission.id, e.target.value as 'view' | 'download' | 'edit')}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="view">Visualizar</option>
                    <option value="download">Download</option>
                    <option value="edit">Editar</option>
                  </select>

                  <div className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {permission.expiresAt?.toLocaleDateString('pt-BR')}
                  </div>

                  <button
                    onClick={() => sendEmailInvite(permission)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Enviar convite por email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => removePermission(permission.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover acesso"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => onShare?.(permissions)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Salvar Configurações
        </button>
      </div>
    </div>
  );
};

export default ReportSharing;
