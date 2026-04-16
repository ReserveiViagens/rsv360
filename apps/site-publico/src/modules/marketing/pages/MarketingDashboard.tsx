import { useDashboardOverview, useCampaignStats, useCampaigns, useBroadcasts } from '../hooks/useMarketing';

export default function MarketingDashboard() {
  const { data: overview, isLoading: loadingOverview } = useDashboardOverview();
  const { data: campaignStats } = useCampaignStats();
  const { data: recentCampaigns } = useCampaigns({ limit: 5 });
  const { data: recentBroadcasts } = useBroadcasts({ limit: 5 });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing</h1>
          <p className="text-muted-foreground">Dashboard de marketing e comunicação</p>
        </div>
      </div>

      {/* KPI Cards - 4 cards em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Campanhas Ativas"
          value={campaignStats?.byStatus?.active ?? 0}
          subtitle={`${campaignStats?.total ?? 0} total`}
          icon="📢"
        />
        <KPICard
          title="Total Leads"
          value={overview?.totalLeads ?? 0}
          subtitle={`${overview?.conversionRate?.toFixed(1) ?? 0}% conversão`}
          icon="👥"
        />
        <KPICard
          title="Broadcasts Enviados"
          value={overview?.totalBroadcasts ?? 0}
          icon="📨"
        />
        <KPICard
          title="Orçamento Total"
          value={`R$ ${(overview?.totalBudget ?? 0).toLocaleString('pt-BR')}`}
          icon="💰"
        />
      </div>

      {/* Grid 2 colunas: Campanhas recentes + Broadcasts recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campanhas Recentes */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Campanhas Recentes</h2>
          {recentCampaigns?.campaigns?.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhuma campanha ainda.</p>
          )}
          <div className="space-y-3">
            {recentCampaigns?.campaigns?.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">{campaign.name}</p>
                  <p className="text-sm text-muted-foreground">{campaign.type} · {campaign.channel}</p>
                </div>
                <StatusBadge status={campaign.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Broadcasts Recentes */}
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Broadcasts Recentes</h2>
          {recentBroadcasts?.broadcasts?.length === 0 && (
            <p className="text-muted-foreground text-sm">Nenhum broadcast ainda.</p>
          )}
          <div className="space-y-3">
            {recentBroadcasts?.broadcasts?.map((broadcast) => (
              <div key={broadcast.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">{broadcast.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {broadcast.channel} · {broadcast.totalRecipients} recipients
                  </p>
                </div>
                <StatusBadge status={broadcast.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loadingOverview && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      )}
    </div>
  );
}

function KPICard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon: string }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
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