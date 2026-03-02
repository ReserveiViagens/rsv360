"use client"

import { useState, useCallback } from "react"
import { MapPin, Mic, Calendar as CalendarIcon, Users } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SearchTab = "tudo" | "hoteis" | "parques" | "passeios"

const TABS: { id: SearchTab; label: string }[] = [
  { id: "tudo", label: "Tudo" },
  { id: "hoteis", label: "Hotéis" },
  { id: "parques", label: "Parques" },
  { id: "passeios", label: "Passeios" },
]

const POPULAR_CHIPS = [
  { label: "Hot Park", slug: "hot-park" },
  { label: "diRoma", slug: "diroma" },
  { label: "Lagoa Quente", slug: "lagoa-quente" },
  { label: "Náutico", slug: "nautico" },
]

/** Tipo mínimo para o evento onresult da Web Speech API */
interface VoiceResultEvent {
  results: Array<{ 0: { transcript: string }; length: number }>
}

export interface SmartSearchFilterProps {
  /** Valor inicial do campo destino */
  defaultDestination?: string
  /** Callback ao submeter busca (tab, destino, entrada, saida, hospedes) */
  onSearch?: (params: {
    tab: SearchTab
    destination: string
    checkIn: string
    checkOut: string
    guests: number
  }) => void
  /** Callback para busca por voz; se não passado, redireciona para /buscar?q= */
  onVoiceSearch?: () => void
  /** Se true, exibe estado de escuta (mic) */
  isListening?: boolean
  /** Suporte a voz detectado (ex.: Web Speech API) */
  voiceSupported?: boolean
  className?: string
}

export function SmartSearchFilter({
  defaultDestination = "",
  onSearch,
  onVoiceSearch,
  isListening = false,
  voiceSupported = false,
  className,
}: SmartSearchFilterProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>("tudo")
  const [destination, setDestination] = useState(defaultDestination)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(2)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (onSearch) {
        onSearch({
          tab: activeTab,
          destination: destination.trim() || "Caldas Novas",
          checkIn: checkIn || "",
          checkOut: checkOut || "",
          guests,
        })
      } else {
        const params = new URLSearchParams()
        if (destination.trim()) params.set("q", destination.trim())
        if (checkIn) params.set("entrada", checkIn)
        if (checkOut) params.set("saida", checkOut)
        if (guests > 0) params.set("hospedes", String(guests))
        params.set("tab", activeTab)
        window.location.href = `/buscar?${params.toString()}`
      }
    },
    [activeTab, destination, checkIn, checkOut, guests, onSearch]
  )

  const handleChipClick = useCallback((slug: string) => {
    setDestination(slug === "hot-park" ? "Hot Park" : slug === "diroma" ? "diRoma" : slug === "lagoa-quente" ? "Lagoa Quente" : "Náutico")
  }, [])

  return (
    <section
      className={cn("rounded-3xl bg-white border border-gray-200 shadow-sm p-4 md:p-6", className)}
      aria-label="Filtro de busca"
    >
      {/* Abas */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-sm font-medium transition-colors touch-manipulation",
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-blue-600"
            )}
            aria-pressed={activeTab === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Destino: Onde em Caldas Novas? + MapPin + Mic */}
        <div className="grid grid-cols-1 md:grid-cols-12 md:gap-3">
          <div className="md:col-span-12 lg:col-span-5 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Onde em Caldas Novas?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 pr-12 h-12 rounded-2xl border-gray-200 text-gray-900 focus-visible:ring-blue-500"
              aria-label="Destino ou local de interesse"
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onVoiceSearch?.()
                }}
                disabled={isListening}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                aria-label="Buscar por voz"
              >
                <Mic className={cn("w-5 h-5", isListening && "animate-pulse")} />
              </button>
            )}
          </div>

          {/* Entrada / Saída */}
          <div className="md:col-span-6 lg:col-span-3 flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex-1 flex items-center gap-2 h-12 pl-3 pr-4 rounded-2xl border border-gray-200 text-left text-sm",
                    "bg-white text-gray-900 hover:bg-gray-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                  selected={checkIn ? new Date(checkIn + "T12:00:00") : undefined}
                  onSelect={(d) => {
                    if (d) setCheckIn(format(d, "yyyy-MM-dd"))
                  }}
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
                    "flex-1 flex items-center gap-2 h-12 pl-3 pr-4 rounded-2xl border border-gray-200 text-left text-sm",
                    "bg-white text-gray-900 hover:bg-gray-50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                  selected={checkOut ? new Date(checkOut + "T12:00:00") : undefined}
                  onSelect={(d) => {
                    if (d) setCheckOut(format(d, "yyyy-MM-dd"))
                  }}
                  locale={ptBR}
                  disabled={(date) => {
                    const today = new Date(new Date().setHours(0, 0, 0, 0))
                    if (date < today) return true
                    if (checkIn) {
                      const minOut = new Date(checkIn + "T12:00:00")
                      minOut.setDate(minOut.getDate() + 1)
                      return date < minOut
                    }
                    return false
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Hóspedes */}
          <div className="md:col-span-6 lg:col-span-2 relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value) || 1)}
              className="pl-9 h-12 rounded-2xl border-gray-200 text-gray-900 focus-visible:ring-blue-500"
              aria-label="Número de hóspedes"
            />
          </div>

          {/* Botão BUSCAR AGORA */}
          <div className="md:col-span-12 lg:col-span-2">
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
            >
              BUSCAR AGORA
            </Button>
          </div>
        </div>
      </form>

      {/* Popular: chips */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <span className="text-sm text-gray-600 mr-2">Popular:</span>
        <div className="inline-flex flex-wrap gap-2">
          {POPULAR_CHIPS.map((chip) => (
            <button
              key={chip.slug}
              type="button"
              onClick={() => handleChipClick(chip.slug)}
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors touch-manipulation"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
