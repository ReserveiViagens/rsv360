import { ExternalLink } from 'lucide-react';
import { PRIMARY_SITE_URL } from '@/lib/app-mode';

type PrimarySiteBannerProps = {
  compact?: boolean;
};

export function PrimarySiteBanner({ compact = false }: PrimarySiteBannerProps) {
  if (compact) {
    return (
      <a
        href={PRIMARY_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 transition hover:bg-violet-100"
      >
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        Site principal
      </a>
    );
  }

  return (
    <div className="border-b border-violet-100 bg-violet-50/80 px-4 py-2 text-sm text-violet-900">
      <span className="text-violet-700">B2C e reservas:</span>{' '}
      <a
        href={PRIMARY_SITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline"
      >
        {PRIMARY_SITE_URL}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
      <span className="ml-2 text-violet-600">(:5000 — Servidor 1)</span>
    </div>
  );
}
