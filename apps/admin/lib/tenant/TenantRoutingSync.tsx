'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/router';
import {
  TENANT_QUERY_PARAM,
  TENANT_STORAGE_KEY,
  resolveTenantRoute,
  withTenantQuery,
} from '@rsv360/shared';
import { useTenant } from '@/lib/tenant/TenantProvider';

/** Sincroniza enterpriseId entre URL, storage e TenantProvider. */
export function TenantRoutingSync({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { enterpriseId, setEnterpriseId } = useTenant();

  useEffect(() => {
    if (!router.isReady) return;

    const queryValue = router.query[TENANT_QUERY_PARAM];
    const storageValue =
      typeof window !== 'undefined' ? window.localStorage.getItem(TENANT_STORAGE_KEY) : null;

    const resolved = resolveTenantRoute({
      pathname: router.asPath.split('?')[0],
      query: queryValue,
      sessionEnterpriseId: enterpriseId,
      storageEnterpriseId: storageValue,
    });

    if (resolved !== enterpriseId) {
      setEnterpriseId(resolved);
    }

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TENANT_STORAGE_KEY, resolved);
    }

    if (!queryValue && resolved) {
      const next = withTenantQuery(router.asPath, resolved);
      if (next !== router.asPath) {
        void router.replace(next, undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.asPath, router.query, enterpriseId, setEnterpriseId, router]);

  return <>{children}</>;
}
