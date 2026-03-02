"use client"

import { cn } from "@/lib/utils"

export function TicketCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse",
        className
      )}
      aria-hidden
    >
      {/* Imagem */}
      <div className="w-full aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-100" />
        {/* Bloco de preço (orange-50/50 identidade) */}
        <div className="rounded-xl bg-orange-50/50 border border-orange-100/50 p-3 space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-16 rounded bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-100" />
            <div className="h-6 w-24 rounded bg-gray-200" />
          </div>
          <div className="h-4 w-32 rounded bg-gray-100" />
        </div>
        {/* Botão */}
        <div className="h-12 w-full rounded-xl bg-gray-200" />
      </div>
    </div>
  )
}
