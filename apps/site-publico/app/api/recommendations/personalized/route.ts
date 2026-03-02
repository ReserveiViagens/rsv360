import { NextRequest, NextResponse } from "next/server"
import { queryDatabase } from "@/lib/db"
import * as jwt from "jsonwebtoken"
import type { UserProfile, Product } from "@/lib/recommendation-engine"
import { getPersonalizedProducts } from "@/lib/recommendation-engine"

// Fallback quando a tabela products não existe ou a query falha
const FALLBACK_PRODUCTS: Product[] = [
  { id: 1, title: "Hot Park - 1 dia", category: "parques", price: 149, originalPrice: 199, rating: 4.8, soldToday: 12, image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop", soldPercent: 90, scarcityMessage: "Apenas 2 quartos a este preço!" },
  { id: 2, title: "diRoma Thermas - Acesso ao parque", category: "parques", price: 129, originalPrice: 179, rating: 4.6, soldToday: 8, image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop", remainingUnits: 3, scarcityMessage: "Últimas unidades!" },
  { id: 3, title: "Lagoa Quente - Day use", category: "parques", price: 69, originalPrice: 89, rating: 4.5, soldToday: 23, image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop" },
  { id: 4, title: "Náutico - 1 dia", category: "parques", price: 99, originalPrice: 120, rating: 4.7, soldToday: 5, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop" },
]

/**
 * GET /api/recommendations/personalized
 * Retorna produtos personalizados baseados no perfil do usuário
 */
export async function GET(request: NextRequest) {
  try {
    // Obter userId do token (se autenticado)
    const authHeader = request.headers.get("authorization")
    let userId: number | null = null

    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.substring(7)
        const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
        const decoded: any = jwt.verify(token, JWT_SECRET)
        userId = decoded.userId || decoded.id || null
      } catch (error) {
        // Token inválido, continuar sem userId
      }
    }

    // Parâmetros da query
    const searchParams = request.nextUrl.searchParams
    const count = parseInt(searchParams.get("count") || "10", 10)
    const randomizationPercent = parseInt(searchParams.get("randomization") || "20", 10)
    const category = searchParams.get("category") || null

    let allProducts: Product[] = []

    try {
      // Buscar produtos do banco (queryDatabase retorna array de rows, não { rows })
      let productsQuery = `
        SELECT 
          id,
          title,
          category,
          price,
          original_price as "originalPrice",
          rating,
          sold_today as "soldToday",
          image_url as image,
          tags,
          sold_percent as "soldPercent",
          remaining_units as "remainingUnits",
          countdown_end as "countdownEnd",
          scarcity_message as "scarcityMessage"
        FROM products
        WHERE status = 'active'
      `

      const queryParams: any[] = []
      if (category) {
        productsQuery += ` AND category = $${queryParams.length + 1}`
        queryParams.push(category)
      }
      productsQuery += ` ORDER BY sold_today DESC, rating DESC LIMIT $${queryParams.length + 1}`
      queryParams.push(count * 3)

      const productsRows = await queryDatabase<any>(productsQuery, queryParams)
      allProducts = (Array.isArray(productsRows) ? productsRows : []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      price: parseFloat(row.price),
      originalPrice: row.originalPrice ? parseFloat(row.originalPrice) : undefined,
      rating: row.rating ? parseFloat(row.rating) : undefined,
      soldToday: row.soldToday || 0,
      image: row.image || "/images/placeholder.jpg",
      tags: row.tags || [],
      soldPercent: row.soldPercent ? parseFloat(row.soldPercent) : undefined,
      remainingUnits: row.remainingUnits || undefined,
      countdownEnd: row.countdownEnd ? new Date(row.countdownEnd) : undefined,
      scarcityMessage: row.scarcityMessage || undefined,
    }))
    } catch (dbError) {
      console.warn("Recomendações: usando lista fallback (tabela products indisponível):", dbError)
      allProducts = [...FALLBACK_PRODUCTS]
    }

    // Construir perfil do usuário
    const userProfile: UserProfile = {
      userId,
      preferences: {},
      purchaseHistory: [],
      behavioralData: {
        viewedProducts: [],
        clickedProducts: [],
        searchQueries: [],
        timeSpent: {},
      },
    }

    if (userId) {
      try {
      // Buscar preferências do usuário
      const prefsResult = await queryDatabase(
        `SELECT preference_key, preference_value, preference_type 
         FROM customer_preferences 
         WHERE user_id = $1 AND is_active = true`,
        [userId]
      )

      const preferences: Record<string, any> = {}
      const prefsRows = Array.isArray(prefsResult) ? prefsResult : []
      for (const row of prefsRows) {
        try {
          if (row.preference_type === "json") {
            preferences[row.preference_key] = JSON.parse(row.preference_value)
          } else if (row.preference_type === "boolean") {
            preferences[row.preference_key] = row.preference_value === "true"
          } else if (row.preference_type === "number") {
            preferences[row.preference_key] = parseFloat(row.preference_value)
          } else {
            preferences[row.preference_key] = row.preference_value
          }
        } catch (e) {
          preferences[row.preference_key] = row.preference_value
        }
      }
      userProfile.preferences = preferences

      // Buscar histórico de compras
      const purchasesResult = await queryDatabase(
        `SELECT 
          p.id as product_id,
          p.category,
          p.price,
          b.created_at as date
         FROM bookings b
         JOIN products p ON b.product_id = p.id
         WHERE b.user_id = $1 AND b.status = 'completed'
         ORDER BY b.created_at DESC
         LIMIT 50`,
        [userId]
      )

      const purchasesRows = Array.isArray(purchasesResult) ? purchasesResult : []
      userProfile.purchaseHistory = purchasesRows.map((row: any) => ({
        productId: row.product_id,
        category: row.category,
        price: parseFloat(row.price),
        date: new Date(row.date),
      }))

      // Buscar dados comportamentais recentes
      const analyticsResult = await queryDatabase(
        `SELECT 
          properties->>'product_id' as product_id,
          event_name,
          properties->>'time_spent' as time_spent
         FROM analytics
         WHERE user_id = $1 
           AND event_type IN ('product_view', 'product_click', 'search')
           AND created_at > NOW() - INTERVAL '30 days'
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
      )

      const viewedProducts = new Set<number>()
      const clickedProducts = new Set<number>()
      const timeSpent: Record<number, number> = {}

      const analyticsRows = Array.isArray(analyticsResult) ? analyticsResult : []
      for (const row of analyticsRows) {
        const productId = parseInt(row.product_id)
        if (!productId) continue

        if (row.event_name === "product_view") {
          viewedProducts.add(productId)
          if (row.time_spent) {
            timeSpent[productId] = (timeSpent[productId] || 0) + parseFloat(row.time_spent)
          }
        } else if (row.event_name === "product_click") {
          clickedProducts.add(productId)
        }
      }

      userProfile.behavioralData = {
        viewedProducts: Array.from(viewedProducts),
        clickedProducts: Array.from(clickedProducts),
        searchQueries: analyticsRows
          .filter((r: any) => r.event_name === "search")
          .map((r: any) => r.properties?.query || ""),
        timeSpent,
      }

      // Buscar dados demográficos
      const profileResult = await queryDatabase(
        `SELECT loyalty_tier, location 
         FROM customer_profiles 
         WHERE user_id = $1`,
        [userId]
      )

      const profileRows = Array.isArray(profileResult) ? profileResult : []
      if (profileRows.length > 0) {
        userProfile.demographics = {
          loyaltyTier: profileRows[0].loyalty_tier,
          location: profileRows[0].location,
        }
      }
      } catch (profileError) {
        console.warn("Recomendações: perfil do usuário indisponível, usando dados vazios:", profileError)
      }
    }

    // Obter produtos personalizados
    const personalizedProducts = getPersonalizedProducts(
      allProducts,
      userProfile,
      count,
      randomizationPercent
    )

    return NextResponse.json({
      success: true,
      products: personalizedProducts,
      userProfile: userId ? {
        userId,
        hasPreferences: Object.keys(userProfile.preferences || {}).length > 0,
        hasHistory: (userProfile.purchaseHistory?.length || 0) > 0,
        hasBehavioralData: (userProfile.behavioralData?.viewedProducts.length || 0) > 0,
      } : null,
    })
  } catch (error: any) {
    console.error("Erro ao buscar recomendações personalizadas:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
