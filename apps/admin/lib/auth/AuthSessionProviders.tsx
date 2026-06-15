'use client';

import type { ReactNode } from 'react';
import { TenantProvider } from '@/lib/tenant/TenantProvider';
import { SessionProvider, useSession } from '@/lib/auth/SessionProvider';

function TenantSessionBridge({ children }: { children: ReactNode }) {
  const { user, session } = useSession();

  return (
    <TenantProvider
      key={user?.id ?? 'anonymous'}
      initialEnterpriseId={user?.enterpriseId ?? session?.enterpriseId ?? 'ent_1'}
      initialSession={session}
    >
      {children}
    </TenantProvider>
  );
}

export function AuthSessionProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <TenantSessionBridge>{children}</TenantSessionBridge>
    </SessionProvider>
  );
}
