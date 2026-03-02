"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface HotelBookingWidgetProps {
  enterpriseId: string;
  enterpriseName?: string;
  /** Preço por noite (ex.: da primeira propriedade) */
  pricePerNight?: number;
  className?: string;
}

export function HotelBookingWidget({
  enterpriseId,
  enterpriseName,
  pricePerNight,
  className,
}: HotelBookingWidgetProps) {
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [guests, setGuests] = useState(2);

  const checkInDate = checkIn ? new Date(checkIn + "T12:00:00") : undefined;
  const checkOutDate = checkOut ? new Date(checkOut + "T12:00:00") : undefined;

  const nights =
    checkInDate && checkOutDate && checkOutDate > checkInDate
      ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (24 * 60 * 60 * 1000))
      : 0;
  const total = pricePerNight != null && nights > 0 ? pricePerNight * nights : null;

  const reservarHref = (() => {
    const params = new URLSearchParams();
    params.set("enterprise", enterpriseId);
    if (checkIn) params.set("entrada", checkIn);
    if (checkOut) params.set("saida", checkOut);
    if (guests > 0) params.set("hospedes", String(guests));
    return `/reservar?${params.toString()}`;
  })();

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-200 shadow-xl p-4 md:p-5 space-y-4",
        className
      )}
    >
      <h3 className="font-bold text-gray-900 text-lg">Reservar</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200 text-left text-sm",
                "bg-white text-gray-900 hover:bg-gray-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              )}
              aria-label="Data de entrada"
            >
              <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={cn(!checkIn && "text-gray-500")}>
                {checkIn
                  ? format(new Date(checkIn + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : "Entrada"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkInDate}
              onSelect={(d) => d && setCheckIn(format(d, "yyyy-MM-dd"))}
              locale={ptBR}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            />
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center gap-2 h-11 px-3 rounded-xl border border-gray-200 text-left text-sm",
                "bg-white text-gray-900 hover:bg-gray-50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              )}
              aria-label="Data de saída"
            >
              <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className={cn(!checkOut && "text-gray-500")}>
                {checkOut
                  ? format(new Date(checkOut + "T12:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : "Saída"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOutDate}
              onSelect={(d) => d && setCheckOut(format(d, "yyyy-MM-dd"))}
              locale={ptBR}
              disabled={(date) => {
                const today = new Date(new Date().setHours(0, 0, 0, 0));
                if (date < today) return true;
                if (checkIn) {
                  const minOut = new Date(checkIn + "T12:00:00");
                  minOut.setDate(minOut.getDate() + 1);
                  return date < minOut;
                }
                return false;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-400" />
        <label className="text-sm text-gray-600">Hóspedes</label>
        <input
          type="number"
          min={1}
          max={20}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value) || 1)}
          className="w-16 h-9 px-2 rounded-lg border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {pricePerNight != null && (
        <p className="text-sm text-gray-600">
          R$ {pricePerNight.toLocaleString("pt-BR")} por noite
          {total != null && (
            <span className="block font-semibold text-gray-900 mt-1">
              Total: R$ {total.toLocaleString("pt-BR")}
            </span>
          )}
        </p>
      )}
      <Link href={reservarHref} className="block">
        <Button
          className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          Reservar Agora
        </Button>
      </Link>
    </div>
  );
}
