"use client"

import { CreditCard, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface MobileExpressCheckoutV2Props {
  totalAmount: number
  discountAmount?: number
  itemCount?: number
  maxInstallments?: string
  onConfirm?: () => void
  /** Badge no topo da barra: "PREÇO DE CALDAS" ou "OFERTA LIMITADA" */
  badgeLabel?: string
  className?: string
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function MobileExpressCheckoutV2({
  totalAmount,
  discountAmount = 0,
  itemCount = 1,
  maxInstallments = "em até 12x sem juros",
  onConfirm,
  badgeLabel = "PREÇO DE CALDAS",
  className,
}: MobileExpressCheckoutV2Props) {
  const totalAfterDiscount = totalAmount - discountAmount

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]",
        "md:max-w-[1320px] md:left-1/2 md:right-auto md:-translate-x-1/2 md:rounded-t-2xl",
        className
      )}
    >
      {/* Barra de urgência (laranja) */}
      <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-orange-800">{badgeLabel}</span>
        {discountAmount > 0 && (
          <span className="text-xs text-orange-700">
            Economia de {formatPrice(discountAmount)}
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-green-600">
            <CreditCard className="w-5 h-5" />
            <span className="font-bold text-lg text-gray-900">{formatPrice(totalAfterDiscount)}</span>
          </div>
          <span className="text-sm text-gray-600">{maxInstallments}</span>
        </div>
        <Button
          onClick={onConfirm}
          className="w-full sm:w-auto min-h-12 px-8 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl active:scale-[0.98] touch-manipulation"
        >
          RESERVAR AGORA
        </Button>
      </div>

      {/* Selo Pagamento Seguro */}
      <div className="px-4 pb-4 flex items-center justify-center gap-2 text-blue-600">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span className="text-xs font-medium text-blue-800">Pagamento Seguro</span>
      </div>
    </div>
  )
}
