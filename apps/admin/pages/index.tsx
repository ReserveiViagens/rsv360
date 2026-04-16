import Link from 'next/link';
import { Building2, Cloud, FileText, MessageSquare, Sparkles, TrendingUp, Users } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const modules = [
  { href: '/communication', label: 'Communication', icon: MessageSquare, description: 'Templates, mensagens e automações.' },
  { href: '/cloud', label: 'Cloud', icon: Cloud, description: 'Arquivos, upload e galeria.' },
  { href: '/housekeeping', label: 'Housekeeping', icon: Sparkles, description: 'Rooms, tarefas e manutenção.' },
  { href: '/revenue', label: 'Revenue', icon: TrendingUp, description: 'Pricing, forecast e KPIs.' },
  { href: '/crm', label: 'CRM & Loyalty', icon: Users, description: 'Hóspedes, fidelidade e campanhas.' },
  { href: '/properties', label: 'Propriedades', icon: Building2, description: 'Switch, usuários e consolidado.' },
  { href: '/fiscal', label: 'Fiscal & LGPD', icon: FileText, description: 'Recibos, FNRH e compliance.' },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Fase 4"
        title="Painel RSV360"
        description="Acesso rápido aos módulos operacionais, comerciais, de propriedade e compliance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Card key={module.href}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">módulo</span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{module.label}</p>
                  <p className="text-sm text-slate-500">{module.description}</p>
                </div>
                <Button asChild>
                  <Link href={module.href}>Abrir módulo</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
