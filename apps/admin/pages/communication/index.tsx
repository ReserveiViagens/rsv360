import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MessageSquare, Send, Users, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCommStats } from '@/src/modules/communication/hooks';
import { formatPercent } from '@/src/lib/format';

const defaultTrend = Array.from({ length: 7 }, (_, index) => ({
  day: `D${index + 1}`,
  sent: 20 + index * 3,
  delivered: 18 + index * 3,
}));

export default function CommunicationDashboardPage() {
  const { data } = useCommStats();
  const channelData = data?.byChannel?.length
    ? data.byChannel
    : [
        { channel: 'email', count: 40 },
        { channel: 'sms', count: 20 },
        { channel: 'whatsapp', count: 32 },
      ];

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Dashboard de comunicação"
        description="Visão geral de mensagens, canais e automações."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Mensagens" value={data?.totalMessages ?? 0} icon={<MessageSquare className="h-4 w-4" />} />
        <StatCard label="Enviadas" value={data?.sentCount ?? 0} icon={<Send className="h-4 w-4" />} tone="success" />
        <StatCard label="Entregues" value={data?.deliveredCount ?? 0} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <StatCard label="Taxa de abertura" value={formatPercent(data?.openedCount && data?.deliveredCount ? (data.openedCount / data.deliveredCount) * 100 : 0)} icon={<Users className="h-4 w-4" />} tone="warning" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mensagens por canal</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0f172a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tendência 7 dias</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={defaultTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sent" stroke="#0f172a" strokeWidth={2} />
                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
