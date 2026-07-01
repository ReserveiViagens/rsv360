'use client';

interface AnticlonagemWatermarkProps {
  label?: string;
  className?: string;
}

/** Overlay leve de anticlonagem — não usar em QR/vouchers (DigitalWallet). */
export function AnticlonagemWatermark({
  label = 'Reservei Viagens — uso exclusivo do destinatário',
  className = '',
}: AnticlonagemWatermarkProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <div
        className="absolute inset-0 flex flex-wrap content-center justify-center gap-8 opacity-[0.05]"
        style={{ transform: 'rotate(-18deg) scale(1.15)' }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            key={index}
            className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.25em] text-white sm:text-sm"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
