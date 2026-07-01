import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ModuloPropostasPanel } from '@/components/configuracoes/ModuloPropostasPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ModuloPropostasConfigPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Configurações"
        title="Módulo Propostas"
        description="Validade, urgência na prévia pública e regras de disparo — API configuracoes_sistema."
        actions={
          <Button variant="outline" asChild>
            <Link href="/propostas">Voltar às propostas</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <ModuloPropostasPanel />
        </CardContent>
      </Card>
    </div>
  );
}
