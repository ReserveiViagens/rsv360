import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useMember, useStatement } from '@/src/modules/crm/hooks';
import { LoyaltyTierBadge } from '@/src/modules/crm/components/LoyaltyTierBadge';
import { PointsStatement } from '@/src/modules/crm/components/PointsStatement';

export default function LoyaltyMemberDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data: member } = useMember(isNew ? undefined : id);
  const { data: statement = [] } = useStatement(isNew ? undefined : id);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="CRM"
        title={member ? member.member_number : (isNew ? 'Novo membro' : `Membro #${id || ''}`)}
        description="Extrato, progressão de tier e saldo corrente."
        actions={<Button asChild variant="outline"><Link href="/crm/loyalty">Voltar</Link></Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2"><Input defaultValue={member?.member_number || ''} /></div>
            <div className="space-y-2"><Select defaultValue={member?.tier || 'Bronze'}><option value="Bronze">Bronze</option><option value="Prata">Prata</option><option value="Ouro">Ouro</option><option value="Diamante">Diamante</option></Select></div>
            {member ? <LoyaltyTierBadge tier={member.tier} /> : null}
          </CardContent>
        </Card>
        <PointsStatement items={statement} />
      </div>
    </div>
  );
}
