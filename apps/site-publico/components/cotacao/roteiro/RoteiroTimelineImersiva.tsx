'use client';

import { useState } from 'react';
import { MapPin, Play } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { VideoModal } from '@/components/cotacao/wizard/VideoModal';
import type { RoteiroPreviewActivity, RoteiroMood } from '@/lib/montar-roteiro-preview';
import { cn } from '@/lib/utils';

const MOOD_STYLES: Record<RoteiroMood, string> = {
  relaxamento: 'bg-blue-100 text-blue-800',
  diversao: 'bg-orange-100 text-orange-800',
  natureza: 'bg-green-100 text-green-800',
  gastronomia: 'bg-amber-100 text-amber-800',
};

const FALLBACK =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop';

interface RoteiroTimelineImersivaProps {
  activities: RoteiroPreviewActivity[];
  activeDay?: number;
  filterByDay?: boolean;
  onVideoPlay?: (activityId: string) => void;
}

export function RoteiroTimelineImersiva({
  activities,
  activeDay,
  filterByDay = false,
  onVideoPlay,
}: RoteiroTimelineImersivaProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const visible = filterByDay && activeDay
    ? activities.filter((a) => a.day === activeDay)
    : activities;

  if (!visible.length) {
    return (
      <div className="flex min-h-[280px] items-center justify-center">
        <p className="py-8 text-center text-muted-foreground">
          Nenhuma atividade para este dia. Selecione outro dia acima.
        </p>
      </div>
    );
  }

  const openVideo = (activity: RoteiroPreviewActivity) => {
    if (!activity.videoUrl) return;
    setVideoUrl(activity.videoUrl);
    setVideoTitle(activity.title);
    setVideoOpen(true);
    onVideoPlay?.(activity.id);
  };

  return (
    <>
      <VideoModal
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
        videoUrl={videoUrl}
        title={videoTitle}
      />
      <div className="relative mx-auto max-w-2xl">
        <div className="absolute bottom-0 left-6 top-0 w-1 bg-gradient-to-b from-accent-lime via-accent-lime to-gray-300" />
        {visible.map((activity) => (
          <div key={activity.id} className="relative mb-10 ml-20">
            <div className="absolute -left-[54px] top-0 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-accent-lime text-sm font-bold text-gray-900 shadow-md">
              {activity.day}
            </div>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md">
              <div className="group relative h-40 overflow-hidden bg-gray-200 md:h-48">
                <ImageWithFallback
                  src={activity.image || FALLBACK}
                  alt={activity.title}
                  className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  fallbackSrc={FALLBACK}
                  objectFit="cover"
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {activity.mood && (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold shadow-sm',
                        MOOD_STYLES[activity.mood],
                      )}
                    >
                      {activity.mood === 'relaxamento'
                        ? 'Relaxamento'
                        : activity.mood === 'diversao'
                          ? 'Diversão'
                          : activity.mood === 'natureza'
                            ? 'Natureza'
                            : 'Gastronomia'}
                    </span>
                  )}
                  {activity.behaviorTag && (
                    <span className="rounded-full bg-accent-lime/40 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                      {activity.behaviorTag}
                    </span>
                  )}
                </div>
                {activity.videoUrl && (
                  <button
                    type="button"
                    onClick={() => openVideo(activity)}
                    className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-white/95 p-2.5 shadow-md transition-transform hover:scale-110"
                    aria-label="Assistir vídeo"
                  >
                    <Play className="h-5 w-5 fill-primary text-primary" />
                  </button>
                )}
              </div>
              <div className="p-4 md:p-5">
                <h3
                  tabIndex={-1}
                  className="mb-1 text-base font-bold text-gray-900 outline-none md:text-lg"
                >
                  {activity.title}
                </h3>
                <p className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {activity.description}
                </p>
                {activity.actionLabel && (
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg border-2 border-gray-900 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                  >
                    {activity.actionLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export type { RoteiroPreviewActivity };
