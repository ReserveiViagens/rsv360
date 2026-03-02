"use client"

import { Quote, Star, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface TestimonialItem {
  text: string
  author: string
  location?: string
  rating?: number
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    text: "Excelente atendimento! Viagem incrível para Caldas Novas. Super recomendo!",
    author: "Erica N.",
    location: "Caldas Novas, GO",
    rating: 5,
  },
  {
    text: "Agência nota 10! Fechei hotéis e ingressos parque. Atendimento Priscila top!",
    author: "Milane F.",
    location: "São Paulo, SP",
    rating: 5,
  },
  {
    text: "Reserve Viagens: atendimento rápido, equipe eficiente, flexibilidade no pagamento.",
    author: "SUA HOME Imobiliária",
    location: "Parceiro",
    rating: 5,
  },
]

export interface SocialProofSectionProps {
  title?: string
  testimonials?: TestimonialItem[]
  badgeLabel?: string
  className?: string
}

function getInitial(name: string): string {
  const part = name.trim().split(/\s+/)[0] ?? ""
  return part.charAt(0).toUpperCase() || "?"
}

export function SocialProofSection({
  title = "Quem viaja com a Reservei, aprova!",
  testimonials = DEFAULT_TESTIMONIALS,
  badgeLabel = "Plataforma 100% Verificada",
  className,
}: SocialProofSectionProps) {
  return (
    <section
      className={cn("rounded-2xl border border-blue-100 bg-blue-50/50 p-6 md:p-8", className)}
      aria-label="Depoimentos de clientes"
    >
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {testimonials.map((t, i) => (
          <Card key={i} className="border-blue-100 bg-white/80 shadow-sm">
            <CardContent className="p-5">
              <Quote className="w-8 h-8 text-blue-600/40 mb-2" />
              {t.rating != null && t.rating > 0 && (
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star
                      key={j}
                      className={j < (t.rating ?? 0) ? "w-4 h-4 fill-yellow-400 text-yellow-400" : "w-4 h-4 text-gray-200"}
                    />
                  ))}
                </div>
              )}
              <p className="text-gray-700 italic mb-4">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0"
                  aria-hidden
                >
                  {getInitial(t.author)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{t.author}</p>
                  {t.location && <p className="text-xs text-gray-500">{t.location}</p>}
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-auto" aria-label="Verificado" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" />
          {badgeLabel}
        </span>
      </div>
    </section>
  )
}
