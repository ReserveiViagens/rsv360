import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useMembers, useProgram } from '@/src/modules/crm/hooks';
import { LoyaltyTierBadge } from '@/src/modules/crm/components/LoyaltyTierBadge';

export default function LoyaltyProgramPage() {
  const { data: program } = useProgram();
  const { data: members = [] } = useMembers();

  return (
    <div className="space-y-6">
      <PageHeader badge="CRM" title="Programa de fidelidade" description="Tiers, membros e gestão de pontos." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input defaultValue={program?.name || ''} placeholder="Nome do programa" />
          <Input defaultValue={String(program?.points_per_brl ?? 1)} placeholder="Pontos por R$" />
          <Input defaultValue={String(program?.points_expiry_days ?? 365)} placeholder="Expiração (dias)" />
          <Button>Salvar programa</Button>
        </CardContent>
      </Card>
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold text-slate-900">Tiers</p>
            {(program?.tiers || []).map((tier) => (
              <div key={tier.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-900">{tier.name}</p>
                  <p className="text-xs text-slate-500">{tier.min_points} pontos</p>
                </div>
                <LoyaltyTierBadge tier={tier.name} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Buscar membro..." />
              <Select defaultValue=""><option value="">Tier</option></Select>
              <Button asChild><Link href="/crm/loyalty/new">Novo membro</Link></Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {members.slice(0, 6).map((member) => (
                <div key={member.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">#{member.member_number}</p>
                  <p className="text-sm text-slate-500">Pontos: {member.available_points}</p>
                  <LoyaltyTierBadge tier={member.tier} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
