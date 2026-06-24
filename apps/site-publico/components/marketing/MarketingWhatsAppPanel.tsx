import Link from 'next/link';
import { ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PRIMARY_SITE_URL } from '@/lib/app-mode';
import { MarketingPageHeader } from './MarketingPageHeader';

const s1CrmUrl = `${PRIMARY_SITE_URL}/admin/crm`;

export function MarketingWhatsAppPanel() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <MarketingPageHeader
        title="WhatsApp"
        description="A inbox operacional e a integração Evolution API rodam no Servidor 1 (site principal). O lab (:3000) apenas referencia e planeja campanhas."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-emerald-600" aria-hidden />
            Operação no S1
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Para atendimento em tempo real, templates aprovados e fila de mensagens,
            use o CRM do site principal em{' '}
            <a
              href={s1CrmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-violet-700 underline"
            >
              {s1CrmUrl}
            </a>
            .
          </p>
          <p>
            Campanhas WhatsApp em massa podem ser criadas em{' '}
            <Link href="/marketing/campaigns" className="font-medium text-violet-700 underline">
              /marketing/campaigns
            </Link>{' '}
            (canal WhatsApp) quando a API S2 estiver configurada.
          </p>
          <Button asChild variant="outline">
            <a href={s1CrmUrl} target="_blank" rel="noopener noreferrer">
              Abrir CRM S1
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
