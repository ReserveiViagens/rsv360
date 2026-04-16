'use client';

import { useState } from 'react';
import { useFunnels, useFunnelReport, useCreateFunnel, useDeleteFunnel } from '../hooks/useMarketing';
import type { FunnelStage } from '../types';

export default function FunnelsView() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFunnel, setSelectedFunnel] = useState<string | null>(null);
  const [newFunnel, setNewFunnel] = useState({
    name: '',
    description: '',
    stages: [{ id: 'lead', name: 'Lead', type: 'entry', order: 1 }, { id: 'qualified', name: 'Qualificado', type: 'middle', order: 2 }]
  });

  const { data: funnelsData, isLoading } = useFunnels();
  const { data: reportData } = useFunnelReport(selectedFunnel || '');
  const createMutation = useCreateFunnel();
  const deleteMutation = useDeleteFunnel();

  const handleCreate = async () => {
    if (!newFunnel.name || newFunnel.stages.length < 2) return;

    await createMutation.mutateAsync({
      name: newFunnel.name,
      description: newFunnel.description || undefined,
      stages: newFunnel.stages,
    });

    setNewFunnel({
      name: '',
      description: '',
      stages: [{ id: '1', name: 'Lead', type: 'lead', order: 1 }, { id: '2', name: 'Qualificado', type: 'qualified', order: 2 }]
    });
    setShowCreate(false);
  };

  const addStage = () => {
    const newOrder = newFunnel.stages.length + 1;
    setNewFunnel({
      ...newFunnel,
      stages: [...newFunnel.stages, { id: `stage-${Date.now()}`, name: `Stage ${newOrder}`, type: 'stage', order: newOrder }]
    });
  };

  const removeStage = (index: number) => {
    if (newFunnel.stages.length <= 2) return; // Minimum 2 stages
    setNewFunnel({
      ...newFunnel,
      stages: newFunnel.stages.filter((_, i) => i !== index).map((stage, i) => ({ ...stage, order: i + 1 }))
    });
  };

  const updateStage = (index: number, field: keyof FunnelStage, value: string | number) => {
    const updatedStages = [...newFunnel.stages];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setNewFunnel({ ...newFunnel, stages: updatedStages });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este funil?')) {
      await deleteMutation.mutateAsync(id);
      if (selectedFunnel === id) setSelectedFunnel(null);
    }
  };

  const selectedFunnelData = funnelsData?.funnels?.find(f => f.id === selectedFunnel);
  const parsedStages = selectedFunnelData ? (typeof selectedFunnelData.stages === 'string' ? JSON.parse(selectedFunnelData.stages) : selectedFunnelData.stages) : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funis de Conversão</h1>
          <p className="text-muted-foreground">Visualize e gerencie seus funis de marketing</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md"
        >
          Novo Funil
        </button>
      </div>

      {/* Form de criação */}
      {showCreate && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-lg font-semibold mb-4">Novo Funil</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nome do funil"
              value={newFunnel.name}
              onChange={(e) => setNewFunnel({ ...newFunnel, name: e.target.value })}
              className="border rounded px-3 py-2 w-full"
            />
            <textarea
              placeholder="Descrição (opcional)"
              value={newFunnel.description}
              onChange={(e) => setNewFunnel({ ...newFunnel, description: e.target.value })}
              className="border rounded px-3 py-2 w-full"
              rows={2}
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Stages ({newFunnel.stages.length})</h4>
                <button
                  onClick={addStage}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Adicionar Stage
                </button>
              </div>

              <div className="space-y-2">
                {newFunnel.stages.map((stage, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Nome do stage"
                      value={stage.name}
                      onChange={(e) => updateStage(index, 'name', e.target.value)}
                      className="border rounded px-3 py-2 flex-1"
                    />
                    <select
                      value={stage.type}
                      onChange={(e) => updateStage(index, 'type', e.target.value)}
                      className="border rounded px-3 py-2"
                    >
                      <option value="lead">Lead</option>
                      <option value="qualified">Qualificado</option>
                      <option value="proposal">Proposta</option>
                      <option value="closed">Fechado</option>
                      <option value="stage">Stage</option>
                    </select>
                    {newFunnel.stages.length > 2 && (
                      <button
                        onClick={() => removeStage(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
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
        </div>
      )}

      {/* Lista de funis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Carregando funis...</p>
          </div>
        ) : funnelsData?.funnels?.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Nenhum funil encontrado.</p>
          </div>
        ) : (
          funnelsData?.funnels?.map((funnel) => (
            <div key={funnel.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{funnel.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  funnel.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {funnel.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              {funnel.description && (
                <p className="text-sm text-muted-foreground mb-3">{funnel.description}</p>
              )}
              <div className="text-sm space-y-1 mb-4">
                <p>Total Leads: {funnel.totalLeads}</p>
                <p>Taxa Conversão: {funnel.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFunnel(selectedFunnel === funnel.id ? null : funnel.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {selectedFunnel === funnel.id ? 'Ocultar' : 'Ver Stages'}
                </button>
                <button className="text-gray-600 hover:text-gray-800 text-sm">
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(funnel.id)}
                  disabled={deleteMutation.isPending}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Deletar
                </button>
              </div>

              {/* Visualização dos stages */}
              {selectedFunnel === funnel.id && (
                <div className="mt-4 pt-4 border-t">
                  <StagePipeline stages={parsedStages} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StagePipeline({ stages }: { stages: FunnelStage[] }) {
  const sorted = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-4">
      {sorted.map((stage, i) => (
        <div key={stage.id} className="flex items-center gap-2">
          <div className="px-4 py-3 bg-primary/10 border border-primary/30 rounded-lg text-center min-w-[120px]">
            <p className="font-medium text-sm">{stage.name}</p>
            <p className="text-xs text-muted-foreground">{stage.type}</p>
          </div>
          {i < sorted.length - 1 && <span className="text-muted-foreground">→</span>}
        </div>
      ))}
    </div>
  );
}
export { FunnelsView };