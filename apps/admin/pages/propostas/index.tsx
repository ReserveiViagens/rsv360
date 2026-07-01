import Link from 'next/link';
import { Fase1ModulePage } from '@/components/fase1/Fase1ModulePage';
import { Button } from '@/components/ui/button';

export default function PropostasAdminPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" asChild>
          <Link href="/configuracoes/modulo-propostas">Configurar validade e urgência</Link>
        </Button>
      </div>
      <Fase1ModulePage module="propostas" />
    </div>
  );
}
