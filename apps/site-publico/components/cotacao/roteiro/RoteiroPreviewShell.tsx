'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { trackCotacaoEvent } from '@/lib/cotacao-analytics';
import { formatBRL } from '@/components/cotacao/wizard/wizard-pricing';
import type { RoteiroPreviewMeta } from '@/lib/montar-roteiro-preview';
import { RoteiroDayControls } from './RoteiroDayControls';
import { RoteiroDayNav } from './RoteiroDayNav';
import { RoteiroDaySlide } from './RoteiroDaySlide';
import { RoteiroOverviewCompact } from './RoteiroOverviewCompact';
import { RoteiroTimelineImersiva } from './RoteiroTimelineImersiva';

type DayNavSource = 'nav' | 'swipe' | 'keyboard';

interface RoteiroPreviewShellProps {
  preview: RoteiroPreviewMeta;
  total: number;
  mode: 'wizard' | 'public';
  onApprove?: () => void;
  onConcierge?: () => void;
  whatsappUrl?: string;
  approveLabel?: string;
  showConcierge?: boolean;
  isDayLoading?: boolean;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export function RoteiroPreviewShell({
  preview,
  total,
  mode,
  onApprove,
  onConcierge,
  whatsappUrl,
  approveLabel = 'Aprovar Roteiro',
  showConcierge = false,
  isDayLoading = false,
}: RoteiroPreviewShellProps) {
  const totalDays = useMemo(() => {
    const maxDay = preview.activities.reduce((max, a) => Math.max(max, a.day), 1);
    return Math.max(preview.nights, maxDay);
  }, [preview.activities, preview.nights]);

  const [activeDay, setActiveDay] = useState(1);
  const [direction, setDirection] = useState(0);
  const [liveMessage, setLiveMessage] = useState('');
  const slideRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'wizard') {
      trackCotacaoEvent('cotacao_roteiro_preview_viewed', {
        nights: preview.nights,
        guests: preview.guests,
      });
    }
  }, [mode, preview.nights, preview.guests]);

  const navigateToDay = useCallback(
    (day: number, source: DayNavSource = 'nav') => {
      if (day < 1 || day > totalDays || day === activeDay) return;
      setDirection(day > activeDay ? 1 : -1);
      setActiveDay(day);
      setLiveMessage(`Dia ${day} de ${totalDays}`);
      trackCotacaoEvent('cotacao_roteiro_day_selected', { step: day, source });
    },
    [activeDay, totalDays],
  );

  useEffect(() => {
    if (!liveMessage) return;
    const timer = window.setTimeout(() => {
      const heading = slideRegionRef.current?.querySelector('h3');
      if (heading instanceof HTMLElement) {
        heading.focus({ preventScroll: true });
      } else {
        slideRegionRef.current?.focus({ preventScroll: true });
      }
    }, 50);
    return () => window.clearTimeout(timer);
  }, [activeDay, liveMessage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateToDay(activeDay - 1, 'keyboard');
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateToDay(activeDay + 1, 'keyboard');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeDay, navigateToDay]);

  const hideTitle = mode === 'public';

  return (
    <div className={mode === 'wizard' ? 'pb-32' : 'pb-28'}>
      {!hideTitle && (
        <div className="mb-2 text-center">
          <h1 className="text-lg font-bold text-gray-900">Seu Roteiro</h1>
          <p className="text-sm text-muted-foreground">Sua viagem dia a dia, ao vivo</p>
        </div>
      )}

      <div
        className={cn(
          'sticky z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm',
          mode === 'public' ? 'top-14' : 'top-0',
        )}
        data-testid="roteiro-sticky-header"
      >
        <RoteiroOverviewCompact
          title={preview.title}
          nights={preview.nights}
          guests={preview.guests}
          destination={preview.destination}
        />
        <RoteiroDayNav totalDays={totalDays} activeDay={activeDay} onDayChange={(d) => navigateToDay(d, 'nav')} />
      </div>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </p>

      <div
        ref={slideRegionRef}
        role="region"
        aria-roledescription="carrossel"
        aria-label={`Atividades do dia ${activeDay}`}
        tabIndex={-1}
        className="mt-4 outline-none"
      >
        <RoteiroDaySlide
          activeDay={activeDay}
          direction={direction}
          totalDays={totalDays}
          isLoading={isDayLoading}
          onSwipeNavigate={(day) => navigateToDay(day, 'swipe')}
        >
          <RoteiroTimelineImersiva
            activities={preview.activities}
            activeDay={activeDay}
            filterByDay
            onVideoPlay={(id) => trackCotacaoEvent('cotacao_roteiro_video_played', { itemId: id })}
          />
        </RoteiroDaySlide>
      </div>

      <RoteiroDayControls
        activeDay={activeDay}
        totalDays={totalDays}
        onNavigate={(day) => navigateToDay(day, 'nav')}
        disabled={isDayLoading}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total estimado</p>
            <p className="text-xl font-bold text-gray-900">{formatBRL(total)}</p>
          </div>
          {showConcierge && onConcierge && (
            <button
              type="button"
              onClick={onConcierge}
              className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Concierge
            </button>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
            >
              WhatsApp
            </a>
          )}
          {onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="rounded-full bg-accent-lime px-6 py-3 text-sm font-bold text-gray-900 shadow-md transition-colors hover:bg-accent-lime/90"
            >
              {approveLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
