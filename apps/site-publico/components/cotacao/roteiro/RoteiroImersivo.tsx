'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import type { RoteiroPreviewMeta } from '@/lib/montar-roteiro-preview';
import { RoteiroPreviewShell } from '@/components/cotacao/roteiro/RoteiroPreviewShell';
import { cn } from '@/lib/utils';

interface RoteiroImersivoProps {
  preview: RoteiroPreviewMeta;
  total: number;
  onApprove?: () => void;
  approveLabel?: string;
  isLoading?: boolean;
}

export function RoteiroImersivo({
  preview,
  total,
  onApprove,
  approveLabel,
  isLoading,
}: RoteiroImersivoProps) {
  const [apresentacao, setApresentacao] = useState(false);

  const toggleApresentacao = useCallback(() => {
    setApresentacao((v) => !v);
  }, []);

  useEffect(() => {
    if (!apresentacao) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setApresentacao(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [apresentacao]);

  return (
    <div
      className={cn(
        apresentacao &&
          'fixed inset-0 z-50 overflow-y-auto bg-gray-950/95 px-2 py-4 md:px-6',
      )}
    >
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={toggleApresentacao}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-50"
          aria-pressed={apresentacao}
        >
          {apresentacao ? (
            <>
              <Minimize2 className="h-4 w-4" aria-hidden />
              Sair da apresentação
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4" aria-hidden />
              Modo apresentação
            </>
          )}
        </button>
      </div>
      <RoteiroPreviewShell
        preview={preview}
        total={total}
        mode="wizard"
        onApprove={onApprove}
        approveLabel={approveLabel}
        isDayLoading={isLoading}
      />
    </div>
  );
}
