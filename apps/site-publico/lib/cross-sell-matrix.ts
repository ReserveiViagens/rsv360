import {
  getHomeSideRailsFallback,
  type HomeSideRailsData,
  type SideRailItem,
} from "@/lib/home-side-rails"

export type PageContext =
  | "home"
  | "hotels"
  | "hotel-detail"
  | "parks"
  | "attractions"
  | "promotions"
  | "flash-deals"

/** Item virtual para CTA "Monte suas férias" (link /cotacao) */
export const COTACAO_ITEM: SideRailItem = {
  id: "monte-suas-ferias",
  title: "Monte suas férias",
  subtitle: "Escolha hotel, parque, atrações e extras em um só lugar.",
  href: "/cotacao",
  badge: "Cotação",
  image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop",
  imageAlt: "Monte suas férias",
  highlight: true,
}

/** Por contexto, lista de itemIds sugeridos (ordem de prioridade). */
const CROSS_SELL_MATRIX: Record<PageContext, string[]> = {
  home: ["weekly-offer", "flash-deals", "hotels", "water-parks", "attractions", "season-rentals"],
  hotels: ["water-parks", "attractions", "excursions", "group-travel"],
  "hotel-detail": ["water-parks", "attractions", "monte-suas-ferias"],
  parks: ["hotels", "season-rentals", "monte-suas-ferias"],
  attractions: ["hotels", "water-parks", "excursions"],
  promotions: ["flash-deals", "auctions", "group-travel"],
  "flash-deals": ["weekly-offer", "group-travel"],
}

function getAllItems(data: HomeSideRailsData): SideRailItem[] {
  const items = [...data.left.items, ...data.right.items]
  return [...items, COTACAO_ITEM]
}

/**
 * Retorna itens de cross-sell para o contexto, excluindo IDs opcionais e limitando quantidade.
 */
export function getCrossSellItems(
  context: PageContext,
  data?: HomeSideRailsData | null,
  options?: { excludeIds?: string[]; limit?: number }
): SideRailItem[] {
  const source = data ?? getHomeSideRailsFallback()
  const allItems = getAllItems(source)
  const idOrder = CROSS_SELL_MATRIX[context] ?? []
  const excludeIds = options?.excludeIds ?? []
  const limit = options?.limit ?? 5

  const byId = new Map(allItems.map((i) => [i.id, i]))
  const result: SideRailItem[] = []

  for (const id of idOrder) {
    if (result.length >= limit) break
    if (excludeIds.includes(id)) continue
    const item = byId.get(id)
    if (item) result.push(item)
  }

  return result
}

/**
 * Retorna um único item para intercalação, rotacionando por índice.
 */
export function getCrossSellItemByIndex(
  context: PageContext,
  index: number,
  data?: HomeSideRailsData | null
): SideRailItem | null {
  const items = getCrossSellItems(context, data, { limit: 10 })
  if (items.length === 0) return null
  return items[index % items.length] ?? null
}
