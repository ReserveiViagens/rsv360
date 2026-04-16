'use client';

import { useState } from 'react';
import { useCampaigns, useCreateCampaign, useDeleteCampaign, useDuplicateCampaign } from '../hooks/useMarketing';

export default function CampaignsList() {
  const [filters, setFilters] = useState({ status: '', type: '', search: '', page: 1, limit: 10 });
  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', type: '', channel: '', budget: '' });

  const { data: campaignsData, isLoading } = useCampaigns(filters);
  const createMutation = useCreateCampaign();
  const deleteMutation = useDeleteCampaign();
  const duplicateMutation = useDuplicateCampaign();

  const handleCreate = async () => {
    if (!newCampaign.name || !newCampaign.type || !newCampaign.channel) return;

    await createMutation.mutateAsync({
      name: newCampaign.name,
      type: newCampaign.type,
      channel: newCampaign.channel,
      budget: newCampaign.budget ? parseFloat(newCampaign.budget) : undefined,
    });

    setNewCampaign({ name: '', type: '', channel: '', budget: '' });
    setShowCreate(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta campanha?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDuplicate = async (id: string) => {
    await duplicateMutation.mutateAsync(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de marketing</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Nova Campanha
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
          <option value="active">Ativa</option>
          <option value="paused">Pausada</option>
          <option value="completed">Concluída</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">Todos os Tipos</option>
          <option value="promotional">Promocional</option>
          <option value="nurture">Nutrição</option>
          <option value="reactivation">Reativação</option>
          <option value="seasonal">Sazonal</option>
          <option value="launch">Lançamento</option>
        </select>

        <input
          type="text"
          placeholder="Buscar campanhas..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className="border rounded px-3 py-2 flex-1 min-w-64"
        />
      </div>

      {/* Form de criação */}
      {showCreate && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Nova Campanha</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nome da campanha"
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              className="border rounded px-3 py-2"
            />
            <select
              value={newCampaign.type}
              onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Selecione o tipo</option>
              <option value="promotional">Promocional</option>
              <option value="nurture">Nutrição</option>
              <option value="reactivation">Reativação</option>
              <option value="seasonal">Sazonal</option>
              <option value="launch">Lançamento</option>
            </select>
            <select
              value={newCampaign.channel}
              onChange={(e) => setNewCampaign({ ...newCampaign, channel: e.target.value })}
              className="border rounded px-3 py-2"
            >
              <option value="">Selecione o canal</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="social">Social</option>
            </select>
            <input
              type="number"
              placeholder="Orçamento (opcional)"
              value={newCampaign.budget}
              onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
              className="border rounded px-3 py-2"
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

      {/* Lista de campanhas */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">Nome</th>
              <th className="text-left p-4">Tipo</th>
              <th className="text-left p-4">Canal</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Orçamento</th>
              <th className="text-left p-4">Criado em</th>
              <th className="text-left p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center p-8">
                  <p className="text-muted-foreground">Carregando campanhas...</p>
                </td>
              </tr>
            ) : campaignsData?.campaigns?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8">
                  <p className="text-muted-foreground">Nenhuma campanha encontrada.</p>
                </td>
              </tr>
            ) : (
              campaignsData?.campaigns?.map((campaign) => (
                <tr key={campaign.id} className="border-t">
                  <td className="p-4 font-medium">{campaign.name}</td>
                  <td className="p-4">{campaign.type}</td>
                  <td className="p-4">{campaign.channel}</td>
                  <td className="p-4">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="p-4">
                    {campaign.budget ? `R$ ${campaign.budget.toLocaleString('pt-BR')}` : '-'}
                  </td>
                  <td className="p-4">
                    {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDuplicate(campaign.id)}
                        disabled={duplicateMutation.isPending}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Duplicar
                      </button>
                      <button
                        onClick={() => handleDelete(campaign.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-800"
                      >
                        Deletar
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
      {campaignsData && campaignsData.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page <= 1}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {campaignsData.page} de {campaignsData.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= campaignsData.totalPages}
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
    active: 'bg-green-100 text-green-800',
    draft: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    sent: 'bg-green-100 text-green-800',
    scheduled: 'bg-purple-100 text-purple-800',
    archived: 'bg-red-100 text-red-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}

export { CampaignsList };