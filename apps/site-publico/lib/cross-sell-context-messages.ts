import type { PageContext } from "@/lib/cross-sell-matrix"

/** Mensagens contextuais por (contexto, itemId) — sobrescrevem o subtitle do card. */
export const CONTEXTUAL_MESSAGES: Record<PageContext, Record<string, string>> = {
  home: {},
  hotels: {
    "water-parks": "Complete sua viagem com diversão nos parques",
    attractions: "Atrações e passeios perto do seu hotel",
    excursions: "Excursões com suporte completo",
    "group-travel": "Viagens em grupo com melhor preço",
  },
  "hotel-detail": {
    "water-parks": "Ingressos para parques na região",
    attractions: "O que fazer perto da sua hospedagem",
    "monte-suas-ferias": "Monte pacote com hotel + parques + atrações",
  },
  parks: {
    hotels: "Onde se hospedar",
    "season-rentals": "Aluguel por temporada",
    "monte-suas-ferias": "Monte suas férias com hotel + ingressos",
  },
  attractions: {
    hotels: "Onde se hospedar",
    "water-parks": "Parques e experiências",
    excursions: "Excursões e roteiros",
  },
  promotions: {
    "flash-deals": "Ofertas com tempo limitado",
    auctions: "Leilões de viagem",
    "group-travel": "Viagens em grupo",
  },
  "flash-deals": {
    "weekly-offer": "Oferta da semana",
    "group-travel": "Viagens em grupo",
  },
}

export function getContextualSubtitle(
  context: PageContext,
  itemId: string,
  defaultSubtitle: string
): string {
  const byContext = CONTEXTUAL_MESSAGES[context]
  if (!byContext) return defaultSubtitle
  return byContext[itemId] ?? defaultSubtitle
}
