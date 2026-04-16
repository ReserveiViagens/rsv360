import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TemplateEditor } from '@/src/modules/communication/components/TemplateEditor';
import { TemplatePreview } from '@/src/modules/communication/components/TemplatePreview';
import { useTemplate } from '@/src/modules/communication/hooks';

export default function TemplateEditorPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const isNew = id === 'new';
  const { data } = useTemplate(isNew ? undefined : id);

  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title={isNew ? 'Novo template' : `Template #${id || ''}`}
        description="Editor completo com variáveis e pré-visualização."
        actions={<Button asChild variant="outline"><Link href="/communication/templates">Voltar</Link></Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>Nome</Label><Input defaultValue={data?.name || ''} /></div>
              <div className="space-y-2"><Label>Canal</Label><Select defaultValue={data?.channel || 'email'}><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></Select></div>
              <div className="space-y-2"><Label>Assunto</Label><Input defaultValue={data?.subject || ''} /></div>
              <div className="space-y-2"><Label>Tipo</Label><Input defaultValue={data?.type || ''} /></div>
            </div>
            <TemplateEditor value={data?.body || 'Olá {{first_name}}, sua reserva #{{booking_id}} está confirmada.'} onChange={() => undefined} />
            <div className="space-y-2">
              <Label>Notas</Label>
              <Textarea rows={4} placeholder="Observações internas..." />
            </div>
          </CardContent>
        </Card>
        <TemplatePreview template={data?.body || 'Olá {{first_name}}, sua reserva #{{booking_id}} está confirmada.'} />
      </div>
    </div>
  );
}
