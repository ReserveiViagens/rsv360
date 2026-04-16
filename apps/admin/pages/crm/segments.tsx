import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSegments } from '@/src/modules/crm/hooks';

export default function SegmentBuilderPage() {
  const { data = [] } = useSegments();

  return (
    <div className="space-y-6">
      <PageHeader badge="CRM" title="Segmentos" description="Filtros visuais, preview e recálculo dinâmico." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Nome do segmento" />
          <Select defaultValue=""><option value="">Lifecycle</option></Select>
          <Select defaultValue=""><option value="">Valor</option></Select>
          <Button>Salvar segmento</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-5">
          <Textarea rows={8} placeholder="JSON de filtro / builder visual" />
          <Button variant="outline">Preview de público</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((segment) => (
          <Card key={segment.id}>
            <CardContent className="space-y-2 p-4">
              <p className="font-medium text-slate-900">{segment.name}</p>
              <p className="text-sm text-slate-500">{segment.description || 'Segmento dinâmico'}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
