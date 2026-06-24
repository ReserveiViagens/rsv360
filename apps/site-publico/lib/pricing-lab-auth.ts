import type { NextRequest } from 'next/server';
import { isMarketingLabMode } from '@/lib/app-mode';
import { advancedAuthMiddleware } from '@/lib/advanced-auth';

/** Auth para rotas de pricing: no marketing-lab leitura/escrita interna sem login. */
export async function pricingLabAuth(request: NextRequest) {
  if (isMarketingLabMode()) {
    return { user: { id: 0, email: 'lab@local.dev' }, error: null as string | null };
  }
  return advancedAuthMiddleware(request);
}
