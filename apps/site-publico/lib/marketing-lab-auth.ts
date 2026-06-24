import type { NextRequest } from 'next/server';
import { isMarketingLabMode } from '@/lib/app-mode';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

/** Auth relaxada no marketing-lab; produção exige login. */
export async function marketingLabAuth(request: NextRequest) {
  if (isMarketingLabMode()) {
    return { user: { id: 0, email: 'lab@local.dev' }, error: null as string | null };
  }
  return advancedAuthMiddleware(request);
}

/** @deprecated use marketingLabAuth */
export const pricingLabAuth = marketingLabAuth;
