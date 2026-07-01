'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RoteiroDayNavProps {
  totalDays: number;
  activeDay: number;
  onDayChange: (day: number) => void;
}

export function RoteiroDayNav({ totalDays, activeDay, onDayChange }: RoteiroDayNavProps) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeDay]);

  return (
    <div className="relative px-2 pb-3 pt-1">
      <div
        ref={scrollRef}
        className="mx-auto max-w-2xl overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-w-max snap-x snap-mandatory gap-3 px-1">
          {days.map((day) => (
            <div key={day} className="relative z-10 flex shrink-0 snap-center flex-col items-center gap-1.5">
              <button
                ref={activeDay === day ? activeButtonRef : undefined}
                type="button"
                onClick={() => onDayChange(day)}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full border-[3px] text-sm font-bold transition-all sm:h-12 sm:w-12',
                  activeDay === day
                    ? 'border-accent-lime bg-accent-lime text-gray-900 shadow-md'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400',
                )}
                aria-label={`Dia ${day}`}
                aria-current={activeDay === day ? 'step' : undefined}
              >
                {day}
              </button>
              <span className="text-[10px] font-semibold text-gray-600 sm:text-xs">Dia {day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
