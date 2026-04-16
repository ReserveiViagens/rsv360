import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChecklists } from '@/src/modules/housekeeping/hooks';
import { Badge } from '@/components/ui/badge';

export default function ChecklistTemplatesPage() {
  const { data = [] } = useChecklists();

  return (
    <div className="space-y-6">
      <PageHeader badge="Housekeeping" title="Checklists" description="CRUD de templates de inspeção." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-3">
          <Input placeholder="Nome do template" />
          <Input placeholder="Adicionar item" />
          <Button>Salvar template</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((checklist) => (
          <Card key={checklist.id}>
            <CardContent className="space-y-3 p-5">
              <p className="font-medium text-slate-900">{checklist.name}</p>
              <div className="flex flex-wrap gap-2">
                {checklist.items?.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
