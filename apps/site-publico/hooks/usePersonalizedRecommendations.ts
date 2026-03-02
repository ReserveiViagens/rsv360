import { useState, useEffect, useCallback } from "react"
import type { ProductScore } from "@/lib/recommendation-engine"

export interface PersonalizedProduct {
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
  score: ProductScore
}

interface UsePersonalizedRecommendationsOptions {
  count?: number
  category?: string
  randomizationPercent?: number
  autoFetch?: boolean
}

interface UsePersonalizedRecommendationsReturn {
  products: PersonalizedProduct[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  userProfile: {
    userId: number | null
    hasPreferences: boolean
    hasHistory: boolean
    hasBehavioralData: boolean
  } | null
}

/**
 * Hook para buscar recomendações personalizadas
 */
export function usePersonalizedRecommendations(
  options: UsePersonalizedRecommendationsOptions = {}
): UsePersonalizedRecommendationsReturn {
  const {
    count = 10,
    category,
    randomizationPercent = 20,
    autoFetch = true,
  } = options

  const [products, setProducts] = useState<PersonalizedProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UsePersonalizedRecommendationsReturn["userProfile"]>(null)

  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = typeof window !== "undefined" 
        ? localStorage.getItem("token") 
        : null

      const params = new URLSearchParams({
        count: count.toString(),
        randomization: randomizationPercent.toString(),
        ...(category && { category }),
      })

      const response = await fetch(
        `/api/recommendations/personalized?${params.toString()}`,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      )

      if (!response.ok) {
        throw new Error("Erro ao buscar recomendações")
      }

      const data = await response.json()
      
      if (data.success && data.products) {
        setProducts(data.products)
        setUserProfile(data.userProfile)
      } else {
        throw new Error(data.error || "Erro desconhecido")
      }
    } catch (err: any) {
      console.error("Erro ao buscar recomendações:", err)
      setError(err.message || "Erro ao carregar recomendações")
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [count, category, randomizationPercent])

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations()
    }
  }, [autoFetch, fetchRecommendations])

  return {
    products,
    isLoading,
    error,
    refetch: fetchRecommendations,
    userProfile,
  }
}
