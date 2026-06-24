import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarketingPageHeader } from './MarketingPageHeader';

const FUNNEL_STAGES = [
  {
    stage: 'Descoberta',
    description: 'Visitantes no site principal (:5000) e campanhas pagas.',
    metric: '12.4k sessões / 30d',
    color: 'border-violet-200 bg-violet-50',
  },
  {
    stage: 'Consideração',
    description: 'Busca de hotéis, leilões e flash deals.',
    metric: '3.1k listagens vistas',
    color: 'border-blue-200 bg-blue-50',
  },
  {
    stage: 'Intenção',
    description: 'Cotações, wishlists e início de checkout.',
    metric: '840 leads qualificados',
    color: 'border-amber-200 bg-amber-50',
  },
  {
    stage: 'Reserva',
    description: 'Pagamento confirmado ou proposta aceita.',
    metric: '196 conversões',
    color: 'border-emerald-200 bg-emerald-50',
  },
  {
    stage: 'Retenção',
    description: 'Fidelidade, upsell e campanhas de reativação.',
    metric: '28% retorno em 90d',
    color: 'border-slate-200 bg-slate-50',
  },
] as const;

export function MarketingFunnelsPanel() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <MarketingPageHeader
        title="Funis de conversão"
        description="Visão estruturada do funil B2C. Métricas abaixo são ilustrativas até integração com analytics em tempo real."
      />

      <div className="space-y-3">
        {FUNNEL_STAGES.map((step, index) => (
          <Card key={step.stage} className={step.color}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">
                  {index + 1}. {step.stage}
                </CardTitle>
                <span className="text-sm font-medium text-slate-700">{step.metric}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Próximo passo: conectar etapas a eventos do S1 (:5000) e campanhas do CRM via
        pipeline de dados no lab.
      </p>
    </div>
  );
}
