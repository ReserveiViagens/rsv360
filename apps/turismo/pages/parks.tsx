'use client'

import React, { useState, useMemo } from 'react'
import ProtectedRoute from '../src/components/ProtectedRoute'
import {
  TreePine,
  Search,
  Filter,
  ExternalLink,
  Star,
  Clock,
  Users,
  MapPin,
  Grid3X3,
  List,
  Eye,
  Edit3,
  Zap,
  Ticket,
  DollarSign,
  CheckCircle,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getParksByCity,
  getAllParks,
  searchParks,
  parkTypes,
  caldasNovasParks,
  type Park,
} from '@/lib/parks-data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SITE_PUBLIC_URL = typeof window !== 'undefined' ? 'http://localhost:3000' : ''

function formatPrice(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value)
}

function getMinPrice(park: Park): number {
  const prices = park.ticketTypes.map((t) => t.basePrice).filter((p) => p > 0)
  return prices.length ? Math.min(...prices) : 0
}

function getMaxPrice(park: Park): number {
  const prices = park.ticketTypes.map((t) => t.basePrice).filter((p) => p > 0)
  return prices.length ? Math.max(...prices) : 0
}

function ParkCard({ park, viewMode }: { park: Park; viewMode: 'grid' | 'list' }) {
  const minPrice = getMinPrice(park)
  const maxPrice = getMaxPrice(park)
  const typeLabel = parkTypes.find((t) => t.value === park.type)?.label || park.type

  const cardContent = (
    <>
      <div
        className={`relative overflow-hidden bg-gray-200 ${
          viewMode === 'grid' ? 'aspect-video' : 'w-48 shrink-0 aspect-video'
        }`}
      >
        <img
          src={park.imageUrl || '/placeholder.svg?height=300&width=400'}
          alt={park.name}
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs">
          {typeLabel.split(' ')[0]}
        </Badge>
        {park.fastPassAvailable && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white font-bold">
            <Zap className="w-3 h-3 inline mr-1" />
            Fast Pass
          </Badge>
        )}
        {park.groupDiscounts && (
          <Badge className="absolute bottom-2 right-2 bg-blue-500 text-white text-xs">
            Desconto Grupo
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <span className="text-white text-xs flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {park.city}, {park.state}
          </span>
        </div>
      </div>

      <div className={viewMode === 'list' ? 'flex-1 min-w-0 p-4' : 'p-4'}>
        <h3 className="font-semibold text-gray-900 truncate">{park.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{park.description}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="flex items-center gap-1 text-amber-600 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <strong>4.7</strong>
          </span>
          <span className="text-sm text-gray-500">
            {park.ticketTypes.length} tipos de ingresso
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 gap-2 border-t pt-4">
          <div>
            {minPrice === maxPrice ? (
              <span className="text-lg font-bold text-emerald-600">{formatPrice(minPrice)}</span>
            ) : (
              <div>
                <span className="text-lg font-bold text-emerald-600">
                  {formatPrice(minPrice)}
                </span>
                <span className="text-sm text-gray-500"> - {formatPrice(maxPrice)}</span>
              </div>
            )}
            <span className="text-xs text-gray-500 block">por pessoa</span>
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => window.open(`${SITE_PUBLIC_URL}/atracoes`, '_blank')}
              title="Ver no site público"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="shrink-0" title="Editar (em breve)">
              <Edit3 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  if (viewMode === 'list') {
    return (
      <div className="flex rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {cardContent}
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
      {cardContent}
    </div>
  )
}

export default function ParksPage() {
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState<string>('Caldas Novas')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredParks = useMemo(() => {
    let list = cityFilter && cityFilter !== 'all' ? getParksByCity(cityFilter) : getAllParks()
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower) ||
          p.city.toLowerCase().includes(searchLower)
      )
    }
    if (typeFilter && typeFilter !== 'all') {
      list = list.filter((p) => p.type === typeFilter)
    }
    return list
  }, [search, cityFilter, typeFilter])

  const cities = useMemo(() => {
    const seen = new Set<string>()
    return getAllParks()
      .map((p) => p.city)
      .filter((c) => {
        if (seen.has(c)) return false
        seen.add(c)
        return true
      })
      .sort()
  }, [])

  // Estatísticas
  const stats = useMemo(() => {
    const totalParks = filteredParks.length
    const totalTicketTypes = filteredParks.reduce((sum, p) => sum + p.ticketTypes.length, 0)
    const parksWithFastPass = filteredParks.filter((p) => p.fastPassAvailable).length
    const parksWithGroupDiscount = filteredParks.filter((p) => p.groupDiscounts).length
    const avgMinPrice =
      filteredParks.length > 0
        ? filteredParks.reduce((sum, p) => sum + getMinPrice(p), 0) / filteredParks.length
        : 0

    return {
      totalParks,
      totalTicketTypes,
      parksWithFastPass,
      parksWithGroupDiscount,
      avgMinPrice,
    }
  }, [filteredParks])

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TreePine className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Gestão de Parques Temáticos
              </h1>
              <p className="text-gray-600 mt-0.5">
                {filteredParks.length} parques encontrados
              </p>
            </div>
          </div>
          <a href={`${SITE_PUBLIC_URL}/atracoes`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Ver no site público
            </Button>
          </a>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Parques</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalParks}</p>
              </div>
              <TreePine className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Tipos Ingresso</p>
                <p className="text-xl font-bold text-blue-600">{stats.totalTicketTypes}</p>
              </div>
              <Ticket className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Fast Pass</p>
                <p className="text-xl font-bold text-yellow-600">{stats.parksWithFastPass}</p>
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Grupos</p>
                <p className="text-xl font-bold text-purple-600">
                  {stats.parksWithGroupDiscount}
                </p>
              </div>
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Preço Médio</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatPrice(stats.avgMinPrice)}
                </p>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="rounded-xl border bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filtros</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome do parque..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger id="city" className="mt-1">
                  <SelectValue placeholder="Todas as cidades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as cidades</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {parkTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex rounded-lg border p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {cityFilter === 'Caldas Novas' && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
            <TreePine className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm text-emerald-800">
              <strong>Caldas Novas</strong> – {caldasNovasParks.length} parques aquáticos
              integrados com{' '}
              {caldasNovasParks.reduce((sum, p) => sum + p.ticketTypes.length, 0)} tipos de
              ingressos disponíveis. Visualize no site público em{' '}
              <a
                href={`${SITE_PUBLIC_URL}/atracoes`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                localhost:3000/atracoes
              </a>
            </p>
          </div>
        )}

        {filteredParks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
            <TreePine className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhum parque encontrado</p>
            <p className="text-sm text-gray-500 mt-1">
              Tente ajustar os filtros ou incluir Caldas Novas nas cidades
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredParks.map((park) => (
              <ParkCard key={park.id} park={park} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
