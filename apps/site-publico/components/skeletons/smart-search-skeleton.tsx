"use client"

import { cn } from "@/lib/utils"

export function SmartSearchSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-3xl bg-white border border-gray-200 p-4 md:p-6 animate-pulse", className)}
      aria-hidden
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-20 rounded-xl bg-gray-200" />
        ))}
      </div>
      {/* Campos + botão */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-5 h-12 rounded-2xl bg-gray-200" />
        <div className="md:col-span-3 h-12 rounded-2xl bg-gray-100" />
        <div className="md:col-span-2 h-12 rounded-2xl bg-gray-100" />
        <div className="md:col-span-2 h-14 rounded-2xl bg-gray-200" />
      </div>
      {/* Popular */}
      <div className="pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <div className="h-4 w-14 rounded bg-gray-100" />
        <div className="h-8 w-20 rounded-full bg-gray-200" />
        <div className="h-8 w-16 rounded-full bg-gray-200" />
        <div className="h-8 w-24 rounded-full bg-gray-200" />
        <div className="h-8 w-16 rounded-full bg-gray-200" />
      </div>
    </div>
  )
}
