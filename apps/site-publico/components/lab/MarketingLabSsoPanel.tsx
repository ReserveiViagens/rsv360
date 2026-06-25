'use client';

import Link from 'next/link';
import { ExternalLink, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isMarketingLabMode } from '@/lib/app-mode';
import { buildS1SsoStartUrl, isSsoDevMockEnabled } from '@/lib/sso-config';

type Props = {
  returnPath?: string;
  showSsoHint?: boolean;
};

export function MarketingLabSsoPanel({ returnPath = '/lab', showSsoHint = false }: Props) {
  if (!isMarketingLabMode() && !showSsoHint) {
    return null;
  }

  const safeReturn = returnPath.startsWith('/') ? returnPath : '/lab';
  const s1StartUrl = buildS1SsoStartUrl(safeReturn);
  const devHandoffUrl = `/api/auth/sso/dev-handoff?return=${encodeURIComponent(safeReturn)}`;

  return (
    <div className="mb-6 rounded-lg border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
        <FlaskConical className="h-4 w-4" />
        Marketing Lab — login único
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Use a mesma conta do site principal (:5000) para acessar analytics, CRM e campanhas no
        laboratório.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="default" size="sm" className="gap-2">
          <a href={s1StartUrl}>
            Entrar com site principal
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </Button>
        {isSsoDevMockEnabled() && (
          <Button asChild variant="outline" size="sm">
            <Link href={devHandoffUrl}>Dev: simular SSO</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
