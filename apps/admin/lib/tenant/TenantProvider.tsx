'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { EnterpriseId, TenantContextValue, TenantSession } from '@rsv360/shared';
import { TENANT_STORAGE_KEY } from '@rsv360/shared';

const TenantContext = createContext<TenantContextValue | null>(null);

export interface TenantProviderProps {
  children: ReactNode;
  initialEnterpriseId?: EnterpriseId;
  initialSession?: TenantSession | null;
}

function readStoredEnterpriseId(fallback: EnterpriseId): EnterpriseId {
  if (typeof window === 'undefined') return fallback;
  return window.localStorage.getItem(TENANT_STORAGE_KEY) || fallback;
}

export function TenantProvider({
  children,
  initialEnterpriseId = 'ent_1',
  initialSession = null,
}: TenantProviderProps) {
  const [enterpriseId, setEnterpriseIdState] = useState<EnterpriseId>(() =>
    readStoredEnterpriseId(initialEnterpriseId)
  );
  const [session] = useState<TenantSession | null>(initialSession);

  const setEnterpriseId = useCallback((id: EnterpriseId) => {
    setEnterpriseIdState(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(TENANT_STORAGE_KEY, id);
    }
  }, []);

  const value = useMemo<TenantContextValue>(
    () => ({ enterpriseId, session, setEnterpriseId }),
    [enterpriseId, session, setEnterpriseId]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return ctx;
}
