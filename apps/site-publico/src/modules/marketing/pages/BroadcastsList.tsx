'use client';

import { useState } from 'react';
import { useBroadcasts, useCreateBroadcast, useScheduleBroadcast } from '../hooks/useMarketing';

export default function BroadcastsList() {
  const [filters, setFilters] = useState({ status: '', channel: '', page: 1, limit: 10 });
  const [showCreate, setShowCreate] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ name: '', channel: '', content: '', subject: '', campaignId: '' });

  const { data: broadcastsData, isLoading } = useBroadcasts(filters);
  const createMutation = useCreateBroadcast();
  const scheduleMutation = useScheduleBroadcast();

  const handleCreate = async () => {
    if (!newBroadcast.name || !newBroadcast.channel || !newBroadcast.content) return;

    await createMutation.mutateAsync({
      name: newBroadcast.name,
      channel: newBroadcast.channel as 'email' | 'whatsapp' | 'sms' | 'push',
      content: newBroadcast.content,
      subject: newBroadcast.subject || undefined,
      campaignId: newBroadcast.campaignId || undefined,
    });

    setNewBroadcast({ name: '', channel: '', content: '', subject: '', campaignId: '' });
    setShowCreate(false);
  };

  const handleSchedule = async (id: string) => {
    const scheduledAt = prompt('Digite a data e hora para agendamento (YYYY-MM-DDTHH:mm):');
    if (scheduledAt) {
      await scheduleMutation.mutateAsync({ id, scheduledAt });
    }
  };

  const getChannelEmoji = (channel: string) => {
    switch (channel) {
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      case 'sms': return '📱';
      case 'push': return '🔔';
      default: return '📢';
    }
  };

  const calculateRate = (value: number, total: number) => {
    if (total === 0) return '0.0%';
    return (value / total * 100).toFixed(1) + '%';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Broadcasts</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de broadcast</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Novo Broadcast
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os Status</option>
          <option value="draft">Rascunho</option>
          <option value="scheduled">Agendado</option>
          <option value="sending">Enviando</option>
          <option value="sent">Enviado</option>
          <option value="failed">Falhou</option>
        </select>

        <select
          value={filters.channel}
          onChange={(e) => setFilters({ ...filters, channel: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os Canais</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="push">Push</option>
        </select>
      </div>

      {/* Form de criação */}
      {showCreate && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Novo Broadcast</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome do broadcast"
              value={newBroadcast.name}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, name: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <select
              value={newBroadcast.channel}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, channel: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Selecione o canal</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
            </select>
            {newBroadcast.channel === 'email' && (
              <input
                type="text"
                placeholder="Assunto"
                value={newBroadcast.subject}
                onChange={(e) => setNewBroadcast({ ...newBroadcast, subject: e.target.value })}
                className="border rounded px-3 py-2"
              />
            )}
            <input
              type="text"
              placeholder="ID da campanha (opcional)"
              value={newBroadcast.campaignId}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, campaignId: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <textarea
              placeholder="Conteúdo da mensagem"
              value={newBroadcast.content}
              onChange={(e) => setNewBroadcast({ ...newBroadcast, content: e.target.value })}
              className="border rounded px-3 py-2 md:col-span-2"
              rows={3}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
            >
              {createMutation.isPending ? 'Criando...' : 'Criar'}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="border px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de broadcasts */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Canal</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Recipients</th>
              <th className="text-left p-4">Open Rate</th>
              <th className="text-left p-4">Click Rate</th>
              <th className="text-left p-4">Data Envio</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center p-8">
                  <p className="text-muted-foreground">Carregando broadcasts...</p>
                </td>
              </tr>
            ) : broadcastsData?.broadcasts?.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8">
                  <p className="text-muted-foreground">Nenhum broadcast encontrado.</p>
                </td>
              </tr>
            ) : (
              broadcastsData?.broadcasts?.map((broadcast) => (
                <tr key={broadcast.id} className="border-t">
                  <td className="p-4 font-medium">{broadcast.name}</td>
                  <td className="p-4">{getChannelEmoji(broadcast.channel)} {broadcast.channel}</td>
                  <td className="p-4">
                    <StatusBadge status={broadcast.status} />
                  </td>
                  <td className="p-4">{broadcast.totalRecipients}</td>
                  <td className="p-4">{calculateRate(broadcast.opened, broadcast.totalRecipients)}</td>
                  <td className="p-4">{calculateRate(broadcast.clicked, broadcast.totalRecipients)}</td>
                  <td className="p-4">
                    {broadcast.sentAt ? new Date(broadcast.sentAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {broadcast.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleSchedule(broadcast.id)}
                            disabled={scheduleMutation.isPending}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Agendar
                          </button>
                          <button className="text-gray-600 hover:text-gray-800">
                            Editar
                          </button>
                        </>
                      )}
                      {broadcast.status === 'scheduled' && (
                        <button className="text-green-600 hover:text-green-800">
                          Executar
                        </button>
                      )}
                      <button className="text-purple-600 hover:text-purple-800">
                        Detalhes
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {broadcastsData && broadcastsData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page <= 1}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {broadcastsData.page} de {broadcastsData.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= broadcastsData.totalPages}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-purple-100 text-purple-800',
    sending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export { BroadcastsList };