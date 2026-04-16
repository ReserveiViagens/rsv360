import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useProperty } from '@/src/modules/properties/hooks';

export default function PropertyDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data: property } = useProperty(isNew ? undefined : id);

  return (
    <div className="space-y-6">
      <PageHeader badge="Multi-property" title={property?.name || (isNew ? 'Nova propriedade' : `Propriedade #${id || ''}`)} description="Detalhes, settings e usuários." actions={<Button asChild variant="outline"><Link href="/properties">Voltar</Link></Button>} />
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input defaultValue={property?.name || ''} />
          <Select defaultValue={property?.type || 'hotel'}><option value="hotel">Hotel</option><option value="hostel">Hostel</option><option value="resort">Resort</option></Select>
          <Input defaultValue={property?.city || ''} placeholder="Cidade" />
          <Input defaultValue={property?.state || ''} placeholder="Estado" />
        </CardContent>
      </Card>
      <Button asChild><Link href={`/properties/${id}/users`}>Gerenciar usuários</Link></Button>
    </div>
  );
}
