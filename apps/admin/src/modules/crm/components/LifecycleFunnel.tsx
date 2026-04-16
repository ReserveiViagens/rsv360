import { FunnelChart, Funnel, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LifecycleFunnel({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Lifecycle funnel</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList position="right" fill="#334155" dataKey="name" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
