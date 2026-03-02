"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, CheckCircle, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getToken } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"

export default function BuscarHostsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [minRating, setMinRating] = useState("")
  const [verified, setVerified] = useState(false)
  const [hosts, setHosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const searchHosts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (location) params.append('location', location)
      if (category) params.append('category', category)
      if (minRating) params.append('min_rating', minRating)
      if (verified) params.append('verified', 'true')
      params.append('page', page.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/users/search?${params}`)
      const result = await response.json()

      if (result.success) {
        setHosts(result.data)
        setTotalPages(result.pagination.total_pages)
      }
    } catch (error) {
      console.error('Erro ao buscar hosts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    searchHosts()
  }, [page])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Buscar Hosts e Propriedades</h1>
          <p className="text-blue-100">Encontre os melhores hosts e propriedades para sua viagem</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Nome, empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Localização</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cidade, estado..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Input
                  placeholder="Hotéis, Pousadas..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={searchHosts} className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="w-4 h-4"
                />
                Apenas verificados
              </label>

              <div className="flex items-center gap-2">
                <label className="text-sm">Rating mínimo:</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-20"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Buscando hosts...</p>
          </div>
        ) : hosts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Nenhum host encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hosts.map((host) => (
                <Link key={host.id} href={`/perfil/${host.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative h-48 bg-gray-200">
                        {host.avatar_url ? (
                          <Image
                            src={host.avatar_url}
                            alt={host.name}
                            fill
                            className="object-cover rounded-t-lg"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <div className="text-4xl mb-2">🏨</div>
                              <p className="text-sm">Sem foto</p>
                            </div>
                          </div>
                        )}
                        {host.verified && (
                          <Badge className="absolute top-2 right-2 bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{host.business_name || host.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{host.short_description || host.bio}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {host.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {host.location}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="font-medium">{host.rating?.toFixed(1) || '0.0'}</span>
                            <span className="text-gray-500 text-sm">({host.review_count || 0})</span>
                          </div>
                          {host.categories && host.categories.length > 0 && (
                            <Badge variant="outline">
                              {host.categories[0]}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

