/** Pool de imagens por itemId (ou categoria) para cross-sell. URLs Unsplash. */
const IMAGE_POOL: Record<string, string[]> = {
  "season-rentals": [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=160&fit=crop",
  ],
  hotels: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1578681998026-79e2129eed79?w=400&h=160&fit=crop",
  ],
  "water-parks": [
    "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1560750588-73207bcf3a9b?w=400&h=160&fit=crop",
  ],
  attractions: [
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=160&fit=crop",
  ],
  auctions: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=160&fit=crop",
  ],
  "flash-deals": [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=160&fit=crop",
  ],
  "group-travel": [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&h=160&fit=crop",
  ],
  excursions: [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=160&fit=crop",
  ],
  "weekly-offer": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=160&fit=crop",
  ],
  "monte-suas-ferias": [
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=160&fit=crop",
  ],
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=160&fit=crop"

/**
 * Retorna uma imagem do pool para o itemId. Seed opcional para resultado determinístico (evita troca ao scroll).
 */
export function getRandomImage(itemId: string, seed?: number): string {
  const pool = IMAGE_POOL[itemId]
  if (!pool || pool.length === 0) return DEFAULT_IMAGE
  const s = seed ?? (itemId.length + (typeof Date !== "undefined" ? Date.now() % 1000 : 0))
  const idx = seededRandom(s) % pool.length
  return pool[Math.floor(idx)]
}

/** Pseudo-random 0..1 determinístico a partir de seed. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}
