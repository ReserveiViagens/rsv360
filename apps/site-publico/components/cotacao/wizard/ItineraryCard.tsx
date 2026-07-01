'use client';

import { Play, Gift, Flame, Check, MapPin } from 'lucide-react';
import { useState } from 'react';
import { VideoModal } from './VideoModal';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { COTACAO_FALLBACK_HOTEL } from '@/lib/cotacao-image-utils';
import { cn } from '@/lib/utils';

export type ItineraryCardMode = 'selection' | 'summary' | 'readonly';

export interface ItineraryCardProps {
  title: string;
  subtitle?: string;
  image: string;
  images?: string[];
  price: number;
  mode?: ItineraryCardMode;
  isSelected?: boolean;
  onSelect?: () => void;
  behaviorTag?: string;
  tagColor?: 'blue' | 'green' | 'purple' | 'lime';
  bonus?: string;
  location?: string;
  hasVideo?: boolean;
  videoUrl?: string;
  showPremium?: boolean;
  premiumLabel?: string;
  availableUnits?: number;
  recentBookings?: number;
  unavailable?: boolean;
  unavailableReason?: string;
  selectLabel?: string;
}

const tagStyles = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  purple: 'bg-purple-100 text-purple-800',
  lime: 'bg-accent-lime/30 text-gray-900',
};

const FALLBACK_IMG = COTACAO_FALLBACK_HOTEL;

export function ItineraryCard({
  title,
  subtitle,
  image,
  images = [],
  price,
  mode = 'selection',
  isSelected = false,
  onSelect,
  behaviorTag,
  tagColor = 'blue',
  bonus,
  location,
  hasVideo = false,
  videoUrl,
  showPremium = false,
  premiumLabel,
  availableUnits,
  recentBookings,
  unavailable = false,
  unavailableReason,
  selectLabel = 'Selecionar',
}: ItineraryCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const gallery = images.length ? images : [image || FALLBACK_IMG];
  const currentImage = gallery[imageIndex] ?? FALLBACK_IMG;
  const imageCounter = `${imageIndex + 1}/${gallery.length}`;

  const showCta = mode === 'selection' && !unavailable;
  const readOnly = mode === 'readonly' || mode === 'summary';

  return (
    <>
      {hasVideo && videoUrl && (
        <VideoModal
          isOpen={isVideoOpen}
          onClose={() => setIsVideoOpen(false)}
          videoUrl={videoUrl}
          title={`Conheça ${title}`}
        />
      )}
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-xl border bg-white shadow-md transition-all duration-300',
          isSelected ? 'border-primary ring-2 ring-primary/30 shadow-lg' : 'border-gray-200 hover:shadow-lg',
          unavailable && 'opacity-60 grayscale',
        )}
      >
        <div
          className="relative h-56 overflow-hidden bg-gray-200 sm:h-64"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <ImageWithFallback
            src={currentImage}
            alt={title}
            className={cn(
              'transition-transform duration-500',
              isHovering ? 'scale-105' : 'scale-100',
            )}
            fallbackSrc={FALLBACK_IMG}
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {(showPremium || premiumLabel) && (
              <span className="inline-block rounded-full bg-yellow-400 px-3 py-1.5 text-xs font-bold text-yellow-900 shadow-md">
                {premiumLabel ?? 'Suíte com Vista Premium'}
              </span>
            )}
            {behaviorTag && (
              <span
                className={cn(
                  'inline-block rounded-full px-3 py-1.5 text-xs font-bold shadow-md',
                  tagStyles[tagColor],
                )}
              >
                {behaviorTag}
              </span>
            )}
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-md">
                <Check className="size-3" /> Selecionado
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                  className="rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm"
                  aria-label="Imagem anterior"
                >
                  ‹
                </button>
                <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm">
                  {imageCounter}
                </span>
                <button
                  type="button"
                  onClick={() => setImageIndex((i) => (i + 1) % gallery.length)}
                  className="rounded-full bg-white/95 px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm"
                  aria-label="Próxima imagem"
                >
                  ›
                </button>
              </>
            )}
            {hasVideo && videoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="flex items-center justify-center rounded-full bg-white/95 p-2 transition-all hover:scale-110 hover:bg-white hover:shadow-lg active:scale-95"
                aria-label="Assistir vídeo"
              >
                <Play className="size-4 fill-blue-600 text-blue-600" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
            {location && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin className="size-4 shrink-0" />
                {location}
              </p>
            )}
          </div>

          {bonus && (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3">
              <Gift className="size-4 shrink-0 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900">
                <strong>Bônus:</strong> {bonus}
              </span>
            </div>
          )}

          {unavailable && (
            <div className="rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
              {unavailableReason ?? 'Indisponível para este período'}
            </div>
          )}

          {!unavailable && availableUnits != null && availableUnits <= 2 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-3">
              <Flame className="size-4 shrink-0 text-red-500" />
              <p className="text-xs font-semibold text-red-600">
                Apenas {availableUnits} vaga{availableUnits > 1 ? 's' : ''} restante
                {availableUnits > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-gray-200 pt-4">
            <div>
              <p className="text-xs text-gray-600">Valor</p>
              <p className="text-2xl font-bold text-gray-900">
                R$ {price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {showCta && (
              <button
                type="button"
                onClick={onSelect}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-bold text-white shadow-md transition-all active:scale-95',
                  isSelected
                    ? 'bg-gray-700 hover:bg-gray-800'
                    : 'bg-primary hover:bg-primary/90 hover:shadow-lg',
                )}
              >
                {isSelected ? 'Desmarcar' : selectLabel}
              </button>
            )}
            {readOnly && mode === 'summary' && isSelected && (
              <span className="text-sm font-semibold text-primary">Incluído</span>
            )}
          </div>

          {recentBookings != null && recentBookings > 0 && (
            <p className="text-center text-xs text-gray-600">
              <strong>{recentBookings} pessoas</strong> reservaram nas últimas 24h
            </p>
          )}
        </div>
      </div>
    </>
  );
}
