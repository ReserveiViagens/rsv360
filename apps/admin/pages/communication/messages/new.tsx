import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TemplatePreview } from '@/src/modules/communication/components/TemplatePreview';

export default function NewMessagePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        badge="Communication"
        title="Nova mensagem"
        description="Compose, canal e envio."
        actions={<Button asChild variant="outline"><Link href="/communication/messages">Voltar</Link></Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2"><Label>Destino</Label><Input placeholder="email@exemplo.com" /></div>
            <div className="space-y-2"><Label>Canal</Label><Select defaultValue="email"><option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option></Select></div>
            <div className="space-y-2"><Label>Assunto</Label><Input placeholder="Assunto da mensagem" /></div>
            <div className="space-y-2"><Label>Conteúdo</Label><Textarea rows={12} defaultValue="Olá {{first_name}}, sua estadia..." /></div>
            <Button>Enviar mensagem</Button>
          </CardContent>
        </Card>
        <TemplatePreview template="Olá {{first_name}}, sua reserva #{{booking_id}} está pronta." />
      </div>
    </div>
  );
}
