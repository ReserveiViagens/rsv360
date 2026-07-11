import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloComissoesPanel } from '@/components/configuracoes/ModuloComissoesPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ComissoesConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Configurações"
        title="Comissões marketplace"
        description="Percentuais Reservei Viagens / RSV360 — edição manual ou sugestão por IA."
        actions={
          <Button variant="outline" asChild>
            <Link href="/crm/comissoes">Ver no CRM</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6">
          <ModuloComissoesPanel />
        </CardContent>
      </Card>
    </div>
  );
}
