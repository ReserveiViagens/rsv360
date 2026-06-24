import { isMarketingLabMode } from '@/lib/app-mode';
import { LabShell } from './LabShell';

export function LabLayout({ children }: { children: React.ReactNode }) {
  if (!isMarketingLabMode()) {
    return <>{children}</>;
  }

  return <LabShell>{children}</LabShell>;
}
