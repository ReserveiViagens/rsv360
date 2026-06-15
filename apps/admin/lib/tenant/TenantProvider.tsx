'use client';

import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { EnterpriseId, TenantContextValue, TenantSession } from '@rsv360/shared';

const TenantContext = createContext<TenantContextValue | null>(null);

export interface TenantProviderProps {
  children: ReactNode;
  initialEnterpriseId?: EnterpriseId;
  initialSession?: TenantSession | null;
}

export function TenantProvider({
  children,
  initialEnterpriseId = 'ent_1',
  initialSession = null,
}: TenantProviderProps) {
  const [enterpriseId, setEnterpriseId] = useState<EnterpriseId>(initialEnterpriseId);
  const [session] = useState<TenantSession | null>(initialSession);

  const value = useMemo<TenantContextValue>(
    () => ({ enterpriseId, session, setEnterpriseId }),
    [enterpriseId, session]
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
