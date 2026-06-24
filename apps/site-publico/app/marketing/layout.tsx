import { LabLayout } from '@/components/lab/LabLayout';
import { isMarketingLabMode } from '@/lib/app-mode';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isMarketingLabMode()) {
    return <LabLayout>{children}</LabLayout>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      {children}
    </main>
  );
}
