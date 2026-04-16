import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function FNRHForm() {
  return (
    <Card>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Nome completo</Label><Input placeholder="Nome do hóspede" /></div>
        <div className="space-y-2"><Label>Documento</Label><Input placeholder="CPF / Passaporte" /></div>
        <div className="space-y-2"><Label>Nacionalidade</Label><Input placeholder="Brasileira" /></div>
        <div className="space-y-2"><Label>Procedência</Label><Input placeholder="Cidade/UF" /></div>
        <div className="space-y-2 md:col-span-2"><Label>Observações</Label><Textarea rows={4} placeholder="Informações adicionais" /></div>
      </CardContent>
    </Card>
  );
}
