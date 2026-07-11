import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloComissoesPanel } from '@/components/configuracoes/ModuloComissoesPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CRMComissoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="CRM"
        title="Percentuais de comissão"
        description="Split plataforma RSV360 · corretor Reservei · anfitrião. Alteração manual ou assistida por IA."
        actions={
          <Button variant="outline" asChild>
            <Link href="/crm">Voltar ao CRM</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="p-6">
          <ModuloComissoesPanel compact />
        </CardContent>
      </Card>
    </div>
  );
}
