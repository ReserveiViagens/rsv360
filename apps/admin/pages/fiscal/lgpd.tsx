import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useLGPDConsents } from '@/src/modules/fiscal/hooks';
import { LGPDConsentBadge } from '@/src/modules/fiscal/components/LGPDConsentBadge';

export default function LGPDPage() {
  const { data = [] } = useLGPDConsents('1');

  return (
    <div className="space-y-6">
      <PageHeader badge="Fiscal" title="LGPD" description="Consentimentos, exportação e anonimização." />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="Guest ID" />
          <Select defaultValue=""><option value="">Consent type</option></Select>
          <Select defaultValue=""><option value="">Status</option></Select>
          <Button asChild><Link href="/fiscal/lgpd/requests">Requisições</Link></Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((consent) => (
          <Card key={consent.id}>
            <CardContent className="space-y-2 p-4">
              <p className="font-medium text-slate-900">{consent.consent_type}</p>
              <LGPDConsentBadge granted={consent.granted} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
