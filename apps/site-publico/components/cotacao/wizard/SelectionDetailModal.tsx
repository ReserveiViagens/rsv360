'use client';

import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { COTACAO_FALLBACK_HOTEL } from '@/lib/cotacao-image-utils';
import { cn } from '@/lib/utils';
import {
  RSV_SUPPORT_EMAIL,
  RSV_SUPPORT_PHONE,
  type SelectionVoucherDetails,
  type VoucherSection,
} from './wizard-selection-voucher';

function SectionThumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border border-gray-100 shadow-sm">
      <ImageWithFallback
        src={src}
        alt={alt}
        className="h-full w-full"
        fallbackSrc={COTACAO_FALLBACK_HOTEL}
        objectFit="cover"
      />
    </div>
  );
}

function VoucherSectionBlock({ section }: { section: VoucherSection }) {
  const hasThumb = Boolean(section.thumbnail);

  return (
    <div className="border-t border-gray-100 py-4 first:border-t-0 first:pt-0">
      <div className={cn('flex gap-3', hasThumb ? 'items-start' : '')}>
        {hasThumb && section.thumbnail && (
          <SectionThumbnail src={section.thumbnail} alt={section.title} />
        )}
        <div className="min-w-0 flex-1">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-800">
            {section.title}
          </h4>
          {section.paragraphs?.map((p) => (
            <p key={p.slice(0, 24)} className="mb-2 text-sm leading-relaxed text-gray-600">
              {p}
            </p>
          ))}
          {section.bullets && section.bullets.length > 0 && (
            <ul className="space-y-1.5 text-sm text-gray-600">
              {section.bullets.map((line) => (
                <li key={line.slice(0, 40)} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
          {section.footnote && (
            <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{section.footnote}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function GalleryStrip({ images, title }: { images: string[]; title: string }) {
  if (images.length <= 1) return null;

  return (
    <div className="relative z-10 -mt-2 flex gap-1.5 px-5 pb-2">
      {images.slice(0, 3).map((src, i) => (
        <div
          key={`${src}-${i}`}
          className="h-14 flex-1 overflow-hidden rounded-lg border-2 border-white shadow-md"
        >
          <ImageWithFallback
            src={src}
            alt={`${title} — foto ${i + 1}`}
            className="h-full w-full"
            fallbackSrc={COTACAO_FALLBACK_HOTEL}
            objectFit="cover"
          />
        </div>
      ))}
    </div>
  );
}

interface SelectionDetailModalProps {
  details: SelectionVoucherDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SelectionDetailModal({ details, open, onOpenChange }: SelectionDetailModalProps) {
  if (!details) return null;

  const hasHero = Boolean(details.heroImage);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl',
          hasHero && '[&>button]:border-0 [&>button]:bg-black/40 [&>button]:text-white [&>button]:hover:bg-black/60',
        )}
      >
        {hasHero && details.heroImage && (
          <div className="relative h-32 w-full shrink-0 overflow-hidden bg-gray-200">
            <ImageWithFallback
              src={details.heroImage}
              alt={details.title}
              className="absolute inset-0 h-full w-full"
              fallbackSrc={COTACAO_FALLBACK_HOTEL}
              objectFit="cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          </div>
        )}

        {details.galleryImages && (
          <GalleryStrip images={details.galleryImages} title={details.title} />
        )}

        <DialogHeader
          className={cn(
            'border-b border-gray-100 px-5 py-4 text-left',
            hasHero ? 'bg-white' : 'bg-gray-50',
          )}
        >
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-gray-800">
            <FileText className="h-4 w-4 text-primary" />
            Detalhes da inclusão
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes e regras de estadia, alimentação e políticas do pacote selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="mb-5 text-center">
            <h2 className="text-lg font-bold text-gray-900">{details.title}</h2>
            <p className="text-xs text-muted-foreground">{details.location}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Suporte: {RSV_SUPPORT_PHONE} · {RSV_SUPPORT_EMAIL}
            </p>
          </div>

          {details.sections.map((section) => (
            <VoucherSectionBlock key={section.title} section={section} />
          ))}
        </div>

        <DialogFooter className="shrink-0 border-t border-gray-100 bg-gray-50 px-5 py-3 sm:justify-end">
          <Button
            type="button"
            className="w-full bg-gray-900 hover:bg-gray-800 sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            Entendi, fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
