'use client';

import { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export type CalendarioDiaEstado = 'livre' | 'bloqueado' | 'reservado';

export interface CalendarioDiaView {
  data: string;
  estado: CalendarioDiaEstado;
  disponivel: boolean;
  readOnly: boolean;
  precoOverride?: string | null;
}

const ESTADO_STYLES: Record<CalendarioDiaEstado, string> = {
  livre: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
  bloqueado: 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100',
  reservado: 'bg-amber-50 text-amber-900 border-amber-200 cursor-not-allowed opacity-90',
};

interface Props {
  dias: CalendarioDiaView[];
  onToggleDia?: (data: string, estadoAtual: CalendarioDiaEstado) => void;
  selectedDates?: string[];
  onSelectDia?: (data: string, estadoAtual: CalendarioDiaEstado) => void;
  readOnly?: boolean;
}

export function AnfitriaoMonthCalendar({
  dias,
  onToggleDia,
  selectedDates = [],
  onSelectDia,
  readOnly = false,
}: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const diaMap = useMemo(() => new Map(dias.map((d) => [d.data, d])), [dias]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const leadingBlanks = startOfMonth(month).getDay();
  const selectionMode = Boolean(onSelectDia);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          ←
        </button>
        <h2 className="text-lg font-semibold capitalize">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <button
          type="button"
          className="rounded border px-2 py-1 text-sm"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          →
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {monthDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const info = diaMap.get(key);
          const estado: CalendarioDiaEstado = info?.estado ?? 'livre';
          const dayReadOnly = readOnly || info?.readOnly || estado === 'reservado';
          const inMonth = isSameMonth(day, month);
          const selected = selectedSet.has(key);
          const preco = info?.precoOverride;

          return (
            <button
              key={key}
              type="button"
              disabled={!inMonth || dayReadOnly || (!selectionMode && !onToggleDia)}
              onClick={() => {
                if (selectionMode) onSelectDia?.(key, estado);
                else onToggleDia?.(key, estado);
              }}
              className={cn(
                `min-h-[56px] rounded border p-1 text-left text-xs ${ESTADO_STYLES[estado]}`,
                isToday(day) && 'ring-2 ring-blue-400',
                selected && 'ring-2 ring-indigo-600 ring-offset-1',
              )}
              title={estado}
            >
              <span className="font-semibold">{format(day, 'd')}</span>
              <span className="mt-0.5 block capitalize">{estado}</span>
              {preco && (
                <span className="mt-0.5 block text-[10px] font-medium text-indigo-700">
                  R$ {preco}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-emerald-200" /> Livre
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-red-200" /> Bloqueado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-amber-200" /> Reservado
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-indigo-200" /> Preço especial
        </span>
      </div>
    </div>
  );
}
