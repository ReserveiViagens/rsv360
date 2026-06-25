import type { NextRequest } from 'next/server';
import { isMarketingLabMode } from '@/lib/app-mode';
import { isMarketingLabAuthRequired } from '@/lib/sso-config';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

/** Auth no marketing-lab: bypass opcional em dev; produção exige JWT quando MARKETING_LAB_REQUIRE_AUTH=true. */
export async function marketingLabAuth(request: NextRequest) {
  if (isMarketingLabMode() && !isMarketingLabAuthRequired()) {
    return { user: { id: 0, email: 'lab@local.dev' }, error: null as string | null };
  }
  return advancedAuthMiddleware(request);
}

/** @deprecated use marketingLabAuth */
export const pricingLabAuth = marketingLabAuth;
