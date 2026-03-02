/**
 * Recommendation Engine
 * Sistema de recomendação inteligente baseado em comportamento do usuário
 */

export interface ProductScore {
  productId: number
  score: number // 0-100
  factors: {
    behavioral: number      // 0-30 pontos
    preferences: number      // 0-25 pontos
    similarity: number       // 0-20 pontos
    popularity: number       // 0-15 pontos
    urgency: number         // 0-10 pontos
  }
  reasoning: string[]
}

export interface UserProfile {
  userId?: number | null
  preferences?: Record<string, any>
  purchaseHistory?: Array<{
    productId: number
    category: string
    price: number
    date: Date
  }>
  behavioralData?: {
    viewedProducts: number[]
    clickedProducts: number[]
    searchQueries: string[]
    timeSpent: Record<number, number> // productId -> seconds
  }
  demographics?: {
    age?: number
    location?: string
    loyaltyTier?: string
  }
}

export interface Product {
  id: number
  title: string
  category: string
  price: number
  originalPrice?: number
  rating?: number
  soldToday?: number
  image: string
  tags?: string[]
  soldPercent?: number
  remainingUnits?: number
  countdownEnd?: Date
  scarcityMessage?: string
}

/**
 * Calcula score de um produto para um usuário
 */
export function calculateProductScore(
  product: Product,
  userProfile: UserProfile
): ProductScore {
  const factors = {
    behavioral: 0,
    preferences: 0,
    similarity: 0,
    popularity: 0,
    urgency: 0,
  }
  const reasoning: string[] = []

  // 1. Fator Comportamental (0-30 pontos)
  if (userProfile.behavioralData) {
    const { viewedProducts, clickedProducts, timeSpent } = userProfile.behavioralData

    // Produto já visualizado (5pts)
    if (viewedProducts.includes(product.id)) {
      factors.behavioral += 5
      reasoning.push("Você já visualizou este produto")
    }

    // Produto já clicado (10pts)
    if (clickedProducts.includes(product.id)) {
      factors.behavioral += 10
      reasoning.push("Você demonstrou interesse neste produto")
    }

    // Tempo gasto visualizando (0-10pts)
    const timeSpentSeconds = timeSpent[product.id] || 0
    if (timeSpentSeconds > 0) {
      const timeScore = Math.min(10, Math.floor(timeSpentSeconds / 10))
      factors.behavioral += timeScore
      if (timeScore > 5) {
        reasoning.push("Você passou tempo considerável visualizando este produto")
      }
    }

    // Categoria visualizada (5pts)
    const viewedCategories = new Set(
      viewedProducts.map(id => {
        // Assumindo que temos acesso às categorias dos produtos visualizados
        return product.category // Simplificado
      })
    )
    if (viewedCategories.has(product.category)) {
      factors.behavioral += 5
      reasoning.push("Você visualizou produtos desta categoria")
    }
  }

  // 2. Fator Preferências (0-25 pontos)
  if (userProfile.preferences) {
    const prefs = userProfile.preferences

    // Preferência de categoria (10pts)
    if (prefs.preferredCategories?.includes(product.category)) {
      factors.preferences += 10
      reasoning.push("Esta categoria está entre suas preferências")
    }

    // Preferência de faixa de preço (8pts)
    if (prefs.priceRange) {
      const { min, max } = prefs.priceRange
      if (product.price >= min && product.price <= max) {
        factors.preferences += 8
        reasoning.push("Preço dentro da sua faixa preferida")
      }
    }

    // Preferência de tags (7pts)
    if (prefs.preferredTags && product.tags) {
      const matchingTags = product.tags.filter(tag => 
        prefs.preferredTags.includes(tag)
      )
      if (matchingTags.length > 0) {
        factors.preferences += Math.min(7, matchingTags.length * 2)
        reasoning.push(`Produto possui tags que você prefere: ${matchingTags.join(", ")}`)
      }
    }
  }

  // 3. Fator Similaridade (0-20 pontos)
  if (userProfile.purchaseHistory && userProfile.purchaseHistory.length > 0) {
    const history = userProfile.purchaseHistory

    // Mesma categoria (8pts)
    const sameCategory = history.filter(h => h.category === product.category)
    if (sameCategory.length > 0) {
      factors.similarity += 8
      reasoning.push("Você já comprou produtos desta categoria")
    }

    // Faixa de preço similar (7pts)
    const avgPrice = history.reduce((sum, h) => sum + h.price, 0) / history.length
    const priceDiff = Math.abs(product.price - avgPrice) / avgPrice
    if (priceDiff < 0.3) { // Dentro de 30% do preço médio
      factors.similarity += 7
      reasoning.push("Preço similar aos produtos que você comprou")
    }

    // Produtos similares recentes (5pts)
    const recentPurchases = history
      .filter(h => {
        const daysSince = (Date.now() - h.date.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince < 90 // Últimos 3 meses
      })
    if (recentPurchases.length > 0) {
      factors.similarity += 5
      reasoning.push("Similar a compras recentes")
    }
  }

  // 4. Fator Popularidade (0-15 pontos)
  // Rating alto (5pts)
  if (product.rating && product.rating >= 4.5) {
    factors.popularity += 5
    reasoning.push("Produto muito bem avaliado")
  } else if (product.rating && product.rating >= 4.0) {
    factors.popularity += 3
    reasoning.push("Produto bem avaliado")
  }

  // Muitas vendas hoje (5pts)
  if (product.soldToday && product.soldToday >= 10) {
    factors.popularity += 5
    reasoning.push("Muitas pessoas compraram hoje")
  } else if (product.soldToday && product.soldToday >= 5) {
    factors.popularity += 3
    reasoning.push("Produto popular hoje")
  }

  // Produto em alta (5pts) - baseado em vendas e rating
  if (product.soldToday && product.soldToday >= 5 && product.rating && product.rating >= 4.0) {
    factors.popularity += 5
    reasoning.push("Produto em alta")
  }

  // 5. Fator Urgência (0-10 pontos)
  // Oferta relâmpago (4pts)
  if (product.originalPrice && product.price < product.originalPrice) {
    const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100
    if (discount >= 30) {
      factors.urgency += 4
      reasoning.push("Desconto alto disponível")
    } else if (discount >= 15) {
      factors.urgency += 2
      reasoning.push("Desconto disponível")
    }
  }

  // Poucas unidades restantes (3pts)
  if (product.remainingUnits && product.remainingUnits <= 5) {
    factors.urgency += 3
    reasoning.push("Poucas unidades restantes")
  }

  // Countdown ativo (3pts)
  if (product.countdownEnd) {
    const msRemaining = product.countdownEnd.getTime() - Date.now()
    if (msRemaining > 0 && msRemaining < 5 * 60 * 1000) { // Menos de 5 minutos
      factors.urgency += 3
      reasoning.push("Oferta terminando em breve")
    }
  }

  // Score total
  const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0)

  return {
    productId: product.id,
    score: Math.min(100, totalScore), // Cap em 100
    factors,
    reasoning: reasoning.length > 0 ? reasoning : ["Produto recomendado para você"]
  }
}

/**
 * Ordena produtos por score e adiciona randomização inteligente
 */
export function getPersonalizedProducts(
  products: Product[],
  userProfile: UserProfile,
  count: number = 10,
  randomizationPercent: number = 20
): Array<Product & { score: ProductScore }> {
  // Calcular scores para todos os produtos
  const scoredProducts = products.map(product => ({
    ...product,
    score: calculateProductScore(product, userProfile)
  }))

  // Ordenar por score
  scoredProducts.sort((a, b) => b.score.score - a.score.score)

  // Selecionar top produtos por score
  const topCount = Math.floor(count * (1 - randomizationPercent / 100))
  const topProducts = scoredProducts.slice(0, topCount)

  // Adicionar produtos aleatórios para exploração
  const remainingProducts = scoredProducts.slice(topCount)
  const randomCount = count - topCount
  
  if (randomCount > 0 && remainingProducts.length > 0) {
    // Embaralhar produtos restantes
    const shuffled = [...remainingProducts].sort(() => Math.random() - 0.5)
    const randomProducts = shuffled.slice(0, randomCount)
    
    // Misturar: maioria personalizada no início, alguns aleatórios no final
    return [...topProducts, ...randomProducts]
  }

  return topProducts
}

/**
 * Shuffle array (Fisher-Yates)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
