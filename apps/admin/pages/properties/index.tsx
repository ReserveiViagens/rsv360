import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useProperties } from '@/src/modules/properties/hooks';
import { PropertyCard } from '@/src/modules/properties/components/PropertyCard';

export default function PropertiesListPage() {
  const { data = [] } = useProperties();

  return (
    <div className="space-y-6">
      <PageHeader badge="Multi-property" title="Propriedades" description="CRUD e acesso multi-tenant." actions={<Button asChild><Link href="/properties/new">Nova propriedade</Link></Button>} />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Buscar propriedade..." />
          <Select defaultValue=""><option value="">Tipo</option></Select>
          <Select defaultValue=""><option value="">Status</option></Select>
          <Button variant="outline">Filtrar</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((property) => <Link key={property.id} href={`/properties/${property.id}`}><PropertyCard property={property} /></Link>)}
      </div>
    </div>
  );
}
