import { Badge } from '@/components/ui/badge';

export function LGPDConsentBadge({ granted }: { granted: boolean }) {
  return <Badge variant={granted ? 'success' : 'danger'}>{granted ? 'granted' : 'revoked'}</Badge>;
}
