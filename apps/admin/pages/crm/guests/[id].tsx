import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGuest, useGuestTimeline } from '@/src/modules/crm/hooks';
import { GuestProfileCard } from '@/src/modules/crm/components/GuestProfileCard';
import { GuestTimeline } from '@/src/modules/crm/components/GuestTimeline';

export default function GuestDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data: guest } = useGuest(isNew ? undefined : id);
  const { data: timeline = [] } = useGuestTimeline(isNew ? undefined : id);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="CRM"
        title={guest ? `${guest.first_name} ${guest.last_name}` : (isNew ? 'Novo hóspede' : `Hóspede #${id || ''}`)}
        description="Perfil, timeline unificada e métricas de fidelidade."
        actions={<Button asChild variant="outline"><Link href="/crm/guests">Voltar</Link></Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {guest ? <GuestProfileCard guest={guest} /> : <Card><CardContent className="p-5 text-slate-500">Carregando perfil...</CardContent></Card>}
        <GuestTimeline items={timeline} />
      </div>
    </div>
  );
}
